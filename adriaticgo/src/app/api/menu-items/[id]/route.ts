import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { menuItemSchema } from "@/lib/validators";

async function ensureMenuItemOwnership(
  itemId: string,
  userId: string
): Promise<boolean> {
  const item = await prisma.menuItem.findUnique({
    where: { id: itemId },
    include: { category: { include: { restaurant: true } } },
  });
  return item?.category.restaurant.ownerId === userId;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "RESTAURANT_OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can update menu items" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const allowed = await ensureMenuItemOwnership(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = menuItemSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { categoryId, name, description, price, imageUrl, isAvailable, sortOrder } =
      parsed.data;
    if (categoryId) {
      const category = await prisma.menuCategory.findUnique({
        where: { id: categoryId },
        include: { restaurant: true },
      });
      if (category?.restaurant.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "RESTAURANT_OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can delete menu items" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const allowed = await ensureMenuItemOwnership(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

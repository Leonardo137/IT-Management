import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { menuCategoryUpdateSchema } from "@/lib/validators";

async function ensureCategoryOwnership(
  categoryId: string,
  userId: string
): Promise<boolean> {
  const category = await prisma.menuCategory.findUnique({
    where: { id: categoryId },
    include: { restaurant: true },
  });
  return category?.restaurant.ownerId === userId;
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
        { error: "Only restaurant owners can update categories" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const allowed = await ensureCategoryOwnership(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = menuCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, sortOrder } = parsed.data;
    const category = await prisma.menuCategory.update({
      where: { id },
      data: { ...(name !== undefined && { name }), ...(sortOrder !== undefined && { sortOrder }) },
    });

    return NextResponse.json(category);
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
        { error: "Only restaurant owners can delete categories" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const allowed = await ensureCategoryOwnership(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.menuCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

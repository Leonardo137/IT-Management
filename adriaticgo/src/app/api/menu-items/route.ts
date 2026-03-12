import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { menuItemSchema } from "@/lib/validators";

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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "RESTAURANT_OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can add menu items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = menuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { categoryId, name, description, price, imageUrl, isAvailable, sortOrder } =
      parsed.data;
    const allowed = await ensureCategoryOwnership(categoryId, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const maxSort = await prisma.menuItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description: description ?? null,
        price,
        imageUrl: imageUrl ?? null,
        isAvailable: isAvailable ?? true,
        sortOrder: sortOrder ?? nextSort,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

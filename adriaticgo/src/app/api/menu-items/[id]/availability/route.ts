import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

export async function PATCH(
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
        { error: "Only restaurant owners can toggle availability" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const allowed = await ensureMenuItemOwnership(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const isAvailable =
      typeof body.isAvailable === "boolean"
        ? body.isAvailable
        : body.isAvailable === "true";

    const item = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

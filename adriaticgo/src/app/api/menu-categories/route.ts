import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { menuCategorySchema } from "@/lib/validators";

async function getOwnerRestaurantIds(userId: string): Promise<string[]> {
  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  return restaurants.map((r) => r.id);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "RESTAURANT_OWNER") {
      return NextResponse.json(
        { error: "Only restaurant owners can manage categories" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = menuCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { restaurantId, name, sortOrder } = parsed.data;
    const ownerRestaurantIds = await getOwnerRestaurantIds(session.user.id);
    if (!ownerRestaurantIds.includes(restaurantId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const maxSort = await prisma.menuCategory.aggregate({
      where: { restaurantId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId,
        name,
        sortOrder: sortOrder ?? nextSort,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validators";
import { VALID_TRANSITIONS } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const role = session.user.role as string;
    if (role === "RESTAURANT_OWNER") {
      if (order.restaurant.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (role !== "DELIVERY_PERSON") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedNext = VALID_TRANSITIONS[order.status];
    if (!allowedNext?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${order.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        restaurant: { select: { name: true } },
        items: true,
        delivery: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

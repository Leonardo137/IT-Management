import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deliveryLocationSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role?: string }).role !== "DELIVERY_PERSON") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = deliveryLocationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid location", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { currentLat, currentLng } = parsed.data;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }
    if (delivery.driverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: { currentLat, currentLng },
      include: {
        order: {
          include: {
            restaurant: { select: { name: true, address: true, latitude: true, longitude: true } },
          },
        },
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

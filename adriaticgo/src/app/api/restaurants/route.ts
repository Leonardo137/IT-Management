import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const openOnly = searchParams.get("openOnly") === "true";

    const restaurants = await prisma.restaurant.findMany({
      where: {
        ...(search ? { name: { contains: search } } : {}),
        ...(cuisine ? { cuisine } : {}),
        ...(openOnly ? { isOpen: true } : {}),
      },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json(restaurants);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const res = await fetch(
      "https://api.counterapi.dev/v1/fueltrack-essence/visits/up",
      { cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ count: null });
    const data = await res.json();
    return NextResponse.json({ count: data.count ?? null });
  } catch {
    return NextResponse.json({ count: null });
  }
}

import { NextResponse } from "next/server";

const API_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";

export type FuelPrices = {
  gazole: number;
  sp95: number;
  sp98: number;
  e10: number;
  e85: number;
  gplc: number;
  stations: number;
  updatedAt: string;
};

export async function GET() {
  try {
    const params = new URLSearchParams({
      select: [
        "avg(gazole_prix) as avg_gazole",
        "avg(sp95_prix) as avg_sp95",
        "avg(sp98_prix) as avg_sp98",
        "avg(e10_prix) as avg_e10",
        "avg(e85_prix) as avg_e85",
        "avg(gplc_prix) as avg_gplc",
      ].join(", "),
      limit: "1",
    });

    const res = await fetch(`${API_URL}?${params}`, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`data.gouv API responded with ${res.status}`);
    }

    const data = await res.json();
    const row = data.results[0];

    const prices: FuelPrices = {
      gazole: Math.round(row.avg_gazole * 1000) / 1000,
      sp95: Math.round(row.avg_sp95 * 1000) / 1000,
      sp98: Math.round(row.avg_sp98 * 1000) / 1000,
      e10: Math.round(row.avg_e10 * 1000) / 1000,
      e85: Math.round(row.avg_e85 * 1000) / 1000,
      gplc: Math.round(row.avg_gplc * 1000) / 1000,
      stations: data.total_count,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les prix carburants" },
      { status: 502 }
    );
  }
}

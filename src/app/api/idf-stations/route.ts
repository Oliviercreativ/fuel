import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  "https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-j-7/records";

export type IdfStation = {
  id: string;
  name: string;
  brand: string | null;
  address: string;
  city: string;
  cp: string;
  depname: string;
  depcode: string;
  fuel: string[];
  shortage: string[];
  services: string[];
  automate_24_24: string | null;
  update: string;
  price_gazole: number | null;
  price_sp95: number | null;
  price_sp98: number | null;
  price_e10: number | null;
  price_e85: number | null;
  price_gplc: number | null;
  geo_point: { lon: number; lat: number } | null;
};

export type IdfResponse = {
  total_count: number;
  stations: IdfStation[];
};

export type IdfFacets = {
  departments: { depname: string; depcode: string }[];
  cities: { city: string; count: number }[];
  brands: { brand: string; count: number }[];
  fuels: { fuel: string; count: number }[];
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action") ?? "stations";

  try {
    if (action === "facets") {
      return await getFacets(searchParams);
    }
    return await getStations(searchParams);
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter l'API Île-de-France" },
      { status: 502 }
    );
  }
}

function buildWhere(filters: Record<string, string | null>, exclude?: string): string {
  const conditions: string[] = [];
  for (const [key, value] of Object.entries(filters)) {
    if (!value || key === exclude) continue;
    if (key === "fuel") {
      // fuel is an array field, use search()
      conditions.push(`search(fuel, "${value}")`);
    } else {
      conditions.push(`${key}="${value}"`);
    }
  }
  return conditions.length > 0
    ? `&where=${encodeURIComponent(conditions.join(" AND "))}`
    : "";
}

async function getFacets(searchParams: URLSearchParams): Promise<NextResponse> {
  const depcode = searchParams.get("depcode") || null;
  const city = searchParams.get("city") || null;
  const brand = searchParams.get("brand") || null;
  const fuel = searchParams.get("fuel") || null;

  const filters = { depcode, city, brand, fuel };

  // Each facet query uses ALL filters EXCEPT its own → cascading AND logic
  const allWhere = buildWhere(filters);
  const whereExceptCity = buildWhere(filters, "city");
  const whereExceptBrand = buildWhere(filters, "brand");
  const whereExceptFuel = buildWhere(filters, "fuel");

  const [depsRes, citiesRes, brandsRes, fuelsRes] = await Promise.all([
    fetch(
      `${API_BASE}?select=depname,depcode&group_by=depname,depcode&order_by=depname asc&limit=20`,
      { next: { revalidate: 86400 } }
    ),
    depcode
      ? fetch(
          `${API_BASE}?select=city,count(*) as nb&group_by=city&order_by=city asc&limit=300${whereExceptCity}`,
          { next: { revalidate: 3600 } }
        )
      : Promise.resolve(null),
    fetch(
      `${API_BASE}?select=brand,count(*) as nb&group_by=brand&order_by=nb desc&limit=30${whereExceptBrand}`,
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `${API_BASE}?select=fuel,count(*) as nb&group_by=fuel&order_by=nb desc&limit=10${whereExceptFuel}`,
      { next: { revalidate: 3600 } }
    ),
  ]);

  const depsData = await depsRes.json();
  const citiesData = citiesRes ? await citiesRes.json() : { results: [] };
  const brandsData = await brandsRes.json();
  const fuelsData = await fuelsRes.json();

  const facets: IdfFacets = {
    departments: depsData.results,
    cities: citiesData.results.map((c: { city: string; nb: number }) => ({
      city: c.city,
      count: c.nb,
    })),
    brands: brandsData.results
      .filter((b: { brand: string | null }) => b.brand)
      .map((b: { brand: string; nb: number }) => ({ brand: b.brand, count: b.nb })),
    fuels: fuelsData.results
      .filter((f: { fuel: string | null }) => f.fuel)
      .map((f: { fuel: string; nb: number }) => ({ fuel: f.fuel, count: f.nb })),
  };

  return NextResponse.json(facets);
}

async function getStations(searchParams: URLSearchParams): Promise<NextResponse> {
  const depcode = searchParams.get("depcode");
  const city = searchParams.get("city");
  const brand = searchParams.get("brand");
  const fuel = searchParams.get("fuel");
  const limit = searchParams.get("limit") ?? "20";
  const offset = searchParams.get("offset") ?? "0";

  const conditions: string[] = [];
  if (depcode) conditions.push(`depcode="${depcode}"`);
  if (city) conditions.push(`city="${city}"`);
  if (brand) conditions.push(`brand="${brand}"`);
  if (fuel) conditions.push(`search(fuel, "${fuel}")`);

  const where =
    conditions.length > 0
      ? `&where=${encodeURIComponent(conditions.join(" AND "))}`
      : "";

  const res = await fetch(
    `${API_BASE}?limit=${limit}&offset=${offset}&order_by=update desc${where}`,
    { next: { revalidate: 900 } }
  );

  if (!res.ok) throw new Error(`IDF API responded with ${res.status}`);

  const data = await res.json();

  const response: IdfResponse = {
    total_count: data.total_count,
    stations: data.results.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      brand: r.brand ?? null,
      address: r.address,
      city: r.city,
      cp: r.cp,
      depname: r.depname,
      depcode: r.depcode,
      fuel: r.fuel ?? [],
      shortage: r.shortage ?? [],
      services: r.services ?? [],
      automate_24_24: r.automate_24_24 ?? null,
      update: r.update,
      price_gazole: r.price_gazole ?? null,
      price_sp95: r.price_sp95 ?? null,
      price_sp98: r.price_sp98 ?? null,
      price_e10: r.price_e10 ?? null,
      price_e85: r.price_e85 ?? null,
      price_gplc: r.price_gplc ?? null,
      geo_point: r.geo_point ?? null,
    })),
  };

  return NextResponse.json(response);
}

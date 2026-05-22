import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const limit = Number(searchParams.get("limit") ?? 10);

    const data = await db.query.products.findMany({
      where: search ? ilike(products.name, `%${search}%`) : undefined,
      limit,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });

    return apiSuccess(data);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();

    const [created] = await db.insert(products).values(body).returning();

    return apiSuccess(created, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}

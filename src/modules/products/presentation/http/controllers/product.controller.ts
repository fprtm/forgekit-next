import { NextRequest, NextResponse } from "next/server";
import { GetProductsHandler } from "../../../application/use-cases/get-products/get-products.handler";
import { DrizzleProductRepository } from "../../../infrastructure/database/repositories/drizzle-product.repository";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { auth } from "@/shared/lib/auth";

const productRepo = new DrizzleProductRepository();
const getProductsUC = new GetProductsHandler(productRepo);

export class ProductController {
  /**
   * REST API Controller for fetching product list.
   * External clients can consume this API.
   */
  public async getProducts(req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();
      
      const searchParams = req.nextUrl.searchParams;
      const search = searchParams.get('search') || "";
      const limit = parseInt(searchParams.get('limit') || "10", 10);

      const result = await getProductsUC.execute({
        search,
        limit,
        user: session?.user
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }
      
      console.error("PRODUCT_CONTROLLER_GET_PRODUCTS_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const productController = new ProductController();

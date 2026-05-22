import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { ProductsService } from "../../application/services"

export async function getProductsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const limit = Number(searchParams.get("limit") ?? 10)

    const data = await ProductsService.getProducts(search, limit)
    return apiSuccess(data)
  } catch {
    return apiError("Internal server error", 500)
  }
}

export async function createProductHandler(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return apiError("Unauthorized", 401)
    }

    const body = await req.json()
    const created = await ProductsService.createProduct(body)
    return apiSuccess(created, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 400)
  }
}

export async function getProductByIdHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const product = await ProductsService.getProductById(id)
    return apiSuccess(product)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") return apiError(error.message, 404)
    return apiError("Internal server error", 500)
  }
}

export async function updateProductHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) return apiError("Unauthorized", 401)

    const { id } = await props.params
    const body = await req.json()
    const updated = await ProductsService.updateProduct(id, body)
    return apiSuccess(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Product not found" ? 404 : 400
    return apiError(message, status)
  }
}

export async function deleteProductHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) return apiError("Unauthorized", 401)

    const { id } = await props.params
    await ProductsService.deleteProduct(id)
    return apiSuccess({ deleted: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Product not found" ? 404 : 500
    return apiError(message, status)
  }
}

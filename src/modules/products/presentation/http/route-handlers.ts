import { NextRequest } from "next/server"
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response"
import { DrizzleProductRepository } from "../../infrastructure/database/repositories/drizzle-product.repository"
import { GetProductsHandler } from "../../application/use-cases/get-products/get-products.handler"
import { CreateProductHandler } from "../../application/use-cases/create-product/create-product.handler"
import { GetProductHandler } from "../../application/use-cases/get-product/get-product.handler"
import { UpdateProductHandler } from "../../application/use-cases/update-product/update-product.handler"
import { DeleteProductHandler } from "../../application/use-cases/delete-product/delete-product.handler"
import { auth } from "@/shared/lib/auth"
import { AuthUser } from "@/modules/auth/domain/types"

const productRepo = new DrizzleProductRepository()
const getProductsUC = new GetProductsHandler(productRepo)
const createProductUC = new CreateProductHandler(productRepo)
const getProductUC = new GetProductHandler(productRepo)
const updateProductUC = new UpdateProductHandler(productRepo)
const deleteProductUC = new DeleteProductHandler(productRepo)

export async function getProductsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const limit = Number(searchParams.get("limit") ?? 10)

    const session = await auth()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : undefined

    const data = await getProductsUC.execute({ search, limit, user })
    return apiSuccess(data)
  } catch (error: unknown) {
    return handleApiError(error, "GET_PRODUCTS")
  }
}

export async function createProductHandler(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key")
    let authUser: AuthUser | undefined

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      const session = await auth()
      if (!session) {
        return apiError("Unauthorized", 401)
      }
      authUser = { id: session.user.id, role: session.user.role }
    }

    const body = await req.json()
    const created = await createProductUC.execute({ ...body, user: authUser })
    return apiSuccess(created, 201)
  } catch (error: unknown) {
    return handleApiError(error, "CREATE_PRODUCT")
  }
}

export async function getProductByIdHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : undefined

    const { id } = await props.params
    const product = await getProductUC.execute({ id, user })
    return apiSuccess(product)
  } catch (error: unknown) {
    return handleApiError(error, "GET_PRODUCT")
  }
}

export async function updateProductHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key")
    let authUser: AuthUser | undefined

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      const session = await auth()
      if (!session) {
        return apiError("Unauthorized", 401)
      }
      authUser = { id: session.user.id, role: session.user.role }
    }

    const { id } = await props.params
    const body = await req.json()
    const updated = await updateProductUC.execute({ id, ...body, user: authUser })
    return apiSuccess(updated)
  } catch (error: unknown) {
    return handleApiError(error, "UPDATE_PRODUCT")
  }
}

export async function deleteProductHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key")
    let authUser: AuthUser | undefined

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      const session = await auth()
      if (!session) {
        return apiError("Unauthorized", 401)
      }
      authUser = { id: session.user.id, role: session.user.role }
    }

    const { id } = await props.params
    await deleteProductUC.execute({ id, user: authUser })
    return apiSuccess({ deleted: true })
  } catch (error: unknown) {
    return handleApiError(error, "DELETE_PRODUCT")
  }
}

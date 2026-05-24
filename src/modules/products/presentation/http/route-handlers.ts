import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { ProductsService } from "../../application/services"
import { auth } from "@/lib/auth"
import { can } from "@/modules/auth/domain/policies"
import { AuthUser } from "@/modules/auth/domain/types"

export async function getProductsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") ?? ""
    const limit = Number(searchParams.get("limit") ?? 10)

    const session = await auth()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : null
    
    if (user && !can(user, "products:read")) {
      return apiError("Forbidden", 403)
    }

    const data = await ProductsService.getProducts(search, limit)
    return apiSuccess(data)
  } catch {
    return apiError("Internal server error", 500)
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
      if (!can(authUser, "products:create")) {
        return apiError("Forbidden", 403)
      }
    }

    const body = await req.json()
    const created = await ProductsService.createProduct(body, authUser)
    return apiSuccess(created, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Forbidden" ? 403 : 400
    return apiError(message, status)
  }
}

export async function getProductByIdHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const user = session?.user ? { id: session.user.id, role: session.user.role } : null
    
    if (user && !can(user, "products:read")) {
      return apiError("Forbidden", 403)
    }

    const { id } = await props.params
    const product = await ProductsService.getProductById(id)
    return apiSuccess(product)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") return apiError(error.message, 404)
    if (error instanceof Error && error.message === "Forbidden") return apiError(error.message, 403)
    return apiError("Internal server error", 500)
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
      if (!can(authUser, "products:update")) {
        return apiError("Forbidden", 403)
      }
    }

    const { id } = await props.params
    const body = await req.json()
    const updated = await ProductsService.updateProduct(id, body, authUser)
    return apiSuccess(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Product not found" ? 404 : (message === "Forbidden" ? 403 : 400)
    return apiError(message, status)
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
      if (!can(authUser, "products:delete")) {
        return apiError("Forbidden", 403)
      }
    }

    const { id } = await props.params
    await ProductsService.deleteProduct(id, authUser)
    return apiSuccess({ deleted: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Product not found" ? 404 : (message === "Forbidden" ? 403 : 500)
    return apiError(message, status)
  }
}

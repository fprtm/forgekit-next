import { NextRequest } from "next/server"
import { timingSafeEqual } from "crypto"
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response"
import { DrizzleProductRepository } from "../../infrastructure/database/repositories/drizzle-product.repository"
import { GetProductsHandler } from "../../application/use-cases/get-products/get-products.handler"
import { CreateProductHandler } from "../../application/use-cases/create-product/create-product.handler"
import { GetProductHandler } from "../../application/use-cases/get-product/get-product.handler"
import { UpdateProductHandler } from "../../application/use-cases/update-product/update-product.handler"
import { DeleteProductHandler } from "../../application/use-cases/delete-product/delete-product.handler"
import { auth } from "@/shared/lib/auth"
import { AuthUser } from "@/modules/auth/domain/types"
import { createProductSchema, updateProductSchema } from "../../application/validations"

// System-level identity used when the internal API key is presented instead
// of a user session. Mutation commands now require a non-null `user`.
const SYSTEM_USER: AuthUser = { id: "system", role: "super_admin" }

// Constant-time comparison to prevent timing attacks against the internal
// API key. Buffers must be equal length before calling timingSafeEqual,
// otherwise it throws — so we compare lengths first (this length check is
// not itself a timing side-channel of concern since the key length is not
// secret).
function isValidApiKey(providedKey: string | null): boolean {
  const expectedKey = process.env.INTERNAL_API_KEY
  if (!providedKey || !expectedKey) {
    return false
  }

  const providedBuffer = Buffer.from(providedKey)
  const expectedBuffer = Buffer.from(expectedKey)

  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

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
    let authUser: AuthUser

    if (isValidApiKey(apiKey)) {
      authUser = SYSTEM_USER
    } else {
      const session = await auth()
      if (!session) {
        return apiError("Unauthorized", 401)
      }
      authUser = { id: session.user.id, role: session.user.role }
    }

    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400)
    }

    const created = await createProductUC.execute({ ...parsed.data, user: authUser })
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
    let authUser: AuthUser

    if (isValidApiKey(apiKey)) {
      authUser = SYSTEM_USER
    } else {
      const session = await auth()
      if (!session) {
        return apiError("Unauthorized", 401)
      }
      authUser = { id: session.user.id, role: session.user.role }
    }

    const { id } = await props.params
    const body = await req.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400)
    }

    // `id` and `user` are placed after the spread so a malicious `id`/`user`
    // field in the request body can never override the authoritative values
    // (route param + resolved session/API-key identity).
    const updated = await updateProductUC.execute({ ...parsed.data, id, user: authUser })
    return apiSuccess(updated)
  } catch (error: unknown) {
    return handleApiError(error, "UPDATE_PRODUCT")
  }
}

export async function deleteProductHandler(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = req.headers.get("x-api-key")
    let authUser: AuthUser

    if (isValidApiKey(apiKey)) {
      authUser = SYSTEM_USER
    } else {
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

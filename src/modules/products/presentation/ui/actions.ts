"use server"

import { auth } from "@/lib/auth"
import { can } from "@/modules/auth/domain/policies"
import { ProductsService } from "../../application/services"
import { ProductEntity } from "../../domain/types"
import { CreateProductDTO, UpdateProductDTO } from "../../application/validations"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function getProductsAction(search = "", limit = 10): Promise<ActionResult<ProductEntity[]>> {
  const session = await auth()
  
  if (!session?.user || !can(session.user, "products:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const products = await ProductsService.getProducts(search, limit)
    return { success: true, data: products, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getProductAction(id: string): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  if (!session?.user || !can(session.user, "products:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const product = await ProductsService.getProductById(id)
    return { success: true, data: product, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function createProductAction(
  input: CreateProductDTO,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  if (!session?.user || !can(session.user, "products:create")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const created = await ProductsService.createProduct(input, session.user)
    return { success: true, data: created, error: null }
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR:", error)
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function updateProductAction(
  id: string,
  input: UpdateProductDTO,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()

  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const existing = await ProductsService.getProductById(id)
    
    if (!can(session.user, "products:update", existing)) {
      return { success: false, error: "Unauthorized", data: null }
    }

    const updated = await ProductsService.updateProduct(id, input, session.user)
    return { success: true, data: updated, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()

  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const existing = await ProductsService.getProductById(id)
    
    if (!can(session.user, "products:delete", existing)) {
      return { success: false, error: "Unauthorized", data: null }
    }

    const deleted = await ProductsService.deleteProduct(id, session.user)
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

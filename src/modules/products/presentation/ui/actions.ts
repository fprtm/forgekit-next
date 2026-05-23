"use server"

import { ProductsService } from "../../application/services"
import { ProductEntity } from "../../domain/types"
import { CreateProductDTO, UpdateProductDTO } from "../../application/validations"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function getProductsAction(search = "", limit = 10): Promise<ActionResult<ProductEntity[]>> {
  try {
    const products = await ProductsService.getProducts(search, limit)
    return { success: true, data: products, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getProductAction(id: string): Promise<ActionResult<ProductEntity>> {
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
  try {
    const created = await ProductsService.createProduct(input)
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
  try {
    const updated = await ProductsService.updateProduct(id, input)
    return { success: true, data: updated, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionResult<ProductEntity>> {
  try {
    const deleted = await ProductsService.deleteProduct(id)
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

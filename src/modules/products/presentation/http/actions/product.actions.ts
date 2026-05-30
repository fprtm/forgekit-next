"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleProductRepository } from "../../../infrastructure/database/repositories/drizzle-product.repository"
import { GetProductsHandler } from "../../../application/use-cases/get-products/get-products.handler"
import { GetProductHandler } from "../../../application/use-cases/get-product/get-product.handler"
import { CreateProductHandler } from "../../../application/use-cases/create-product/create-product.handler"
import { UpdateProductHandler } from "../../../application/use-cases/update-product/update-product.handler"
import { DeleteProductHandler } from "../../../application/use-cases/delete-product/delete-product.handler"
import { ProductEntity } from "../../../domain/entities/product.entity"
import { CreateProductCommand } from "../../../application/use-cases/create-product/create-product.command"
import { UpdateProductCommand } from "../../../application/use-cases/update-product/update-product.command"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const productRepo = new DrizzleProductRepository()
const getProductsUC = new GetProductsHandler(productRepo)
const getProductUC = new GetProductHandler(productRepo)
const createProductUC = new CreateProductHandler(productRepo)
const updateProductUC = new UpdateProductHandler(productRepo)
const deleteProductUC = new DeleteProductHandler(productRepo)

export async function getProductsAction(search = "", limit = 10): Promise<ActionResult<ProductEntity[]>> {
  const session = await auth()
  
  try {
    const products = await getProductsUC.execute({ search, limit, user: session?.user })
    return { success: true, data: products, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("GET PRODUCTS ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getProductAction(id: string): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  try {
    const product = await getProductUC.execute({ id, user: session?.user })
    return { success: true, data: product, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("GET PRODUCT ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function createProductAction(
  input: Omit<CreateProductCommand, "user">,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  try {
    const created = await createProductUC.execute({ ...input, user: session?.user } as CreateProductCommand)
    return { success: true, data: created as ProductEntity, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    // E.g. Zod validation errors can also be caught here, for now fallback to string msg
    const message = error instanceof Error ? error.message : "Internal error"
    console.error("CREATE PRODUCT ERROR:", error)
    return { success: false, error: message, data: null }
  }
}

export async function updateProductAction(
  id: string,
  input: Omit<UpdateProductCommand, "id" | "user">,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()

  try {
    const updated = await updateProductUC.execute({ id, ...input, user: session?.user })
    return { success: true, data: updated as ProductEntity, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    const message = error instanceof Error ? error.message : "Internal error"
    console.error("UPDATE PRODUCT ERROR:", error)
    return { success: false, error: message, data: null }
  }
}

export async function deleteProductAction(
  id: string,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()

  try {
    const deleted = await deleteProductUC.execute({ id, user: session?.user })
    return { success: true, data: deleted as ProductEntity, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("DELETE PRODUCT ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

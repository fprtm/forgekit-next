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

import { logActivityUC } from "@/modules/audit-logs/presentation/http/actions/audit-log.actions"

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
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getProductAction(id: string): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  try {
    const product = await getProductUC.execute({ id, user: session?.user })
    return { success: true, data: product, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function createProductAction(
  input: Omit<CreateProductCommand, "user">,
): Promise<ActionResult<ProductEntity>> {
  const session = await auth()
  
  try {
    const created = await createProductUC.execute({ ...input, user: session?.user } as CreateProductCommand)
    // Auditing activity
    await logActivityUC.execute({
      userId: session?.user?.id || null,
      action: "product:create",
      details: `Product created: ${created.name} (Price: $${created.price})`,
    })
    return { success: true, data: created, error: null }
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR:", error)
    const message = error instanceof Error ? error.message : "Internal error"
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
    // Auditing activity
    await logActivityUC.execute({
      userId: session?.user?.id || null,
      action: "product:update",
      details: `Product updated: id=${id} (Name: ${updated.name})`,
    })
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

  try {
    const deleted = await deleteProductUC.execute({ id, user: session?.user })
    // Auditing activity
    await logActivityUC.execute({
      userId: session?.user?.id || null,
      action: "product:delete",
      details: `Product deleted: id=${id} (Name: ${deleted.name})`,
    })
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

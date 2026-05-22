"use server"

import { ProductsService } from "../../application/services"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function createProductAction(
  input: unknown,
): Promise<ActionResult<unknown>> {
  try {
    const created = await ProductsService.createProduct(input)
    return { success: true, data: created, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

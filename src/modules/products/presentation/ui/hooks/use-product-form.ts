import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { createProductSchema } from "../../../application/validations"
import { createProductAction, updateProductAction } from "../../http/actions/product.actions"
import { ProductEntity } from "../../../domain/entities/product.entity"
import { routes } from "@/shared/config/routes"

// createProductSchema applies a `.default(null)` transform on `description`, so
// the raw form input type (pre-transform) and the resolved output type differ:
// the input allows description to be omitted, the output always has it present.
export type ProductFormValues = z.input<typeof createProductSchema>
export type ProductFormOutput = z.output<typeof createProductSchema>

export function useProductForm(initialData?: ProductEntity) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description ?? null,
      price: initialData?.price || 0,
    },
  })

  async function onSubmit(data: ProductFormOutput) {
    const payload = { ...data, description: data.description ?? undefined }
    const res = isEditing && initialData
      ? await updateProductAction(initialData.id, payload)
      : await createProductAction(payload)

    if (res.success) {
      toast.success(isEditing ? "Product updated!" : "Product created!")
      router.push(routes.dashboard.products.list)
    } else {
      toast.error(res.error)
    }
  }

  return {
    form,
    onSubmit,
    isEditing,
  }
}

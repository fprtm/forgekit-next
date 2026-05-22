import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createProductSchema } from "../../../../application/validations"
import { createProductAction, updateProductAction } from "../../actions"
import { ProductEntity } from "../../../../domain/types"

export interface ProductFormValues {
  name: string
  description?: string
  price: number
}

export function useProductForm(initialData?: ProductEntity) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || undefined,
      price: initialData?.price || 0,
    },
  })

  async function onSubmit(data: ProductFormValues) {
    const res = isEditing && initialData
      ? await updateProductAction(initialData.id, data)
      : await createProductAction(data)

    if (res.success) {
      toast.success(isEditing ? "Product updated!" : "Product created!")
      router.push("/products")
      router.refresh()
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

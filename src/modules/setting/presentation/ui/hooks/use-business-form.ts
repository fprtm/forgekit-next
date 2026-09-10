import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { businessSchema, BusinessFormValues, BusinessFormOutput } from "../../../application/validations"
import { updateSettingAction, deleteSettingAction } from "../../http/actions/setting.actions"

interface UseBusinessFormProps {
  initialName: string
  initialShortName: string
  initialDescription: string
  initialTimezone: string
}

const DEFAULT_TIMEZONE = "Asia/Jakarta"

export function useBusinessForm({
  initialName,
  initialShortName,
  initialDescription,
  initialTimezone,
}: UseBusinessFormProps) {
  const [isResetting, setIsResetting] = useState(false)

  const form = useForm<BusinessFormValues, unknown, BusinessFormOutput>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: initialName,
      shortName: initialShortName,
      description: initialDescription,
      timezone: initialTimezone || DEFAULT_TIMEZONE,
    },
  })

  async function onSubmit(data: BusinessFormOutput) {
    const nameRes = await updateSettingAction("business_name", {
      name: data.businessName.trim(),
      shortName: data.shortName?.trim(),
      description: data.description?.trim(),
    })
    const tzRes = await updateSettingAction("timezone", { value: data.timezone })

    if (nameRes.success && tzRes.success) {
      toast.success(
        "Business profile updated successfully! Please refresh the page to apply branding & layout updates globally.",
      )
    } else {
      toast.error(nameRes.error || tzRes.error || "Failed to update business profile")
    }
  }

  async function onReset() {
    setIsResetting(true)
    try {
      const nameRes = await deleteSettingAction("business_name")
      const tzRes = await deleteSettingAction("timezone")

      if (nameRes.success && tzRes.success) {
        form.reset({
          businessName: "",
          shortName: "",
          description: "",
          timezone: DEFAULT_TIMEZONE,
        })
        toast.success("Business settings reset to system defaults! Please refresh the page to apply changes.")
      } else {
        toast.error(nameRes.error || tzRes.error || "Failed to reset settings")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return { form, onSubmit, onReset, isResetting }
}

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { policySchema, PolicyFormValues, PolicyFormOutput } from "../../../application/validations"
import { updateSettingAction, deleteSettingAction } from "../../http/actions/setting.actions"

interface UsePolicyFormProps {
  initialMode: "strict" | "flexible"
  initialRefundPercent: number
}

export function usePolicyForm({ initialMode, initialRefundPercent }: UsePolicyFormProps) {
  const [isResetting, setIsResetting] = useState(false)

  const form = useForm<PolicyFormValues, unknown, PolicyFormOutput>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      cancellationMode: initialMode,
      refundPercent: initialRefundPercent,
    },
  })

  async function onSubmit(data: PolicyFormOutput) {
    const res = await updateSettingAction("cancellation", {
      mode: data.cancellationMode,
      refundPercent: data.cancellationMode === "strict" ? data.refundPercent : undefined,
    })

    if (res.success) {
      toast.success("Cancellation policies saved successfully")
    } else {
      toast.error(res.error || "Failed to save policies")
    }
  }

  async function onReset() {
    setIsResetting(true)
    try {
      const res = await deleteSettingAction("cancellation")
      if (res.success) {
        form.reset({
          cancellationMode: "flexible",
          refundPercent: 100,
        })
        toast.success("Cancellation policy removed successfully")
      } else {
        toast.error(res.error || "Failed to delete policy settings")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return { form, onSubmit, onReset, isResetting }
}

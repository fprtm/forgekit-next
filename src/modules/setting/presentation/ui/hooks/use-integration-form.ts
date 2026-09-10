import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { integrationSchema, IntegrationFormValues, IntegrationFormOutput } from "../../../application/validations"
import { updateSettingAction, deleteSettingAction } from "../../http/actions/setting.actions"

interface UseIntegrationFormProps {
  initialMidtransClientKey?: string
  initialMidtransServerKey?: string
  initialMidtransIsProduction?: boolean
  initialFonnteApiToken?: string
  initialFonnteDeviceId?: string
}

export function useIntegrationForm({
  initialMidtransClientKey = "",
  initialMidtransServerKey = "",
  initialMidtransIsProduction = false,
  initialFonnteApiToken = "",
  initialFonnteDeviceId = "",
}: UseIntegrationFormProps) {
  const [isResetting, setIsResetting] = useState(false)

  const form = useForm<IntegrationFormValues, unknown, IntegrationFormOutput>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      midtransClientKey: initialMidtransClientKey,
      midtransServerKey: initialMidtransServerKey,
      midtransIsProduction: initialMidtransIsProduction,
      fonnteApiToken: initialFonnteApiToken,
      fonnteDeviceId: initialFonnteDeviceId,
    },
  })

  async function onSubmit(data: IntegrationFormOutput) {
    const resMidtrans = await updateSettingAction("midtrans_credentials", {
      clientKey: data.midtransClientKey ?? "",
      serverKey: data.midtransServerKey ?? "",
      isProduction: data.midtransIsProduction,
    })

    const resFonnte = await updateSettingAction("fonnte_credentials", {
      apiToken: data.fonnteApiToken ?? "",
      deviceId: data.fonnteDeviceId || undefined,
    })

    if (resMidtrans.success && resFonnte.success) {
      toast.success("API Integrations updated successfully")
    } else {
      toast.error(resMidtrans.error || resFonnte.error || "Failed to update integration settings")
    }
  }

  async function onReset() {
    setIsResetting(true)
    try {
      const resMidtrans = await deleteSettingAction("midtrans_credentials")
      const resFonnte = await deleteSettingAction("fonnte_credentials")
      if (resMidtrans.success && resFonnte.success) {
        form.reset({
          midtransClientKey: "",
          midtransServerKey: "",
          midtransIsProduction: false,
          fonnteApiToken: "",
          fonnteDeviceId: "",
        })
        toast.success("API credentials removed successfully")
      } else {
        toast.error(resMidtrans.error || resFonnte.error || "Failed to delete integration settings")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return { form, onSubmit, onReset, isResetting }
}

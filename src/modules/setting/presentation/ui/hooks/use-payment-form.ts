import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { paymentSchema, PaymentFormValues, PaymentFormOutput } from "../../../application/validations"
import { updateSettingAction, deleteSettingAction } from "../../http/actions/setting.actions"

interface UsePaymentFormProps {
  initialType: "flat" | "percentage"
  initialAmount: number
  initialPaymentMode?: "midtrans" | "manual" | "both"
  initialManualInstructions?: string
  initialBankName?: string
  initialAccountNumber?: string
  initialAccountHolder?: string
  initialConfirmationPhone?: string
}

export function usePaymentForm({
  initialType,
  initialAmount,
  initialPaymentMode = "midtrans",
  initialManualInstructions = "",
  initialBankName = "",
  initialAccountNumber = "",
  initialAccountHolder = "",
  initialConfirmationPhone = "",
}: UsePaymentFormProps) {
  const [isResetting, setIsResetting] = useState(false)

  const form = useForm<PaymentFormValues, unknown, PaymentFormOutput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      depositType: initialType,
      depositAmount: initialAmount,
      paymentMode: initialPaymentMode,
      manualInstructions: initialManualInstructions,
      bankName: initialBankName,
      accountNumber: initialAccountNumber,
      accountHolder: initialAccountHolder,
      confirmationPhone: initialConfirmationPhone,
    },
  })

  function handlePhoneChange(val: string) {
    let cleaned = val.replace(/\D/g, "")
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1)
    }
    form.setValue("confirmationPhone", cleaned, { shouldValidate: true })
  }

  async function onSubmit(data: PaymentFormOutput) {
    const resDeposit = await updateSettingAction("deposit", {
      type: data.depositType,
      amount: data.depositAmount,
    })

    const resMethod = await updateSettingAction("payment_method", {
      mode: data.paymentMode,
      manualInstructions: data.paymentMode !== "midtrans" ? data.manualInstructions : undefined,
      bankName: data.paymentMode !== "midtrans" ? data.bankName : undefined,
      accountNumber: data.paymentMode !== "midtrans" ? data.accountNumber : undefined,
      accountHolder: data.paymentMode !== "midtrans" ? data.accountHolder : undefined,
      confirmationPhone: data.paymentMode !== "midtrans" ? data.confirmationPhone : undefined,
    })

    if (resDeposit.success && resMethod.success) {
      toast.success("Payment settings updated successfully")
    } else {
      toast.error(resDeposit.error || resMethod.error || "Failed to update payment settings")
    }
  }

  async function onReset() {
    setIsResetting(true)
    try {
      const resDeposit = await deleteSettingAction("deposit")
      const resMethod = await deleteSettingAction("payment_method")
      if (resDeposit.success && resMethod.success) {
        form.reset({
          depositType: "flat",
          depositAmount: 0,
          paymentMode: "midtrans",
          manualInstructions: "",
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          confirmationPhone: "",
        })
        toast.success("Deposit configurations removed successfully")
      } else {
        toast.error(resDeposit.error || resMethod.error || "Failed to delete deposit settings")
      }
    } finally {
      setIsResetting(false)
    }
  }

  return { form, onSubmit, onReset, isResetting, handlePhoneChange }
}

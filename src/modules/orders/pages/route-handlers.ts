import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import crypto from "crypto"
import { OrdersService } from "../service"

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string,
) {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex")
  return hash === receivedSignature
}

export async function midtransWebhookHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
    } = body

    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key,
    )

    if (!isValid) return apiError("Invalid signature", 401)

    await OrdersService.processPaymentWebhook(transaction_status, order_id)

    return apiSuccess({ received: true })
  } catch {
    return apiError("Internal server error", 500)
  }
}

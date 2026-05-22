import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import crypto from "crypto";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

// Verifikasi signature Midtrans
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
    .digest("hex");
  return hash === receivedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    // Verifikasi signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key,
    );

    if (!isValid) return apiError("Invalid signature", 401);

    // Update status order
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      await db
        .update(orders)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(orders.id, order_id));
    }

    if (transaction_status === "cancel" || transaction_status === "expire") {
      await db
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(orders.id, order_id));
    }

    return apiSuccess({ received: true });
  } catch {
    return apiError("Internal server error", 500);
  }
}

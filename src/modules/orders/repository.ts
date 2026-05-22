import { db } from "@/db"
import { eq } from "drizzle-orm"
import { orders } from "./schema"

export const OrdersRepository = {
  async updateStatus(id: string, status: "paid" | "cancelled") {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning()
    return updated
  }
}

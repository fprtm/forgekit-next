import { OrdersRepository } from "./repository"

export const OrdersService = {
  async processPaymentWebhook(transactionStatus: string, orderId: string) {
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      return OrdersRepository.updateStatus(orderId, "paid")
    }

    if (transactionStatus === "cancel" || transactionStatus === "expire") {
      return OrdersRepository.updateStatus(orderId, "cancelled")
    }

    return null
  }
}

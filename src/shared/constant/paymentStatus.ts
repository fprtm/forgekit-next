export const PaymentStatus = {
  unpaid: "unpaid",
  partial: "partial",
  paid: "paid",
  refunded: "refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];


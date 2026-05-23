import { NextResponse } from "next/server";

// Placeholder for Midtrans webhook integration.
// Will be connected to the Orders module once it is implemented.
export async function POST() {
  return NextResponse.json({ message: "Midtrans Webhook Handler Placeholder" });
}

import { authController } from "@/modules/auth/presentation/http/controllers/auth.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Pass the request strictly to the delivery layer (controller)
  return authController.register(req);
}

import { impersonateController } from "@/modules/auth/presentation/http/controllers/impersonate.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return impersonateController.impersonate(req);
}

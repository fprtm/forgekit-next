import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/shared/lib/api-response";
import { DrizzleSettingRepository } from "../../infrastructure/database/repositories/drizzle-setting.repository";
import { GetSettingHandler } from "../../application/use-cases/get-setting/get-setting.handler";
import { UpdateSettingHandler } from "../../application/use-cases/update-setting/update-setting.handler";
import { auth } from "@/shared/lib/auth";
import { can } from "@/modules/auth/domain/policies";
import { SettingCategory, SettingKey } from "../../domain/entities/setting.entity";

const settingRepo = new DrizzleSettingRepository();
const getSettingUC = new GetSettingHandler(settingRepo);
const updateSettingUC = new UpdateSettingHandler(settingRepo);

export async function getSettingsHandler(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user ? { id: session.user.id, role: session.user.role } : null;

    if (!user || !can(user, "settings:read")) {
      return apiError("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") as SettingKey | null;

    if (key) {
      const data = await getSettingUC.execute({ key });
      return apiSuccess(data);
    }

    const data = await settingRepo.findAll();
    return apiSuccess(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, 500);
  }
}

export async function updateSettingHandler(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user ? { id: session.user.id, role: session.user.role } : null;

    if (!user || !can(user, "settings:write")) {
      return apiError("Forbidden", 403);
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return apiError("Missing 'key' in request body", 400);
    }

    const updated = await updateSettingUC.execute({ key, value });
    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, 500);
  }
}

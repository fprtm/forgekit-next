import { NextRequest, NextResponse } from "next/server";
import { GetSettingHandler } from "@/modules/setting/application/use-cases/get-setting/get-setting.handler";
import { DrizzleSettingRepository } from "@/modules/setting/infrastructure/database/repositories/drizzle-setting.repository";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { SettingKey } from "@/modules/setting/domain/entities/setting.entity";

const settingRepo = new DrizzleSettingRepository();
const getSettingUC = new GetSettingHandler(settingRepo);

export class SettingController {
  /**
   * REST API Controller for fetching app settings.
   */
  public async getSetting(req: NextRequest, { params }: { params: { key: string } }): Promise<NextResponse> {
    try {
      const result = await getSettingUC.execute({
        key: params.key as SettingKey
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }

      console.error("SETTING_CONTROLLER_GET_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const settingController = new SettingController();

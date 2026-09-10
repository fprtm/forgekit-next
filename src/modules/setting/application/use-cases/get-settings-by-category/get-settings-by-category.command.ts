import { AuthUser } from "@/modules/auth/domain/types"
import { SettingCategory } from "../../../domain/entities/setting.entity"

export interface GetSettingsByCategoryCommand {
  category: SettingCategory
  user?: AuthUser
}

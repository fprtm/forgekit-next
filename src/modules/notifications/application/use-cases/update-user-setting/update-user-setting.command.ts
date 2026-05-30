export interface UpdateUserSettingCommand {
  userId: string;
  email?: boolean;
  push?: boolean;
  whatsapp?: boolean;
}

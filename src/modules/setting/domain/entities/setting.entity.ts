export type SettingCategory = "payment" | "business" | "policy" | "general";

export type DepositSetting = {
  type: "flat" | "percentage";
  amount: number;
};

export type CancellationSetting = {
  mode: "strict" | "flexible";
  refundPercent?: number;
};

export type BusinessSetting = {
  name: string;
  shortName?: string;
  description?: string;
};

export type TherapistAssignmentSetting = {
  mode: "patient_select" | "auto_assign";
};

export type PaymentMethodSetting = {
  mode: "midtrans" | "manual" | "both";
  manualInstructions?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  confirmationPhone?: string;
};

export type MidtransCredentialsSetting = {
  clientKey: string;
  serverKey: string;
  isProduction: boolean;
};

export type FonnteCredentialsSetting = {
  apiToken: string;
  deviceId?: string;
};

export type SettingsValueMap = {
  deposit: DepositSetting;
  payment_method: PaymentMethodSetting;
  cancellation: CancellationSetting;
  business_name: BusinessSetting;
  timezone: {
    value: string;
  };
  therapist_assignment: TherapistAssignmentSetting;
  midtrans_credentials: MidtransCredentialsSetting;
  fonnte_credentials: FonnteCredentialsSetting;
};
export type SettingKey = keyof SettingsValueMap;

export type Setting<K extends SettingKey = SettingKey> = {
  id: string;
  category: SettingCategory;
  key: K;
  value: SettingsValueMap[K];
  createdAt: Date;
  updatedAt: Date;
};

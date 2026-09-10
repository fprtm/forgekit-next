import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { SettingKeyValueObject } from "../value-objects/setting-key.value-object";

export type SettingCategory = "payment" | "business" | "policy" | "general" | "notification";

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

export type NotificationChannelsSetting = {
  email: boolean;
  push: boolean;
  whatsapp: boolean;
};

export type EmailGatewaySetting = {
  host: string;
  port: number;
  user: string;
  pass: string;
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
  notification_channels: NotificationChannelsSetting;
  email_gateway: EmailGatewaySetting;
};
export type SettingKey = keyof SettingsValueMap;

export type SettingProps<K extends SettingKey = SettingKey> = {
  id: string;
  category: SettingCategory;
  key: K;
  value: SettingsValueMap[K];
  createdAt: Date;
  updatedAt: Date;
};

export class Setting<K extends SettingKey = SettingKey> {
  public readonly id: string;
  public readonly category: SettingCategory;
  public readonly key: K;
  public readonly value: SettingsValueMap[K];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: SettingProps<K>) {
    this.id = props.id;
    this.category = props.category;
    this.key = props.key;
    this.value = props.value;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Creates a new Setting, enforcing domain invariants (key format, id
   * presence). Use this when a Setting is being created/changed by the
   * application, as opposed to being loaded verbatim from the database.
   */
  public static create<K extends SettingKey>(props: SettingProps<K>): Setting<K> {
    if (!props.id || props.id.trim() === "") {
      throw new DomainException("Setting id cannot be empty", "INVALID_SETTING_ID", 400);
    }

    SettingKeyValueObject.create(props.key);

    return new Setting<K>(props);
  }

  /**
   * Reconstructs a Setting from raw persistence data (e.g. a Drizzle row).
   * Skips re-validation since the data is assumed to already be valid,
   * having passed through `create` at write time.
   */
  public static reconstruct<K extends SettingKey>(raw: SettingProps<K>): Setting<K> {
    return new Setting<K>(raw);
  }

  /**
   * Plain-object projection so this entity can cross the Server->Client
   * Component boundary (React's RSC serializer rejects class instances but
   * respects toJSON()) and so it survives JSON.stringify anywhere else.
   */
  public toJSON(): SettingProps<K> {
    return {
      id: this.id,
      category: this.category,
      key: this.key,
      value: this.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

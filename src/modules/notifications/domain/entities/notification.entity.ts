export type NotificationType = "system" | "security" | "marketing" | "product" | "general";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

/** Raw persisted shape, as returned by the database. Used with `NotificationEntity.reconstruct()`. */
export interface NotificationRow {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Fields required to persist a brand-new notification. Used with `INotificationRepository.create()`. */
export type CreateNotificationInput = Omit<NotificationRow, "id" | "createdAt" | "updatedAt">;

export class NotificationEntity {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly title: string,
    readonly message: string,
    readonly type: NotificationType,
    readonly priority: NotificationPriority,
    readonly read: boolean,
    readonly readAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  /** Creates a brand-new, unread notification. Used for new entity creation. */
  static create(props: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
  }): NotificationEntity {
    const now = new Date();
    return new NotificationEntity(
      crypto.randomUUID(),
      props.userId,
      props.title,
      props.message,
      props.type,
      props.priority,
      false,
      null,
      now,
      now
    );
  }

  /** Rebuilds an entity from persisted data. No validation — trusts the database. */
  static reconstruct(raw: NotificationRow): NotificationEntity {
    return new NotificationEntity(
      raw.id,
      raw.userId,
      raw.title,
      raw.message,
      raw.type,
      raw.priority,
      raw.read,
      raw.readAt,
      raw.createdAt,
      raw.updatedAt
    );
  }

  /**
   * Plain-object projection so this entity can cross the Server->Client
   * Component boundary (React's RSC serializer rejects class instances but
   * respects toJSON()) and so it survives JSON.stringify anywhere else.
   */
  toJSON(): NotificationRow {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      priority: this.priority,
      read: this.read,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** Returns a new instance marked as read. */
  markAsRead(): NotificationEntity {
    return new NotificationEntity(
      this.id,
      this.userId,
      this.title,
      this.message,
      this.type,
      this.priority,
      true,
      new Date(),
      this.createdAt,
      new Date()
    );
  }
}

export interface UserNotificationSettingsEntity {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  system: boolean;
  security: boolean;
  marketing: boolean;
  product: boolean;
  general: boolean;
  createdAt: Date;
  updatedAt: Date;
}

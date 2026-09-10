import { DomainEvent } from "@/shared/domain/events/domain.event";
import { UserEntity } from "../entities/user.entity";

export class UserCreatedEvent implements DomainEvent {
  public readonly eventName = "UserCreatedEvent";
  public readonly occurredOn: Date;
  public readonly user: UserEntity;
  public readonly adminId: string | null;

  constructor(user: UserEntity, adminId: string | null) {
    this.occurredOn = new Date();
    this.user = user;
    this.adminId = adminId;
  }
}

export class UserUpdatedEvent implements DomainEvent {
  public readonly eventName = "UserUpdatedEvent";
  public readonly occurredOn: Date;
  public readonly user: UserEntity;
  public readonly adminId: string | null;

  constructor(user: UserEntity, adminId: string | null) {
    this.occurredOn = new Date();
    this.user = user;
    this.adminId = adminId;
  }
}

export class UserDeletedEvent implements DomainEvent {
  public readonly eventName = "UserDeletedEvent";
  public readonly occurredOn: Date;
  public readonly deletedUser: UserEntity;
  public readonly adminId: string | null;

  constructor(deletedUser: UserEntity, adminId: string | null) {
    this.occurredOn = new Date();
    this.deletedUser = deletedUser;
    this.adminId = adminId;
  }
}

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName = "UserRegisteredEvent";
  public readonly occurredOn: Date;
  public readonly user: UserEntity;

  constructor(user: UserEntity) {
    this.occurredOn = new Date();
    this.user = user;
  }
}

export class UserPasswordResetEvent implements DomainEvent {
  public readonly eventName = "UserPasswordResetEvent";
  public readonly occurredOn: Date;
  public readonly user: UserEntity;
  public readonly adminId: string | null;

  constructor(user: UserEntity, adminId: string | null) {
    this.occurredOn = new Date();
    this.user = user;
    this.adminId = adminId;
  }
}

/**
 * Dispatched when a (logged-out) visitor requests a password reset link.
 * Carries the raw token so a listener can build the reset URL — the token
 * itself is never persisted anywhere except the (hashed-by-nobody, short-lived)
 * verification_tokens row, so this event is the only place it's ever visible
 * for delivery (e.g. logging it in dev, or handing it to a real email provider).
 */
export class PasswordResetRequestedEvent implements DomainEvent {
  public readonly eventName = "PasswordResetRequestedEvent";
  public readonly occurredOn: Date;
  public readonly email: string;
  public readonly token: string;

  constructor(email: string, token: string) {
    this.occurredOn = new Date();
    this.email = email;
    this.token = token;
  }
}

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

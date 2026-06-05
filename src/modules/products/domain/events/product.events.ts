import { DomainEvent } from "@/shared/domain/events/domain.event";
import { ProductEntity } from "../entities/product.entity";

export class ProductCreatedEvent implements DomainEvent {
  public readonly eventName = "ProductCreatedEvent";
  public readonly occurredOn: Date;
  public readonly product: ProductEntity;
  public readonly userId: string | null;

  constructor(product: ProductEntity, userId: string | null) {
    this.occurredOn = new Date();
    this.product = product;
    this.userId = userId;
  }
}

export class ProductUpdatedEvent implements DomainEvent {
  public readonly eventName = "ProductUpdatedEvent";
  public readonly occurredOn: Date;
  public readonly product: ProductEntity;
  public readonly userId: string | null;

  constructor(product: ProductEntity, userId: string | null) {
    this.occurredOn = new Date();
    this.product = product;
    this.userId = userId;
  }
}

export class ProductDeletedEvent implements DomainEvent {
  public readonly eventName = "ProductDeletedEvent";
  public readonly occurredOn: Date;
  public readonly productId: string;
  public readonly productName: string;
  public readonly userId: string | null;

  constructor(productId: string, productName: string, userId: string | null) {
    this.occurredOn = new Date();
    this.productId = productId;
    this.productName = productName;
    this.userId = userId;
  }
}

import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { ProductCreatedEvent } from "../../domain/events/product.events";

export class ProductInventoryService {
  public registerListeners(): void {
    eventDispatcher.register<ProductCreatedEvent>("ProductCreatedEvent", async (event) => {
      // Stub: Initialize inventory count for the new product in a third-party ERP.
      console.log(`[Inventory Service] Initializing default stock for Product ID: ${event.product.id}`);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      console.log(`[Inventory Service] Stock initialized for ${event.product.name}`);
    });
  }
}

export const productInventoryService = new ProductInventoryService();
productInventoryService.registerListeners();

import { describe, expect, it, mock, beforeEach } from "bun:test";
import { createProductSchema, updateProductSchema } from "../validations";
import { CreateProductHandler } from "../use-cases/create-product/create-product.handler";
import { GetProductsHandler } from "../use-cases/get-products/get-products.handler";
import { UpdateProductHandler } from "../use-cases/update-product/update-product.handler";
import { DeleteProductHandler } from "../use-cases/delete-product/delete-product.handler";
import { IProductRepository } from "../../domain/repositories/product-repository.interface";
import { ProductEntity } from "../../domain/entities/product.entity";
import { AuthUser } from "@/modules/auth/domain/types";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

describe("Products Bounded Context - Unit & Validation Tests", () => {
  let mockProductRepository: IProductRepository;
  const testUser: AuthUser = { id: "user-1", role: "super_admin" };
  const dummyProduct: ProductEntity = ProductEntity.reconstruct({
    id: "prod-1",
    name: "Test Laptop",
    description: "High-end developer computer",
    price: 1500,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockProductRepository = {
      findMany: mock(() => Promise.resolve([dummyProduct])),
      findById: mock(() => Promise.resolve(dummyProduct)),
      create: mock((data) => Promise.resolve({ ...dummyProduct, ...data })),
      update: mock((id, data) => Promise.resolve({ ...dummyProduct, ...data })),
      delete: mock(() => Promise.resolve(dummyProduct)),
    };
  });

  describe("Validations (Zod Schemas)", () => {
    it("should accept valid product data", () => {
      const validData = {
        name: "Test Product",
        description: "A great product",
        price: 100,
      };
      const result = createProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const invalidData = {
        name: "Test Product",
        price: -10,
      };
      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Use Cases (Business Logic)", () => {
    it("should get all products via GetProductsHandler", async () => {
      const handler = new GetProductsHandler(mockProductRepository);
      const result = await handler.execute({ search: "" });

      expect(result).toEqual([dummyProduct]);
      expect(mockProductRepository.findMany).toHaveBeenCalled();
    });

    it("should create a product via CreateProductHandler", async () => {
      const handler = new CreateProductHandler(mockProductRepository);
      const input = { name: "New Keyboard", price: 120, user: testUser };
      const result = await handler.execute(input);

      expect(result.name).toBe("New Keyboard");
      expect(result.price).toBe(120);
      expect(mockProductRepository.create).toHaveBeenCalled();
    });

    it("should update a product via UpdateProductHandler", async () => {
      const handler = new UpdateProductHandler(mockProductRepository);
      const input = { id: "prod-1", price: 1350, user: testUser };
      const result = await handler.execute(input);

      expect(result.price).toBe(1350);
      expect(mockProductRepository.update).toHaveBeenCalled();
    });

    it("should delete a product via DeleteProductHandler", async () => {
      const handler = new DeleteProductHandler(mockProductRepository);
      const result = await handler.execute({ id: "prod-1", user: testUser });

      expect(result.id).toBe("prod-1");
      expect(mockProductRepository.delete).toHaveBeenCalled();
    });
  });
});

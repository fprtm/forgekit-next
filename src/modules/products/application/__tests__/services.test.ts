import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

import { ProductsService } from "../services";
import { ProductsRepository } from "../../infrastructure/repository";

// Mock the repository
mock.module("../../infrastructure/repository", () => {
  return {
    ProductsRepository: {
      findMany: mock(),
      findById: mock(),
      create: mock(),
      update: mock(),
      delete: mock(),
    }
  };
});

type MockedFunction<T extends (...args: never[]) => unknown> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
};

const mockFindMany = ProductsRepository.findMany as unknown as MockedFunction<typeof ProductsRepository.findMany>;
const mockFindById = ProductsRepository.findById as unknown as MockedFunction<typeof ProductsRepository.findById>;
const mockCreate = ProductsRepository.create as unknown as MockedFunction<typeof ProductsRepository.create>;
const mockUpdate = ProductsRepository.update as unknown as MockedFunction<typeof ProductsRepository.update>;
const mockDelete = ProductsRepository.delete as unknown as MockedFunction<typeof ProductsRepository.delete>;

describe("Products Service", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFindMany.mockClear();
    mockFindById.mockClear();
    mockCreate.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  });

  it("should get all products", async () => {
    const mockProducts = [
      { id: "1", name: "P1", description: null, price: 10, createdAt: new Date(), updatedAt: new Date() }
    ];
    mockFindMany.mockResolvedValue(mockProducts);

    const result = await ProductsService.getProducts();
    expect(result).toEqual(mockProducts);
    expect(ProductsRepository.findMany).toHaveBeenCalled();
  });

  it("should create a product with valid data", async () => {
    const input = { name: "New Product", price: 50 };
    const mockCreated = { id: "2", ...input, description: null, createdAt: new Date(), updatedAt: new Date() };
    
    mockCreate.mockResolvedValue(mockCreated);

    const result = await ProductsService.createProduct(input);
    expect(result).toEqual(mockCreated);
    expect(ProductsRepository.create).toHaveBeenCalled();
  });

  it("should throw error when creating product with invalid data", async () => {
    const input = { name: "", price: -5 };
    
    expect(ProductsService.createProduct(input)).rejects.toThrow();
    expect(ProductsRepository.create).not.toHaveBeenCalled();
  });
});


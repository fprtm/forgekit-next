import { describe, expect, it, mock, beforeEach } from "bun:test";
import { LogActionHandler } from "../use-cases/log-action/log-action.handler";
import { GetAuditLogsHandler } from "../use-cases/get-audit-logs/get-audit-logs.handler";
import { IAuditLogRepository } from "../../domain/repositories/audit-log-repository.interface";
import { AuditLogEntity } from "../../domain/entities/audit-log.entity";
import { AuditActionValueObject } from "../../domain/value-objects/audit-action.value-object";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";
import { EventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { AuditLogEntryCreatedEvent } from "../../domain/events/audit-log.events";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

describe("Audit Logs Bounded Context - Unit & Validation Tests", () => {
  let mockAuditLogRepository: IAuditLogRepository;
  let eventDispatcher: EventDispatcher;

  const dummyLog: AuditLogEntity = AuditLogEntity.reconstruct({
    id: "log-1",
    action: "CREATE",
    entityName: "Product",
    entityId: "prod-1",
    actorId: "user-1",
    details: {},
    ipAddress: null,
    createdAt: new Date(),
  });

  beforeEach(() => {
    eventDispatcher = EventDispatcher.getInstance();

    mockAuditLogRepository = {
      create: mock(() => Promise.resolve(dummyLog)),
      findMany: mock(() => Promise.resolve([dummyLog])),
      findById: mock(() => Promise.resolve(dummyLog)),
      count: mock(() => Promise.resolve(1)),
    };
  });

  describe("AuditLogEntity", () => {
    it("should throw a DomainException when created with an invalid action", () => {
      expect(() =>
        AuditLogEntity.create({
          action: "NOT_A_REAL_ACTION" as never,
          entityName: "Product",
          actorId: "user-1",
          details: {},
        })
      ).toThrow(DomainException);
    });

    it("should create successfully with a valid action", () => {
      const log = AuditLogEntity.create({
        action: "DELETE",
        entityName: "Product",
        actorId: "user-1",
        details: { reason: "cleanup" },
      });

      expect(log.action).toBe("DELETE");
      expect(log.entityName).toBe("Product");
    });

    it("should not validate when reconstructing from persistence, even with a legacy-invalid action", () => {
      expect(() =>
        AuditLogEntity.reconstruct({
          id: "log-2",
          action: "NOT_A_REAL_ACTION" as never,
          entityName: "Product",
          entityId: null,
          actorId: "user-1",
          details: {},
          ipAddress: null,
          createdAt: new Date(),
        })
      ).not.toThrow();
    });
  });

  describe("AuditActionValueObject", () => {
    it("should throw a DomainException on an invalid action", () => {
      expect(() => AuditActionValueObject.create("INVALID")).toThrow(DomainException);
    });

    it("should accept a valid action", () => {
      expect(AuditActionValueObject.create("LOGIN").getValue()).toBe("LOGIN");
    });
  });

  describe("LogActionHandler", () => {
    it("should create a log entry with correctly mapped fields", async () => {
      const handler = new LogActionHandler(mockAuditLogRepository);
      const result = await handler.execute({
        action: "CREATE",
        entityName: "Product",
        entityId: "prod-1",
        actorId: "user-1",
        details: { name: "New Product" },
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual(dummyLog);
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        action: "CREATE",
        entityName: "Product",
        entityId: "prod-1",
        actorId: "user-1",
        details: { name: "New Product" },
        ipAddress: "127.0.0.1",
      });
    });

    it("should dispatch an AuditLogEntryCreatedEvent after persisting", async () => {
      const capturedEvents: AuditLogEntryCreatedEvent[] = [];
      eventDispatcher.register<AuditLogEntryCreatedEvent>("AuditLogEntryCreatedEvent", (event) => {
        capturedEvents.push(event);
      });

      const handler = new LogActionHandler(mockAuditLogRepository);
      await handler.execute({
        action: "CREATE",
        entityName: "Product",
        actorId: "user-1",
      });

      expect(capturedEvents.length).toBeGreaterThan(0);
      expect(capturedEvents[capturedEvents.length - 1].log).toEqual(dummyLog);
    });
  });

  describe("GetAuditLogsHandler", () => {
    it("should succeed for a super_admin role", async () => {
      const handler = new GetAuditLogsHandler(mockAuditLogRepository);
      const result = await handler.execute({}, "super_admin");

      expect(result).toEqual({ data: [dummyLog], total: 1 });
      expect(mockAuditLogRepository.findMany).toHaveBeenCalled();
      expect(mockAuditLogRepository.count).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException for a non-super_admin role", async () => {
      const handler = new GetAuditLogsHandler(mockAuditLogRepository);

      await expect(handler.execute({}, "admin")).rejects.toThrow(UnauthorizedException);
      await expect(handler.execute({}, "user")).rejects.toThrow(UnauthorizedException);
      expect(mockAuditLogRepository.findMany).not.toHaveBeenCalled();
    });
  });
});

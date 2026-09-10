import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GetDashboardStatsHandler } from "../use-cases/get-dashboard-stats/get-dashboard-stats.handler";
import { IStatReader } from "../../domain/repositories/stat-reader.interface";
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

describe("Dashboard Bounded Context - Unit Tests", () => {
  let mockStatReader: IStatReader;

  const recentLogs = [
    { action: "CREATE", entityName: "Product", createdAt: new Date() },
  ];

  beforeEach(() => {
    mockStatReader = {
      countUsers: mock(() => Promise.resolve(10)),
      countProducts: mock(() => Promise.resolve(25)),
      countLogs: mock(() => Promise.resolve(100)),
      getRecentLogs: mock(() => Promise.resolve(recentLogs)),
    };
  });

  describe("GetDashboardStatsHandler", () => {
    it("should throw UnauthorizedException for a role that isn't admin/super_admin", async () => {
      const handler = new GetDashboardStatsHandler(mockStatReader);

      await expect(handler.execute("user")).rejects.toThrow(UnauthorizedException);
      expect(mockStatReader.countUsers).not.toHaveBeenCalled();
    });

    it("should succeed and return the aggregated stats shape for super_admin", async () => {
      const handler = new GetDashboardStatsHandler(mockStatReader);
      const result = await handler.execute("super_admin");

      expect(result).toEqual({
        totalUsers: 10,
        totalProducts: 25,
        totalAuditLogs: 100,
        recentLogs,
      });
      expect(mockStatReader.countUsers).toHaveBeenCalled();
      expect(mockStatReader.countProducts).toHaveBeenCalled();
      expect(mockStatReader.countLogs).toHaveBeenCalled();
      expect(mockStatReader.getRecentLogs).toHaveBeenCalledWith(5);
    });

    it("should succeed and return the aggregated stats shape for admin", async () => {
      const handler = new GetDashboardStatsHandler(mockStatReader);
      const result = await handler.execute("admin");

      expect(result).toEqual({
        totalUsers: 10,
        totalProducts: 25,
        totalAuditLogs: 100,
        recentLogs,
      });
    });
  });
});

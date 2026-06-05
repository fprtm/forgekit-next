import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalAuditLogs: number;
  recentLogs: Array<{ action: string; entityName: string; createdAt: Date }>;
}

export interface IStatReader {
  countUsers(): Promise<number>;
  countProducts(): Promise<number>;
  countLogs(): Promise<number>;
  getRecentLogs(limit: number): Promise<Array<{ action: string; entityName: string; createdAt: Date }>>;
}

export class GetDashboardStatsHandler {
  constructor(private readonly statReader: IStatReader) {}

  async execute(currentUserRole: string): Promise<DashboardStats> {
    if (currentUserRole !== "super_admin" && currentUserRole !== "admin") {
      throw new UnauthorizedException("Only admin or super_admin can view dashboard stats");
    }

    const [totalUsers, totalProducts, totalAuditLogs, recentLogs] = await Promise.all([
      this.statReader.countUsers(),
      this.statReader.countProducts(),
      this.statReader.countLogs(),
      this.statReader.getRecentLogs(5),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalAuditLogs,
      recentLogs,
    };
  }
}

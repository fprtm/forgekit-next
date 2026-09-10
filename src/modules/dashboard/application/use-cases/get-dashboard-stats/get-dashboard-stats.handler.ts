import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";
import { DashboardStats } from "../../../domain/entities/dashboard-stats";
import { IStatReader } from "../../../domain/repositories/stat-reader.interface";

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

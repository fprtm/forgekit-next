// Pure domain read-model, independent of any framework or database ORM
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalAuditLogs: number;
  recentLogs: Array<{ action: string; entityName: string; createdAt: Date }>;
}

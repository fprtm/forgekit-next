export interface IStatReader {
  countUsers(): Promise<number>;
  countProducts(): Promise<number>;
  countLogs(): Promise<number>;
  getRecentLogs(limit: number): Promise<Array<{ action: string; entityName: string; createdAt: Date }>>;
}

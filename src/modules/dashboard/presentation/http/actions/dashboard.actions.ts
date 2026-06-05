"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleStatReader } from "../../../infrastructure/services/drizzle-stat-reader"
import { GetDashboardStatsHandler, DashboardStats } from "../../../application/use-cases/get-dashboard-stats/get-dashboard-stats.handler"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { logger } from "@/shared/lib/logger"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const statReader = new DrizzleStatReader()
const getDashboardStatsUC = new GetDashboardStatsHandler(statReader)

export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  const session = await auth()

  if (!session?.user?.role) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const stats = await getDashboardStatsUC.execute(session.user.role)
    return { success: true, data: stats, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ tag: "DASHBOARD_STATS", error }, "Unhandled error")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

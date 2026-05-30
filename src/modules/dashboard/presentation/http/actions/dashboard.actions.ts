"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleStatReader } from "../../../infrastructure/services/drizzle-stat-reader"
import { GetDashboardStatsHandler, DashboardStats } from "../../../application/use-cases/get-dashboard-stats/get-dashboard-stats.handler"

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
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

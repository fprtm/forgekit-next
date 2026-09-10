import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "@/shared/config/env"
import * as schema from "./schema"
import { DemoModeException } from "@/shared/domain/exceptions/demo-mode.exception"

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})
const rawDb = drizzle({ client: pool, schema })

// Tables that must keep writing even in demo mode — the audit trail is what the demo is showing
// off, and a login-triggered notification row is a bounded system side-effect, not visitor-spammable.
const DEMO_MODE_WRITE_ALLOWLIST = new Set<unknown>([schema.auditLogs, schema.notifications])

function guardWrite(table: unknown) {
  if (!DEMO_MODE_WRITE_ALLOWLIST.has(table)) {
    throw new DemoModeException()
  }
}

/**
 * When NEXT_PUBLIC_DEMO_MODE=true, block every insert/update/delete/transaction
 * except the allowlisted tables above — turns a live deployment into a click-through
 * demo without touching every repository or Server Action individually.
 */
export const db = env.NEXT_PUBLIC_DEMO_MODE === "true"
  ? new Proxy(rawDb, {
      get(target, prop, receiver) {
        if (prop === "insert" || prop === "update" || prop === "delete") {
          return (table: unknown, ...rest: unknown[]) => {
            guardWrite(table)
            return (target[prop] as (...a: unknown[]) => unknown).apply(target, [table, ...rest])
          }
        }
        if (prop === "transaction") {
          return () => {
            throw new DemoModeException()
          }
        }
        return Reflect.get(target, prop, receiver)
      },
    })
  : rawDb

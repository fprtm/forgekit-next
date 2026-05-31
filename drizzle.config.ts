import { config } from "dotenv"
import { resolve } from "path"
import { defineConfig } from "drizzle-kit"

config({ path: resolve(process.cwd(), ".env.local") })

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})

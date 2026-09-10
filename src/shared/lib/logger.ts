import pino from "pino";
import pinoPretty from "pino-pretty";
import { env } from "@/shared/config/env";

// Uses pino-pretty as a direct synchronous stream rather than pino's `transport`
// worker-thread option — the worker approach fails to resolve the "pino-pretty"
// module target under bundled runtimes (e.g. Next.js/Turbopack).
const stream =
  process.env.NODE_ENV === "development"
    ? pinoPretty({ colorize: true })
    : undefined;

export const logger = pino(
  {
    level: env.LOG_LEVEL,
  },
  stream,
);

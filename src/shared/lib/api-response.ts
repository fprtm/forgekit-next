import { NextResponse } from "next/server";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { logger } from "@/shared/lib/logger";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown, tag: string): NextResponse {
  if (error instanceof DomainException) {
    return apiError(error.message, error.statusCode);
  }
  logger.error({ tag, error }, "Unhandled error");
  return apiError("Internal Server Error", 500);
}

// lib/api-response.ts
import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/common-types';

// Note the order: data first, then message, then HTTP status code
export function sendSuccess<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode },
  );
}

export function sendError(
  message: string,
  statusCode = 400,
  errorDetails?: string | Record<string, unknown>,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      data: undefined,
      ...(errorDetails && { error: errorDetails }),
    },
    { status: statusCode },
  );
}

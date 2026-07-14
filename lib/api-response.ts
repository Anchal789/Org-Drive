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

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, unknown>;
};

export function sendActionError(
  message: string,
  errorDetails?: string | Record<string, unknown>,
): ActionResponse {
  return {
    success: false,
    message,
    ...(errorDetails && { error: errorDetails }),
  };
}

export function sendActionSuccess<T>(
  data: T,
  message?: string,
): ActionResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

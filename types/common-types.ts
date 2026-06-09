export interface FetchOptions extends RequestInit {
  params?: Record<string, unknown>;
}

export interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data: T;
  error?: string | Record<string, unknown>;
  status?: string;
  code?: number;
}

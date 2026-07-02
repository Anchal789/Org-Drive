import { useAuthStore } from "@/store/store";
import type { FailedRequest, FetchOptions } from "@/types/common-types";

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (token) request.resolve(token);
    else request.reject(error);
  });
  failedQueue = [];
};

const buildUrl = (url: string, params?: Record<string, unknown>): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fullUrl = new URL(url, baseUrl || window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }
  return fullUrl.toString();
};

const customFetch = async (
  url: string,
  options: FetchOptions = {},
): Promise<{ data: unknown }> => {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(buildUrl(url, options.params), config);

    if (response.ok) {
      const data = await response.json();
      return { data };
    }

    if (response.status === 401 && !url.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              headers.set("Authorization", `Bearer ${token}`);
              resolve(customFetch(url, { ...options, headers }));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!refreshRes.ok) {
          throw new Error("Refresh token expired or invalid");
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.data.accessToken;

        if (!newAccessToken) {
          throw new Error("Invalid token update structure");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        headers.set("Authorization", `Bearer ${newAccessToken}`);
        return await customFetch(url, { ...options, headers });
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`,
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    customFetch(url, { ...options, method: "GET" }) as Promise<{ data: T }>,

  post: <T>(
    url: string,
    payload: unknown,
    options?: FetchOptions,
    isFormData?: boolean,
  ) =>
    customFetch(url, {
      ...options,
      method: "POST",
      body: isFormData ? (payload as BodyInit) : JSON.stringify(payload),
      headers: isFormData ? undefined : options?.headers,
    }) as Promise<{ data: T }>,

  put: <T>(url: string, payload: unknown, options?: FetchOptions) =>
    customFetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(payload),
    }) as Promise<{ data: T }>,

  delete: <T>(url: string, options?: FetchOptions) =>
    customFetch(url, { ...options, method: "DELETE" }) as Promise<{ data: T }>,
};

export default api;

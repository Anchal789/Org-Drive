// api-fn.ts
import api from '@/helpers/api-requests';
import type { ApiResponse } from '@/types/common-types';

// Helper to safely combine baseUrl and url without double slashes
const getFullUrl = (url: string, baseUrl?: string) => {
  if (!baseUrl) return url;
  const cleanBase = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
  const cleanUrl = url.startsWith('/') ? url : `/${url}`; // Ensure leading slash
  return `${cleanBase}${cleanUrl}`;
};

export const fetchData = async <T>({
  url,
  params,
  baseUrl,
}: {
  url: string;
  params?: Record<string, unknown>;
  baseUrl?: string;
}): Promise<ApiResponse<T>> => {
  return await api
    .get<ApiResponse<T>>(getFullUrl(url, baseUrl), { params })
    .then((res) => res.data);
};

export const postData = async <T>({
  url,
  payload,
  params,
  baseUrl,
  isFormData,
}: {
  url: string;
  payload: unknown;
  params?: Record<string, unknown>;
  baseUrl?: string;
  isFormData?: boolean;
}): Promise<ApiResponse<T>> => {
  const res = await api.post<ApiResponse<T>>(
    getFullUrl(url, baseUrl),
    payload,
    {
      params,
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    },
    isFormData,
  );

  return res.data;
};

export const deleteData = async <T>({
  url,
  params,
  baseUrl,
}: {
  url: string;
  params?: Record<string, unknown>;
  baseUrl?: string;
}): Promise<ApiResponse<T>> => {
  return await api
    .delete<ApiResponse<T>>(getFullUrl(url, baseUrl), { params })
    .then((res) => res.data);
};

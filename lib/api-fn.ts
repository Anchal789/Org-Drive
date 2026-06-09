import api from "@/helpers/api-requests";
import { ApiResponse } from "@/types/common-types";

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
    .get<ApiResponse<T>>(baseUrl ?? url, { params })
    .then((res) => res.data);
};

export const postData = async <T>({
  url,
  payload,
  params,
  baseUrl,
}: {
  url: string;
  payload: unknown;
  params?: Record<string, unknown>;
  baseUrl?: string;
}): Promise<ApiResponse<T>> => {
  const res = await api.post<ApiResponse<T>>(baseUrl ?? url, payload, {
    params,
  });
  return res.data;
};

export const putData = async <T>({
  url,
  payload,
  params,
  baseUrl,
}: {
  url: string;
  payload: unknown;
  params?: Record<string, unknown>;
  baseUrl?: string;
}): Promise<ApiResponse<T>> => {
  return await api
    .put<ApiResponse<T>>(baseUrl ?? url, payload, { params })
    .then((res) => res.data);
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
    .delete<ApiResponse<T>>(baseUrl ?? url, { params })
    .then((res) => res.data);
};

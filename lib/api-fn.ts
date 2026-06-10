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
  // isFormData,
}: {
  url: string;
  payload: unknown;
  params?: Record<string, unknown>;
  baseUrl?: string;
  // isFormData?: boolean;
}): Promise<ApiResponse<T>> => {
  const isFormData = payload instanceof FormData;
  const res = await api.post<ApiResponse<T>>(
    baseUrl ?? url,
    payload,
    {
      params,
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    },
    isFormData,
  );

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

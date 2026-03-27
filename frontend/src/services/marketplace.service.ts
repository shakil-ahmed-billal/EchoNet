import { apiClient } from "./api-client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  status: string;
  store: { id: string; name: string };
  category: { id: string; name: string };
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  followersCount: number;
  isFollowing?: boolean;
  _count?: {
    products: number;
    followers: number;
  };
}

export const getCategories = async () => {
  const response = await apiClient.get<any>("/categories");
  return response.data.data;
};

export const getProducts = async (params?: any) => {
  const response = await apiClient.get<any>("/products", { params });
  return response.data.data;
};

export const getProductById = async (id: string) => {
  const response = await apiClient.get<any>(`/products/${id}`);
  return response.data.data;
};

export const createStore = async (data: any) => {
  const response = await apiClient.post<any>("/stores", data);
  return response.data.data;
};

export const getMyStore = async () => {
  const response = await apiClient.get<any>("/stores/my-store");
  return response.data.data;
};

export const getStoreById = async (id: string) => {
  const response = await apiClient.get<any>(`/stores/${id}`);
  return response.data.data;
};

export const createProduct = async (data: any) => {
  const response = await apiClient.post<any>("/products", data);
  return response.data.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await apiClient.put<any>(`/products/${id}`, data);
  return response.data.data;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const createOrder = async (data: any) => {
  const response = await apiClient.post<any>("/orders", data);
  return response.data.data;
};

export const initiatePayment = async (orderId: string) => {
  const response = await apiClient.post<any>("/payments/initiate", { orderId });
  return response.data.data;
};

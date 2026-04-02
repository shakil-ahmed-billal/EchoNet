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
  store: { 
    id: string; 
    name: string;
    owner?: { id: string; name: string; avatarUrl?: string; image?: string };
  };
  category: { id: string; name: string };
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
     id: string;
     name: string;
     avatarUrl?: string;
     image?: string;
  };
  likes: { userId: string }[];
  replies: ReviewReply[];
  createdAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  comment: string;
  user: {
     id: string;
     name: string;
     avatarUrl?: string;
     image?: string;
  };
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

export const getCategories = async (params?: any) => {
  const response = await apiClient.get<any>("/categories", { params });
  return response.data?.data; // Returns { data, meta }
};

export const getProducts = async (params?: any) => {
  const response = await apiClient.get<any>("/products", { params: { limit: 12, ...params } });
  return response.data?.data; // Returns { data, meta }
};

export const getProductById = async (id: string) => {
  const response = await apiClient.get<any>(`/products/${id}`);
  return response.data?.data ?? null;
};

export const createStore = async (data: any) => {
  const response = await apiClient.post<any>("/stores", data);
  return response.data.data;
};

export const getMyStore = async () => {
  const response = await apiClient.get<any>("/stores/my-store");
  return response.data?.data ?? null;
};

export const getStoreById = async (id: string) => {
  const response = await apiClient.get<any>(`/stores/${id}`);
  return response.data?.data ?? null;
};

export const createProduct = async (data: FormData) => {
  const response = await apiClient.post<any>("/products", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data.data;
};

export const updateProduct = async (id: string, data: FormData) => {
  const response = await apiClient.put<any>(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
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
  return response.data?.data ?? null;
};

export const getStoreOrders = async () => {
  const response = await apiClient.get<any>("/orders/store-orders");
  return response.data?.data ?? [];
};

export const getMyOrders = async () => {
  const response = await apiClient.get<any>("/orders/my-orders");
  return response.data?.data ?? [];
};

export const createReview = async ({ productId, data }: { productId: string; data: { rating: number; comment: string } }) => {
  const response = await apiClient.post<any>(`/products/${productId}/reviews`, data);
  return response.data.data;
};

export const likeReview = async (reviewId: string) => {
  const response = await apiClient.post<any>(`/products/reviews/${reviewId}/like`);
  return response.data.data;
};

export const replyToReview = async ({ reviewId, data }: { reviewId: string; data: { comment: string } }) => {
  const response = await apiClient.post<any>(`/products/reviews/${reviewId}/reply`, data);
  return response.data.data;
};

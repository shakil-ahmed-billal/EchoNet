"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getCategories, 
  getProducts, 
  getProductById, 
  getMyStore, 
  getStoreById,
  createStore,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  initiatePayment,
  getStoreOrders,
  getMyOrders,
  createReview
} from "@/services/marketplace.service"
import { toast } from "sonner"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProducts(params?: any) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    staleTime: 60 * 1000,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  })
}

export function useMyStore() {
  return useQuery({
    queryKey: ["my-store"],
    queryFn: getMyStore,
    retry: false,
  })
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: () => getStoreById(id),
    enabled: !!id,
  })
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-store"] })
      toast.success("Store created successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create store")
    }
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product")
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product updated successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product")
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product deleted successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product")
    }
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] })
      toast.success("Order placed successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order")
    }
  })
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: initiatePayment,
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initiate payment")
    }
  })
}

export function useStoreOrders() {
  return useQuery({
    queryKey: ["store-orders"],
    queryFn: getStoreOrders,
  })
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string, data: { rating: number, comment: string } }) => createReview({ productId, data }),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] })
      toast.success("Review submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review")
    }
  })
}

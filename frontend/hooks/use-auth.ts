"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserInfo, logoutAction } from "@/services/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export type User = {
  id: string
  name: string
  email: string
  image?: string
  role: string
}

export type Session = {
  user: User
  session: any
}

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: session, isLoading, isError } = useQuery<Session | null>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      try {
        const responseData = await getUserInfo()
        console.log("useAuth - auth/me proxy response:", responseData)
        return responseData ?? null
      } catch (error) {
        console.error("useAuth - auth/me error:", error)
        return null
      }
    },
    retry: false,
    staleTime: 0, 
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutAction()
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-me"], null)
      toast.success("Logged out successfully")
      router.push("/login")
    },
    onError: () => {
      toast.error("Failed to logout")
    }
  })

  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    isLoading,
    isError,
    isAuthenticated: !!session?.user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}

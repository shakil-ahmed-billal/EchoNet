"use client"

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "./socket-provider"
import { SocketHandler } from "./socket-handler"
import { MessengerProvider } from "./messages/messenger-context"
import { MessengerDrawer } from "./messages/messenger-drawer"
import { FloatingChats } from "./messages/floating-chats"
import { FloatingGroupChats } from "./messages/floating-group-chats"
import { GroupChatModal } from "./messages/group-chat-modal"
import { CallManager } from "./messages/call-manager"
import { CartProvider } from "@/hooks/use-cart"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
        defaultTheme="system"
        attribute="class"
      >
        <SocketProvider>
          <CartProvider>
            <MessengerProvider>
              <SocketHandler />
              {children}
              <MessengerDrawer />
              <FloatingChats />
              <FloatingGroupChats />
              <GroupChatModal />
              <CallManager />
            </MessengerProvider>
          </CartProvider>
        </SocketProvider>
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}


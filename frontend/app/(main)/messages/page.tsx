import { Metadata } from "next"
import { Suspense } from "react"
import { ChatInterface } from "@/components/messages/chat-interface"

export const metadata: Metadata = {
  title: "Messages | EchoNet",
  description: "Chat with your EchoNet friends",
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading messages...</div>}>
      <ChatInterface />
    </Suspense>
  )
}

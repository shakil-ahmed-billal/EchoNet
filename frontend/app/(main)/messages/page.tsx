import { Metadata } from "next"
import { ChatInterface } from "@/components/messages/chat-interface"

export const metadata: Metadata = {
  title: "Messages | EchoNet",
  description: "Chat with your EchoNet friends",
}

export default function MessagesPage() {
  return <ChatInterface />
}

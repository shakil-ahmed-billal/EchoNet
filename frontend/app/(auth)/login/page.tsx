import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | EchoNet",
  description: "Login to your EchoNet account",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  )
}

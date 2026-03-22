import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register | EchoNet",
  description: "Create a new EchoNet account",
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <RegisterForm />
    </div>
  )
}

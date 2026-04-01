import { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { SiteMark } from "@/components/SiteMark"

export const metadata: Metadata = {
  title: "Forgot Password | EchoNet",
  description: "Request a password reset link",
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/20" />
        <div className="z-10 flex justify-center">
          <SiteMark className="h-24 w-auto opacity-30" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2">
            <SiteMark className="h-9 w-auto" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}

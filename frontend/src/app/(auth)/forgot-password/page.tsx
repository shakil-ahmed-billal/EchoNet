import { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { GalleryVerticalEndIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Forgot Password | EchoNet",
  description: "Request a password reset link",
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <GalleryVerticalEndIcon className="size-32 text-muted-foreground/20" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            EchoNet
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

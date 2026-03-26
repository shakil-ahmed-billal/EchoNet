import { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Reset Password | EchoNet",
  description: "Set your new password",
}

function ResetPasswordLoader() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center p-8">
      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading reset form...</p>
    </div>
  )
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={<ResetPasswordLoader />}>
                <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

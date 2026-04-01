import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"
import { SiteMark } from "@/components/SiteMark"

export const metadata: Metadata = {
  title: "Register | EchoNet",
  description: "Create a new EchoNet account",
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Desktop Left Side - Brand */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 border-r border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5" />
        <div className="z-10 text-center px-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="mb-8 mx-auto flex justify-center">
            <SiteMark className="h-20 w-auto" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Join EchoNet</h1>
          <p className="text-lg text-muted-foreground max-w-[380px]">
            Join the EchoNet community today and start connecting.
          </p>
        </div>
      </div>

      {/* Mobile/Right Side - Register Form */}
      <div className="flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 lg:bg-background">
        <div className="w-full max-w-[460px] bg-background border border-border/40 shadow-2xl rounded-[32px] p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Mobile Only Logo */}
          <div className="flex lg:hidden flex-col items-center gap-2 mb-8">
            <SiteMark className="h-12 w-auto" />
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

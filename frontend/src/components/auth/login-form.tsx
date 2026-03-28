"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { loginAction } from "@/services/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

interface LoginFormProps {
    className?: string;
    redirectPath?: string;
}

export function LoginForm({
  className,
  redirectPath,
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setServerError(null)
    try {
      const response = await loginAction(values);

      if (response && response.success) {
        toast.success("Login successful!");
        await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
        router.push(redirectPath || "/");
      } else {
        setServerError(response?.message || "Invalid email or password.");
        toast.error(response?.message || "Invalid email or password.");
      }
    } catch (error: any) {
      setServerError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Use the same-origin proxy route to ensure cookies are handled correctly and 
    // to match the Better Auth mount point (/api/auth instead of /api/v1/auth)
    window.location.href = `/api/auth/login/google?redirect=${encodeURIComponent(redirectPath || "/")}`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground max-w-[30ch]">
            Enter your email below to login to your account
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required 
              {...register("password")}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
          )}
        </Field>
        
        <Button type="submit" disabled={isLoading} className="w-full font-semibold">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>

        <FieldSeparator>Or continue with</FieldSeparator>
        
        <div className="flex flex-col gap-4">
          <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
              <path d="M12.452 11.01v3.007h7.375c-.226 1.686-.803 2.921-1.681 3.788-1.08 1.052-2.76 2.2-5.694 2.2-4.541 0-8.09-3.568-8.09-7.993s3.549-7.993 8.09-7.993c2.446 0 4.24.941 5.557 2.151l2.17-2.115C18.347 2.32 15.889 1 12.452 1 6.23 1 1 5.938 1 12s5.23 11 11.452 11c3.36 0 5.895-1.075 7.876-3.08C22.36 17.94 23 15.141 23 12.892c0-.697-.05-1.345-.163-1.882z" fill="currentColor" />
            </svg>
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4 font-medium text-primary">
              Sign up
            </Link>
          </FieldDescription>
        </div>
      </FieldGroup>
    </form>
  )
}

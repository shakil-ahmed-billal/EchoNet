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
import { registerAction } from "@/services/auth.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

interface RegisterFormProps {
    className?: string;
}

export function RegisterForm({
  className,
  ...props
}: RegisterFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setServerError(null)
    try {
      const response = await registerAction(values);

      if (response && response.success) {
        toast.success("Account created! You are now logged in.");
        await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
        router.push("/");
      } else {
        setServerError(response?.message || "Registration failed. Please try again.");
        toast.error(response?.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      setServerError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Point directly to the custom Express controller we built in the backend
    // which handles the redirect logic cleanly.
    window.location.href = `/api/v1/auth/login/google`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup className="gap-5">
        {serverError && (
          <Alert variant="destructive" className="rounded-2xl bg-destructive/5 border-destructive/20 animate-in fade-in duration-300">
            <AlertDescription className="font-semibold">{serverError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name" className="text-xs font-bold  text-muted-foreground/60 mb-2 ml-1">Full Name</FieldLabel>
          <Input
            id="name"
            placeholder="John Doe"
            required
            {...register("name")}
            disabled={isLoading}
            className="h-12 px-5 bg-muted/30 border-transparent focus:bg-background focus:border-primary/40 rounded-2xl transition-all shadow-sm"
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1.5 ml-1">{errors.name.message}</p>
          )}
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email" className="text-xs font-bold  text-muted-foreground/60 mb-2 ml-1">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...register("email")}
            disabled={isLoading}
            className="h-12 px-5 bg-muted/30 border-transparent focus:bg-background focus:border-primary/40 rounded-2xl transition-all shadow-sm"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1.5 ml-1">{errors.email.message}</p>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" className="text-xs font-bold  text-muted-foreground/60 mb-2 ml-1">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              {...register("password")}
              disabled={isLoading}
              className="h-12 px-5 pr-12 bg-muted/30 border-transparent focus:bg-background focus:border-primary/40 rounded-2xl transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1.5 ml-1">{errors.password.message}</p>
          )}
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground/60 mb-2 ml-1">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              {...register("confirmPassword")}
              disabled={isLoading}
              className="h-12 px-5 pr-12 bg-muted/30 border-transparent focus:bg-background focus:border-primary/40 rounded-2xl transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mt-1.5 ml-1">{errors.confirmPassword.message}</p>
          )}
        </Field>
        
        <Button type="submit" disabled={isLoading} className="h-12 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-full mt-2">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Join EchoNet Now
        </Button>

        <FieldSeparator>Or continue with</FieldSeparator>
        
        <div className="flex flex-col gap-6 mt-2">
          <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={isLoading} className="h-12 rounded-2xl font-bold text-sm border-border/20 bg-card hover:bg-muted/50 shadow-sm active:scale-95 transition-all w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
              <path d="M12.452 11.01v3.007h7.375c-.226 1.686-.803 2.921-1.681 3.788-1.08 1.052-2.76 2.2-5.694 2.2-4.541 0-8.09-3.568-8.09-7.993s3.549-7.993 8.09-7.993c2.446 0 4.24.941 5.557 2.151l2.17-2.115C18.347 2.32 15.889 1 12.452 1 6.23 1 1 5.938 1 12s5.23 11 11.452 11c3.36 0 5.895-1.075 7.876-3.08C22.36 17.94 23 15.141 23 12.892c0-.697-.05-1.345-.163-1.882z" fill="currentColor" />
            </svg>
            Sign up with Google
          </Button>
          
          <div className="text-center">
            <span className="text-xs font-medium text-muted-foreground">Already have an account?</span>{" "}
            <Link href="/login" className="text-xs font-bold text-primary hover:underline transition-all underline-offset-4">
              Log in instead
            </Link>
          </div>
        </div>
      </FieldGroup>
    </form>
  )
}

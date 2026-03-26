"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { resetPasswordAction } from "@/services/auth.actions"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

const resetPasswordSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
})

const ResetPasswordFormInner = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [serverError, setServerError] = React.useState<string | null>(null)

    const {
      register,
      handleSubmit,
      control,
      formState: { errors },
    } = useForm<z.infer<typeof resetPasswordSchema>>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: {
        otp: "",
        password: "",
        confirmPassword: "",
      },
    })

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
      if (!email) {
          toast.error("Email is missing. Please start the forgot password flow again.");
          return;
      }

      setIsLoading(true)
      setServerError(null)
      try {
        const response = await resetPasswordAction({
          email,
          otp: values.otp,
          newPassword: values.password,
        });

        if (response && response.success) {
          toast.success("Password reset successfully! You can now login.");
          router.push("/login");
        } else {
          setServerError(response?.message || "Failed to reset password. Please check your OTP.");
          toast.error(response?.message || "Failed to reset password. Please check your OTP.");
        }
      } catch (error: any) {
        setServerError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred.");
      } finally {
        setIsLoading(false)
      }
    }

    if (!email) {
      return (
          <div className="text-center p-6 border rounded-xl bg-destructive/5 border-destructive/20 mt-10">
              <h2 className="text-lg font-bold text-destructive">Missing Email</h2>
              <p className="text-sm text-muted-foreground mt-2">
                  We couldn&apos;t find an email associated with this session.
              </p>
              <Button variant="outline" className="mt-6 w-full font-medium">Go Back
                  <Link href="/forgot-password"></Link>
              </Button>
          </div>
      )
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6")}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Enter Reset OTP</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field className="flex flex-col items-center" data-invalid={!!errors.otp}>
          <FieldLabel>OTP Code</FieldLabel>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP 
                maxLength={6} 
                value={field.value} 
                onChange={field.onChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.otp && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.otp.message}</p>
          )}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
          )}
        </Field>
        
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
          <Input 
            id="confirmPassword" 
            type="password" 
            required 
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </Field>

        <Button type="submit" disabled={isLoading} className="w-full font-semibold">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>

        <div className="text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
        </div>
      </FieldGroup>
    </form>
  )
}

export function ResetPasswordForm() {
  return (
    <React.Suspense fallback={<div className="text-center p-8 mt-10">Loading reset form...</div>}>
      <ResetPasswordFormInner />
    </React.Suspense>
  )
}

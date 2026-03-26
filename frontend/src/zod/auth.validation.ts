import { z } from "zod";

export const loginZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters long")
});

export const registerBaseZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string()
});

export const registerZodSchema = registerBaseZodSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const forgetPasswordZodSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 characters long"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;
export type IRegisterPayload = z.infer<typeof registerZodSchema>;

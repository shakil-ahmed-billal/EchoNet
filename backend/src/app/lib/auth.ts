import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Role } from "../../../generated/prisma/client/index.js";
import config from "../config/index.js";
import { prisma } from "./prisma.js";
import { emailHelper } from "./email.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: config.jwt_secret,
  baseURL: process.env.BETTER_AUTH_URL || config.backend_url,
  basePath: "/api/auth",
  trustedOrigins: [
    config.frontend_url, 
    "http://localhost:3000",
    process.env.PROD_APP_URL || "https://echonet.vercel.app"
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
            if (type === "email-verification") {
                await emailHelper.sendVerificationEmail(email, otp);
            } else if (type === "forget-password") {
                await emailHelper.sendResetPasswordEmail(email, otp);
            }
        },
    })
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      mapProfileToUser: (profile) => ({ 
        role: Role.USER, 
        isDeleted: false,
        avatarUrl: profile.picture,
        image: profile.picture 
      }),
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      mapProfileToUser: (profile: any) => ({ 
        role: Role.USER, 
        isDeleted: false,
        avatarUrl: profile.picture?.data?.url || (typeof profile.picture === 'string' ? profile.picture : ""),
        image: profile.picture?.data?.url || (typeof profile.picture === 'string' ? profile.picture : "")
      }),
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: Role.USER },
      isDeleted: { type: "boolean", required: true, defaultValue: false },
      isSuspended: { type: "boolean", required: true, defaultValue: false },
      avatarUrl: { type: "string", required: false },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },
});

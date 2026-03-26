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
  baseURL: "http://localhost:8000",
  trustedOrigins: ["http://localhost:3000"],
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
      mapProfileToUser: () => ({ role: Role.USER, isDeleted: false }),
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      mapProfileToUser: () => ({ role: Role.USER, isDeleted: false }),
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: Role.USER },
      isDeleted: { type: "boolean", required: true, defaultValue: false },
      isSuspended: { type: "boolean", required: true, defaultValue: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    useSecureCookies: config.env === "production",
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: config.env === "production" ? "none" : "lax",
          secure: config.env === "production",
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});

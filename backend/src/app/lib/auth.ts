import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role } from "../../../generated/prisma/client/index.js";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            mapProfileToUser: () => ({ role: Role.USER, isDeleted: false })
        },
        facebook: {
            clientId: process.env.FACEBOOK_APP_ID || "",
            clientSecret: process.env.FACEBOOK_APP_SECRET || "",
            mapProfileToUser: () => ({ role: Role.USER, isDeleted: false })
        }
    },
    user: {
        additionalFields: {
            role: { type: "string", required: true, defaultValue: Role.USER },
            isDeleted: { type: "boolean", required: true, defaultValue: false },
        }
    },
    session: {
        expiresIn: 60 * 60 * 24, 
        updateAge: 60 * 60 * 24,
    },
    advanced: {
        useSecureCookies: false,
        cookies: {
            sessionToken: {
                attributes: {
                    sameSite: "none", secure: true, httpOnly: true, path: "/",
                }
            }
        }
    }
});

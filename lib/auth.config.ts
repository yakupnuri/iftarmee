import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { ADMIN_EMAILS } = require("./admin-emails");
            const isAdmin = auth?.user?.email ? ADMIN_EMAILS.includes(auth.user.email.toLowerCase()) : false;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnHost = nextUrl.pathname.startsWith("/host");
            const isOnMyInvitations = nextUrl.pathname.startsWith("/my-invitations");
            const isAuthPage = nextUrl.pathname === "/login";

            if (isOnAdmin || isOnHost || isOnMyInvitations) {
                if (isLoggedIn) {
                    if (isOnAdmin && !isAdmin) {
                        return Response.redirect(new URL("/", nextUrl));
                    }
                    return true;
                }
                return false; // Login sayfasına yönlendir
            }

            if (isAuthPage && isLoggedIn) {
                const redirectUrl = isAdmin ? "/admin" : "/";
                return Response.redirect(new URL(redirectUrl, nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

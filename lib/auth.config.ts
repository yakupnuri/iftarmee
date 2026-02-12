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
            const isAdmin = auth?.user?.email === "vahidnuri@gmail.com";
            const isAuthPage = nextUrl.pathname === "/login";
            const isProtectedRoute = nextUrl.pathname.startsWith("/host") || nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/my-invitations");

            if (isProtectedRoute) {
                if (isLoggedIn) {
                    if (nextUrl.pathname.startsWith("/admin") && !isAdmin) {
                        return Response.redirect(new URL("/", nextUrl));
                    }
                    return true;
                }
                return false; // Redirect to login
            }

            if (isAuthPage && isLoggedIn) {
                if (isAdmin) {
                    return Response.redirect(new URL("/admin", nextUrl));
                }
                return Response.redirect(new URL("/", nextUrl));
            }

            if (nextUrl.pathname === "/" && isAdmin) {
                return Response.redirect(new URL("/admin", nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

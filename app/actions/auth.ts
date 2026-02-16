"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginAction() {
    await signIn("google", { redirectTo: "/host" });
}

export async function logoutAction() {
    await signOut({ redirectTo: "/" });
}

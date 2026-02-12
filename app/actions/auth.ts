"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginAction() {
    await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
    await signOut();
}

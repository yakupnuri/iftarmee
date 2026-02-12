import { redirect } from "next/navigation";
import { isAdmin } from "@/app/actions/admin";

export default async function ConfirmPageRedirect() {
  const admin = await isAdmin();
  if (admin) {
    redirect("/admin");
  } else {
    redirect("/");
  }
}

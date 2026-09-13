import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/account/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/account");
  }
  return session;
}

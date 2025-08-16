import { auth } from "@/auth";
export async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

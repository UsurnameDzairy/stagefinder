import { headers } from "next/headers";
import { auth } from "./auth-config";
import prisma from "./prisma";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      role: true,
      profile: true,
      subscription: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

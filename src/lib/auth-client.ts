import { createAuthClient } from "better-auth/react";

// Get base URL - use relative path in browser to avoid CORS issues
const getBaseURL = () => {
  // In browser, use relative URL (empty string means same origin)
  if (typeof window !== "undefined") {
    return ""; // This makes requests relative to current domain
  }
  // On server, use environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;

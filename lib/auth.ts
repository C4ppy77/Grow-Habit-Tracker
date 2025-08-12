import { supabase } from "./supabase"

// Get the correct redirect URL based on environment
function getRedirectUrl() {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Use the current origin (works for both localhost and deployed domains)
    return `${window.location.origin}/auth/callback`
  }

  // Fallback for server-side rendering
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return `${baseUrl}/auth/callback`
}

export async function signInWithMagicLink(email: string) {
  const redirectUrl = getRedirectUrl()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  return { error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  return { session, error }
}

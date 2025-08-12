import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback received:", { code: !!code, error, errorDescription })

  // Handle error cases
  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`,
        )
      }

      if (data.user) {
        console.log("Successfully authenticated user:", data.user.email)

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (!profile) {
          console.log("New user detected, redirecting to onboarding")
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        } else {
          console.log("Existing user, redirecting to home")
          return NextResponse.redirect(`${requestUrl.origin}/home`)
        }
      }

      // Fallback redirect
      return NextResponse.redirect(`${requestUrl.origin}/home`)
    } catch (error) {
      console.error("Unexpected error during auth:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=unexpected_error`)
    }
  }

  // No code parameter, redirect to login
  console.log("No code parameter, redirecting to login")
  return NextResponse.redirect(`${requestUrl.origin}/`)
}

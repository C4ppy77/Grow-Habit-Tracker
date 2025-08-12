"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, AlertTriangle, CheckCircle, Sparkles } from "lucide-react"
import { signInWithMagicLink } from "@/lib/auth"
import { isDemoMode } from "@/lib/supabase"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError("")

    try {
      const { error } = await signInWithMagicLink(email.trim())

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-leaf mx-auto mb-4" />
          <CardTitle className="text-leaf">Magic Link Sent! ✨</CardTitle>
          <CardDescription>
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-leaf/5 border border-leaf/20 rounded-lg p-4">
            <h4 className="font-medium text-leaf mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              What happens next:
            </h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the magic link in the email</li>
              <li>You'll be automatically signed in!</li>
              <li className="font-medium text-leaf">New users will go through a quick setup</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>First time using GROW?</strong> After clicking the magic link, you'll be guided through a quick
              onboarding to set up your name and choose your first habits to track! 🌱
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes for delivery</li>
            </ul>
          </div>

          <Button
            onClick={() => {
              setSent(false)
              setEmail("")
            }}
            variant="outline"
            className="w-full"
          >
            Try Different Email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">GR🌸W</div>
        <CardTitle className="text-leaf">Welcome to GROW</CardTitle>
        <CardDescription>Build healthy habits and watch your garden flourish</CardDescription>
      </CardHeader>
      <CardContent>
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Supabase not configured. Using local storage for demonstration.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Sign in failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={!email.trim() || loading} className="w-full h-12 bg-leaf hover:bg-leaf/90">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-xs text-gray-500 space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium text-blue-800 mb-1">🪄 Magic Link Authentication</p>
            <p className="text-blue-700">
              No passwords needed! We'll send you a secure link to sign in instantly. New users will be guided through a
              quick setup process.
            </p>
          </div>

          <div className="text-center">
            <p>
              <strong>New to GROW?</strong> Your account will be created automatically and you'll go through onboarding!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

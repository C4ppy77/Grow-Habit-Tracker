"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "access_denied":
        return "Access was denied. You may have cancelled the login process."
      case "server_error":
        return "There was a server error. Please try again."
      case "temporarily_unavailable":
        return "The service is temporarily unavailable. Please try again later."
      case "invalid_request":
        return "The magic link is invalid or malformed."
      case "expired_token":
        return "The magic link has expired. Please request a new one."
      default:
        return "There was an issue signing you in."
    }
  }

  return (
    <div className="min-h-screen bg-stone-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{getErrorMessage(error)}</p>

          {error && <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">Error code: {error}</div>}

          <div className="text-sm text-gray-500 text-left space-y-2">
            <p className="font-medium">Common causes:</p>
            <ul className="space-y-1 ml-4">
              <li>• The magic link has expired (links expire after 1 hour)</li>
              <li>• The link has already been used</li>
              <li>• You opened the link in a different browser</li>
              <li>• There was a network connectivity issue</li>
            </ul>
          </div>

          <Link href="/">
            <Button className="w-full bg-leaf hover:bg-leaf/90">Try Again</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

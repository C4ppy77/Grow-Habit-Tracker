"use client"

import { useAuth } from "@/hooks/use-auth"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div>
<OnboardingFlow
        user={user}
        onComplete={() => {
          // Redirect to the home page after onboarding is complete
          router.push("/home")
        }}
      />
    </div>
  )
}

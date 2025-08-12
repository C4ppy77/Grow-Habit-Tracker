"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Cookie, Settings, X, Check, Info } from "lucide-react"
import { storage } from "@/lib/safe-storage"

const COOKIE_CONSENT_KEY = "grow-cookie-consent"
const COOKIE_PREFERENCES_KEY = "grow-cookie-preferences"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  preferences: false,
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user has already given consent
    const consent = storage.getItem(COOKIE_CONSENT_KEY)
    const savedPreferences = storage.getItem(COOKIE_PREFERENCES_KEY)

    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }

    saveConsent(allAccepted)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleAcceptSelected = () => {
    saveConsent(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleRejectAll = () => {
    saveConsent(DEFAULT_PREFERENCES)
    setShowBanner(false)
    setShowSettings(false)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    storage.setItem(COOKIE_CONSENT_KEY, "true")
    storage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setPreferences(prefs)

    // Trigger analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      console.log("Analytics cookies enabled")
      // Initialize analytics here
    }
    if (prefs.marketing) {
      console.log("Marketing cookies enabled")
      // Initialize marketing pixels here
    }
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return // Can't disable necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!mounted || !showBanner) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

      {/* Cookie Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto lg:max-w-lg lg:bottom-6 lg:left-6 lg:right-auto">
        <Card className="border-leaf/20 bg-white shadow-2xl">
          <CardContent className="p-6">
            {!showSettings ? (
              // Main Banner
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-leaf/10 rounded-full flex items-center justify-center">
                      <Cookie className="h-5 w-5 text-leaf" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">🍪 We use cookies to help you grow</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We use cookies to enhance your experience, analyze usage, and help you build better habits. Your
                      privacy matters to us.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleAcceptAll} className="flex-1 bg-leaf hover:bg-leaf/90 text-white">
                    <Check className="h-4 w-4 mr-2" />
                    Accept All
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="flex-1 border-leaf/30 text-leaf hover:bg-leaf/5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <button onClick={handleRejectAll} className="hover:text-gray-700 underline">
                    Reject All
                  </button>
                  <a href="/privacy" className="hover:text-gray-700 underline flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Privacy Policy
                  </a>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-leaf" />
                    Cookie Preferences
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm text-gray-900">Necessary</h4>
                        <span className="px-2 py-0.5 bg-leaf/10 text-leaf text-xs rounded-full">Required</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-3">
                      <div className="w-10 h-6 bg-leaf rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">Analytics</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Help us understand how you use GROW to improve your experience.
                      </p>
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={() => togglePreference("analytics")}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          preferences.analytics ? "bg-leaf" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            preferences.analytics ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">Marketing</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Used to show you relevant content and ads across the web.
                      </p>
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={() => togglePreference("marketing")}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          preferences.marketing ? "bg-leaf" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            preferences.marketing ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Preferences Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">Preferences</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Remember your settings and personalize your experience.
                      </p>
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={() => togglePreference("preferences")}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          preferences.preferences ? "bg-leaf" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            preferences.preferences ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleAcceptSelected} className="flex-1 bg-leaf hover:bg-leaf/90 text-white">
                    Save Preferences
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    variant="outline"
                    className="flex-1 border-leaf/30 text-leaf hover:bg-leaf/5 bg-transparent"
                  >
                    Accept All
                  </Button>
                </div>

                <div className="text-center">
                  <a
                    href="/privacy"
                    className="text-xs text-gray-500 hover:text-gray-700 underline flex items-center justify-center"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Learn more about our privacy practices
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

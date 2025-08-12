"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Cookie, Settings, Trash2, Download } from "lucide-react"
import { storage } from "@/lib/safe-storage"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export default function PrivacyManager() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    // Load saved preferences
    const saved = storage.getItem("grow-cookie-preferences")
    const consent = storage.getItem("grow-cookie-consent")

    if (saved) {
      setPreferences(JSON.parse(saved))
    }

    if (consent) {
      setLastUpdated(new Date().toLocaleDateString())
    }
  }, [])

  const updatePreferences = (newPrefs: CookiePreferences) => {
    storage.setItem("grow-cookie-preferences", JSON.stringify(newPrefs))
    storage.setItem("grow-cookie-consent", "true")
    setPreferences(newPrefs)
    setLastUpdated(new Date().toLocaleDateString())
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return

    const newPrefs = {
      ...preferences,
      [key]: !preferences[key],
    }
    updatePreferences(newPrefs)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all cookies and data? This will reset your preferences.")) {
      storage.removeItem("grow-cookie-consent")
      storage.removeItem("grow-cookie-preferences")
      // Clear other app data if needed
      setPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      })
      setLastUpdated("")
    }
  }

  const exportData = () => {
    const data = {
      preferences,
      lastUpdated,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "grow-privacy-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-leaf/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-leaf" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Cookie Settings</h1>
        <p className="text-gray-600">Manage your privacy preferences and control how we use cookies in GROW.</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cookie className="h-5 w-5 text-leaf" />
            <span>Current Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastUpdated && (
            <div className="bg-leaf/5 border border-leaf/20 rounded-lg p-3">
              <p className="text-sm text-leaf">✅ Your preferences were last updated on {lastUpdated}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Necessary */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                <p className="text-sm text-gray-600">Required for basic functionality</p>
              </div>
              <div className="w-10 h-6 bg-leaf rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">Help us improve your experience</p>
              </div>
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

            {/* Marketing */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">Personalized content and ads</p>
              </div>
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

            {/* Preferences */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                <p className="text-sm text-gray-600">Remember your settings</p>
              </div>
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
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-leaf" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={exportData}
              variant="outline"
              className="border-leaf/30 text-leaf hover:bg-leaf/5 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button
              onClick={clearAllData}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Your Rights:</strong> You can request access, correction, or deletion of your personal data at any
              time. Contact us at privacy@grow-app.com for assistance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() =>
            updatePreferences({
              necessary: true,
              analytics: true,
              marketing: true,
              preferences: true,
            })
          }
          className="bg-leaf hover:bg-leaf/90"
        >
          Accept All Cookies
        </Button>
        <Button
          onClick={() =>
            updatePreferences({
              necessary: true,
              analytics: false,
              marketing: false,
              preferences: false,
            })
          }
          variant="outline"
          className="border-leaf/30 text-leaf hover:bg-leaf/5"
        >
          Reject All Optional
        </Button>
      </div>
    </div>
  )
}

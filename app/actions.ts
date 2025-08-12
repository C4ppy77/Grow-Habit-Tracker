"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Access your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function getAiInsights(progressData: string) {
  if (!process.env.GOOGLE_API_KEY) {
    console.log("Google API Key not found, skipping AI insight.")
    return { insight: "AI insights are currently unavailable. Please check server configuration." }
  }

  if (!progressData) {
    return { error: "No progress data provided." }
  }

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    You are POT, a friendly and encouraging AI assistant for a habit tracking app called "GROW".
    Your goal is to provide positive and actionable insights based on the user's progress data.
    Do not be repetitive. Be creative and motivating.

    Here is the user's progress data in JSON format:
    ${progressData}

    Based on this data, provide a short, insightful, and motivational message for the user.
    Focus on one or two key observations from the data. For example, mention their streak,
    their completion rate, or a habit they are doing particularly well on.

    Keep the response to a maximum of 2-3 sentences.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    return { insight: text }
  } catch (error) {
    console.error("Error generating AI insight:", error)
    return { error: "Could not generate an insight at this time." }
  }
}

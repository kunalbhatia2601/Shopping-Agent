import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "sk_test_stylehub_ai_integration_key_2024"
const AUTH_URL = "https://backend-xi-murex-46.vercel.app/api/external/auth/login"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Attempting login with email:", email)

    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    console.log("[v0] Auth response status:", response.status)
    console.log("[v0] Auth response headers:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const userData = await response.json()

      console.log("[v0] Full auth response from original site:", JSON.stringify(userData, null, 2))
      console.log("[v0] Available fields in response:", Object.keys(userData))

      const authToken =
        userData.token ||
        userData.authToken ||
        userData.sessionToken ||
        userData.accessToken ||
        userData.id ||
        userData._id ||
        userData.userId ||
        `user_${Date.now()}` // Generate a temporary token if none exists

      console.log("[v0] Extracted auth token:", authToken)
      console.log(
        "[v0] Token source:",
        userData.token
          ? "token"
          : userData.authToken
            ? "authToken"
            : userData.sessionToken
              ? "sessionToken"
              : userData.accessToken
                ? "accessToken"
                : userData.id
                  ? "id"
                  : userData._id
                    ? "_id"
                    : userData.userId
                      ? "userId"
                      : "generated",
      )

      return NextResponse.json({
        success: true,
        user: userData,
        authToken: authToken,
      })
    } else {
      const error = await response.text()
      console.log("[v0] Auth failed with error:", error)
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}

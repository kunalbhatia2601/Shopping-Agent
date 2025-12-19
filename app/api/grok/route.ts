import { NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a shopping assistant that extracts product search keywords from user queries. 
Be VERY SPECIFIC about product types. Distinguish between:
- "t-shirt" or "tshirt" (casual pullover T-shirts) vs "shirt" (formal/casual button-down shirts)
- "dress" (women's one-piece) vs "kurta" (traditional Indian wear)
- "shoes" vs "sandals" vs "mojari"
- "jacket" vs "coat" vs "blazer"
- "belt" (accessory) is NOT clothing like shirt/dress/kurta

Extract relevant keywords for product search including:
- Exact product type (be VERY specific: if user says "tshirt" or "t-shirt", return ONLY ["t-shirt"], NOT ["shirt"])
- Color (if mentioned)
- Material (if mentioned: silk, cotton, leather, etc.)
- Gender/Age group (men, women, kids, boys, girls)
- Style/occasion (formal, casual, traditional, ethnic, party)

Also extract EXCLUDE keywords - products that should NOT appear:
- If searching for "t-shirt", exclude: ["shirt", "kurta", "dress", "belt"]
- If searching for "shirt", exclude: ["t-shirt", "kurta", "dress", "belt"]
- If searching for "belt", exclude: ["shirt", "t-shirt", "dress", "kurta", "jeans", "skirt"]
- If searching for "dress", exclude: ["shirt", "t-shirt", "kurta", "skirt"]

CRITICAL RULES:
- "tshirt" or "t-shirt" → keywords: ["t-shirt"], excludeKeywords: ["shirt", "kurta", "dress", "belt"]
- "shirt" → keywords: ["shirt"], excludeKeywords: ["t-shirt", "kurta", "dress", "belt"]
- Be exact with the product type - don't mix similar items

Return ONLY a JSON object with these fields:
{
  "keywords": ["exact", "product", "keywords"],
  "excludeKeywords": ["items", "to", "exclude"],
  "category": "category name or null",
  "priceRange": {"min": number or null, "max": number or null},
  "intent": "search|order|track|general"
}

Examples:
User: "Show me tshirt"
Response: {"keywords":["t-shirt"],"excludeKeywords":["shirt","kurta","dress","belt","skirt"],"category":null,"priceRange":{"min":null,"max":null},"intent":"search"}

User: "formal shirts for men"
Response: {"keywords":["shirt","formal","men"],"excludeKeywords":["t-shirt","kurta","dress","belt"],"category":"men","priceRange":{"min":null,"max":null},"intent":"search"}

User: "red dress under 3000"
Response: {"keywords":["red","dress"],"excludeKeywords":["shirt","t-shirt","kurta","skirt"],"category":"women","priceRange":{"min":null,"max":3000},"intent":"search"}`
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Groq API error:", error)
      return NextResponse.json({ error: "Failed to process with Groq API" }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: "No response from Groq API" }, { status: 500 })
    }

    // Parse the JSON response from Grok
    let parsed
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json[\s\S]*?([\s\S]*?)[\s\S]*?```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      parsed = JSON.parse(jsonStr.trim())
    } catch (e) {
      console.error("Failed to parse Groq response:", content)
      // Fallback: extract keywords manually from the original message
      const words = message.toLowerCase().split(/\s+/)
      const excludeWords: string[] = []
      
      // Check for shirt vs t-shirt
      if (message.toLowerCase().includes('t-shirt') || message.toLowerCase().includes('tshirt')) {
        parsed = {
          keywords: ['t-shirt', 'tshirt'],
          excludeKeywords: [],
          category: null,
          priceRange: { min: null, max: null },
          intent: "search"
        }
      } else if (message.toLowerCase().includes('shirt')) {
        parsed = {
          keywords: ['shirt'],
          excludeKeywords: ['t-shirt', 'tshirt'],
          category: null,
          priceRange: { min: null, max: null },
          intent: "search"
        }
      } else {
        parsed = {
          keywords: words.filter((w: string) => w.length > 3),
          excludeKeywords: [],
          category: null,
          priceRange: { min: null, max: null },
          intent: "search"
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      rawResponse: content
    })

  } catch (error) {
    console.error("Groq API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

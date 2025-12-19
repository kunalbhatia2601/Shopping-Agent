import { NextResponse } from "next/server"
import { sites, type SiteId } from "@/app/config/sites"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "1000"
    const siteId = (searchParams.get("site") as SiteId) || "site1"
    const productId = searchParams.get("id")
    
    const site = sites[siteId]
    if (!site) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 })
    }

    // Construct the API URL based on site configuration
    const apiPath = site.apiVersion ? `/api/${site.apiVersion}/products` : '/api/products'
    const url = productId 
      ? `${site.baseUrl}${apiPath}?id=${productId}`
      : `${site.baseUrl}${apiPath}?limit=${limit}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }
    headers[site.apiKeyHeader] = site.apiKey

    const response = await fetch(url, {
      method: "GET",
      headers
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: response.status })
    }

    const data = await response.json()
    
    // Normalize the response format
    const products = productId && !Array.isArray(data) ? [data] : (data.products || [data])
    const normalizedProducts = products.map((product: any) => {
      // Handle different image field names and formats
      let imageUrl = product.image || product.imageUrl || product.images?.[0] || null;
      
      // If image doesn't start with http, prepend base URL
      // Use imageBaseUrl if available (for sites where images are hosted separately from API)
      if (imageUrl && !imageUrl.startsWith('http')) {
        const baseUrlForImages = site.imageBaseUrl || site.baseUrl;
        imageUrl = `${baseUrlForImages}${imageUrl}`;
      }
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || 'Unknown',
        inStock: typeof product.stock === 'number' ? product.stock > 0 : product.inStock,
        image: imageUrl,
        // Add site-specific data
        site: site.name,
        siteId,
        originalData: product
      };
    })

    return NextResponse.json({
      products: normalizedProducts,
      site: site.name,
      siteId
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

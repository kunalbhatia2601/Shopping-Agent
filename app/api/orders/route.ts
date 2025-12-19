import { NextResponse } from "next/server"
import { sites, type SiteId } from "@/app/config/sites"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Received order request:", body)

    const siteId = body.siteId as SiteId || "site1"
    const site = sites[siteId]

    if (!site) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 })
    }

    // Prepare the order payload based on the site
    const payload = siteId === "site2" ? {
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        name: body.customerName,
        phone: body.customerPhone,
        addressLine1: body.shippingAddress.street,
        addressLine2: "",
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        pincode: body.shippingAddress.zipCode,
        country: body.shippingAddress.country
      },
      paymentMethod: "COD"
    } : {
      items: body.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: "M",
        color: "Default",
      })),
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: body.paymentStatus || "PENDING",
      subtotal: body.subtotal,
      tax: body.tax,
      shipping: body.shipping,
      total: body.total,
      metadata: {
        source: "AI Shopping Agent",
        timestamp: new Date().toISOString(),
      },
    }

    console.log("[v0] Sending payload to site:", payload)

    // Construct the API URL based on site configuration. Prefer explicit orderPath if provided.
    const apiPath = site.orderPath ?? (site.apiVersion ? `/api/${site.apiVersion}/orders` : '/api/orders')
    const orderUrl = `${site.baseUrl}${apiPath}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }
    headers[site.apiKeyHeader] = site.apiKey

    // Log the request details for debugging (mask api key value when logging headers)
    const maskedHeaders = { ...headers }
    if (maskedHeaders[site.apiKeyHeader]) maskedHeaders[site.apiKeyHeader] = "[REDACTED]"
    console.log("[v0] Order URL:", orderUrl)
    console.log("[v0] Request headers:", maskedHeaders)
    console.log("[v0] Request payload:", payload)

    const response = await fetch(orderUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    console.log("[v0] Site response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Site error:", errorText)
      return NextResponse.json({ error: "Failed to place order", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Order placed successfully:", data)
    console.log("[v0] Full API response data:", JSON.stringify(data, null, 2))

    // Normalize the order response based on site
    const orderResponse = {
      success: true,
      message: "Order placed successfully",
      order: siteId === "site2" ? {
        id: data.order.id,
        orderNumber: data.order.orderNumber,
        status: data.order.status,
        total: data.order.total,
        paymentStatus: data.order.paymentStatus,
        items: data.order.items,
        createdAt: data.order.createdAt
      } : {
        id: data.id || data.orderId || data._id || data.order?.id || `order_${Date.now()}`,
        orderNumber: data.orderNumber || data.number || data.order?.number || data.order?.orderNumber || `ORD${Date.now()}`,
        status: data.status || data.order?.status || "PENDING",
        total: data.total || data.order?.total,
      }
    }

    console.log("[v0] Returning order response:", orderResponse)

    return NextResponse.json(orderResponse)
  } catch (error) {
    console.error("Order API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


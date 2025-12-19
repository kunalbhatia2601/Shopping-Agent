"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Send, Bot, UserIcon, ShoppingCart, Package, Loader2, ShoppingBag, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const API_URL = "/api/products"

interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    inStock: boolean
    image?: string
    site: string
    siteId: string
    originalData: any
}

interface CustomerInfo {
    name: string
    phone: string
    email: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
}

interface Message {
    id: string
    type: "user" | "bot"
    content: string
    products?: Product[]
    timestamp: Date
}

interface PriceRange {
    min?: number
    max?: number
}

const STOP_WORDS = new Set([
    "i",
    "me",
    "my",
    "we",
    "our",
    "you",
    "your",
    "he",
    "she",
    "it",
    "they",
    "this",
    "that",
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "if",
    "is",
    "are",
    "was",
    "were",
    "be",
    "have",
    "has",
    "do",
    "does",
    "did",
    "want",
    "need",
    "looking",
    "for",
    "show",
    "find",
    "get",
    "buy",
])

const INITIAL_MESSAGE: Message = {
    id: "1",
    type: "bot",
    content:
        "Hello! I'm your AI shopping assistant. I can help you find products and place orders. What are you looking for today?",
    timestamp: new Date(),
}

const INITIAL_CUSTOMER_INFO: CustomerInfo = {
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
}

const preprocessQuery = (query: string): string[] => {
    const tokens = query.toLowerCase().match(/\b[a-zA-Z]+\b/g) || []
    return tokens.filter((token) => !STOP_WORDS.has(token))
}

const extractPriceRange = (query: string): PriceRange | null => {
    const lowerQuery = query.toLowerCase()

    const patterns = [
        { regex: /(?:under|below|less than|up to)\s*(?:rs\.?|₹)?\s*(\d+)/i, type: "max" },
        { regex: /(?:above|over|more than|at least)\s*(?:rs\.?|₹)?\s*(\d+)/i, type: "min" },
        { regex: /(?:between|from)\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:and|to|-)\s*(?:rs\.?|₹)?\s*(\d+)/i, type: "range" },
        { regex: /(?:rs\.?|₹)?\s*(\d+)\s*(?:-|to)\s*(?:rs\.?|₹)?\s*(\d+)/i, type: "range" },
        { regex: /(?:around|about|near|approximately)\s*(?:rs\.?|₹)?\s*(\d+)/i, type: "around" },
        { regex: /(?:₹|rs\.?\s*)(\d+)(?:\s*rupees?)?/i, type: "exact" },
    ]

    for (const pattern of patterns) {
        const match = lowerQuery.match(pattern.regex)
        if (match) {
            switch (pattern.type) {
                case "max":
                    return { max: Number.parseInt(match[1]) }
                case "min":
                    return { min: Number.parseInt(match[1]) }
                case "range": {
                    const min = Number.parseInt(match[1])
                    const max = Number.parseInt(match[2])
                    return { min: Math.min(min, max), max: Math.max(min, max) }
                }
                case "around": {
                    const price = Number.parseInt(match[1])
                    const range = Math.max(100, price * 0.2)
                    return { min: Math.max(0, price - range), max: price + range }
                }
                case "exact": {
                    const price = Number.parseInt(match[1])
                    const range = Math.max(50, price * 0.1)
                    return { min: Math.max(0, price - range), max: price + range }
                }
            }
        }
    }
    return null
}

const searchProducts = (products: Product[], query: string, keywords?: string[], excludeKeywords?: string[], priceRange?: PriceRange): Product[] => {
    if (!query.trim()) return products.slice(0, 6)

    const searchTokens = keywords && keywords.length > 0 ? keywords.map(k => k.toLowerCase()) : preprocessQuery(query)
    const matchingProducts: Array<{ product: Product; score: number; avgRating: number; hasNameMatch: boolean }> = []

    console.log("[v0] Searching with keywords:", searchTokens, "exclude:", excludeKeywords)

    for (const product of products) {
        if (priceRange) {
            if (priceRange.min !== undefined && product.price < priceRange.min) continue
            if (priceRange.max !== undefined && product.price > priceRange.max) continue
        }

        const name = product.name.toLowerCase()
        const description = product.description.toLowerCase()
        const category = product.category.toLowerCase()
        const text = `${name} ${description} ${category}`

        const normalizedName = name.replace(/-/g, '')
        const normalizedText = text.replace(/-/g, '')

        const productTokens = preprocessQuery(text)

        let score = 0
        let hasNameMatch = false
        let matchesAnyKeyword = false

        for (const token of searchTokens) {
            const normalizedToken = token.replace(/-/g, '')

            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`\\b${escapedToken}\\b`, 'i')
            const normalizedRegex = new RegExp(`\\b${normalizedToken}\\b`, 'i')

            const matchesText = regex.test(text) || normalizedRegex.test(normalizedText) || productTokens.includes(token) || productTokens.includes(normalizedToken)
            const matchesName = regex.test(name) || normalizedRegex.test(normalizedName)
            const matchesCategory = regex.test(category)

            if (matchesText) {
                matchesAnyKeyword = true
                score += 1
                if (matchesName) {
                    score += 5
                    hasNameMatch = true
                } else if (name.includes(token) || normalizedName.includes(normalizedToken)) {
                    score += 2
                }
                if (matchesCategory) {
                    score += 1
                }
            }
        }

        if (!matchesAnyKeyword && excludeKeywords && excludeKeywords.length > 0) {
            for (const excludeWord of excludeKeywords) {
                const normalizedExclude = excludeWord.toLowerCase().replace(/-/g, '')
                const excludeRegex = new RegExp(`\\b${normalizedExclude}\\b`, 'i')
                const originalExcludeRegex = new RegExp(`\\b${excludeWord.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')

                if (excludeRegex.test(normalizedText) || originalExcludeRegex.test(text)) {
                    score = 0
                    break
                }
            }
        }

        const avgRating = product.originalData?.averageRating || product.originalData?.rating || 0
        const reviewCount = product.originalData?.reviewCount || 0

        if (score > 0) {
            if (avgRating > 4) score += 2
            else if (avgRating > 3.5) score += 1

            if (reviewCount > 100) score += 1
            else if (reviewCount > 50) score += 0.5
        }

        if (score > 0) {
            matchingProducts.push({ product, score, avgRating, hasNameMatch })
        }
    }

    matchingProducts.sort((a, b) => {
        if (a.hasNameMatch !== b.hasNameMatch) return b.hasNameMatch ? 1 : -1
        if (b.score !== a.score) return b.score - a.score
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
        return a.product.price - b.product.price
    })

    if (keywords && keywords.length > 0) {
        const relevantMatches = matchingProducts.filter(m => m.hasNameMatch || m.score >= 3)
        if (relevantMatches.length === 0) {
            return []
        }
        return relevantMatches.slice(0, 6).map((item) => item.product)
    }

    if (matchingProducts.length === 0 || matchingProducts[0].score < 2) {
        return []
    }

    return matchingProducts.slice(0, 6).map((item) => item.product)
}

export default function ChatPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [typing, setTyping] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [customerInfo, setCustomerInfo] = useState(INITIAL_CUSTOMER_INFO)
    const [orderDialogOpen, setOrderDialogOpen] = useState(false)
    const [placingOrder, setPlacingOrder] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()

    const fetchProducts = useCallback(async () => {
        try {
            const [site1Response, site2Response] = await Promise.all([
                fetch(`${API_URL}?limit=1000&site=site1`),
                fetch(`${API_URL}?limit=1000&site=site2`)
            ]);

            const allProducts: Product[] = [];

            if (site1Response.ok) {
                const data = await site1Response.json();
                const site1Products = Array.isArray(data.products) ? data.products : (data.products ? [data.products] : []);
                if (site1Products.length > 0) allProducts.push(...site1Products);
            }

            if (site2Response.ok) {
                const data = await site2Response.json();
                const site2Products = Array.isArray(data.products) ? data.products : (data.products ? [data.products] : []);
                if (site2Products.length > 0) allProducts.push(...site2Products);
            }

            if (allProducts.length > 0) {
                setProducts(allProducts);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch products from all sites",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error while fetching products",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const generateBotResponse = useCallback(
        async (userMessage: string): Promise<{ content: string; products?: Product[] }> => {
            try {
                const groqResponse = await fetch('/api/grok', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                })

                let keywords: string[] = []
                let excludeKeywords: string[] = []
                let priceRange: PriceRange | null = null

                if (groqResponse.ok) {
                    const groqData = await groqResponse.json()

                    if (groqData.success && groqData.data) {
                        keywords = groqData.data.keywords || []
                        excludeKeywords = groqData.data.excludeKeywords || []
                        priceRange = groqData.data.priceRange?.min || groqData.data.priceRange?.max
                            ? groqData.data.priceRange
                            : null
                    }
                } else {
                    priceRange = extractPriceRange(userMessage)
                    const queryLower = userMessage.toLowerCase()
                    if (queryLower.match(/\bshirt\b/) && !queryLower.includes('t-shirt') && !queryLower.includes('tshirt')) {
                        keywords.push('shirt')
                        excludeKeywords.push('t-shirt', 'tshirt', 'tee')
                    }
                    if (queryLower.includes('t-shirt') || queryLower.includes('tshirt') || queryLower.match(/\btee\b/)) {
                        keywords.push('t-shirt', 'tshirt', 'tee')
                        excludeKeywords.push('shirt', 'kurta', 'pajama', 'belt', 'dress', 'skirt')
                    }
                    if (queryLower.includes('kurta')) {
                        keywords.push('kurta')
                        excludeKeywords.push('t-shirt', 'tshirt')
                    }
                    if (queryLower.match(/\bdress\b/)) {
                        keywords.push('dress')
                        excludeKeywords.push('kurta', 'shirt')
                    }
                    if (queryLower.includes('saree') || queryLower.includes('sari')) keywords.push('saree')
                    if (queryLower.match(/\bshoes\b/)) keywords.push('shoes')
                    if (queryLower.includes('sandal')) keywords.push('sandal')
                    if (queryLower.includes('belt')) {
                        keywords.push('belt')
                        excludeKeywords.push('shirt', 'kurta', 'dress', 'skirt')
                    }
                    if (queryLower.includes('jacket')) keywords.push('jacket')
                    if (queryLower.includes('blazer')) keywords.push('blazer')
                    if (queryLower.includes('trousers') || queryLower.includes('pants')) {
                        keywords.push('trousers', 'pants')
                        excludeKeywords.push('kurta', 'pajama')
                    }
                    if (queryLower.includes('formal')) keywords.push('formal')
                    if (queryLower.includes('casual')) keywords.push('casual')
                }

                if (keywords.length === 0) {
                    const queryTokens = preprocessQuery(userMessage)
                    keywords = queryTokens.filter(token => token.length > 3)

                    if (keywords.length === 0) {
                        return {
                            content: "I couldn't understand what you're looking for. Could you please specify a product type? For example: 'shirt', 'kurta', 'dress', 'shoes', etc."
                        }
                    }
                }

                const searchResults = searchProducts(products, userMessage, keywords, excludeKeywords, priceRange || undefined)

                if (searchResults.length > 0) {
                    const categories = [...new Set(searchResults.map((p) => p.category))]
                    const inStockCount = searchResults.filter((p) => p.inStock).length

                    let responseText = `I found ${searchResults.length} product${searchResults.length !== 1 ? "s" : ""} for you`

                    if (priceRange) {
                        if (priceRange.min !== undefined && priceRange.max !== undefined) {
                            responseText += ` in the ₹${priceRange.min}-₹${priceRange.max} price range`
                        } else if (priceRange.max !== undefined) {
                            responseText += ` under ₹${priceRange.max}`
                        } else if (priceRange.min !== undefined) {
                            responseText += ` above ₹${priceRange.min}`
                        }
                    }

                    if (categories.length > 1) {
                        responseText += ` across ${categories.join(", ")} categories`
                    } else {
                        responseText += ` in ${categories[0]}`
                    }

                    if (inStockCount < searchResults.length) {
                        responseText += `. ${inStockCount} are currently in stock`
                    }

                    responseText += ". Products are sorted by relevance, ratings, and price for the best matches!"

                    return { content: responseText, products: searchResults }
                } else {
                    if (priceRange) {
                        let priceMessage = "I couldn't find products matching your search"
                        if (priceRange.min !== undefined && priceRange.max !== undefined) {
                            priceMessage += ` in the ₹${priceRange.min}-₹${priceRange.max} price range`
                        } else if (priceRange.max !== undefined) {
                            priceMessage += ` under ₹${priceRange.max}`
                        } else if (priceRange.min !== undefined) {
                            priceMessage += ` above ₹${priceRange.min}`
                        }
                        priceMessage += ". Try adjusting your price range or search terms."
                        return { content: priceMessage }
                    }

                    const suggestions = [
                        "I couldn't find products matching that exactly. Try searching for 'kurta', 'shirt', 'dress', 'shoes', or 'accessories'.",
                        "No matches found for that search. Could you try different keywords? For example: 'traditional wear', 'formal shirt', 'ethnic dress', or 'leather shoes'.",
                        "Hmm, I don't see products matching that description. Try searching for specific items like 'silk kurta', 'cotton shirt', or 'party dress'.",
                    ]

                    return { content: suggestions[Math.floor(Math.random() * suggestions.length)] }
                }
            } catch (error) {
                console.error("[v0] Error generating response:", error)
                return { content: "I'm having trouble processing your request. Please try again." }
            }
        },
        [products],
    )

    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim() || typing) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: inputMessage.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputMessage("")
        setTyping(true)

        setTimeout(async () => {
            const botResponse = await generateBotResponse(userMessage.content)
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "bot",
                content: botResponse.content,
                products: botResponse.products,
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, botMessage])
            setTyping(false)
        }, 1000)
    }, [inputMessage, typing, generateBotResponse])

    const orderTotals = useMemo(() => {
        if (!selectedProduct) return null

        const subtotal = selectedProduct.price * quantity
        const taxRate = 0.18
        const tax = Math.round(subtotal * taxRate)
        const shipping = subtotal >= 1000 ? 0 : 50
        const total = subtotal + tax + shipping

        return { subtotal, tax, shipping, total }
    }, [selectedProduct, quantity])

    const handleBuyNow = useCallback((product: Product) => {
        setSelectedProduct(product)
        setQuantity(1)
        setOrderDialogOpen(true)
    }, [])

    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
    }, [])

    const handleCustomerInfoChange = useCallback(
        (field: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setCustomerInfo((prev) => ({ ...prev, [field]: e.target.value }))
        },
        [],
    )

    const placeOrder = useCallback(async () => {
        if (!selectedProduct) return

        setPlacingOrder(true)

        try {
            const subtotal = selectedProduct.price * quantity
            const tax = Math.round(subtotal * 0.18)
            const shipping = subtotal >= 1000 ? 0 : 50
            const total = subtotal + tax + shipping

            const orderData = {
                items: [
                    {
                        productId: selectedProduct.id,
                        quantity: quantity,
                        price: selectedProduct.price,
                        size: "M",
                        color: "White",
                        name: selectedProduct.name
                    },
                ],
                total: total,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                customerEmail: customerInfo.email,
                shippingAddress: {
                    street: customerInfo.street,
                    city: customerInfo.city,
                    state: customerInfo.state,
                    zipCode: customerInfo.zipCode,
                    country: customerInfo.country,
                },
                paymentMethod: "COD",
                paymentStatus: "PENDING",
                siteId: selectedProduct.siteId,
                metadata: {
                    source: "cli_agent",
                    campaign: "none",
                    site: selectedProduct.site
                },
            }

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            })

            const result = await response.json()

            if (response.ok) {
                const orderInfo = result.order
                toast({
                    title: "Order Placed Successfully! 🎉",
                    description: `Order ID: ${orderInfo.id} | Order #${orderInfo.orderNumber}`,
                })

                const successMessage: Message = {
                    id: Date.now().toString(),
                    type: "bot",
                    content: `Great! Your order for ${selectedProduct.name} has been placed successfully.\n\n📋 Order Details:\n• Order ID: ${orderInfo.id}\n• Order Number: ${orderInfo.orderNumber}\n• Total: ₹${total}\n\nYou can track your order using either the Order ID or Order Number. Your order will be delivered to your address with cash on delivery.`,
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, successMessage])

                setOrderDialogOpen(false)
                setSelectedProduct(null)
                setCustomerInfo(INITIAL_CUSTOMER_INFO)
            } else {
                toast({
                    title: "Order Failed",
                    description: result.message || "Failed to place order. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Order Failed",
                description: "Unable to place order. Please try again.",
                variant: "destructive",
            })
        } finally {
            setPlacingOrder(false)
        }
    }, [selectedProduct, quantity, customerInfo, toast])

    const isFormValid = useMemo(
        () => customerInfo.name && customerInfo.phone && customerInfo.email,
        [customerInfo.name, customerInfo.phone, customerInfo.email],
    )

    if (loading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <div className="text-center glass-card p-8 rounded-2xl">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-purple-400" />
                    <p className="text-muted-foreground">Loading shopping assistant...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            {/* Header */}
            <header className="glass-dark border-b border-border/50 px-6 py-4 sticky top-0 z-50">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-foreground">AI Shopping Assistant</h1>
                                    <p className="text-xs text-muted-foreground">Find products and place orders easily</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/">
                            <Button variant="outline" size="sm" className="border-border/50 hover:bg-white/10">
                                <Home className="h-4 w-4 mr-2" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl overflow-y-auto">
                <div className="space-y-4 mb-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                            {message.type === "bot" && (
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                            )}

                            <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : ""}`}>
                                <div
                                    className={`rounded-2xl px-4 py-3 ${message.type === "user"
                                            ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white ml-auto"
                                            : "glass-card text-foreground"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                                </div>

                                {message.products && message.products.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {message.products.map((product) => (
                                            <Card
                                                key={product.id}
                                                className="glass-card border-border/50 group hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                                                onClick={() => handleBuyNow(product)}
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none"
                                                                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                                                                }}
                                                            />
                                                        ) : (
                                                            <Package className="h-10 w-10 text-muted-foreground" />
                                                        )}
                                                        <Package className="h-10 w-10 text-muted-foreground hidden" />
                                                    </div>
                                                    <CardTitle className="text-sm line-clamp-2 text-balance">{product.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pb-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-lg font-bold gradient-text">₹{product.price}</span>
                                                        <Badge
                                                            variant={product.inStock ? "default" : "secondary"}
                                                            className={`text-xs ${product.inStock ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                                                        >
                                                            {product.inStock ? "In Stock" : "Out of Stock"}
                                                        </Badge>
                                                    </div>

                                                    {product.originalData?.averageRating > 0 && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex items-center">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-xs ${i < Math.floor(product.originalData.averageRating || 0)
                                                                                ? "text-amber-400"
                                                                                : "text-gray-600"
                                                                            }`}
                                                                    >
                                                                        ★
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {product.originalData.averageRating.toFixed(1)}
                                                                {product.originalData.reviewCount > 0 && (
                                                                    <span> ({product.originalData.reviewCount})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                                                            {product.category}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                                                            {product.site}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                                                        disabled={!product.inStock}
                                                    >
                                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                                        {product.inStock ? "Buy Now" : "Out of Stock"}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {message.type === "user" && (
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                    <UserIcon className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {typing && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="glass-card rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Bar */}
            <div className="glass-dark border-t border-border/50 px-4 py-4 sticky bottom-0">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex gap-3">
                        <Input
                            placeholder="Ask me to find products..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1 bg-white/5 border-border/50 focus:border-purple-500/50 rounded-xl"
                            disabled={typing}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || typing}
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl px-6"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Order Dialog */}
            <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">Place Order</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Enter your details to complete your order for {selectedProduct?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProduct && (
                        <div className="space-y-6">
                            {/* Product Summary */}
                            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-border/50">
                                <div className="w-20 h-20 bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                                    {selectedProduct.image ? (
                                        <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover rounded-xl" />
                                    ) : (
                                        <Package className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{selectedProduct.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.category} • {selectedProduct.site}</p>
                                    <p className="text-lg font-bold gradient-text mt-1">₹{selectedProduct.price}</p>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="bg-white/5 border-border/50 mt-1"
                                    />
                                </div>
                                {orderTotals && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Subtotal: ₹{orderTotals.subtotal}</p>
                                        <p className="text-sm text-muted-foreground">Tax (18%): ₹{orderTotals.tax}</p>
                                        <p className="text-sm text-muted-foreground">Shipping: {orderTotals.shipping === 0 ? 'Free' : `₹${orderTotals.shipping}`}</p>
                                        <p className="text-lg font-bold gradient-text">Total: ₹{orderTotals.total}</p>
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-foreground">Customer Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Full Name *</Label>
                                        <Input
                                            value={customerInfo.name}
                                            onChange={handleCustomerInfoChange("name")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Phone *</Label>
                                        <Input
                                            value={customerInfo.phone}
                                            onChange={handleCustomerInfoChange("phone")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-muted-foreground">Email *</Label>
                                        <Input
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={handleCustomerInfoChange("email")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-foreground">Shipping Address</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label className="text-muted-foreground">Street Address</Label>
                                        <Textarea
                                            value={customerInfo.street}
                                            onChange={handleCustomerInfoChange("street")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="123 Main St, Apt 4B"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">City</Label>
                                        <Input
                                            value={customerInfo.city}
                                            onChange={handleCustomerInfoChange("city")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">State</Label>
                                        <Input
                                            value={customerInfo.state}
                                            onChange={handleCustomerInfoChange("state")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">ZIP Code</Label>
                                        <Input
                                            value={customerInfo.zipCode}
                                            onChange={handleCustomerInfoChange("zipCode")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="400001"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Country</Label>
                                        <Input
                                            value={customerInfo.country}
                                            onChange={handleCustomerInfoChange("country")}
                                            className="bg-white/5 border-border/50 mt-1"
                                            placeholder="India"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOrderDialogOpen(false)} className="border-border/50">
                            Cancel
                        </Button>
                        <Button
                            onClick={placeOrder}
                            disabled={!isFormValid || placingOrder}
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                        >
                            {placingOrder ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Place Order (COD)
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    )
}

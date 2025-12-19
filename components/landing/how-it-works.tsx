"use client"

import { MessageCircle, Search, ShoppingCart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
    {
        number: "01",
        icon: MessageCircle,
        title: "Chat with AI",
        description: "Tell our AI assistant what you're looking for in natural language. No complex filters needed.",
        example: "\"Show me blue silk kurtas under ₹2000\""
    },
    {
        number: "02",
        icon: Search,
        title: "Discover Products",
        description: "Get personalized product recommendations from multiple stores, sorted by relevance and ratings.",
        example: "Browse curated results with ratings & reviews"
    },
    {
        number: "03",
        icon: ShoppingCart,
        title: "Place Your Order",
        description: "Select your favorite product and complete your order seamlessly with cash on delivery.",
        example: "Quick checkout with order tracking"
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-amber-950/10 to-background" />

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">How It Works</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Three simple steps to find and order your perfect products.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector line (hidden on last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
                            )}

                            <div className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 h-full">
                                {/* Step Number */}
                                <div className="text-6xl font-bold gradient-text opacity-30 mb-4">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <step.icon className="h-8 w-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3 text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground mb-4 leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Example */}
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground italic">
                                    {step.example}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link href="/chat">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-lg px-8 py-6 btn-glow group"
                        >
                            Try It Now
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

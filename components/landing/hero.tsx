"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-animated">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float-slow" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-pulse-glow">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-muted-foreground">Powered by AI</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-foreground">Your Personal</span>
                        <br />
                        <span className="gradient-text text-glow">AI Shopping Assistant</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                        Discover products, compare prices, and place orders across multiple stores —
                        all through natural conversation.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/chat">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-lg px-8 py-6 btn-glow group"
                            >
                                <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Start Shopping
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 border-border/50 hover:bg-muted/50 backdrop-blur-sm"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text-purple">2+</div>
                            <div className="text-sm text-muted-foreground mt-1">Stores</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text-purple">100+</div>
                            <div className="text-sm text-muted-foreground mt-1">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold gradient-text-purple">AI</div>
                            <div className="text-sm text-muted-foreground mt-1">Powered</div>
                        </div>
                    </div>
                </div>

                {/* Floating Product Cards Preview */}
                <div className="mt-20 relative">
                    <div className="flex justify-center gap-4 md:gap-8">
                        {/* Card 1 */}
                        <div className="w-48 md:w-56 glass-card rounded-2xl p-4 animate-float transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl mb-3 flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-purple-400" />
                            </div>
                            <div className="h-3 bg-white/20 rounded-full w-3/4 mb-2" />
                            <div className="h-2 bg-white/10 rounded-full w-1/2" />
                        </div>

                        {/* Card 2 - Center */}
                        <div className="w-48 md:w-56 glass-card rounded-2xl p-4 animate-float-delayed scale-110 z-10">
                            <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-xl mb-3 flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-cyan-400" />
                            </div>
                            <div className="h-3 bg-white/20 rounded-full w-3/4 mb-2" />
                            <div className="h-2 bg-white/10 rounded-full w-1/2" />
                        </div>

                        {/* Card 3 */}
                        <div className="w-48 md:w-56 glass-card rounded-2xl p-4 animate-float-slow transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-square bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl mb-3 flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-amber-400" />
                            </div>
                            <div className="h-3 bg-white/20 rounded-full w-3/4 mb-2" />
                            <div className="h-2 bg-white/10 rounded-full w-1/2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
                </div>
            </div>
        </section>
    )
}

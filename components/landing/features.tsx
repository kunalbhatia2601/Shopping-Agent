"use client"

import { Bot, Store, Star, Package } from "lucide-react"

const features = [
    {
        icon: Bot,
        title: "AI-Powered Search",
        description: "Chat naturally and let our AI understand exactly what you're looking for, even complex queries.",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        icon: Store,
        title: "Multi-Store Integration",
        description: "Search across multiple e-commerce platforms simultaneously to find the best deals.",
        gradient: "from-cyan-500 to-blue-500"
    },
    {
        icon: Star,
        title: "Smart Recommendations",
        description: "Get products sorted by relevance, ratings, and price for the best matches.",
        gradient: "from-amber-500 to-orange-500"
    },
    {
        icon: Package,
        title: "Easy Order Tracking",
        description: "Place orders and track them easily with order numbers, all in one place.",
        gradient: "from-green-500 to-emerald-500"
    }
]

export function Features() {
    return (
        <section id="features" className="py-24 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Powerful Features</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Everything you need for a seamless shopping experience, powered by cutting-edge AI technology.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-default"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                                <feature.icon className="h-7 w-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-semibold mb-3 text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

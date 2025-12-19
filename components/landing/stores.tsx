"use client"

import { ExternalLink, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stores = [
    {
        name: "Style Hub",
        description: "Traditional and ethnic wear including kurtas, sarees, and festive collections.",
        categories: ["Ethnic Wear", "Traditional", "Festive"],
        gradient: "from-purple-500 to-pink-500",
        url: "https://stylehub-showcase.vercel.app"
    },
    {
        name: "LuxeWear",
        description: "Modern fashion, accessories, and contemporary styles for everyday elegance.",
        categories: ["Modern Fashion", "Accessories", "Contemporary"],
        gradient: "from-cyan-500 to-blue-500",
        url: "https://style-suite-express.vercel.app"
    }
]

export function Stores() {
    return (
        <section id="stores" className="py-24 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan-950/10 to-background" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Integrated Stores</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Shop from multiple trusted e-commerce platforms, all through one intelligent assistant.
                    </p>
                </div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {stores.map((store, index) => (
                        <div
                            key={index}
                            className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 group"
                        >
                            {/* Store Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${store.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                <ShoppingBag className="h-8 w-8 text-white" />
                            </div>

                            {/* Store Info */}
                            <h3 className="text-2xl font-bold mb-3 text-foreground">
                                {store.name}
                            </h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                {store.description}
                            </p>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {store.categories.map((category, catIndex) => (
                                    <span
                                        key={catIndex}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-muted-foreground border border-white/10"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex gap-3">
                                <Link href="/chat" className="flex-1">
                                    <Button className={`w-full bg-gradient-to-r ${store.gradient} hover:opacity-90 text-white`}>
                                        Browse Products
                                    </Button>
                                </Link>
                                <a href={store.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon" className="border-border/50 hover:bg-muted/50">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

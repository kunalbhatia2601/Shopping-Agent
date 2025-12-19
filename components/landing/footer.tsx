"use client"

import Link from "next/link"
import { ShoppingBag, Github, Twitter, Linkedin, Heart } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-16 border-t border-border/50 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Shopper Agent</span>
                        </Link>
                        <p className="text-muted-foreground max-w-xs leading-relaxed">
                            Your AI-powered shopping assistant. Find products and place orders across multiple stores with ease.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Start Shopping
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#stores" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Stores
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/SahilGarg15/Shopper-Agent"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <Github className="h-5 w-5 text-muted-foreground" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <Twitter className="h-5 w-5 text-muted-foreground" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <Linkedin className="h-5 w-5 text-muted-foreground" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Shopper Agent. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using Next.js & AI
                    </p>
                </div>
            </div>
        </footer>
    )
}

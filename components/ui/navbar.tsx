"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Shopper Agent</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="#stores"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Stores
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            How it Works
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <Link href="/chat">
                            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white btn-glow">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="#features"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="#stores"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Stores
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it Works
                            </Link>
                            <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

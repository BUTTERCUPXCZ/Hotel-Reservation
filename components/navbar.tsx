"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"

interface NavbarProps {
    currentPath?: string
}

export function Navbar({ currentPath = "/" }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [debugInfo, setDebugInfo] = useState<any>({})

    // This ensures the component only renders on the client side to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)

        // Debug info
        try {
            const storageUser = localStorage.getItem('user')
            setDebugInfo({
                isAuthenticated,
                user,
                storageUser: storageUser ? JSON.parse(storageUser) : null,
            })
            console.log('Navbar debug:', { isAuthenticated, user, storageUser })
        } catch (e) {
            console.error('Debug error:', e)
        }
    }, [isAuthenticated, user])
    // Common navigation links
    const navLinks = (
        <nav className="hidden md:flex items-center space-x-6">
            <Link
                href="/"
                className={`text-sm font-medium ${currentPath === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
                    }`}
            >
                Home
            </Link>
            <Link
                href="/rooms"
                className={`text-sm font-medium ${currentPath === "/rooms" ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
                    }`}
            >
                Rooms
            </Link>
            <Link
                href="/about"
                className={`text-sm font-medium ${currentPath === "/about" ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
                    }`}
            >
                About
            </Link>
            <Link
                href="/contact"
                className={`text-sm font-medium ${currentPath === "/contact" ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
                    }`}
            >
                Contact
            </Link>
        </nav>
    )

    // Logo component
    const logo = (
        <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="text-xl font-bold">HostelHub</span>
        </Link>
    )

    // Prevent hydration mismatch by not rendering authenticated state on server
    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {logo}
                {navLinks}                <div className="flex items-center space-x-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button size="sm">Sign Up</Button>
                    </Link>
                </div>
            </div>
        )
    }
    return (
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {logo}
            {navLinks}            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium hidden md:inline-block">
                                Hi, {user?.firstname || user?.name?.split(" ")[0] || "User"}
                            </span>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                                <AvatarFallback>{user?.name?.charAt(0) || user?.firstname?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Sign Up</Button>
                        </Link>
                    </>
                )}
            </div>            {/* Debug info - only shown in development */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="fixed bottom-2 right-2 bg-black/70 text-white p-2 rounded text-xs z-50 max-w-xs overflow-auto" style={{ maxHeight: '300px' }}>
                    <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
                    <div>User: {user?.firstname || 'None'}</div>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

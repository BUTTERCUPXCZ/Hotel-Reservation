"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface NavbarProps {
    currentPath?: string
}

export function Navbar({ currentPath = "/" }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter()

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // This ensures the component only renders on the client side to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [isAuthenticated, user])

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [currentPath])

    // Logout handler
    const handleSafeLogout = () => {
        try {
            sessionStorage.setItem('isLoggingOut', 'true');
            router.push('/');
            setTimeout(() => {
                logout();
            }, 100);
        } catch (error) {
            console.error("Logout error:", error);
            logout();
        }
    }

    // Navigation links data
    const navigationLinks = [
        { href: "/", label: "Home" },
        { href: "/rooms", label: "Rooms" },
        { href: "/discovery", label: "Discovery" },
        { href: "/Contact", label: "Contact" }
    ]

    // Desktop navigation links
    const navLinks = (
        <nav className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/80 ${currentPath === link.href
                        ? "bg-white/50"
                        : ""
                        }`}
                    style={{
                        color: currentPath === link.href ? '#6AB19A' : '#2E2E2E',
                        borderColor: currentPath === link.href ? '#6AB19A' : 'transparent'
                    }}
                >
                    {link.label}
                    {currentPath === link.href && (
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                            style={{ backgroundColor: '#6AB19A' }}
                            layoutId="activeTab"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </Link>
            ))}
        </nav>
    )

    // Mobile navigation links
    const mobileNavLinks = (
        <motion.nav
            className="flex flex-col space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            {navigationLinks.map((link, index) => (
                <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Link
                        href={link.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${currentPath === link.href
                            ? "border"
                            : "hover:bg-white/50"
                            }`}
                        style={{
                            color: currentPath === link.href ? '#6AB19A' : '#5A5A5A',
                            backgroundColor: currentPath === link.href ? 'rgba(106, 177, 154, 0.1)' : 'transparent',
                            borderColor: currentPath === link.href ? 'rgba(106, 177, 154, 0.2)' : 'transparent'
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                </motion.div>
            ))}
        </motion.nav>
    )

    // Logo component
    const logo = (
        <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105" style={{ backgroundColor: '#6AB19A' }}>
                <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold" style={{ color: '#2E2E2E' }}>
                Kayan
            </span>
        </Link>
    )

    // Desktop auth buttons
    const desktopAuthButtons = (
        <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-2 h-10 px-4 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-white/80 hover:to-emerald-50/70 group"
                            style={{ color: '#2E2E2E', border: '1px solid rgba(106, 177, 154, 0.15)' }}
                        >
                            <div className="relative">
                                <Avatar className="h-8 w-8 ring-2 transition-all duration-300 group-hover:ring-4 group-hover:scale-105"
                                    style={{ '--tw-ring-color': 'rgba(106, 177, 154, 0.3)' } as React.CSSProperties}>
                                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name && decodeURIComponent(user.name) || "User"} />
                                    <AvatarFallback className="text-xs font-bold"
                                        style={{ backgroundColor: 'rgba(106, 177, 154, 0.2)', color: '#3C8B73' }}>
                                        {(user?.name && decodeURIComponent(user.name).charAt(0)) || user?.firstname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div className="flex flex-col -space-y-0.5 items-start">
                                <span className="text-sm font-medium max-w-24 truncate" style={{ color: '#2E2E2E' }}>
                                    {user?.firstname || (user?.name && decodeURIComponent(user.name).split(" ")[0]) || "User"}
                                </span>
                                <span className="text-xs opacity-70" style={{ color: '#6AB19A' }}>Welcome back!</span>
                            </div>
                            <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" style={{ color: '#5A5A5A' }} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleSafeLogout}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-medium transition-all duration-200 hover:bg-white/80"
                            style={{ color: '#2E2E2E' }}
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button
                            size="sm"
                            className="font-medium shadow-sm hover:shadow-md transition-all duration-200 text-white hover:opacity-90"
                            style={{ backgroundColor: '#6AB19A' }}
                        >
                            Sign Up
                        </Button>
                    </Link>
                </>
            )}
        </div>
    )

    // Mobile auth buttons
    const mobileAuthButtons = (
        <motion.div
            className="flex flex-col space-y-3 pt-6"
            style={{ borderTop: '1px solid #E0E0E0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            {isAuthenticated ? (
                <>
                    <div className="flex items-center space-x-4 px-5 py-4 rounded-xl"
                        style={{
                            background: 'linear-gradient(to right, rgba(106, 177, 154, 0.1), rgba(106, 177, 154, 0.05))',
                            borderLeft: '3px solid #6AB19A'
                        }}>
                        <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-offset-2"
                                style={{ '--tw-ring-color': 'rgba(106, 177, 154, 0.4)', '--tw-ring-offset-color': 'rgba(255, 255, 255, 0.8)' } as React.CSSProperties}>
                                <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name && decodeURIComponent(user.name) || "User"} />
                                <AvatarFallback className="text-sm font-bold" style={{ backgroundColor: 'rgba(106, 177, 154, 0.2)', color: '#3C8B73' }}>
                                    {(user?.name && decodeURIComponent(user.name).charAt(0)) || user?.firstname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <p className="text-base font-semibold truncate" style={{ color: '#2E2E2E' }}>
                                    {user?.firstname || (user?.name && decodeURIComponent(user.name).split(" ")[0]) || "User"}
                                </p>
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(106, 177, 154, 0.2)', color: '#3C8B73' }}>
                                    Guest
                                </span>
                            </div>
                            <p className="text-xs truncate mt-1" style={{ color: '#5A5A5A' }}>
                                {user?.email || "user@example.com"}
                            </p>
                            <p className="text-xs mt-1 font-medium" style={{ color: '#6AB19A' }}>
                                Welcome back! Your last login was today.
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start h-12 rounded-lg hover:bg-white/50 hover:translate-x-1 transition-all"
                            style={{ color: '#2E2E2E', border: '1px solid rgba(106, 177, 154, 0.1)' }}>
                            <User className="mr-3 h-4 w-4 text-emerald-600" />
                            <span>Dashboard</span>
                            <div className="ml-auto opacity-50">→</div>
                        </Button>
                    </Link>
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start h-12 rounded-lg hover:bg-white/50 hover:translate-x-1 transition-all"
                            style={{ color: '#2E2E2E', border: '1px solid rgba(106, 177, 154, 0.1)' }}>
                            <Settings className="mr-3 h-4 w-4 text-emerald-600" />
                            <span>Settings</span>
                            <div className="ml-auto opacity-50">→</div>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsMobileMenuOpen(false)
                            handleSafeLogout()
                        }}
                        className="text-red-600 hover:bg-red-50 w-full h-12 rounded-lg transition-all hover:translate-x-1 mt-1"
                        style={{ borderColor: '#E0E0E0' }}
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Logout</span>
                        <div className="ml-auto opacity-50">→</div>
                    </Button>
                </>
            ) : (
                <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full h-11 font-medium hover:bg-white/50" style={{ color: '#2E2E2E' }}>
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button size="sm" className="w-full h-11 font-medium shadow-sm text-white hover:opacity-90" style={{ backgroundColor: '#6AB19A' }}>
                            Sign Up
                        </Button>
                    </Link>
                </>
            )}
        </motion.div>
    )

    // Prevent hydration mismatch by not rendering authenticated state on server
    if (!mounted) {
        return (
            <div
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md shadow-lg' : ''
                    }`}
                style={{
                    backgroundColor: scrolled ? 'rgba(250, 250, 250, 0.95)' : '#FAFAFA',
                    borderBottom: scrolled ? '1px solid rgba(224, 224, 224, 0.8)' : '1px solid #E0E0E0'
                }}
            >
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16 lg:h-18">
                        {logo}
                        {navLinks}
                        <div className="hidden lg:flex items-center space-x-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-medium hover:bg-white/80" style={{ color: '#2E2E2E' }}>
                                    Login
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="font-medium shadow-sm text-white hover:opacity-90" style={{ backgroundColor: '#6AB19A' }}>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden p-2 hover:bg-white/80"
                            style={{ color: '#2E2E2E' }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md shadow-lg' : ''
                    }`}
                style={{
                    backgroundColor: scrolled ? 'rgba(250, 250, 250, 0.95)' : '#FAFAFA',
                    borderBottom: scrolled ? '1px solid rgba(224, 224, 224, 0.8)' : '1px solid #E0E0E0'
                }}
            >
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16 lg:h-18">
                        {logo}
                        {navLinks}
                        {desktopAuthButtons}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden p-2 hover:bg-white/80"
                            style={{ color: '#2E2E2E' }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <motion.div
                                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </motion.div>
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className="lg:hidden"
                            style={{
                                borderTop: scrolled ? '1px solid rgba(224, 224, 224, 0.8)' : '1px solid #E0E0E0',
                                backgroundColor: scrolled ? 'rgba(250, 250, 250, 0.95)' : '#FAFAFA',
                                backdropFilter: scrolled ? 'blur(12px)' : 'none'
                            }}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="container mx-auto px-4 py-6 space-y-6">
                                {mobileNavLinks}
                                {mobileAuthButtons}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}
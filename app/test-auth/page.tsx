"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { trpc } from "@/hooks/trpc"

export default function TestAuthPage() {
    const [cookieInfo, setCookieInfo] = useState<any>({})
    const [localStorageInfo, setLocalStorageInfo] = useState<any>(null)
    const { user, isAuthenticated } = useAuth()

    // Test the getUserBookings query
    const userBookingsQuery = trpc.rooms.getUserBookings.useQuery(undefined, {
        enabled: isAuthenticated,
        retry: false
    })

    // Test the session query
    const sessionQuery = trpc.auth.getSession.useQuery(undefined, {
        retry: false
    })

    useEffect(() => {
        updateInfo()
    }, [])

    const updateInfo = () => {
        // Get cookies
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return undefined;
        };

        setCookieInfo({
            userId: getCookie('userId'),
            userEmail: getCookie('userEmail'),
            userName: getCookie('userName'),
            allCookies: document.cookie
        })

        // Get localStorage
        try {
            const userData = localStorage.getItem('user')
            setLocalStorageInfo(userData ? JSON.parse(userData) : null)
        } catch (error) {
            setLocalStorageInfo('Error parsing localStorage')
        }
    }

    const handleSetTestUser = () => {
        const testUser = {
            id: "test123",
            email: "test@example.com",
            firstname: "Test",
            lastname: "User",
            name: "Test User",
            loginTime: Date.now()
        }

        // Set localStorage
        localStorage.setItem("user", JSON.stringify(testUser))

        // Set cookies
        const cookieOptions = "; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `userId=${testUser.id}${cookieOptions}`;
        document.cookie = `userEmail=${testUser.email}${cookieOptions}`;
        document.cookie = `userName=${encodeURIComponent(testUser.name)}${cookieOptions}`;

        console.log("Test user created in localStorage and cookies")

        // Trigger auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged'));

        // Update info display
        setTimeout(updateInfo, 100)
    }

    const handleClearUser = () => {
        // Clear localStorage
        localStorage.removeItem("user")

        // Clear cookies
        document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        console.log("User cleared from localStorage and cookies")

        // Trigger auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged'));

        // Update info display
        setTimeout(updateInfo, 100)
    }

    const testUserBookings = () => {
        userBookingsQuery.refetch()
    }

    return (
        <div className="container mx-auto p-8 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Authentication Testing</h1>

            <div className="flex gap-4 mb-6">
                <Button onClick={handleSetTestUser}>Set Test User</Button>
                <Button variant="destructive" onClick={handleClearUser}>Clear User</Button>
                <Button variant="outline" onClick={updateInfo}>Refresh Info</Button>
                <Button variant="secondary" onClick={testUserBookings} disabled={!isAuthenticated}>
                    Test User Bookings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Auth State</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</div>
                            <div>User: {user ? JSON.stringify(user, null, 2) : "None"}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cookies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>userId: {cookieInfo.userId || "Not set"}</div>
                            <div>userEmail: {cookieInfo.userEmail || "Not set"}</div>
                            <div>userName: {cookieInfo.userName || "Not set"}</div>
                            <div className="text-xs text-gray-500 mt-2">
                                All cookies: {cookieInfo.allCookies || "None"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>LocalStorage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <pre className="whitespace-pre-wrap">
                                {localStorageInfo ? JSON.stringify(localStorageInfo, null, 2) : "No user data"}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Session Query</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>Loading: {sessionQuery.isLoading ? "Yes" : "No"}</div>
                            <div>Error: {sessionQuery.error ? JSON.stringify(sessionQuery.error.message) : "None"}</div>
                            <div>Data: <pre className="text-xs">{JSON.stringify(sessionQuery.data, null, 2)}</pre></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>User Bookings Query</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div>Loading: {userBookingsQuery.isLoading ? "Yes" : "No"}</div>
                            <div>Error: {userBookingsQuery.error ?
                                <pre className="text-red-600 text-xs">{JSON.stringify(userBookingsQuery.error, null, 2)}</pre>
                                : "None"}</div>
                            <div>Data Length: {userBookingsQuery.data?.length || 0}</div>
                            <div>Data: <pre className="text-xs">{JSON.stringify(userBookingsQuery.data, null, 2)}</pre></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

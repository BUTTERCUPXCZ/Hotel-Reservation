"use client"

import { Button } from "@/components/ui/button"

export default function TestAuthPage() {
    const handleSetTestUser = () => {
        const testUser = {
            id: "test123",
            email: "test@example.com",
            firstname: "Test",
            lastname: "User",
            name: "Test User",
        }
        localStorage.setItem("user", JSON.stringify(testUser))
        console.log("Test user created in localStorage")
        window.location.reload()
    }

    const handleClearUser = () => {
        localStorage.removeItem("user")
        console.log("User cleared from localStorage")
        window.location.reload()
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Auth Testing</h1>
            <div className="flex gap-4">
                <Button onClick={handleSetTestUser}>Set Test User</Button>
                <Button variant="destructive" onClick={handleClearUser}>Clear User</Button>
            </div>
        </div>
    )
}

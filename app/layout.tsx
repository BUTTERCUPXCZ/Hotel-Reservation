import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import "../styles/animations.css"
import { TRPCProvider } from "@/components/trpc-provider"
import AuthProvider from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })
const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kayan Hostel - Your Gateway to Siargao",
  description: "Experience authentic Siargao living at Kayan Hostel. From surf sessions to island hopping, discover the soul of Siargao.",
  keywords: "Kayan, hostel, Siargao, Philippines, surf, island hopping, accommodation, travel",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

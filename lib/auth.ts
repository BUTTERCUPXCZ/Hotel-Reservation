// lib/auth.ts
import { db } from "@/lib/db"
import { compare, hash } from "bcryptjs"

// This is a custom auth service that doesn't rely on NextAuth
export const authService = {
  // Verify credentials and return a user if valid
  async verifyCredentials(email: string, password: string) {
    try {
      const user = await db.user.findUnique({
        where: { email }
      })

      if (!user) {
        return null
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        return null
      }

      // Return user without password
      return {
        id: user.id.toString(),
        email: user.email,
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      }
    } catch (error) {
      console.error("Auth error:", error)
      return null
    }
  },

  // Create a new user
  async registerUser(userData: {
    firstname: string,
    lastname: string,
    email: string,
    password: string
  }) {
    // Hash the password
    const hashedPassword = await hash(userData.password, 10)

    // Create the user
    const newUser = await db.user.create({
      data: {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        password: hashedPassword,
      },
    })

    // Return user without password
    return {
      id: newUser.id.toString(),
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
    }
  },

  // Get the current session (we won't implement this right now)
  async getSession() {
    return null
  }
}

// These are placeholders to prevent breaking imports in other files
// They don't actually do anything
export const auth = () => null
export const handlers = {}
export const signIn = () => null
export const signOut = () => null

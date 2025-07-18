"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Leaf } from "lucide-react"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Store token if provided (optional, since we're using cookies)
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        router.push('/')
      } else {
        // Handle error - use the message from backend or a default message
        const errorMessage = data.msg || 'Registration failed. Please try again.';
        setError(errorMessage);
        console.error('Signup failed:', errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create an account"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="underline text-green-600 hover:text-green-700">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

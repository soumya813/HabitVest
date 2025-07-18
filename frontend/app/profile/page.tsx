"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Crown,
  Edit3,
  Save,
  X,
} from "lucide-react"

interface UserData {
  id: string
  username: string
  email: string
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUsername, setEditedUsername] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data)
        setEditedUsername(data.data.username)
        setEditedEmail(data.data.email)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editedUsername,
          email: editedEmail,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data)
        setIsEditing(false)
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditedUsername(user.username)
      setEditedEmail(user.email)
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userInitials = user.username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-green-800 dark:bg-green-900 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-green-200 dark:border-green-700">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.username} />
                  <AvatarFallback className="bg-green-600 text-white text-xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {user.username}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Username</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  ) : (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {user.username}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      placeholder="Enter email"
                    />
                  ) : (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {user.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member Since</span>
                  </Label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {memberSince}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2,450</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">42</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Level 8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

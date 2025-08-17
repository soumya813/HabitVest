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
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUsername, setEditedUsername] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (user) {
      setEditedUsername(user.username || '')
      setEditedEmail(user.email)
    }
  }, [user, isAuthenticated, authLoading, router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:5001/api/v1/users/${user._id}`, {
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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()

        if (data.success) {
          await refreshUser() // Refresh user data from auth context
          setIsEditing(false)
        } else {
          console.error('Failed to update profile:', data.msg)
        }
      } else {
        const text = await response.text();
        console.error('Failed to update profile - non-JSON response:', response.status, text);
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditedUsername(user.username || '')
      setEditedEmail(user.email)
    }
    setIsEditing(false)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You need to be logged in to view this page.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const userInitials = (user.username || user.email)
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase()

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'Unknown'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.username || user.email} />
                  <AvatarFallback className="text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.username || 'User'}
              </CardTitle>
              <div className="flex justify-center items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {(user.xp ?? user.points) || 0} XP
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    {isEditing ? (
                      <Input
                        id="username"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        placeholder="Enter username"
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                        {user.username || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        placeholder="Enter email"
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                    {memberSince}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(user.xp ?? user.points) || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.totalTasksCompleted || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {user.totalRewardsRedeemed || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rewards Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

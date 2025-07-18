"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  LogOut,
  Settings,
  UserCircle,
  Crown,
} from "lucide-react"

interface UserData {
  id: string
  username: string
  email: string
  createdAt: string
}

export function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data)
      } else {
        // User not authenticated, redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Clear any local storage if needed
        localStorage.removeItem('token')
        // Redirect to login page
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleProfileClick = () => {
    // Navigate to profile page (to be created)
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    // Navigate to settings page (to be created)
    router.push('/settings')
  }

  if (isLoading) {
    return (
      <Avatar className="h-10 w-10 animate-pulse">
        <AvatarFallback className="bg-green-600 dark:bg-green-700">
          <User className="h-5 w-5 text-white" />
        </AvatarFallback>
      </Avatar>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={() => router.push('/login')}
        variant="outline"
        size="sm"
        className="text-white border-white hover:bg-white hover:text-green-800"
      >
        Login
      </Button>
    )
  }

  const userInitials = user.username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-white/10 focus:bg-white/10"
        >
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage 
              src="/placeholder-user.jpg" 
              alt={user.username}
            />
            <AvatarFallback className="bg-green-600 dark:bg-green-700 text-white font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt={user.username} />
                <AvatarFallback className="bg-green-600 text-white text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Crown className="h-3 w-3" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

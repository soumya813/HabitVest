"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect if still loading or already on onboarding page
    if (isLoading || pathname === '/onboarding' || pathname === '/login' || pathname === '/signup') {
      return
    }

    // Only redirect to onboarding for users who haven't completed it
    // New users will be redirected, existing users can optionally complete onboarding
    if (user && !user.onboardingCompleted) {
      // Check if user was created recently (likely a new user)
      const userCreatedAt = new Date(user.createdAt || '2023-01-01');
      const recentUserThreshold = new Date();
      recentUserThreshold.setDate(recentUserThreshold.getDate() - 7); // Users created in last 7 days
      
      // Only auto-redirect very recent users to onboarding
      if (userCreatedAt > recentUserThreshold) {
        router.push('/onboarding')
      }
      // For older users, they can access the app normally and complete onboarding if they choose
    }
  }, [user, isLoading, pathname, router])

  // Show loading state while checking auth/onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Only block content for very recent users who haven't completed onboarding
  if (user && !user.onboardingCompleted && pathname !== '/onboarding') {
    const userCreatedAt = new Date(user.createdAt || '2023-01-01');
    const recentUserThreshold = new Date();
    recentUserThreshold.setDate(recentUserThreshold.getDate() - 7); // Users created in last 7 days
    
    // Only block rendering for very recent users
    if (userCreatedAt > recentUserThreshold) {
      return null
    }
  }

  return <>{children}</>
}

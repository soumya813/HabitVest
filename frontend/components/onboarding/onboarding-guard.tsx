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

    // If user is authenticated but hasn't completed onboarding
    if (user && !user.onboardingCompleted) {
      router.push('/onboarding')
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

  // If user needs onboarding and not on onboarding page, don't render children
  if (user && !user.onboardingCompleted && pathname !== '/onboarding') {
    return null
  }

  return <>{children}</>
}

"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWizard, OnboardingData } from '@/components/onboarding/onboarding-wizard'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Check if onboarding is already completed
    if (user.onboardingCompleted) {
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [user, router])

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // The onboarding wizard already sends the data to backend and shows success toast
      // Now refresh the user data to get the updated onboardingCompleted status
      console.log('Refreshing user data after onboarding completion...')
      await refreshUser()
      console.log('User data refreshed successfully')
      
      // Small delay to allow the success message to be seen, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...')
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Onboarding completion error:', error)
      toast({
        title: "Error",
        description: "Something went wrong refreshing your profile. Please try again.",
        variant: 'destructive'
      })
    }
  }

  const handleSkipOnboarding = () => {
    // Allow user to skip onboarding and go straight to the app
    toast({
      title: "Onboarding Skipped",
      description: "You can always complete setup later in your profile.",
      variant: 'default'
    })
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWizard 
      onComplete={handleOnboardingComplete}
      onSkip={handleSkipOnboarding}
    />
  )
}

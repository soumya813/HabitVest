"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { WelcomeStep } from './steps/welcome-step'
import { GoalsStep } from './steps/goals-step'
import { ScheduleStep } from './steps/schedule-step'
import { HabitsStep } from './steps/habits-step'
import { CompletionStep } from './steps/completion-step'
import { useToast } from '@/components/ui/use-toast'

export interface OnboardingData {
  goals: string[]
  schedule: {
    wakeUpTime: string
    workoutTime: string
    studyTime: string
    bedTime: string
    reminderPreferences: {
      morning: boolean
      evening: boolean
      beforeDeadlines: boolean
    }
  }
  initialHabits: Array<{
    name: string
    description: string
    category: string
    frequency: {
      type: 'daily' | 'weekly' | 'specific_days'
      days?: number[]
      count?: number
    }
    points: number
    reminderTime?: string
  }>
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    focusAreas: string[]
    motivationStyle: 'competitive' | 'collaborative' | 'personal'
  }
}

const onboardingSteps = [
  {
    title: "Welcome to HabitVest",
    description: "Your journey to better habits starts here",
    component: WelcomeStep
  },
  {
    title: "Set Your Goals",
    description: "What areas of your life do you want to improve?",
    component: GoalsStep
  },
  {
    title: "Plan Your Schedule",
    description: "When do you want to work on your habits?",
    component: ScheduleStep
  },
  {
    title: "Create Your First Habits",
    description: "Start with 2-3 simple habits for success",
    component: HabitsStep
  },
  {
    title: "You're All Set!",
    description: "Ready to start your habit-building journey",
    component: CompletionStep
  }
]

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
  onSkip?: () => void
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<OnboardingData>({
    goals: [],
    schedule: {
      wakeUpTime: '07:00',
      workoutTime: '08:00',
      studyTime: '19:00',
      bedTime: '22:00',
      reminderPreferences: {
        morning: true,
        evening: true,
        beforeDeadlines: true
      }
    },
    initialHabits: [],
    preferences: {
      difficulty: 'beginner',
      focusAreas: [],
      motivationStyle: 'personal'
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Save onboarding data to backend
      const response = await fetch('http://localhost:5001/api/v1/users/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const responseBody = await (async () => {
        try { return await response.json(); } catch { return null }
      })();

      if (response.ok) {
        console.log('Onboarding response:', response.status, responseBody);
        toast({
          title: "Welcome to HabitVest!",
          description: "Your onboarding is complete. Let's start building habits!",
          variant: 'default'
        })
        onComplete(userData)
      } else {
        let errorData: any = responseBody || {};
        
        const errorMessage = errorData?.msg || `Server error: ${response.status}`;
        console.error('Onboarding error details:', { status: response.status, errorData });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Onboarding completion error:', error)
      
      // Show specific error message based on error type
      let errorMessage = "Failed to complete onboarding. Please try again."
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "You need to log in first. Please sign in to continue."
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = "Access denied. Please check your login status."
        } else if (error.message.includes('Server error')) {
          errorMessage = `Server error occurred: ${error.message}`
        } else if (error.message !== 'Failed to save onboarding data') {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete(userData)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Goals step
        return userData.goals.length > 0
      case 2: // Schedule step
        return userData.schedule.wakeUpTime && userData.schedule.bedTime
      case 3: // Habits step
        return userData.initialHabits.length > 0
      default:
        return true
    }
  }

  const CurrentStepComponent = onboardingSteps[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            HabitVest Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Let's personalize your habit-building experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / onboardingSteps.length) * 100} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {onboardingSteps[currentStep].title}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {onboardingSteps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <CurrentStepComponent 
              userData={userData}
              setUserData={setUserData}
            />
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                {currentStep === 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip}
                    className="text-gray-500"
                  >
                    Skip Setup
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={nextStep}
                disabled={!isStepValid() || isLoading}
                className="flex items-center gap-2"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  isLoading ? 'Setting up...' : 'Get Started'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

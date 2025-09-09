"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, Target, Star } from 'lucide-react'
import { OnboardingData } from '../onboarding-wizard'

interface WelcomeStepProps {
  userData: OnboardingData
  setUserData: (data: OnboardingData) => void
}

export function WelcomeStep({ userData, setUserData }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
            <Rocket className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to HabitVest!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Transform your life one habit at a time
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <CardContent className="p-0">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Smart Goal Setting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set personalized goals and track your progress with intelligent insights
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
          <CardContent className="p-0">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Gamified Experience</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earn points, unlock rewards, and compete with friends
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
          <CardContent className="p-0">
            <Rocket className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Proven Methods</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on scientific research and behavioral psychology
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-center mb-4">Join thousands of successful habit builders</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">10K+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">2M+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Habits Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">85%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Quick Setup Tips:</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">1</Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose 2-3 simple habits to start with</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">2</Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">Set realistic goals and be consistent</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">3</Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress and celebrate wins</p>
          </div>
        </div>
      </div>
    </div>
  )
}

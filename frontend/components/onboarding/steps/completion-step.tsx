"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Rocket, 
  Target, 
  Calendar, 
  Trophy,
  Star,
  Gift,
  Users
} from 'lucide-react'
import { OnboardingData } from '../onboarding-wizard'

interface CompletionStepProps {
  userData: OnboardingData
  setUserData: (data: OnboardingData) => void
}

export function CompletionStep({ userData, setUserData }: CompletionStepProps) {
  const goalCount = userData.goals.length
  const habitCount = userData.initialHabits.length
  const totalPoints = userData.initialHabits.reduce((sum, habit) => sum + habit.points, 0)

  const achievements = [
    {
      icon: Target,
      title: 'Goal Setter',
      description: `Selected ${goalCount} focus area${goalCount !== 1 ? 's' : ''}`,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: Calendar,
      title: 'Schedule Planner',
      description: 'Set up your daily routine',
      color: 'text-green-500 bg-green-100 dark:bg-green-900/30'
    },
    {
      icon: Rocket,
      title: 'Habit Creator',
      description: `Created ${habitCount} habit${habitCount !== 1 ? 's' : ''}`,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
    }
  ]

  const nextSteps = [
    {
      icon: CheckCircle,
      title: 'Complete Your First Day',
      description: 'Mark your habits as complete today',
      badge: 'Start Now'
    },
    {
      icon: Trophy,
      title: 'Build Your Streak',
      description: 'Aim for a 7-day streak in your first week',
      badge: 'This Week'
    },
    {
      icon: Gift,
      title: 'Earn Your First Reward',
      description: `Collect ${totalPoints} points to unlock rewards`,
      badge: 'Goal'
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Share your progress and get motivated',
      badge: 'Optional'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 You're All Set!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your personalized habit journey is ready to begin
          </p>
        </div>
      </div>

      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-4 text-center">
            Setup Complete - Here's What You've Accomplished:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`p-2 rounded-lg ${achievement.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Your Habits Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Starting Habits
          </h3>
          
          <div className="space-y-3">
            {userData.initialHabits.map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">{habit.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {habit.category} • Daily
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {habit.points} XP
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Daily Potential
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalPoints} XP
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Complete all habits daily to earn maximum points
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-500" />
            What's Next?
          </h3>
          
          <div className="space-y-3">
            {nextSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {step.badge}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Motivation Quote */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
        <blockquote className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
        </blockquote>
        <cite className="text-sm text-gray-600 dark:text-gray-400">— Aristotle</cite>
      </div>

      {/* Final CTA */}
      <div className="text-center space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          Ready to start building life-changing habits?
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>💪 Stay consistent</span>
          <span>•</span>
          <span>📈 Track progress</span>
          <span>•</span>
          <span>🎯 Reach your goals</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Briefcase, 
  Users, 
  Leaf, 
  Target,
  CheckCircle
} from 'lucide-react'
import { OnboardingData } from '../onboarding-wizard'

interface GoalsStepProps {
  userData: OnboardingData
  setUserData: (data: OnboardingData) => void
}

const goalCategories = [
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    icon: Dumbbell,
    color: 'bg-red-500',
    description: 'Exercise, nutrition, and physical wellbeing',
    examples: ['Daily workout', 'Healthy eating', 'Better sleep']
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    icon: Brain,
    color: 'bg-purple-500',
    description: 'Mindfulness, stress management, mental health',
    examples: ['Meditation', 'Journaling', 'Stress management']
  },
  {
    id: 'learning-growth',
    name: 'Learning & Growth',
    icon: BookOpen,
    color: 'bg-blue-500',
    description: 'Education, skills, personal development',
    examples: ['Reading', 'Online courses', 'Language learning']
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: Target,
    color: 'bg-green-500',
    description: 'Work efficiency, time management, focus',
    examples: ['Deep work', 'Time blocking', 'Goal setting']
  },
  {
    id: 'relationships',
    name: 'Relationships',
    icon: Users,
    color: 'bg-pink-500',
    description: 'Family, friends, social connections',
    examples: ['Quality time', 'Communication', 'Social activities']
  },
  {
    id: 'career',
    name: 'Career',
    icon: Briefcase,
    color: 'bg-indigo-500',
    description: 'Professional development, networking',
    examples: ['Skill building', 'Networking', 'Side projects']
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: Heart,
    color: 'bg-orange-500',
    description: 'Art, music, creative expression',
    examples: ['Drawing', 'Writing', 'Music practice']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: Leaf,
    color: 'bg-teal-500',
    description: 'Environment, habits, daily routines',
    examples: ['Organization', 'Sustainability', 'Minimalism']
  }
]

export function GoalsStep({ userData, setUserData }: GoalsStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userData.goals || [])

  const toggleGoal = (goalId: string) => {
    const updatedGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId]
    
    setSelectedGoals(updatedGoals)
    setUserData({
      ...userData,
      goals: updatedGoals,
      preferences: {
        ...userData.preferences,
        focusAreas: updatedGoals
      }
    })
  }

  const getSelectedCount = () => selectedGoals.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          What areas do you want to focus on?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select 2-4 areas that matter most to you right now
        </p>
        <Badge variant={getSelectedCount() > 0 ? "default" : "secondary"} className="mt-2">
          {getSelectedCount()} of 4 selected
        </Badge>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalCategories.map((goal) => {
          const Icon = goal.icon
          const isSelected = selectedGoals.includes(goal.id)
          
          return (
            <Card 
              key={goal.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`${goal.color} rounded-lg p-2 flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {goal.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {goal.examples.map((example, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      {getSelectedCount() > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            💡 Recommendations based on your selection:
          </h3>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            {selectedGoals.includes('health-fitness') && (
              <p>• Start with 15-20 minutes of daily exercise</p>
            )}
            {selectedGoals.includes('mental-wellness') && (
              <p>• Try 5-10 minutes of daily meditation</p>
            )}
            {selectedGoals.includes('learning-growth') && (
              <p>• Read for 20-30 minutes daily</p>
            )}
            {selectedGoals.includes('productivity') && (
              <p>• Use time-blocking techniques for focused work</p>
            )}
          </div>
        </div>
      )}

      {/* Motivation Style Selection */}
      {getSelectedCount() > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 dark:text-white">
            How do you stay motivated?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'personal', label: 'Personal Growth', desc: 'I focus on my own progress' },
              { id: 'competitive', label: 'Competition', desc: 'I thrive on challenges and leaderboards' },
              { id: 'collaborative', label: 'Community', desc: 'I enjoy sharing and supporting others' }
            ].map((style) => (
              <Button
                key={style.id}
                variant={userData.preferences.motivationStyle === style.id ? 'default' : 'outline'}
                className="h-auto p-3 text-left"
                onClick={() => setUserData({
                  ...userData,
                  preferences: {
                    ...userData.preferences,
                    motivationStyle: style.id as 'personal' | 'competitive' | 'collaborative'
                  }
                })}
              >
                <div>
                  <div className="font-medium">{style.label}</div>
                  <div className="text-xs opacity-70">{style.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

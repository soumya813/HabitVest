"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Sun, 
  Moon, 
  Dumbbell, 
  BookOpen, 
  Bell,
  Coffee,
  Sunset
} from 'lucide-react'
import { OnboardingData } from '../onboarding-wizard'

interface ScheduleStepProps {
  userData: OnboardingData
  setUserData: (data: OnboardingData) => void
}

const timeSlots = [
  { id: 'wakeUpTime', label: 'Wake Up', icon: Sun, color: 'text-yellow-500', defaultTime: '07:00' },
  { id: 'workoutTime', label: 'Workout', icon: Dumbbell, color: 'text-red-500', defaultTime: '08:00' },
  { id: 'studyTime', label: 'Learning', icon: BookOpen, color: 'text-blue-500', defaultTime: '19:00' },
  { id: 'bedTime', label: 'Sleep', icon: Moon, color: 'text-purple-500', defaultTime: '22:00' }
]

const reminderOptions = [
  { 
    id: 'morning', 
    label: 'Morning Motivation', 
    icon: Coffee,
    description: 'Daily inspiration to start your day right',
    time: '08:00'
  },
  { 
    id: 'evening', 
    label: 'Evening Reflection', 
    icon: Sunset,
    description: 'Review your progress and plan tomorrow',
    time: '20:00'
  },
  { 
    id: 'beforeDeadlines', 
    label: 'Smart Reminders', 
    icon: Bell,
    description: 'Gentle nudges before habit deadlines',
    time: 'Variable'
  }
]

export function ScheduleStep({ userData, setUserData }: ScheduleStepProps) {
  const updateSchedule = (field: string, value: string | boolean) => {
    if (field.includes('reminderPreferences.')) {
      const reminderField = field.split('.')[1]
      setUserData({
        ...userData,
        schedule: {
          ...userData.schedule,
          reminderPreferences: {
            ...userData.schedule.reminderPreferences,
            [reminderField]: value
          }
        }
      })
    } else {
      setUserData({
        ...userData,
        schedule: {
          ...userData.schedule,
          [field]: value
        }
      })
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getOptimalHabitTime = (goalAreas: string[]) => {
    if (goalAreas.includes('health-fitness')) return 'Morning workouts boost energy all day'
    if (goalAreas.includes('learning-growth')) return 'Evening learning helps with retention'
    if (goalAreas.includes('mental-wellness')) return 'Morning meditation sets a calm tone'
    return 'Consistency matters more than timing'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          When do you want to build habits?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your ideal schedule for habit-building activities
        </p>
      </div>

      {/* Daily Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Daily Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeSlots.map((slot) => {
            const Icon = slot.icon
            return (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${slot.color}`} />
                  <div>
                    <Label className="font-medium">{slot.label}</Label>
                    <p className="text-sm text-gray-500">
                      {slot.id === 'wakeUpTime' && 'Start your day with intention'}
                      {slot.id === 'workoutTime' && 'Physical activity and exercise'}
                      {slot.id === 'studyTime' && 'Learning and skill development'}
                      {slot.id === 'bedTime' && 'Wind down and prepare for rest'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={userData.schedule[slot.id as keyof typeof userData.schedule] as string || slot.defaultTime}
                    onChange={(e) => updateSchedule(slot.id, e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Badge variant="outline" className="text-xs">
                    {formatTime(userData.schedule[slot.id as keyof typeof userData.schedule] as string || slot.defaultTime)}
                  </Badge>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Reminder Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Reminder Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reminderOptions.map((option) => {
            const Icon = option.icon
            const isEnabled = userData.schedule.reminderPreferences[option.id as keyof typeof userData.schedule.reminderPreferences]
            
            return (
              <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <Label className="font-medium">{option.label}</Label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {option.time}
                    </Badge>
                  </div>
                </div>
                
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateSchedule(`reminderPreferences.${option.id}`, checked)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Personalized Tip */}
      {userData.goals.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
            💡 Personalized Tip
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {getOptimalHabitTime(userData.goals)}
          </p>
        </div>
      )}

      {/* Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Schedule Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const time = userData.schedule[slot.id as keyof typeof userData.schedule] as string || slot.defaultTime
              const Icon = slot.icon
              return (
                <div key={slot.id} className="flex items-center gap-3 text-sm">
                  <Icon className={`h-4 w-4 ${slot.color}`} />
                  <span className="font-medium w-16">{formatTime(time)}</span>
                  <span className="text-gray-600 dark:text-gray-400">{slot.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Flame } from "lucide-react"

interface Category {
  _id: string
  name: string
  color: string
}

interface Habit {
  _id: string
  name: string
  description?: string
  category: Category | string
  points: number
  frequency: {
    type: 'daily' | 'weekly' | 'specific_days' | 'x_times_per_week'
    days?: number[]
    count?: number
  }
  completedToday?: boolean
  streak: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface HabitListProps {
  habits: Habit[]
  isLoading?: boolean
  onHabitComplete?: (habitId: string) => void
}

export function HabitList({ habits, isLoading, onHabitComplete }: HabitListProps) {
  const getCategoryName = (category: Category | string) => {
    return typeof category === 'string' ? category : category.name
  }

  const getCategoryColor = (category: Category | string) => {
    return typeof category === 'string' ? '#6B7280' : category.color
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No habits yet. Create your first habit to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit._id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {habit.name}
              </p>
              {habit.streak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">
                    {habit.streak}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {habit.points} XP
              </p>
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0"
                style={{ 
                  backgroundColor: `${getCategoryColor(habit.category)}20`, 
                  color: getCategoryColor(habit.category) 
                }}
              >
                {getCategoryName(habit.category)}
              </Badge>
            </div>
          </div>
          
          <Button
            size="sm"
            className={`${
              habit.completedToday 
                ? "bg-gray-400 hover:bg-gray-500" 
                : "bg-green-600 hover:bg-green-700"
            } text-white min-w-[80px]`}
            disabled={habit.completedToday}
            onClick={() => onHabitComplete?.(habit._id)}
          >
            {habit.completedToday ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Done</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Circle className="h-4 w-4" />
                <span>Complete</span>
              </div>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}

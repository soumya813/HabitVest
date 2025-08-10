"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Target, 
  Flame, 
  MoreHorizontal,
  Plus,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


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
  // Optionally, backend may add:
  // remainingForPeriod?: number
}

interface HabitListProps {
  habits: Habit[]
  isLoading?: boolean
  onHabitComplete?: (habitId: string) => void
  showDetails?: boolean
}


export function HabitList({ habits: initialHabits = [], isLoading: initialLoading = false, onHabitComplete, showDetails }: HabitListProps) {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchHabits()
    fetchCategories()
  }, [])

  const fetchHabits = async (showSuccess?: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/habits', {
        credentials: 'include',
      })
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json()
        if (data.success) {
          setHabits(data.data)
          if (showSuccess) {
            toast({ title: showSuccess, variant: 'default' })
          }
        }
      } else {
        const text = await response.text();
        console.error('Error fetching habits:', response.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/categories', {
        credentials: 'include',
      })
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } else {
        const text = await response.text();
        console.error('Error fetching categories:', response.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const toggleHabitCompletion = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/habits/${habitId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      
      const contentType = response.headers.get('content-type');
      if (response.ok) {
        fetchHabits(completed ? 'Habit marked as complete!' : 'Habit marked as incomplete!')
      } else {
        const text = await response.text();
        console.error('Error toggling habit completion:', response.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error)
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      const response = await fetch(`/api/v1/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        fetchHabits('Habit deleted!')
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const filteredHabits = habits.filter(habit => {
    const catName = typeof habit.category === 'string' ? habit.category : habit.category?.name;
    return selectedCategory === 'all' || catName === selectedCategory;
  })

  const getFrequencyText = (habit: Habit) => {
    switch (habit.frequency.type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `${habit.frequency.count ?? 0}x per week`;
      case 'x_times_per_week':
        return `${habit.frequency.count ?? 0}x per week`;
      case 'specific_days': {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (habit.frequency.days ?? []).map(d => days[d]).join(', ');
      }
      default:
        return 'Unknown';
    }
  }

  const getCategoryColor = (category: string | Category) => {
    const catName = typeof category === 'string' ? category : category?.name;
    const found = categories.find(c => c.name === catName);
    return found?.color || '#3B82F6';
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Habits</h2>
          <p className="text-muted-foreground">
            {filteredHabits.length} habit{filteredHabits.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Add Habit button removed: use parent component to handle creation */}
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No habits found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory === 'all' 
                ? "Start building better habits today!"
                : `No habits in the "${selectedCategory}" category.`
              }
            </p>
            {/* Add Habit button removed: use parent component to handle creation */}
          </CardContent>
        </Card>
      ) : (
  <div className="grid gap-4">
          {filteredHabits.map((habit) => (
            <Card 
              key={habit._id} 
              className={`transition-all duration-200 hover:shadow-md ${
                habit.completedToday ? 'bg-green-50 border-green-200' : ''
              }`} style={{ fontSize: '0.92rem', minHeight: '2.5rem' }}
            >
              <CardContent className="p-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Completion Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHabitCompletion(habit._id, !habit.completedToday)}
                      className={`p-1 h-8 w-8 ${habit.completedToday ? 'text-green-600' : 'text-gray-400'}`}
                      // Remove shouldCompleteToday, just enable always for now
                      // disabled={!habit.shouldCompleteToday}
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>

                    {/* Habit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1 min-h-[1.25rem]">
                        <h3 className={`font-medium text-sm truncate max-w-[8rem] ${habit.completedToday ? 'line-through text-muted-foreground' : ''}`}
                            style={{lineHeight: '1rem'}}>
                          {habit.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          style={{ backgroundColor: `${getCategoryColor(habit.category)}20`, color: getCategoryColor(habit.category) }}
                          className="text-[10px] px-1 py-0.5 rounded font-semibold"
                        >
                          {(() => {
                            if (typeof habit.category === 'object' && habit.category?.name) return habit.category.name;
                            if (typeof habit.category === 'string') {
                              const found = categories.find(c => c._id === habit.category);
                              return found ? found.name : '';
                            }
                            return '';
                          })()}
                        </Badge>
                      </div>
                      
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mb-2">{habit.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getFrequencyText(habit)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span className="font-semibold text-gray-700 dark:text-gray-200">{habit.points} points</span>
                        </span>
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {habit.streak} day streak
                          </span>
                        )}
                      </div>

                      {/* Progress for weekly/monthly habits */}
                      {(habit.frequency.type === 'weekly' || habit.frequency.type === 'x_times_per_week') && typeof habit.frequency.count === 'number' && typeof (habit as any).remainingForPeriod === 'number' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress this week</span>
                            <span>{habit.frequency.count - (habit as any).remainingForPeriod}/{habit.frequency.count}</span>
                          </div>
                          <Progress 
                            value={((habit.frequency.count - (habit as any).remainingForPeriod) / habit.frequency.count) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Edit button removed: use parent component to handle editing */}
                      <DropdownMenuItem 
                        onClick={() => deleteHabit(habit._id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

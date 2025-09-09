"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  Target, 
  Clock, 
  Calendar,
  Star,
  Lightbulb
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OnboardingData } from '../onboarding-wizard'

interface Category {
  _id: string
  name: string
  description?: string
  color: string
  icon: string
}

interface HabitsStepProps {
  userData: OnboardingData
  setUserData: (data: OnboardingData) => void
}

// Suggested habits based on goals
const habitSuggestions = {
  'health-fitness': [
    { name: '10-minute morning walk', points: 20, frequency: { type: 'daily' } },
    { name: 'Drink 8 glasses of water', points: 15, frequency: { type: 'daily' } },
    { name: '20-minute workout', points: 30, frequency: { type: 'daily' } },
    { name: 'Take stairs instead of elevator', points: 10, frequency: { type: 'daily' } }
  ],
  'mental-wellness': [
    { name: '5-minute meditation', points: 25, frequency: { type: 'daily' } },
    { name: 'Write in gratitude journal', points: 20, frequency: { type: 'daily' } },
    { name: 'Practice deep breathing', points: 15, frequency: { type: 'daily' } },
    { name: 'No phone 1 hour before bed', points: 25, frequency: { type: 'daily' } }
  ],
  'learning-growth': [
    { name: 'Read for 20 minutes', points: 25, frequency: { type: 'daily' } },
    { name: 'Learn 5 new words', points: 15, frequency: { type: 'daily' } },
    { name: 'Watch educational video', points: 20, frequency: { type: 'daily' } },
    { name: 'Practice a new skill', points: 30, frequency: { type: 'daily' } }
  ],
  'productivity': [
    { name: 'Plan tomorrow tonight', points: 15, frequency: { type: 'daily' } },
    { name: '2 hours deep work', points: 35, frequency: { type: 'daily' } },
    { name: 'Review daily goals', points: 10, frequency: { type: 'daily' } },
    { name: 'Organize workspace', points: 15, frequency: { type: 'daily' } }
  ],
  'relationships': [
    { name: 'Call a family member', points: 20, frequency: { type: 'daily' } },
    { name: 'Compliment someone', points: 15, frequency: { type: 'daily' } },
    { name: 'Quality time with loved ones', points: 25, frequency: { type: 'daily' } },
    { name: 'Send appreciation message', points: 20, frequency: { type: 'weekly', count: 3 } }
  ]
}

export function HabitsStep({ userData, setUserData }: HabitsStepProps) {
  const [habits, setHabits] = useState(userData.initialHabits || [])
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [customHabit, setCustomHabit] = useState({
    name: '',
    description: '',
    category: '',
    frequency: { type: 'daily' as const },
    points: 20,
    reminderTime: ''
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/categories', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        } else {
          console.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Get suggested habits based on selected goals
  const getSuggestedHabits = () => {
    const suggestions: any[] = []
    userData.goals.forEach(goal => {
      if (habitSuggestions[goal as keyof typeof habitSuggestions]) {
        suggestions.push(...habitSuggestions[goal as keyof typeof habitSuggestions].slice(0, 2))
      }
    })
    return suggestions.slice(0, 6) // Limit to 6 suggestions
  }

  // Helper function to get category ID from goal
  const getCategoryIdFromGoal = (goal: string) => {
    const goalToCategoryMap: { [key: string]: string } = {
      'health': 'Health',
      'productivity': 'Productivity', 
      'learning': 'Learning',
      'finance': 'Finance',
      'relationships': 'Personal',
      'career': 'Personal'
    }
    
    const categoryName = goalToCategoryMap[goal] || 'Personal'
    const category = categories.find(cat => cat.name.toLowerCase().includes(categoryName.toLowerCase()))
    return category?._id || (categories[0]?._id || '')
  }

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category?.name || 'Unknown'
  }

  const addSuggestedHabit = (suggestion: any) => {
    const categoryId = getCategoryIdFromGoal(userData.goals[0] || '')
    const newHabit = {
      ...suggestion,
      category: categoryId,
      description: `Recommended habit for your ${userData.goals[0]} goal`
    }
    
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    updateUserData(updatedHabits)
  }

  const addCustomHabit = () => {
    if (!customHabit.name.trim()) return
    
    const newHabit = {
      ...customHabit,
      category: customHabit.category || (categories[0]?._id || '')
    }
    
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    updateUserData(updatedHabits)
    
    // Reset form
    setCustomHabit({
      name: '',
      description: '',
      category: '',
      frequency: { type: 'daily' },
      points: 20,
      reminderTime: ''
    })
    setIsAddingCustom(false)
  }

  const removeHabit = (index: number) => {
    const updatedHabits = habits.filter((_, i) => i !== index)
    setHabits(updatedHabits)
    updateUserData(updatedHabits)
  }

  const updateUserData = (newHabits: any[]) => {
    setUserData({
      ...userData,
      initialHabits: newHabits
    })
  }

  const getFrequencyText = (frequency: any) => {
    if (frequency.type === 'daily') return 'Daily'
    if (frequency.type === 'weekly') return `${frequency.count || 1}x per week`
    return 'Custom'
  }

  const suggestedHabits = getSuggestedHabits()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Let's create your first habits
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start with 2-3 simple habits. You can always add more later!
        </p>
        <Badge variant={habits.length > 0 ? "default" : "secondary"}>
          {habits.length} habit{habits.length !== 1 ? 's' : ''} selected
        </Badge>
      </div>

      {/* Suggested Habits */}
      {suggestedHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedHabits.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => addSuggestedHabit(suggestion)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {suggestion.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {suggestion.points} XP
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {getFrequencyText(suggestion.frequency)}
                        </Badge>
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Habits */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-green-500" />
              Your Habits ({habits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habits.map((habit, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 dark:text-green-200">
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {habit.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                        {getCategoryNameById(habit.category)}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                        <Target className="h-3 w-3 mr-1" />
                        {habit.points} XP
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                        <Clock className="h-3 w-3 mr-1" />
                        {getFrequencyText(habit.frequency)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHabit(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Custom Habit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Create Custom Habit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAddingCustom ? (
            <Button 
              variant="outline" 
              onClick={() => setIsAddingCustom(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your Own Habit
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="habit-name">Habit Name *</Label>
                <Input
                  id="habit-name"
                  placeholder="e.g., Read for 20 minutes"
                  value={customHabit.name}
                  onChange={(e) => setCustomHabit({ ...customHabit, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="habit-description">Description (Optional)</Label>
                <Textarea
                  id="habit-description"
                  placeholder="Why is this habit important to you?"
                  value={customHabit.description}
                  onChange={(e) => setCustomHabit({ ...customHabit, description: e.target.value })}
                  className="resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="habit-category">Category</Label>
                  <Select
                    value={customHabit.category}
                    onValueChange={(value) => setCustomHabit({ ...customHabit, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="habit-points">Points (XP)</Label>
                  <Input
                    id="habit-points"
                    type="number"
                    min="5"
                    max="100"
                    value={customHabit.points}
                    onChange={(e) => setCustomHabit({ ...customHabit, points: parseInt(e.target.value) || 20 })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addCustomHabit} disabled={!customHabit.name.trim()}>
                  Add Habit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingCustom(false)
                    setCustomHabit({
                      name: '',
                      description: '',
                      category: '',
                      frequency: { type: 'daily' },
                      points: 20,
                      reminderTime: ''
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
          💡 Tips for Success
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Start small - 5-10 minutes is better than ambitious goals you can't keep</li>
          <li>• Be specific - "Read 20 minutes" vs "Read more"</li>
          <li>• Stack habits - Link new habits to existing routines</li>
          <li>• Track consistently - The app will help you see your progress</li>
        </ul>
      </div>
    </div>
  )
}

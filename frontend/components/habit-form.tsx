"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Repeat, Tag } from "lucide-react"

interface Category {
  _id: string
  name: string
  color: string
  icon: string
}

interface HabitFormData {
  name: string;
  description: string;
  category: string; // will store category _id
  points: number;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'specific_days' | 'x_times_per_week';
    target: number;
    days: number[];
  };
}


interface HabitFormProps {
  categories?: Category[]
  onHabitCreated?: () => void
  onSubmit?: (data: HabitFormData) => void
  onCancel?: () => void
  initialData?: Partial<HabitFormData>
  isLoading?: boolean
}



const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

// Default categories that are always available
const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'health', name: 'Health', color: '#EF4444', icon: 'heart' },
  { _id: 'fitness', name: 'Fitness', color: '#F97316', icon: 'dumbbell' },
  { _id: 'learning', name: 'Learning', color: '#6366F1', icon: 'book' },
  { _id: 'finance', name: 'Finance', color: '#10B981', icon: 'dollar-sign' },
  { _id: 'productivity', name: 'Productivity', color: '#3B82F6', icon: 'briefcase' },
  { _id: 'mindfulness', name: 'Mindfulness', color: '#8B5CF6', icon: 'brain' },
  { _id: 'social', name: 'Social', color: '#EC4899', icon: 'users' },
  { _id: 'creativity', name: 'Creativity', color: '#F59E0B', icon: 'palette' }
];

export function HabitForm({ categories: propCategories, onHabitCreated, onSubmit, onCancel, initialData, isLoading }: HabitFormProps) {
  // Do not default to DEFAULT_CATEGORIES here — keep empty so UI can block creation
  const [categories, setCategories] = useState<Category[]>(propCategories && propCategories.length > 0 ? propCategories : [])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    category: '',
    points: 10,
    frequency: {
      type: 'daily',
      target: 1,
      days: []
    },
    ...initialData
  })

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories)
      if (!formData.category) {
        setFormData(prev => ({ ...prev, category: propCategories[0]._id }))
      }
    } else {
      fetchCategories()
    }
  }, [propCategories])

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/categories', {
        credentials: 'include',
      })
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data)
          if (!formData.category) {
            setFormData(prev => ({ ...prev, category: data.data[0]._id }))
          }
        } else {
          // Use default categories if backend returns empty array
          setCategories(DEFAULT_CATEGORIES)
          if (!formData.category) {
            setFormData(prev => ({ ...prev, category: DEFAULT_CATEGORIES[0]._id }))
          }
        }
      } else {
        // If backend didn't return categories, keep categories empty so the form
        // shows the warning and prevents creating habits with fake ids.
        setCategories([])
        if (!formData.category) {
          setFormData(prev => ({ ...prev, category: '' }))
        }
      }
    } catch (error) {
      // Keep categories empty on error so user must create categories first.
      setCategories([])
      if (!formData.category) {
        setFormData(prev => ({ ...prev, category: '' }))
      }
    } finally {
      setCategoriesLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:5001/api/v1/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          points: formData.points,
          frequency: {
            type: formData.frequency.type,
            days: formData.frequency.type === 'specific_days' ? formData.frequency.days : undefined,
            count: formData.frequency.type === 'x_times_per_week' ? formData.frequency.target : undefined,
          }
        }),
      })
      const contentType = response.headers.get('content-type');
      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: categories[0]?._id || '',
          points: 10,
          frequency: { type: 'daily', target: 1, days: [] }
        })
        setShowForm(false)
        onHabitCreated?.()
      } else {
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          console.error('Error creating habit:', error);
          alert('Failed to create habit. ' + (error?.message || error?.error || JSON.stringify(error)));
        } else {
          const text = await response.text();
          console.error('Error creating habit (non-JSON):', text);
          alert('Failed to create habit: Server returned non-JSON response. You may not be authenticated or the backend is down. Response: ' + text);
        }
      }
    } catch (error) {
      console.error('Error creating habit:', error)
      alert('Failed to create habit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFrequencyTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        type: type as 'daily' | 'weekly' | 'monthly' | 'specific_days',
        days: type === 'specific_days' ? prev.frequency.days : []
      }
    }))
  }

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        days: prev.frequency.days.includes(day)
          ? prev.frequency.days.filter(d => d !== day)
          : [...prev.frequency.days, day].sort()
      }
    }))
  }

  if (!showForm) {
    return (
      <Button
        size="sm"
        onClick={() => setShowForm(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        + Add Habit
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {initialData ? 'Edit Habit' : 'Create New Habit'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 && !categoriesLoading && (
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
            No categories available. Please create a category first in the dashboard or admin panel. You cannot create a habit until at least one category exists.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of your habit..."
                rows={3}
              />
            </div>
          </div>

          {/* Category & Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={categoriesLoading || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">No categories available. Please create a category first in the dashboard or admin panel.</div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">XP per completion</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
              />
            </div>
          </div>

          {/* Frequency Settings */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Frequency
            </Label>
            
            <Select
              value={formData.frequency.type}
              onValueChange={handleFrequencyTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="specific_days">Specific Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Target for weekly/monthly */}
            {(formData.frequency.type === 'weekly' || formData.frequency.type === 'monthly') && (
              <div className="space-y-2">
                <Label htmlFor="target">
                  Times per {formData.frequency.type === 'weekly' ? 'week' : 'month'}
                </Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  max={formData.frequency.type === 'weekly' ? 7 : 31}
                  value={formData.frequency.target}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    frequency: { ...prev.frequency, target: parseInt(e.target.value) || 1 }
                  }))}
                />
              </div>
            )}

            {/* Specific days selection */}
            {formData.frequency.type === 'specific_days' && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={formData.frequency.days.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.frequency.days.length === 0 && (
                  <p className="text-sm text-red-500">Please select at least one day</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowForm(false)
                onCancel?.()
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.category || categories.length === 0 ||
                (formData.frequency.type === 'specific_days' && formData.frequency.days.length === 0)}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Habit' : 'Create Habit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

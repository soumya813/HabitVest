"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Trash2, Filter, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Category {
  _id: string
  name: string
  icon: string
  color: string
}

interface Habit {
  _id: string;
  title: string;
  description?: string;
  category: Category | string;
  frequency: {
    type: "daily" | "weekly" | "monthly";
    target: number;
    days?: number[];
  };
  completedCount?: number;
  isCompleted: boolean;
  streak?: number;
  lastCompletedAt?: string;
  createdAt: string;
  userId: string;
}

interface HabitListProps {
  habits: Habit[]
  isLoading: boolean
  onHabitComplete: (habitId: string) => void
  onHabitDelete?: (habitId: string) => void
  showFilters?: boolean
}

export function HabitList({ 
  habits, 
  isLoading, 
  onHabitComplete, 
  onHabitDelete,
  showFilters = true 
}: HabitListProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/categories', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleToggleComplete = async (habitId: string) => {
    try {
      onHabitComplete(habitId)
      toast({
        title: "Habit updated!",
        description: "Great job on maintaining your habit!",
      })
    } catch (error) {
      console.error('Failed to toggle habit:', error)
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (habitId: string) => {
    if (!onHabitDelete) return
    
    try {
      onHabitDelete(habitId)
      toast({
        title: "Habit deleted",
        description: "The habit has been removed from your list.",
      })
    } catch (error) {
      console.error('Failed to delete habit:', error)
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredHabits = habits.filter(habit => {
    if (selectedCategory === "all") return true;
    const categoryId = typeof habit.category === 'string' ? habit.category : (habit.category as Category)?._id;
    return categoryId === selectedCategory;
  });

  const getFrequencyText = (frequency: any) => {
    if (!frequency || typeof frequency !== 'object') {
      return "";
    }
    const type = frequency.type;
    const target = frequency.target ?? frequency.count ?? 1;
    switch (type) {
      case "daily":
        return target === 1 ? "Daily" : `${target}x daily`;
      case "weekly":
        return target === 1 ? "Weekly" : `${target}x weekly`;
      case "monthly":
        return target === 1 ? "Monthly" : `${target}x monthly`;
      default:
        return type;
    }
  };

  const getCategoryColor = (category: string | Category) => {
    const categoryId = typeof category === 'string' ? category : (category as Category)?._id;
    const cat = categories.find(c => c._id === categoryId);
    return cat?.color || "#6366f1";
  };

  // Render as a plain container so parent can control card/layout
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-medium">Your Habits</h4>
        {showFilters && categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {selectedCategory === "all" 
              ? "No habits yet. Create your first habit to get started!" 
              : "No habits in this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map((habit) => (
            <div
              key={habit._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <Button
                  variant={habit.isCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleComplete(habit._id)}
                  className="mt-1"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${habit.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      { (habit as any).name || habit.title }
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ backgroundColor: `${getCategoryColor(habit.category)}20`, color: getCategoryColor(habit.category) }}
                    >
                      {getFrequencyText(habit.frequency)}
                    </Badge>
                  </div>
                  
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {habit.description}
                    </p>
                  )}
                  
                  {habit.streak !== undefined && habit.streak > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>🔥 {habit.streak} day streak</span>
                    </div>
                  )}
                  
                  {habit.completedCount !== undefined && ((habit.frequency?.target ?? (habit.frequency as any)?.count ?? 1)) > 1 && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                        <span>{habit.completedCount}/{habit.frequency.target ?? (habit.frequency as any).count}</span>
                      </div>
                      <Progress 
                        value={(habit.completedCount / (habit.frequency.target ?? (habit.frequency as any).count)) * 100}
                        className="h-2" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {onHabitDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(habit._id)}
                  className="text-destructive hover:text-destructive/80 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

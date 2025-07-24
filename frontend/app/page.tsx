"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ElementType } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { mockAPI } from "@/lib/mock-api"
import {
  TrendingUp,
  TrendingDown,
  Heart,
  BookOpen,
  DollarSign,
  Leaf,
  User,
  Gift,
  Coffee,
  Gamepad2,
  ShoppingBag,
  CheckSquare,
  ArrowRight,
} from "lucide-react"

interface UserData {
  _id: string;
  username: string;
  points: number;
  totalTasksCompleted: number;
  totalRewardsRedeemed: number;
}

interface HabitData {
  id: number;
  name: string;
  completed: boolean;
  points: number;
  category: 'Health' | 'Learning' | 'Finance';
}

export default function Dashboard() {
  // State for user data and functionality
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(75);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Try to fetch real user data first, fallback to mock API
      let response;
      try {
        response = await fetch('http://localhost:5001/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserData(data.data);
            // Calculate progress based on points (example: every 100 points = 1 level)
            const currentLevel = Math.floor(data.data.points / 100);
            const pointsInCurrentLevel = data.data.points % 100;
            setProgressPercentage(pointsInCurrentLevel);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('Backend not available, using mock data');
      }

      // Fallback to mock API
      const mockData = await mockAPI.getUser();
      if (mockData.success) {
        setUserData(mockData.data);
        // Calculate progress based on points
        const currentLevel = Math.floor(mockData.data.points / 100);
        const pointsInCurrentLevel = mockData.data.points % 100;
        setProgressPercentage(pointsInCurrentLevel);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle habit completion
  const handleHabitComplete = async (habitId: number) => {
    if (!userData) return;

    try {
      // Simulate habit completion by awarding points
      const habit = habits.find(h => h.id === habitId);
      if (!habit || habit.completed) return;

      // Update local state immediately for better UX
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, completed: true } : h
      ));

      // Update user points
      const newPoints = userData.points + habit.points;
      setUserData(prev => prev ? {
        ...prev,
        points: newPoints,
        totalTasksCompleted: prev.totalTasksCompleted + 1
      } : null);

      // Update progress
      const currentLevel = Math.floor(newPoints / 100);
      const pointsInCurrentLevel = newPoints % 100;
      setProgressPercentage(pointsInCurrentLevel);

      // In a real app, you would make an API call here to update the backend
      console.log(`Habit completed! Earned ${habit.points} points`);
      
    } catch (error) {
      console.error('Error completing habit:', error);
      // Revert the optimistic update on error
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, completed: false } : h
      ));
    }
  };

  // Handle reward redemption
  const handleRewardRedeem = async (rewardId: number) => {
    if (!userData) return;

    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return;

      // Check if user has enough points
      if (userData.points < reward.points) {
        alert(`Insufficient points! You need ${reward.points} points but only have ${userData.points} points.`);
        return;
      }

      // Confirmation dialog
      const confirmed = confirm(`Redeem "${reward.name}" for ${reward.points} points?`);
      if (!confirmed) return;

      // Update user points immediately for better UX
      const newPoints = userData.points - reward.points;
      setUserData(prev => prev ? {
        ...prev,
        points: newPoints,
        totalRewardsRedeemed: prev.totalRewardsRedeemed + 1
      } : null);

      // Update progress
      const currentLevel = Math.floor(newPoints / 100);
      const pointsInCurrentLevel = newPoints % 100;
      setProgressPercentage(pointsInCurrentLevel);

      // Show success message
      alert(`Successfully redeemed "${reward.name}"! ${reward.points} points deducted.`);

      // In a real app, you would make an API call here to update the backend
      console.log(`Reward redeemed! ${reward.points} points deducted`);
      
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  // Calculate dynamic portfolio values based on user data
  const calculatePortfolioValues = () => {
    if (!userData) return investments;

    const baseValues = {
      Health: 500,
      Learning: 350,
      Finance: 800
    };

    // Filter habits by category and calculate category-specific metrics
    const getHabitsByCategory = (category: 'Health' | 'Learning' | 'Finance') => {
      return habits.filter(h => h.category === category);
    };

    const getCompletedHabitsByCategory = (category: 'Health' | 'Learning' | 'Finance') => {
      return habits.filter(h => h.category === category && h.completed);
    };

    const getCategoryPoints = (category: 'Health' | 'Learning' | 'Finance') => {
      return getCompletedHabitsByCategory(category).reduce((sum, habit) => sum + habit.points, 0);
    };

    return investments.map(investment => {
      const category = investment.category as 'Health' | 'Learning' | 'Finance';
      const baseValue = baseValues[category];
      
      // Calculate ONLY category-specific values (no cross-category influence)
      const categoryHabits = getHabitsByCategory(category);
      const completedCategoryHabits = getCompletedHabitsByCategory(category);
      const categoryPoints = getCategoryPoints(category);
      const completionRate = categoryHabits.length > 0 ? completedCategoryHabits.length / categoryHabits.length : 0;
      
      // Simplified dynamic value calculation - much smaller bonuses
      const pointsBonus = categoryPoints * 0.5; // Each earned point in THIS category adds 0.5 to portfolio value
      const completionBonus = completionRate * 50; // Completion rate bonus (0-50 points)
      
      const dynamicValue = Math.round(baseValue + pointsBonus + completionBonus);
      
      // Simplified growth percentage calculation
      let growthPercentage = 0;
      
      if (category === 'Health') {
        // Simple calculation: 1% per completed habit + 0.1% per 10 points earned
        growthPercentage = (completedCategoryHabits.length * 1) + (categoryPoints * 0.01) - 2;
      } else if (category === 'Learning') {
        // Simple calculation: 0.8% per completed habit + 0.12% per 10 points earned  
        growthPercentage = (completedCategoryHabits.length * 0.8) + (categoryPoints * 0.012) - 1.5;
      } else if (category === 'Finance') {
        // Simple calculation: 0.9% per completed habit + 0.08% per 10 points - spending penalty
        const spendingPenalty = userData.totalRewardsRedeemed * 0.3;
        growthPercentage = (completedCategoryHabits.length * 0.9) + (categoryPoints * 0.008) - spendingPenalty - 1;
      }

      // Cap the growth percentage between -10% and +15%
      growthPercentage = Math.max(-10, Math.min(15, growthPercentage));
      
      return {
        ...investment,
        value: `${dynamicValue.toLocaleString()} pts`,
        change: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`,
        isPositive: growthPercentage >= 0
      };
    });
  };

  // Calculate dynamic portfolio summary
  const calculatePortfolioSummary = () => {
    if (!userData) return {
      totalValue: '2,500 pts',
      totalGrowth: '+5.0%',
      streakDays: 15,
      currentLevel: 'Level 3'
    };

    const dynamicPortfolio = calculatePortfolioValues();
    const totalValue = dynamicPortfolio.reduce((sum, item) => {
      return sum + parseInt(item.value.replace(' pts', '').replace(',', ''));
    }, 0);

    const averageGrowth = dynamicPortfolio.reduce((sum, item) => {
      return sum + parseFloat(item.change.replace('%', ''));
    }, 0) / dynamicPortfolio.length;

    // Simplified streak calculation
    const completedHabits = habits.filter(h => h.completed).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;
    
    // Simple streak calculation: base + completed habits + consistency bonus
    const baseStreak = 5; // Base streak
    const streakHabitBonus = completedHabits * 3; // 3 days per completed habit
    const consistencyBonus = Math.round(completionRate * 10); // Up to 10 days for 100% completion
    const taskBonus = Math.min(userData.totalTasksCompleted, 15); // Max 15 days from tasks
    
    const streakDays = baseStreak + streakHabitBonus + consistencyBonus + taskBonus;

    // Simplified level calculation
    const totalHabitPoints = habits.filter(h => h.completed).reduce((sum, h) => sum + h.points, 0);
    const baseLevel = Math.floor(userData.points / 150); // Level every 150 points
    const levelHabitBonus = Math.floor(totalHabitPoints / 100); // Bonus level every 100 habit points
    const currentLevel = Math.max(1, baseLevel + levelHabitBonus); // Minimum level 1

    return {
      totalValue: `${totalValue.toLocaleString()} pts`,
      totalGrowth: `${averageGrowth >= 0 ? '+' : ''}${averageGrowth.toFixed(1)}%`,
      streakDays: streakDays,
      currentLevel: `Level ${currentLevel}`,
      isGrowthPositive: averageGrowth >= 0
    };
  };

  // Static data (could be moved to state and made dynamic)
  const [habits, setHabits] = useState<HabitData[]>([
    // Health Category Habits
    { id: 1, name: "Morning Exercise", completed: false, points: 100, category: 'Health' },
    { id: 2, name: "Drink 8 Glasses Water", completed: true, points: 25, category: 'Health' },
    { id: 3, name: "Take Vitamins", completed: false, points: 15, category: 'Health' },
    { id: 4, name: "10k Steps Walk", completed: false, points: 50, category: 'Health' },
    { id: 5, name: "Healthy Meal Prep", completed: true, points: 75, category: 'Health' },
    
    // Learning Category Habits
    { id: 6, name: "Morning Meditation", completed: false, points: 50, category: 'Learning' },
    { id: 7, name: "Read 30 Minutes", completed: true, points: 30, category: 'Learning' },
    { id: 8, name: "Practice Skill", completed: false, points: 40, category: 'Learning' },
    { id: 9, name: "Watch Educational Video", completed: false, points: 20, category: 'Learning' },
    { id: 10, name: "Journal Writing", completed: true, points: 25, category: 'Learning' },
    
    // Finance Category Habits
    { id: 11, name: "Budget Review", completed: false, points: 75, category: 'Finance' },
    { id: 12, name: "Save Money", completed: true, points: 60, category: 'Finance' },
    { id: 13, name: "Track Expenses", completed: false, points: 30, category: 'Finance' },
    { id: 14, name: "Investment Research", completed: false, points: 50, category: 'Finance' },
    { id: 15, name: "Pay Bills", completed: true, points: 40, category: 'Finance' },
  ]);

  const investments: {
    category: string;
    icon: ElementType;
    value: string;
    change: string;
    isPositive: boolean;
    color: string;
    lightColor: string;
    textColor: string;
  }[] = [
    {
      category: "Health",
      icon: Heart,
      value: "650 pts",
      change: "+12.5%",
      isPositive: true,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      category: "Learning",
      icon: BookOpen,
      value: "420 pts",
      change: "+8.3%",
      isPositive: true,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      category: "Finance",
      icon: DollarSign,
      value: "890 pts",
      change: "-2.1%",
      isPositive: false,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ]

  const rewards: {
    id: number;
    name: string;
    points: number;
    icon: ElementType;
  }[] = [
    { id: 1, name: "Watch Netflix", points: 200, icon: Gamepad2 },
    { id: 2, name: "Buy Coffee", points: 150, icon: Coffee },
    { id: 3, name: "Shopping Spree", points: 500, icon: ShoppingBag },
    { id: 4, name: "Cheat Meal", points: 300, icon: Gift },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href="/tasks">
            <Card className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 border-blue-200 hover:border-blue-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                      <CheckSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Manage Tasks</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create and complete tasks to earn points
                        {!isLoading && userData && (
                          <span className="block text-xs text-blue-600 font-medium">
                            {userData.totalTasksCompleted} tasks completed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rewards">
            <Card className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 border-purple-200 hover:border-purple-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                      <Gift className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Browse Rewards</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Redeem your points for amazing rewards
                        {!isLoading && userData && (
                          <span className="block text-xs text-purple-600 font-medium">
                            {userData.totalRewardsRedeemed} rewards redeemed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Habits */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Welcome back! 👋
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {isLoading ? '...' : userData?.points?.toLocaleString() || '0'}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Total Points
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {progressPercentage}% to next level
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Daily Habits</h3>
                {isLoading ? (
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
                ) : (
                  habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{habit.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{habit.points} pts</p>
                      </div>
                      <Button
                        size="sm"
                        className={`${
                          habit.completed ? "bg-gray-400 hover:bg-gray-500" : "bg-green-600 hover:bg-green-700"
                        } text-white`}
                        disabled={habit.completed}
                        onClick={() => handleHabitComplete(habit.id)}
                      >
                        {habit.completed ? "Done" : "Complete"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Investment Dashboard */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Habit Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(isLoading ? investments : calculatePortfolioValues()).map((investment) => (
                    <Card
                      key={investment.category}
                      className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-full ${investment.lightColor} ${isLoading ? 'animate-pulse' : ''}`}>
                            <investment.icon className={`h-6 w-6 ${investment.textColor}`} />
                          </div>
                          <div className="flex items-center space-x-1">
                            {investment.isPositive ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                investment.isPositive ? "text-green-500" : "text-red-500"
                              } ${isLoading ? 'animate-pulse' : ''}`}
                            >
                              {isLoading ? '+0.0%' : investment.change}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{investment.category}</p>
                          <p className={`text-2xl font-bold text-gray-800 dark:text-gray-200 ${isLoading ? 'animate-pulse' : ''}`}>
                            {isLoading ? '0 pts' : investment.value}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Portfolio Summary */}
              <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Portfolio Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-gray-800 dark:text-gray-200 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? '0 pts' : calculatePortfolioSummary().totalValue}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-green-600 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? '+0.0%' : calculatePortfolioSummary().totalGrowth}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Growth</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-gray-800 dark:text-gray-200 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? '0' : calculatePortfolioSummary().streakDays}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Streak Days</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-blue-600 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? 'Level 0' : calculatePortfolioSummary().currentLevel}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Reward Store */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span>Reward Store</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rewards.map((reward) => {
                  const canAfford = userData ? userData.points >= reward.points : false;
                  const isDisabled = !userData || !canAfford;
                  
                  return (
                    <div
                      key={reward.id}
                      className={`p-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors cursor-pointer ${
                        canAfford 
                          ? 'hover:bg-gray-200 dark:hover:bg-gray-600' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => !isDisabled && handleRewardRedeem(reward.id)}
                      title={
                        !userData 
                          ? 'Loading...' 
                          : canAfford 
                            ? `Click to redeem ${reward.name} for ${reward.points} points`
                            : `Need ${reward.points - (userData?.points || 0)} more points`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-full">
                            <reward.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{reward.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reward.points} pts</p>
                          </div>
                        </div>
                        {!canAfford && userData && (
                          <div className="text-xs text-red-500 font-medium">
                            Need {reward.points - userData.points} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Balance</p>
                    <p className="text-xl font-bold text-green-600">
                      {isLoading ? '...' : userData?.points?.toLocaleString() || '0'} pts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

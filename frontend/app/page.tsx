"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ElementType } from "react"
// Avatar components removed (unused in this file)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
// ThemeToggle and UserProfile removed (not used in this file)
import { HabitForm } from "@/components/habit-form"
import { HabitList } from "@/components/habit-list"
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard"
// mockAPI removed (not used)
import { useAuth } from "@/lib/auth-context"
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

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface HabitData {
  _id: string;
  title: string;
  description?: string;
  category: Category | string;
  points: number;
  frequency: {
    type: 'daily' | 'weekly' | 'specific_days' | 'x_times_per_week';
    days?: number[];
    count?: number;
  };
  completedToday?: boolean;
  streak: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  return (
    <OnboardingGuard>
      <DashboardContent />
    </OnboardingGuard>
  )
}

function DashboardContent() {
  // Get authenticated user from context
  const { user, isAuthenticated, isLoading: authLoading, setUserPoints } = useAuth();
  
  // State management
  const [userData, setUserData] = useState<UserData | null>(null);

  // Always initialize and sync userData from context user for instant UI update
  useEffect(() => {
    if (user) {
      setUserData(prev => {
        if (!prev) {
          return {
            _id: user._id,
            username: user.username || '',
            points: user.points || 0,
            totalTasksCompleted: user.totalTasksCompleted || 0,
            totalRewardsRedeemed: user.totalRewardsRedeemed || 0,
          };
        }
        if (user.points !== undefined && user.points !== prev.points) {
          return { ...prev, points: user.points };
        }
        return prev;
      });
    }
  }, [user]);
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(75);
  
  // Debug logging
  useEffect(() => {
    console.log('Dashboard - Auth state:', { user, isAuthenticated, authLoading });
    console.log('Categories state:', categories);
    console.log('Habits state:', habits);
  }, [user, isAuthenticated, authLoading, categories, habits]);

  // Fetch data from backend
  const fetchUserData = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('Fetching user data...');
      const response = await fetch('http://localhost:5001/api/v1/auth/me', {
        credentials: 'include',
      });
      
      console.log('User data response:', response.status, response.ok);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('User data received:', data);
        setUserData(data.data);

        // Simple progress based on points (every 100 points = 100%)
        const points = data.data.points ?? 0;
        const percentage = (points % 100);
        setProgressPercentage(Math.max(0, Math.min(100, percentage)));
      } else {
        const text = await response.text();
        console.error('Error fetching user data:', response.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchHabits = async () => {
    if (!isAuthenticated) return;
    try {
      console.log('Fetching habits...');
      const response = await fetch('http://localhost:5001/api/v1/habits', {
        credentials: 'include',
      });
      
      console.log('Habits response:', response.status, response.ok);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Habits data received:', data);
        setHabits(data.data || []);
      } else {
        const text = await response.text();
        console.error('Error fetching habits: ', response.status, text);
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchCategories = async () => {
    if (!isAuthenticated) return;
    try {
      console.log('Fetching categories...');
      const response = await fetch('http://localhost:5001/api/v1/categories', {
        credentials: 'include',
      });
      
      console.log('Categories response:', response.status, response.ok);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Categories data received:', data);
        setCategories(data.data || []);
      } else {
        const text = await response.text();
        console.error('Error fetching categories: ', response.status, text);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response - backend may be down or auth issue');
        }
        
        // If we get HTML error, it's likely auth issue - try to provide fallback categories
        if (text.includes('<!DOCTYPE')) {
          console.log('Got HTML error page - likely auth issue. Setting fallback categories.');
        }
        setCategories([
          { _id: 'fallback-1', name: 'Health', color: '#EF4444', icon: 'heart' },
          { _id: 'fallback-2', name: 'Work', color: '#3B82F6', icon: 'briefcase' },
          { _id: 'fallback-3', name: 'Finance', color: '#10B981', icon: 'dollar-sign' },
          { _id: 'fallback-4', name: 'Education', color: '#8B5CF6', icon: 'book' },
          { _id: 'fallback-5', name: 'Personal', color: '#F59E0B', icon: 'user' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Provide fallback categories on network error
      setCategories([
        { _id: 'fallback-1', name: 'Health', color: '#EF4444', icon: 'heart' },
        { _id: 'fallback-2', name: 'Work', color: '#3B82F6', icon: 'briefcase' },
        { _id: 'fallback-3', name: 'Finance', color: '#10B981', icon: 'dollar-sign' },
        { _id: 'fallback-4', name: 'Education', color: '#8B5CF6', icon: 'book' },
        { _id: 'fallback-5', name: 'Personal', color: '#F59E0B', icon: 'user' },
      ]);
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      Promise.all([
        fetchUserData(),
        fetchHabits(),
        fetchCategories()
      ]).finally(() => {
        setIsLoading(false);
      });
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  // Handle habit completion
  const handleHabitComplete = async (habitId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/habits/${habitId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: true
        })
      });

      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // Update points instantly if returned
        const returnedPoints = typeof data.userPoints === 'number' ? data.userPoints : undefined;
        if (typeof returnedPoints === 'number') {
          setUserPoints(returnedPoints);
        }
        // Refresh habits and user data
        await Promise.all([fetchHabits(), fetchUserData()]);
        console.log('Habit completed successfully:', data);
      } else {
          let bodyText = '';
          try {
            bodyText = await response.text();
            const parsed = JSON.parse(bodyText);
            console.error('Error completing habit:', response.status, parsed);
          } catch (e) {
            console.error('Error completing habit:', response.status, bodyText);
          }
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Server returned non-JSON response - backend may be down or auth issue');
          }
      }
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleHabitCreated = () => {
    // Refresh habits when a new one is created
    fetchHabits();
  };

  // Handle reward redemption
  const handleRewardRedeem = async (rewardId: number) => {
    if (!userData) return;

    try {
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) return;

      // Check if user has enough points
      const userPoints = userData.points;
      if (userPoints < reward.points) {
        alert(`Insufficient points! You need ${reward.points} points but only have ${userPoints} points.`);
        return;
      }

      // Confirmation dialog
      const confirmed = confirm(`Redeem "${reward.name}" for ${reward.points} points?`);
      if (!confirmed) return;

      // Update user points immediately for better UX
      const newPoints = userPoints - reward.points;
      setUserData(prev => prev ? {
        ...prev,
        points: newPoints,
        totalRewardsRedeemed: prev.totalRewardsRedeemed + 1
      } : null);

      // Update progress using points value
      const progressValue = newPoints % 100;
      setProgressPercentage(progressValue);

      // Show success message
      alert(`Successfully redeemed "${reward.name}"! ${reward.points} points deducted.`);

      // In a real app, you would make an API call here to update the backend
  console.log(`Reward redeemed! ${reward.points} XP deducted`);
      
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  // Calculate dynamic portfolio values based on habit data
  const calculatePortfolioValues = () => {
    const defaultInvestments = [
      {
        category: "Health",
        icon: Heart,
        value: "500 XP",
        change: "+0.0%",
        isPositive: true,
        color: "bg-red-500",
        lightColor: "bg-red-50",
        textColor: "text-red-600",
      },
      {
        category: "Learning",
        icon: BookOpen,
  value: "350 XP",
        change: "+0.0%",
        isPositive: true,
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-600",
      },
      {
        category: "Finance",
        icon: DollarSign,
  value: "800 XP",
        change: "+0.0%",
        isPositive: true,
        color: "bg-green-500",
        lightColor: "bg-green-50",
        textColor: "text-green-600",
      },
    ];

    if (!userData || habits.length === 0) return defaultInvestments;

    const baseValues = {
      Health: 500,
      Learning: 350,
      Finance: 800
    };

  return defaultInvestments.map(investment => {
      const categoryName = investment.category;
      const baseValue = baseValues[categoryName as keyof typeof baseValues] || 500;
      
      // Find habits for this category
      const categoryHabits = habits.filter(h => {
        const habitCategory = typeof h.category === 'string' ? h.category : h.category?.name;
        return habitCategory?.toLowerCase() === categoryName.toLowerCase();
      });

      const completedHabits = categoryHabits.filter(h => h.completedToday);
      const categoryPoints = completedHabits.reduce((sum, habit) => sum + habit.points, 0);
      const completionRate = categoryHabits.length > 0 ? completedHabits.length / categoryHabits.length : 0;
      
      // Calculate dynamic value
      const pointsBonus = categoryPoints * 0.5;
      const completionBonus = completionRate * 50;
      const dynamicValue = Math.round(baseValue + pointsBonus + completionBonus);
      
      // Calculate growth percentage
      const avgStreak = categoryHabits.reduce((sum, h) => sum + h.streak, 0) / Math.max(categoryHabits.length, 1);
      const growthPercentage = Math.max(-10, Math.min(15, 
        (completedHabits.length * 1) + (avgStreak * 0.1) + (completionRate * 5) - 2
      ));
      
      return {
        ...investment,
        value: `${dynamicValue.toLocaleString()} XP`,
        change: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`,
        isPositive: growthPercentage >= 0
      };
    });
  };

  // Calculate dynamic portfolio summary
  const calculatePortfolioSummary = () => {
    const defaultSummary = {
      totalValue: '1,650 XP',
      totalGrowth: '+0.0%',
      streakDays: 0,
      currentLevel: 'Level 1',
      isGrowthPositive: true
    };

    if (!userData) return defaultSummary;

    const dynamicPortfolio = calculatePortfolioValues();
    const totalValue = dynamicPortfolio.reduce((sum, item) => {
      return sum + parseInt(item.value.replace(' XP', '').replace(',', ''));
    }, 0);

    const averageGrowth = dynamicPortfolio.reduce((sum, item) => {
      return sum + parseFloat(item.change.replace('%', ''));
    }, 0) / dynamicPortfolio.length;

    // Calculate streak from habits
    const avgStreak = habits.length > 0 
      ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length)
      : 0;

  // Calculate level from points (every 100 points = 1 level)
  const currentLevel = Math.max(1, Math.floor((userData.points || 0) / 100) + 1);

    return {
      totalValue: `${totalValue.toLocaleString()} Points`,
      totalGrowth: `${averageGrowth >= 0 ? '+' : ''}${averageGrowth.toFixed(1)}%`,
      streakDays: avgStreak,
      currentLevel: `Level ${currentLevel}`,
      isGrowthPositive: averageGrowth >= 0
    };
  };

  const investments = calculatePortfolioValues();

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

  // Show loading while auth is being checked
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="mx-auto max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to HabitVest
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to access your dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                        Create and complete tasks to earn XP
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
                        Redeem your XP for amazing rewards
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
                      {isLoading ? '...' : (userData?.points !== undefined ? userData.points.toLocaleString() : '0')}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Total Points
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {progressPercentage}% to next milestone
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Your Habits</h3>
                  <HabitForm 
                    categories={categories}
                    onHabitCreated={handleHabitCreated}
                  />
                </div>
                <HabitList 
                  habits={habits}
                  isLoading={isLoading}
                  onHabitComplete={handleHabitComplete}
                />
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
                            {isLoading ? '0 XP' : investment.value}
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
                        {isLoading ? '0 XP' : calculatePortfolioSummary().totalValue}
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
                        {isLoading ? '0' : (Number(calculatePortfolioSummary().streakDays) || 0)}
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
                  const userPoints = (userData && userData.points !== undefined) ? userData.points : 0;
                  const canAfford = userPoints >= reward.points;
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
                            : `Need ${reward.points - userPoints} more points`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-full">
                            <reward.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{reward.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reward.points} Points</p>
                          </div>
                        </div>
                        {!canAfford && userData && (
                          <div className="text-xs text-red-500 font-medium">
                            Need {reward.points - userPoints} more
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
                      {isLoading ? '...' : (userData?.points !== undefined ? userData.points.toLocaleString() : '0')} Points
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

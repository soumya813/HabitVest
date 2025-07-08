"use client"

import type { ElementType } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
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
} from "lucide-react"


export default function Dashboard() {
  const habits = [
    { id: 1, name: "Morning Meditation", completed: false, points: 50 },
    { id: 2, name: "Read 30 Minutes", completed: true, points: 30 },
    { id: 3, name: "Exercise", completed: false, points: 100 },
    { id: 4, name: "Drink 8 Glasses Water", completed: true, points: 25 },
  ]

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
      value: "$2,450",
      change: "+12.5%",
      isPositive: true,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      category: "Learning",
      icon: BookOpen,
      value: "$1,890",
      change: "+8.3%",
      isPositive: true,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      category: "Finance",
      icon: DollarSign,
      value: "$3,200",
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
      {/* Top Navbar */}
      <nav className="bg-green-800 dark:bg-green-900 text-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <span className="text-xl font-bold">HabitVest</span>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-green-600 dark:bg-green-700">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
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
                    <span className="text-2xl font-bold text-green-600">2,450</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Total Points
                    </Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">75% to next level</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Daily Habits</h3>
                {habits.map((habit) => (
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
                    >
                      {habit.completed ? "Done" : "Complete"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Investment Dashboard */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Habit Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {investments.map((investment) => (
                    <Card
                      key={investment.category}
                      className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-full ${investment.lightColor}`}>
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
                              }`}
                            >
                              {investment.change}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{investment.category}</p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{investment.value}</p>
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
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">$7,540</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">+18.7%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Growth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">42</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Streak Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">Level 8</p>
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
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Balance</p>
                    <p className="text-xl font-bold text-green-600">2,450 pts</p>
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

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Target, Trophy, Star, TrendingUp } from 'lucide-react';

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPoints: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
}

interface TaskStatsProps {
  stats: TaskStats;
}

export function TaskStats({ stats }: TaskStatsProps) {
  const completionRate = stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
            </div>
            <Circle className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Points Earned</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Priority Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">🔥 High</Badge>
              </div>
              <span className="font-semibold">{stats.highPriorityTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">⚡ Medium</Badge>
              </div>
              <span className="font-semibold">{stats.mediumPriorityTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">📝 Low</Badge>
              </div>
              <span className="font-semibold">{stats.lowPriorityTasks}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

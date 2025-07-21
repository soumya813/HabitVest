'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Calendar, Star, Edit, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '@/lib/mock-api';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, data: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskComplete, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '📝';
      default:
        return '📝';
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground text-center">
            Create your first task to get started with earning points!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task._id} className={`transition-all duration-200 ${task.completed ? 'opacity-75' : 'hover:shadow-md'}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskComplete(task._id)}
                  disabled={task.completed}
                  className="mt-1 p-0 h-auto"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.name}
                    </h3>
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      {getPriorityIcon(task.priority)} {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {task.points} pts
                    </Badge>
                  </div>

                  {task.description && (
                    <p className={`text-sm mb-2 ${task.completed ? 'text-muted-foreground' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {task.category && (
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                      </div>
                    )}

                    {task.habit && (
                      <Badge variant="outline" className="text-xs">
                        Habit: {task.habit.name}
                      </Badge>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                    </div>

                    {task.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Handle edit - you could implement a modal or inline editing
                    console.log('Edit task:', task._id);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this task?')) {
                      onTaskDelete(task._id);
                    }
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

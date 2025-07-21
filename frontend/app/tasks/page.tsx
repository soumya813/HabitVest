'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, CheckCircle, Circle, Star, Target, Trophy } from 'lucide-react';
import { TaskForm } from '../../components/task-form';
import { TaskList } from '../../components/task-list';
import { TaskStats } from '../../components/task-stats';
import { mockAPI, type Task } from '@/lib/mock-api';

interface TaskStatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPoints: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStatsData | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  // Mock user ID - in real app, get from auth context
  const userId = '676789ab123456789abcdef0';

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [filter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const params: any = {};
      
      if (filter !== 'all') {
        params.completed = filter === 'completed' ? 'true' : 'false';
      }
      
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }

      const data = await mockAPI.getTasks(params);
      setTasks(data.data);
      if (data.data.length > 0 && data.data[0].user.points !== undefined) {
        setUserPoints(data.data[0].user.points);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const data = await mockAPI.getTaskStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    try {
      await mockAPI.createTask(taskData);
      setShowTaskForm(false);
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const data = await mockAPI.completeTask(taskId);
      fetchTasks();
      fetchTaskStats();
      // Show success message with points earned
      alert(data.message);
    } catch (error) {
      console.error('Error completing task:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleTaskUpdate = async (taskId: string, updateData: Partial<Task>) => {
    try {
      // Mock API doesn't have update method, so we'll just refresh for now
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await mockAPI.deleteTask(taskId);
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'pending' && task.completed) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and earn points • Current Points: {userPoints}
          </p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Tasks
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            <Circle className="w-4 h-4 mr-1" />
            Pending
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('all')}
          >
            All Priorities
          </Button>
          <Button
            variant={priorityFilter === 'high' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('high')}
          >
            High
          </Button>
          <Button
            variant={priorityFilter === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('medium')}
          >
            Medium
          </Button>
          <Button
            variant={priorityFilter === 'low' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('low')}
          >
            Low
          </Button>
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        onTaskComplete={handleTaskComplete}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskCreate}
          onCancel={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}

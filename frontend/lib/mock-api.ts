// Mock API for development and testing
export interface Task {
  _id: string;
  name: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  points: number;
  completedAt?: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    points: number;
  };
  habit?: {
    _id: string;
    name: string;
  };
}

export interface Reward {
  _id: string;
  name: string;
  description?: string;
  points: number;
  category?: string;
  type: 'virtual' | 'physical' | 'experience';
  isRedeemed: boolean;
  redeemedAt?: string;
  isAvailable: boolean;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    points: number;
  };
  canAfford?: boolean;
  pointsNeeded?: number;
}

// Mock user data
let mockUser = {
  _id: '676789ab123456789abcdef0',
  username: 'testuser',
  points: 150,
  // xp mirrors points for now; backend will be authoritative in real usage
  xp: 150,
  totalTasksCompleted: 3,
  totalRewardsRedeemed: 1,
};

// Mock tasks data
let mockTasks: Task[] = [
  {
    _id: '1',
    name: 'Complete morning workout',
    description: 'Do 30 minutes of cardio and strength training',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    category: 'Health',
    points: 50,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    user: mockUser,
  },
  {
    _id: '2',
    name: 'Read 20 pages of a book',
    description: 'Continue reading "The Power of Habit"',
    completed: true,
    priority: 'medium',
    category: 'Learning',
    points: 30,
    completedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user: mockUser,
  },
  {
    _id: '3',
    name: 'Drink 8 glasses of water',
    completed: false,
    priority: 'low',
    category: 'Health',
    points: 20,
    createdAt: new Date().toISOString(),
    user: mockUser,
  },
];

// Mock rewards data
let mockRewards: Reward[] = [
  {
    _id: '1',
    name: 'Watch a movie',
    description: 'Enjoy a nice movie night with popcorn',
    points: 100,
    category: 'Entertainment',
    type: 'virtual',
    isRedeemed: false,
    isAvailable: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    user: mockUser,
  },
  {
    _id: '2',
    name: 'Buy a coffee',
    description: 'Treat yourself to your favorite coffee',
    points: 50,
    category: 'Food',
    type: 'physical',
    isRedeemed: true,
    redeemedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    isAvailable: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    user: mockUser,
  },
  {
    _id: '3',
    name: 'Go to a spa',
    description: 'Relax and rejuvenate with a spa day',
    points: 300,
    category: 'Wellness',
    type: 'experience',
    isRedeemed: false,
    isAvailable: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    user: mockUser,
  },
];

// Mock API functions
export const mockAPI = {
  // Task APIs
  getTasks: async (params?: any): Promise<{ success: boolean; data: Task[]; count: number; userXp?: number; userPoints?: number }> => {
    let filteredTasks = [...mockTasks];
    
    if (params?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === (params.completed === 'true'));
    }
    
    if (params?.priority && params.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
    }
    
    return {
      success: true,
      data: filteredTasks,
      count: filteredTasks.length,
      userXp: mockUser.xp ?? mockUser.points,
      userPoints: mockUser.points,
    };
  },

  createTask: async (taskData: Partial<Task>): Promise<{ success: boolean; data: Task }> => {
    const newTask: Task = {
      _id: (mockTasks.length + 1).toString(),
      name: taskData.name || '',
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      category: taskData.category,
      points: taskData.points || 10,
      createdAt: new Date().toISOString(),
      user: mockUser,
    };
    
    mockTasks.unshift(newTask);
    return { success: true, data: newTask };
  },

  completeTask: async (taskId: string): Promise<{ success: boolean; data: Task; message: string; userXp?: number; userPoints?: number }> => {
    const taskIndex = mockTasks.findIndex(task => task._id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const task = mockTasks[taskIndex];
    if (task.completed) {
      throw new Error('Task is already completed');
    }

    task.completed = true;
    task.completedAt = new Date().toISOString();
  mockUser.points += task.points;
  // keep xp in sync for migration
  mockUser.xp = mockUser.points;
  mockUser.totalTasksCompleted += 1;

    return {
      success: true,
      data: { ...task, user: { ...mockUser } },
      message: `Task completed! You earned ${task.points} XP.`,
      userXp: mockUser.xp ?? mockUser.points,
      userPoints: mockUser.points,
    };
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean; data: {} }> => {
    const taskIndex = mockTasks.findIndex(task => task._id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    mockTasks.splice(taskIndex, 1);
    return { success: true, data: {} };
  },

  getTaskStats: async (): Promise<{ success: boolean; data: any }> => {
    const totalTasks = mockTasks.length;
    const completedTasks = mockTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const totalPoints = mockTasks.filter(task => task.completed).reduce((sum, task) => sum + task.points, 0);
    const highPriorityTasks = mockTasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = mockTasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = mockTasks.filter(task => task.priority === 'low').length;

    return {
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        totalPoints,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
      },
    };
  },

  // Reward APIs
  getRewards: async (params?: any): Promise<{ success: boolean; data: Reward[]; count: number; userXp?: number; userPoints?: number }> => {
    let filteredRewards = [...mockRewards];
    
    if (params?.isRedeemed !== undefined) {
      filteredRewards = filteredRewards.filter(reward => reward.isRedeemed === (params.isRedeemed === 'true'));
    }
    
    if (params?.type && params.type !== 'all') {
      filteredRewards = filteredRewards.filter(reward => reward.type === params.type);
    }
    
    if (params?.available) {
      filteredRewards = filteredRewards.filter(reward => reward.isAvailable && !reward.isRedeemed);
      // Add affordability info
      filteredRewards = filteredRewards.map(reward => ({
        ...reward,
        canAfford: mockUser.points >= reward.points,
        pointsNeeded: Math.max(0, reward.points - mockUser.points),
      }));
    }
    
    return {
      success: true,
      data: filteredRewards,
      count: filteredRewards.length,
      // expose xp as primary client-side field, keep userPoints for compatibility
      userXp: mockUser.xp ?? mockUser.points,
      userPoints: mockUser.points,
    };
  },

  getAvailableRewards: async (): Promise<{ success: boolean; data: Reward[]; count: number; userXp?: number; userPoints: number }> => {
    const availableRewards = mockRewards
      .filter(reward => reward.isAvailable && !reward.isRedeemed)
      .map(reward => ({
        ...reward,
        canAfford: mockUser.points >= reward.points,
        pointsNeeded: Math.max(0, reward.points - mockUser.points),
      }));

    return {
      success: true,
      data: availableRewards,
      count: availableRewards.length,
      userXp: mockUser.xp ?? mockUser.points,
      userPoints: mockUser.points,
    };
  },

  createReward: async (rewardData: Partial<Reward>): Promise<{ success: boolean; data: Reward }> => {
    const newReward: Reward = {
      _id: (mockRewards.length + 1).toString(),
      name: rewardData.name || '',
      description: rewardData.description,
      points: rewardData.points || 50,
      category: rewardData.category,
      type: rewardData.type || 'virtual',
      isRedeemed: false,
      isAvailable: rewardData.isAvailable ?? true,
      createdAt: new Date().toISOString(),
      user: mockUser,
    };
    
    mockRewards.unshift(newReward);
    return { success: true, data: newReward };
  },

  redeemReward: async (rewardId: string): Promise<{ success: boolean; data: Reward; message: string }> => {
    const rewardIndex = mockRewards.findIndex(reward => reward._id === rewardId);
    if (rewardIndex === -1) {
      throw new Error('Reward not found');
    }

    const reward = mockRewards[rewardIndex];
    if (reward.isRedeemed) {
      throw new Error('Reward has already been redeemed');
    }

    if (!reward.isAvailable) {
      throw new Error('Reward is not available');
    }

    // prefer xp but fallback to points
    const userBalance = mockUser.xp ?? mockUser.points;
    if (userBalance < reward.points) {
      throw new Error(`Insufficient XP. You need ${reward.points} XP but only have ${userBalance} XP.`);
    }

    reward.isRedeemed = true;
    reward.redeemedAt = new Date().toISOString();
    mockUser.points -= reward.points;
    mockUser.xp = mockUser.points;
    mockUser.totalRewardsRedeemed += 1;

    return {
      success: true,
      data: { ...reward, user: { ...mockUser } },
  message: `Reward redeemed successfully! ${reward.points} XP deducted.`,
    };
  },

  deleteReward: async (rewardId: string): Promise<{ success: boolean; data: {} }> => {
    const rewardIndex = mockRewards.findIndex(reward => reward._id === rewardId);
    if (rewardIndex === -1) {
      throw new Error('Reward not found');
    }

    mockRewards.splice(rewardIndex, 1);
    return { success: true, data: {} };
  },

  getRewardStats: async (): Promise<{ success: boolean; data: any }> => {
    const totalRewards = mockRewards.length;
    const redeemedRewards = mockRewards.filter(reward => reward.isRedeemed).length;
    const availableRewards = mockRewards.filter(reward => reward.isAvailable && !reward.isRedeemed).length;
    const totalPointsSpent = mockRewards.filter(reward => reward.isRedeemed).reduce((sum, reward) => sum + reward.points, 0);
    const virtualRewards = mockRewards.filter(reward => reward.type === 'virtual').length;
    const physicalRewards = mockRewards.filter(reward => reward.type === 'physical').length;
    const experienceRewards = mockRewards.filter(reward => reward.type === 'experience').length;

    return {
      success: true,
      data: {
        totalRewards,
        redeemedRewards,
        availableRewards,
        totalPointsSpent,
        virtualRewards,
        physicalRewards,
        experienceRewards,
      },
    };
  },

  // User API
  getUser: async (): Promise<{ success: boolean; data: typeof mockUser }> => {
    return { success: true, data: mockUser };
  },
};

# HabitVest - Tasks and Rewards System

## Overview
HabitVest is a gamified habit tracking application where users can create tasks, complete them to earn points, and redeem those points for rewards. This system helps motivate users to build better habits by providing tangible rewards for their efforts.

## Features Added

### 🎯 Task Management System

#### Backend Features:
- **Enhanced Task Model** with priority levels, due dates, categories, and point values
- **Task Completion** with automatic point awarding to users
- **Task Statistics** for tracking progress and analytics
- **Filtering and Sorting** by completion status, priority, and category
- **Point System** - users earn points when completing tasks

#### Frontend Features:
- **Task Dashboard** with comprehensive overview
- **Create/Edit/Delete Tasks** with rich form interface
- **Task Completion** with instant feedback and point awards
- **Priority System** (High, Medium, Low) with visual indicators
- **Category Organization** for better task management
- **Due Date Tracking** with relative time display
- **Statistics Dashboard** showing completion rates and breakdowns

### 🎁 Reward System

#### Backend Features:
- **Enhanced Reward Model** with types (virtual, physical, experience)
- **Reward Redemption** with point deduction and validation
- **Availability Management** for controlling when rewards can be redeemed
- **Reward Statistics** for tracking redemption patterns
- **Point Validation** to ensure users have sufficient points

#### Frontend Features:
- **Reward Catalog** with beautiful card-based interface
- **Reward Redemption** with affordability indicators
- **Reward Types** (Virtual, Physical, Experience) with distinct styling
- **Point Requirements** clearly displayed with "points needed" calculations
- **Redemption History** showing previously redeemed rewards
- **Statistics Dashboard** for reward analytics

### 👤 User Point System

#### Backend Features:
- **Point Tracking** integrated into User model
- **Automatic Point Management** when tasks are completed/rewards redeemed
- **Statistics Tracking** for total tasks completed and rewards redeemed
- **Point Validation** for reward redemption

#### Frontend Features:
- **Point Display** throughout the application
- **Real-time Updates** when points are earned or spent
- **Visual Indicators** for affordability and progress

## API Endpoints

### Task Endpoints
```
GET    /api/v1/tasks                    # Get all tasks
GET    /api/v1/users/:userId/tasks      # Get user's tasks
POST   /api/v1/users/:userId/tasks      # Create new task
GET    /api/v1/tasks/:id                # Get single task
PUT    /api/v1/tasks/:id                # Update task
DELETE /api/v1/tasks/:id                # Delete task
PUT    /api/v1/tasks/:id/complete       # Complete task (award points)
GET    /api/v1/users/:userId/tasks/stats # Get task statistics
```

### Reward Endpoints
```
GET    /api/v1/rewards                     # Get all rewards
GET    /api/v1/users/:userId/rewards       # Get user's rewards
POST   /api/v1/users/:userId/rewards       # Create new reward
GET    /api/v1/rewards/:id                 # Get single reward
PUT    /api/v1/rewards/:id                 # Update reward
DELETE /api/v1/rewards/:id                 # Delete reward
PUT    /api/v1/rewards/:id/redeem          # Redeem reward (deduct points)
GET    /api/v1/users/:userId/rewards/available  # Get available rewards
GET    /api/v1/users/:userId/rewards/stats      # Get reward statistics
```

## Database Schema Updates

### Task Model
```javascript
{
  name: String,           // Task name
  description: String,    // Task description
  completed: Boolean,     // Completion status
  priority: String,       // 'low', 'medium', 'high'
  dueDate: Date,         // Optional due date
  category: String,       // Task category
  points: Number,         // Points awarded on completion
  completedAt: Date,      // When task was completed
  user: ObjectId,         // Reference to user
  habit: ObjectId,        // Optional reference to habit
  createdAt: Date         // Creation timestamp
}
```

### Reward Model
```javascript
{
  name: String,           // Reward name
  description: String,    // Reward description
  points: Number,         // Points required to redeem
  category: String,       // Reward category
  type: String,          // 'virtual', 'physical', 'experience'
  isRedeemed: Boolean,   // Redemption status
  redeemedAt: Date,      // When reward was redeemed
  isAvailable: Boolean,   // Availability status
  user: ObjectId,        // Reference to user
  createdAt: Date        // Creation timestamp
}
```

### User Model (Enhanced)
```javascript
{
  username: String,           // Username
  email: String,             // Email
  password: String,          // Hashed password
  points: Number,            // Current point balance
  totalTasksCompleted: Number, // Total tasks completed
  totalRewardsRedeemed: Number, // Total rewards redeemed
  createdAt: Date            // Creation timestamp
}
```

## Frontend Components

### Task Components
- `TaskForm` - Create/edit task form with validation
- `TaskList` - Display tasks with completion, editing, and deletion
- `TaskStats` - Statistics dashboard for task analytics

### Reward Components
- `RewardForm` - Create/edit reward form
- `RewardList` - Display rewards with redemption capabilities
- `RewardStats` - Statistics dashboard for reward analytics

### Navigation
- `Navigation` - Main navigation with point display
- Enhanced dashboard with quick actions to tasks and rewards

## Installation & Setup

### Backend Setup
```bash
cd backend
npm install
# Configure your MongoDB connection in config/config.env
npm start
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

## Key Features in Detail

### 🎯 Task Priority System
- **High Priority** (🔥): Important urgent tasks
- **Medium Priority** (⚡): Standard tasks
- **Low Priority** (📝): Nice-to-have tasks

### 🏆 Point System
- Tasks award points based on difficulty/importance
- Points are immediately awarded upon task completion
- Points can be spent on rewards
- Point balance is displayed throughout the app

### 🎁 Reward Types
- **Virtual** (💻): Digital rewards like streaming time, game time
- **Physical** (🎁): Real-world items like coffee, treats
- **Experience** (🎭): Activities like spa days, outings

### 📊 Analytics & Statistics
- Task completion rates
- Point earning/spending patterns
- Priority distribution
- Reward redemption history

## Mock API for Development
A comprehensive mock API is included at `/lib/mock-api.ts` for frontend development and testing without requiring a running backend.

## Future Enhancements
- Habit linking with tasks
- Recurring tasks
- Reward scheduling
- Social features and leaderboards
- Integration with external reward systems
- Mobile application
- Push notifications for task reminders

## Technology Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS with dark/light theme support

This comprehensive task and reward system transforms habit building into an engaging, gamified experience that motivates users to achieve their goals through a clear reward structure.

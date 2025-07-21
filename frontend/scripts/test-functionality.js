#!/usr/bin/env node

// Development test script for HabitVest Tasks and Rewards functionality
import { mockAPI } from '../lib/mock-api.js';

console.log('🎯 Testing HabitVest Tasks and Rewards System');
console.log('=' .repeat(50));

async function testTaskFunctionality() {
  console.log('\n📝 Testing Task Functionality:');
  
  try {
    // Test getting tasks
    const tasks = await mockAPI.getTasks();
    console.log(`✅ Retrieved ${tasks.count} tasks`);
    
    // Test creating a task
    const newTask = await mockAPI.createTask({
      name: 'Test Task',
      description: 'A test task for development',
      priority: 'high',
      category: 'Development',
      points: 25
    });
    console.log('✅ Created new task:', newTask.data.name);
    
    // Test completing a task
    const completed = await mockAPI.completeTask(newTask.data._id);
    console.log('✅ Completed task:', completed.message);
    
    // Test task stats
    const stats = await mockAPI.getTaskStats();
    console.log('✅ Task stats:', {
      total: stats.data.totalTasks,
      completed: stats.data.completedTasks,
      points: stats.data.totalPoints
    });
    
  } catch (error) {
    console.error('❌ Task test failed:', error.message);
  }
}

async function testRewardFunctionality() {
  console.log('\n🎁 Testing Reward Functionality:');
  
  try {
    // Test getting rewards
    const rewards = await mockAPI.getRewards();
    console.log(`✅ Retrieved ${rewards.count} rewards`);
    
    // Test creating a reward
    const newReward = await mockAPI.createReward({
      name: 'Test Reward',
      description: 'A test reward for development',
      points: 100,
      type: 'virtual',
      category: 'Development'
    });
    console.log('✅ Created new reward:', newReward.data.name);
    
    // Test available rewards
    const available = await mockAPI.getAvailableRewards();
    console.log(`✅ Found ${available.count} available rewards`);
    console.log(`   User has ${available.userPoints} points`);
    
    // Test reward stats
    const stats = await mockAPI.getRewardStats();
    console.log('✅ Reward stats:', {
      total: stats.data.totalRewards,
      redeemed: stats.data.redeemedRewards,
      available: stats.data.availableRewards
    });
    
  } catch (error) {
    console.error('❌ Reward test failed:', error.message);
  }
}

async function testIntegration() {
  console.log('\n🔗 Testing Integration:');
  
  try {
    // Test user data
    const user = await mockAPI.getUser();
    console.log('✅ User data:', {
      username: user.data.username,
      points: user.data.points,
      tasksCompleted: user.data.totalTasksCompleted,
      rewardsRedeemed: user.data.totalRewardsRedeemed
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Ready to start development server with: pnpm dev');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testTaskFunctionality();
  await testRewardFunctionality();
  await testIntegration();
}

runTests().catch(console.error);

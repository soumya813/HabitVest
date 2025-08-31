'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Ca          <p className="text-muted-foreground">
            Redeem rewards using points. Current Points: {userPoints}
          </p>escription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, Star, Trophy, Target, Check } from 'lucide-react';
import { RewardForm } from '../../components/reward-form';
import { RewardList } from '../../components/reward-list';
import { RewardStats } from '../../components/reward-stats';
import { mockAPI, type Reward } from '@/lib/mock-api';

interface RewardStatsData {
  totalRewards: number;
  redeemedRewards: number;
  availableRewards: number;
  totalPointsSpent: number;
  virtualRewards: number;
  physicalRewards: number;
  experienceRewards: number;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<RewardStatsData | null>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'redeemed'>('available');
  const [typeFilter, setTypeFilter] = useState<'all' | 'virtual' | 'physical' | 'experience'>('all');
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  // Mock user ID - in real app, get from auth context
  const userId = '676789ab123456789abcdef0';

  useEffect(() => {
    fetchRewards();
    fetchRewardStats();
  }, [filter, typeFilter]);

  const fetchRewards = async () => {
    try {
      let data;
      
      if (filter === 'available') {
        data = await mockAPI.getAvailableRewards();
      } else {
        const params: any = {};
        
        if (filter === 'redeemed') {
          params.isRedeemed = 'true';
        }
        
        if (typeFilter !== 'all') {
          params.type = typeFilter;
        }

        data = await mockAPI.getRewards(params);
      }

      setRewards(data.data);
      setUserPoints(data.userPoints ?? 0);
      if (data.data.length > 0 && data.data[0].user.points !== undefined) {
        setUserPoints(data.data[0].user.points);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardStats = async () => {
    try {
      const data = await mockAPI.getRewardStats();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching reward stats:', error);
    }
  };

  const handleRewardCreate = async (rewardData: Partial<Reward>) => {
    try {
      await mockAPI.createReward(rewardData);
      setShowRewardForm(false);
      fetchRewards();
      fetchRewardStats();
    } catch (error) {
      console.error('Error creating reward:', error);
    }
  };

  const handleRewardRedeem = async (rewardId: string) => {
    try {
      const data = await mockAPI.redeemReward(rewardId);
      fetchRewards();
      fetchRewardStats();
      // Show success message
      alert(data.message);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleRewardUpdate = async (rewardId: string, updateData: Partial<Reward>) => {
    try {
      // Mock API doesn't have update method, so we'll just refresh for now
      fetchRewards();
      fetchRewardStats();
    } catch (error) {
      console.error('Error updating reward:', error);
    }
  };

  const handleRewardDelete = async (rewardId: string) => {
    try {
      await mockAPI.deleteReward(rewardId);
      fetchRewards();
      fetchRewardStats();
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'available' && (reward.isRedeemed || !reward.isAvailable)) return false;
    if (filter === 'redeemed' && !reward.isRedeemed) return false;
    if (typeFilter !== 'all' && reward.type !== typeFilter) return false;
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
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">
            Redeem rewards using XP  Current XP: {typeof userXp === 'number' ? userXp : userPoints}
          </p>
        </div>
        <Button onClick={() => setShowRewardForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {/* Stats */}
      {stats && <RewardStats stats={stats} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('available')}
          >
            <Gift className="w-4 h-4 mr-1" />
            Available
          </Button>
          <Button
            variant={filter === 'redeemed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('redeemed')}
          >
            <Check className="w-4 h-4 mr-1" />
            Redeemed
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Rewards
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All Types
          </Button>
          <Button
            variant={typeFilter === 'virtual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('virtual')}
          >
            Virtual
          </Button>
          <Button
            variant={typeFilter === 'physical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('physical')}
          >
            Physical
          </Button>
          <Button
            variant={typeFilter === 'experience' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('experience')}
          >
            Experience
          </Button>
        </div>
      </div>

      {/* Reward List */}
      <RewardList
        rewards={filteredRewards}
        userPoints={userPoints}
        userXp={userXp}
        onRewardRedeem={handleRewardRedeem}
        onRewardUpdate={handleRewardUpdate}
        onRewardDelete={handleRewardDelete}
      />

      {/* Reward Form Modal */}
      {showRewardForm && (
        <RewardForm
          onSubmit={handleRewardCreate}
          onCancel={() => setShowRewardForm(false)}
        />
      )}
    </div>
  );
}

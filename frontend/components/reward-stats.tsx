'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Check, Star, TrendingUp, Package, User, Gamepad2 } from 'lucide-react';

interface RewardStats {
  totalRewards: number;
  redeemedRewards: number;
  availableRewards: number;
  totalPointsSpent: number;
  virtualRewards: number;
  physicalRewards: number;
  experienceRewards: number;
}

interface RewardStatsProps {
  stats: RewardStats;
}

export function RewardStats({ stats }: RewardStatsProps) {
  const redemptionRate = stats.totalRewards > 0 ? ((stats.redeemedRewards / stats.totalRewards) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
              <p className="text-2xl font-bold">{stats.totalRewards}</p>
            </div>
            <Gift className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Redeemed</p>
              <p className="text-2xl font-bold text-green-600">{stats.redeemedRewards}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-orange-600">{stats.availableRewards}</p>
            </div>
            <Star className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Points Spent</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPointsSpent}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Redemption Rate</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-600">{redemptionRate}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${redemptionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Reward Types</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Virtual</span>
              </div>
              <span className="font-semibold">{stats.virtualRewards}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-green-500" />
                <span className="text-sm">Physical</span>
              </div>
              <span className="font-semibold">{stats.physicalRewards}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Experience</span>
              </div>
              <span className="font-semibold">{stats.experienceRewards}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

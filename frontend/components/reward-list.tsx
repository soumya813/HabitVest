'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Star, Edit, Trash2, Clock, Check, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Reward } from '@/lib/mock-api';

interface RewardListProps {
  rewards: Reward[];
  userPoints: number;
  onRewardRedeem: (rewardId: string) => void;
  onRewardUpdate: (rewardId: string, data: Partial<Reward>) => void;
  onRewardDelete: (rewardId: string) => void;
}

export function RewardList({ rewards, userPoints, onRewardRedeem, onRewardUpdate, onRewardDelete }: RewardListProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return '💻';
      case 'physical':
        return '🎁';
      case 'experience':
        return '🎭';
      default:
        return '🎁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'virtual':
        return 'bg-blue-100 text-blue-800';
      case 'physical':
        return 'bg-green-100 text-green-800';
      case 'experience':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
          <p className="text-muted-foreground text-center">
            Create your first reward to have something to work towards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => {
        const canAfford = userPoints >= reward.points;
        const pointsNeeded = Math.max(0, reward.points - userPoints);

        return (
          <Card 
            key={reward._id} 
            className={`transition-all duration-200 ${
              reward.isRedeemed 
                ? 'opacity-75 bg-gray-50' 
                : canAfford 
                ? 'hover:shadow-md border-green-200' 
                : 'border-orange-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{getTypeIcon(reward.type)}</div>
                  <div>
                    <CardTitle className={`text-lg ${reward.isRedeemed ? 'line-through text-muted-foreground' : ''}`}>
                      {reward.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(reward.type)}>
                        {reward.type}
                      </Badge>
                      <Badge variant="outline" className="text-yellow-600">
                        <Star className="w-3 h-3 mr-1" />
                        {reward.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {reward.isRedeemed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Redeemed
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {reward.description && (
                <p className={`text-sm mb-3 ${reward.isRedeemed ? 'text-muted-foreground' : 'text-gray-600'}`}>
                  {reward.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
                {reward.category && (
                  <Badge variant="outline" className="text-xs">
                    {reward.category}
                  </Badge>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatDistanceToNow(new Date(reward.createdAt), { addSuffix: true })}</span>
                </div>

                {reward.redeemedAt && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    <span>Redeemed {formatDistanceToNow(new Date(reward.redeemedAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>

              {/* Affordability indicator */}
              {!reward.isRedeemed && reward.isAvailable && (
                <div className="mb-4">
                  {canAfford ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      <span>You can afford this reward!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Need {pointsNeeded} more points</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle edit - you could implement a modal or inline editing
                      console.log('Edit reward:', reward._id);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this reward?')) {
                        onRewardDelete(reward._id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {!reward.isRedeemed && reward.isAvailable && (
                  <Button
                    onClick={() => onRewardRedeem(reward._id)}
                    disabled={!canAfford}
                    size="sm"
                    className={canAfford ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Redeem
                  </Button>
                )}

                {!reward.isAvailable && (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, CheckSquare, Gift, User, Leaf, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { mockAPI } from '@/lib/mock-api';

export function Navigation() {
  const pathname = usePathname();
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user points on component mount
  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      // Try backend first, fallback to mock API
      let response;
      try {
        response = await fetch('http://localhost:5001/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPoints(data.data.points || 0);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('Backend not available, using mock data');
      }

      // Fallback to mock API
      const mockData = await mockAPI.getUser();
      if (mockData.success) {
        setUserPoints(mockData.data.points || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/rewards', label: 'Rewards', icon: Gift },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="border-b bg-green-800 dark:bg-green-900 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-white" />
            <span className="font-bold text-xl text-white">HabitVest</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    pathname === item.href 
                      ? 'bg-white/20 text-white hover:bg-white/30' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex items-center space-x-1 bg-white/20 text-white border-white/20">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="font-medium">
              {isLoading ? '...' : userPoints.toLocaleString()} points
            </span>
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, CheckSquare, Gift, User, TrendingUp, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/rewards', label: 'Rewards', icon: Gift },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Mock user points - in real app, get from context/auth
  const userPoints = 150;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">HabitVest</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="font-medium">{userPoints} points</span>
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

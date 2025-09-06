'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, CheckSquare, Gift, User, Leaf, Star, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/settings', label: 'Settings', icon: Shield },
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
          {isLoading ? (
            <div className="h-8 w-24 bg-white/20 rounded-md animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              <Badge variant="secondary" className="hidden sm:flex items-center space-x-1 bg-white/20 text-white border-white/20">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="font-medium">
                  {((user as any).xp ?? (user as any).points)?.toLocaleString() || 0} XP
                </span>
              </Badge>
              <Button onClick={logout} variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

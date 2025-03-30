'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, BarChart2, Settings } from 'lucide-react';

const navItems = [
  {
    label: 'Practice',
    href: '/practice',
    icon: Mic,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart2,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full transform -translate-x-1/2" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  List,
  Settings,
  LogOut,
  CheckSquare,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from '@/lib/hooks/use-translation';
import LanguageSwitcher from '@/components/language-switcher';

export default function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigation = [
    { name: t('navigation.board'), href: '/app', icon: LayoutDashboard },
    { name: t('navigation.timeline'), href: '/app/timeline', icon: Calendar },
    { name: t('navigation.allTasks'), href: '/app/tasks', icon: List },
    {
      name: t('navigation.completed'),
      href: '/app/completed',
      icon: CheckCircle,
    },
    { name: t('navigation.settings'), href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900">Todu</h1>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute max-w-[200px] w-full bottom-0 left-0 right-0 p-2 space-y-2">
        <div className="px-2">
          <LanguageSwitcher />
        </div>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full justify-start text-slate-600 hover:text-slate-900 text-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('auth.signOut')}
        </Button>
      </div>
    </div>
  );
}

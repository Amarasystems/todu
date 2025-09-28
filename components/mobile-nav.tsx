'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Calendar,
  List,
  Settings,
  CheckCircle,
  Menu,
} from 'lucide-react';
import { useTranslation } from '@/lib/hooks/use-translation';
import LanguageSwitcher from '@/components/language-switcher';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">Todu</h1>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
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

              <div className="mt-6 px-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

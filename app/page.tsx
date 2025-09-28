'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/lib/hooks/use-translation';
import LanguageSwitcher from '@/components/language-switcher';

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>

        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-slate-900">
            {t('landing.title')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">{t('auth.signIn')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">{t('landing.getStarted')}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('landing.features.kanban.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.kanban.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('landing.features.timeline.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.timeline.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('landing.features.progress.title')}</CardTitle>
              <CardDescription>
                {t('landing.features.progress.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

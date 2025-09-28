'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/use-translation';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement profile update API
      console.log('Update profile:', { name });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('navigation.settings')}
        </h1>
        <p className="text-slate-600">{t('settings.description')}</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t('settings.profile')}</span>
            </CardTitle>
            <CardDescription>
              {t('settings.profileDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-sm text-slate-500">
                  {t('settings.emailCannotBeChanged')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings.enterYourName')}
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating
                  ? t('settings.updating')
                  : t('settings.updateProfile')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5" />
              <span>{t('settings.account')}</span>
            </CardTitle>
            <CardDescription>
              {t('settings.accountDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  {t('auth.signOut')}
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  {t('settings.signOutDescription')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.signOut')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

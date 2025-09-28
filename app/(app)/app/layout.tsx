import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import AppSidebar from '@/components/app-sidebar';
import MobileNav from '@/components/mobile-nav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}

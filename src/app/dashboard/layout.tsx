// src/app/dashboard/layout.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import DashboardNav from '@/components/layout/DashboardNav';

export const metadata = {
  title: 'Dashboard - Personal Blog',
  description: 'Manage your blog posts and content',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                My Blog
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/posts"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Posts
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  View Blog
                </Link>
              </div>
            </div>
            <DashboardNav user={session.user} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
'use client';

import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 管理后台顶部 */}
      <header className="border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold">CodeAI Hub Admin</div>
            <Link href="/">
              <Button variant="outline">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 管理后台导航 */}
      <div className="border-b">
        <div className="container mx-auto">
          <AdminNav />
        </div>
      </div>

      {/* 内容区域 */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
} 
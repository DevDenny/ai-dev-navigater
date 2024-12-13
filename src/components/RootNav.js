'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function RootNav() {
  const pathname = usePathname();
  
  // 如果是管理后台路径，不显示导航
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              CodeAI Hub
            </Link>
            <div className="space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/resources">
                <Button variant="ghost">Resources</Button>
              </Link>
              <Link href="/posts">
                <Button variant="ghost">Articles</Button>
              </Link>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
            <Button variant="ghost">Logout</Button>
          </div>
        </nav>
      </div>
    </header>
  );
} 
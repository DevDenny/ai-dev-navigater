'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="py-4">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button 
            variant={isActive('/admin') ? "default" : "ghost"}
          >
            Dashboard
          </Button>
        </Link>
        <Link href="/admin/articles">
          <Button 
            variant={isActive('/admin/articles') ? "default" : "ghost"}
          >
            Articles
          </Button>
        </Link>
        <Link href="/admin/categories">
          <Button 
            variant={isActive('/admin/categories') ? "default" : "ghost"}
          >
            Categories
          </Button>
        </Link>
        <Link href="/admin/resources">
          <Button 
            variant={isActive('/admin/resources') ? "default" : "ghost"}
          >
            Resources
          </Button>
        </Link>
      </div>
    </nav>
  );
} 
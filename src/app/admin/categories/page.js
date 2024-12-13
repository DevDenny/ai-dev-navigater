'use client';  // 添加这行标记为客户端组件

import CategoryManager from '@/components/CategoryManager';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-12">
      <CategoryManager />
    </div>
  );
} 
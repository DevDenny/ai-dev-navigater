'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import ArticleEditor from '@/components/ArticleEditor';

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (article) => {
    setIsLoading(true);

    try {
      const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const path = `data/md/${slug}.md`;

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: {
            ...article,
            path,
            slug,
            date: new Date().toISOString().split('T')[0]
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create article');
      }

      toast({
        title: "成功",
        description: "文章创建成功",
      });
      
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "错误",
        description: error.message || "创建文章失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emptyArticle = {
    title: '',
    description: '',
    content: '',
    category: '',
    categoryName: '',
    date: new Date().toISOString().split('T')[0]
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">创建文章</h1>
      <div className="flex-1">
        <ArticleEditor 
          article={emptyArticle}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
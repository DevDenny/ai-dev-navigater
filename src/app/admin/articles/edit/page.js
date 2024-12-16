'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleEditor from '@/components/ArticleEditor';
import { toast } from "@/components/ui/use-toast";

export default function EditArticlePage() {
  const [article, setArticle] = useState(null);
  const searchParams = useSearchParams();
  const path = searchParams.get('path');

  // 获取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles?path=${path}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        console.log('Fetched article data:', data); // 调试日志
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: "错误",
          description: "获取文章失败",
          variant: "destructive",
        });
      }
    };

    if (path) {
      fetchArticle();
    }
  }, [path]);

  const handleSubmit = async (updatedArticle) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: {
            ...updatedArticle,
            path
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update article');

      toast({
        title: "成功",
        description: "文章已更新",
      });
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "错误",
        description: "更新文章失败",
        variant: "destructive",
      });
    }
  };

  // 添加调试日志
  console.log('Current article state:', article);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
      {article && (
        <ArticleEditor 
          article={article} 
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
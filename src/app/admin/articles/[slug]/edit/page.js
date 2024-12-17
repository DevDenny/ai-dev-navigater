'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import ArticleEditor from '@/components/ArticleEditor';

export default function EditArticlePage({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.slug) {
        toast({
          title: "错误",
          description: "无效的文章标识",
          variant: "destructive",
        });
        router.push('/admin/articles');
        return;
      }

      try {
        setIsPageLoading(true);
        const response = await fetch(`/api/articles/${params.slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || `获取文章失败 (${response.status})`);
        }
        
        const data = await response.json();
        if (!data.title) {
          throw new Error('获取到的文章数据无效');
        }

        setArticle({
          ...data,
          title: data.title,
          content: data.content || '',
          description: data.description || '',
          category: data.category || '',
          categoryName: data.categoryName || '',
          date: data.date || new Date().toISOString().split('T')[0],
          slug: data.slug || params.slug
        });
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: "错误",
          description: error.message,
          variant: "destructive",
        });
        router.push('/admin/articles');
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug, router]);

  const handleSubmit = async (updatedArticle) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/articles/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          article: {
            ...updatedArticle,
            date: updatedArticle.date || new Date().toISOString().split('T')[0]
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update article');

      toast({
        title: "成功",
        description: "文章更新成功",
      });
      
      router.push('/admin/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "错误",
        description: "更新文章失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-lg">文章不存在</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <ArticleEditor 
        article={article} 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
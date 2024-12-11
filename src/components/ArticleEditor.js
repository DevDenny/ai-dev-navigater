'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

/**
 * 文章编辑器组件
 * 支持文章的加载、编辑和保存功能
 */
export default function ArticleEditor() {
  // 状态管理
  const [article, setArticle] = useState({ 
    title: '', 
    description: '', 
    content: '', 
    path: '' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const path = searchParams.get('path');

  // 组件加载时获取文章内容
  useEffect(() => {
    if (path) {
      fetchArticle(decodeURIComponent(path));
    } else {
      setError('No article path provided');
      setIsLoading(false);
    }
  }, [path]);

  /**
   * 从服务器获取文章内容
   * @param {string} articlePath - 文章路径
   */
  const fetchArticle = async (articlePath) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/articles?path=${encodeURIComponent(articlePath)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入字段变化
   * @param {Event} e - 输入事件对象
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

  /**
   * 保存文章到服务器
   */
  const handleSave = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      
      alert('Article saved successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please try again.');
    }
  };

  // 加载状态显示
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 错误状态显示
  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  // 渲染编辑表单
  return (
    <div className="space-y-4">
      <Input
        name="title"
        value={article.title}
        onChange={handleInputChange}
        placeholder="Article Title"
        className="text-xl font-bold"
      />
      
      <Input
        name="description"
        value={article.description}
        onChange={handleInputChange}
        placeholder="Article Description"
      />
      
      <Textarea
        name="content"
        value={article.content}
        onChange={handleInputChange}
        placeholder="Article Content (Markdown)"
        rows={20}
        className="font-mono"
      />
      
      <Button onClick={handleSave}>
        Save Article
      </Button>
    </div>
  );
}
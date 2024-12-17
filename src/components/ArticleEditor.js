'use client';

import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from './ImageUploader';

// 创建 DOMPurify 实例
const DOMPurify = createDOMPurify(window);

export default function ArticleEditor({ article: initialArticle, onSubmit, isLoading }) {
  const [article, setArticle] = useState(initialArticle);
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (value) => {
    const selectedCategory = categories.find(cat => cat.slug === value);
    setArticle(prev => ({
      ...prev,
      category: value,
      categoryName: selectedCategory?.name || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(article);
  };

  const handleImageUpload = (imageUrl) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageMarkdown = `![图片描述](${imageUrl})`;
    
    const newContent = 
      article.content.substring(0, start) + 
      imageMarkdown + 
      article.content.substring(end);

    setArticle(prev => ({
      ...prev,
      content: newContent
    }));
  };

  // 添加安全的 HTML 渲染函数
  const renderHTML = (content) => {
    try {
      const markedContent = marked(content || '');
      return DOMPurify.sanitize(markedContent);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">标题</label>
            <Input
              value={article.title}
              onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
              placeholder="文章标题"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <Select
              value={article.category}
              onValueChange={handleCategoryChange}
              disabled={isCategoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem 
                    key={category.slug} 
                    value={category.slug || 'uncategorized'}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <Textarea
            value={article.description}
            onChange={(e) => setArticle(prev => ({ ...prev, description: e.target.value }))}
            placeholder="文章简短描述"
            required
            className="resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 min-h-[500px] flex-1">
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2">内容</label>
            <div className="relative flex-1 border rounded">
              <textarea
                ref={editorRef}
                value={article.content}
                onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                className="absolute inset-0 w-full h-full p-4 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="支持 Markdown 格式"
                required
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-2">预览</label>
            <div 
              ref={previewRef}
              className="flex-1 overflow-auto p-4 border rounded bg-white prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(article.content || '')) }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-t">
          <div className="flex items-center gap-4">
            <ImageUploader onUploadSuccess={handleImageUpload} />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存文章'}
          </Button>
        </div>
      </form>
    </div>
  );
}
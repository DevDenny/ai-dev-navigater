'use client';

import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ImageUploader from './ImageUploader';

export default function ArticleEditor({ article: initialArticle, onSubmit }) {
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    slug: ''
  });

  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const [isEditorScrolling, setIsEditorScrolling] = useState(false);
  const [isPreviewScrolling, setIsPreviewScrolling] = useState(false);

  useEffect(() => {
    if (initialArticle) {
      setArticle({
        title: initialArticle.title || '',
        description: initialArticle.description || '',
        content: initialArticle.content || '',
        slug: initialArticle.slug || ''
      });
    }
  }, [initialArticle]);

  const handleEditorScroll = (e) => {
    if (!isPreviewScrolling && editorRef.current && previewRef.current) {
      setIsEditorScrolling(true);
      
      const editor = editorRef.current;
      const preview = previewRef.current;
      
      const editorScrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      
      if (editorScrollPercent >= 1) {
        preview.scrollTop = preview.scrollHeight - preview.clientHeight;
      } else {
        preview.scrollTop = editorScrollPercent * (preview.scrollHeight - preview.clientHeight);
      }
      
      setTimeout(() => setIsEditorScrolling(false), 50);
    }
  };

  const handlePreviewScroll = (e) => {
    if (!isEditorScrolling && editorRef.current && previewRef.current) {
      setIsPreviewScrolling(true);
      
      const editor = editorRef.current;
      const preview = previewRef.current;
      
      const previewScrollPercent = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      
      if (previewScrollPercent < 1) {
        editor.scrollTop = previewScrollPercent * (editor.scrollHeight - editor.clientHeight);
      } else {
        editor.scrollTop = editor.scrollHeight - editor.clientHeight;
      }
      
      setTimeout(() => setIsPreviewScrolling(false), 50);
    }
  };

  const markdownToHtml = (markdown) => {
    try {
      const html = marked(markdown || '');
      return DOMPurify.sanitize(html);
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return '';
    }
  };

  const handleImageUpload = (imageUrl) => {
    const imageMarkdown = `![图片](${imageUrl})`;
    setArticle(prev => ({
      ...prev,
      content: prev.content + '\n' + imageMarkdown
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(article);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={article.title}
            onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">描述</label>
          <input
            type="text"
            value={article.description}
            onChange={(e) => setArticle(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={article.slug}
            onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-250px)]">
        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium mb-2">内容</label>
          <div className="relative flex-1">
            <textarea
              ref={editorRef}
              value={article.content}
              onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
              onScroll={handleEditorScroll}
              className="absolute inset-0 w-full h-full p-4 border rounded font-mono resize-none"
              placeholder="支持 Markdown 格式"
            />
          </div>
          <div className="mt-2 flex items-center gap-4">
            <ImageUploader onUploadSuccess={handleImageUpload} />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              保存文章
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium mb-2">预览</label>
          <div 
            ref={previewRef}
            onScroll={handlePreviewScroll}
            className="flex-1 overflow-auto p-4 border rounded bg-white prose max-w-none"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
          />
        </div>
      </div>
    </div>
  );
}
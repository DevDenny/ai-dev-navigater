'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function ImageUploader({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: "错误",
        description: "只支持 JPG、PNG 和 GIF 格式的图片",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "错误",
        description: "图片大小不能超过 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 上传到 GitHub 仓库
      const response = await fetch('/api/github/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "成功",
          description: "图片上传成功",
        });
        // 返回 GitHub raw 链接
        onUploadSuccess(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "错误",
        description: "图片上传失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="image-upload"
        disabled={isUploading}
      />
      <label htmlFor="image-upload">
        <Button 
          variant="outline" 
          disabled={isUploading}
          asChild
        >
          <span>
            {isUploading ? '上传中...' : '上传图片'}
          </span>
        </Button>
      </label>
    </div>
  );
} 
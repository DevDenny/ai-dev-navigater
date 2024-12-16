'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ImagePreview } from './ImagePreview';

export default function ImageManager() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取图片列表
  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      toast({
        title: "错误",
        description: "加载图片列表失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除选中的图片
  const handleDelete = async () => {
    if (!selectedImages.length) return;
    
    if (!confirm('确定要删除选中的图片吗？')) return;

    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: selectedImages }),
      });

      if (!response.ok) throw new Error('Failed to delete images');

      toast({
        title: "成功",
        description: "已删除选中的图片",
      });

      // 刷新图片列表
      fetchImages();
      setSelectedImages([]);
    } catch (error) {
      toast({
        title: "错误",
        description: "删除图片失败",
        variant: "destructive",
      });
    }
  };

  // 复制图片链接
  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "成功",
      description: "图片链接已复制到剪贴板",
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">图片管理</h2>
        <div className="space-x-2">
          <Button
            variant="destructive"
            disabled={!selectedImages.length}
            onClick={handleDelete}
          >
            删除选中 ({selectedImages.length})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.url}
              className={`relative border rounded p-2 ${
                selectedImages.includes(image.url) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedImages(prev =>
                  prev.includes(image.url)
                    ? prev.filter(url => url !== image.url)
                    : [...prev, image.url]
                );
              }}
            >
              <ImagePreview src={image.url} />
              <div className="mt-2 flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyImageUrl(image.url);
                  }}
                >
                  复制链接
                </Button>
                <span className="text-sm text-gray-500">
                  {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
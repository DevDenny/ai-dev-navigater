'use client';  // 添加这行标记为客户端组件

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError('Failed to load categories');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新分类
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      setError('Name and slug are required');
      return;
    }

    // 验证 slug 格式
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newCategory.slug)) {
      setError('Invalid slug format');
      return;
    }

    // 检查 slug 是否已存在
    if (categories.some(cat => cat.slug === newCategory.slug)) {
      setError('Slug already exists');
      return;
    }

    const updatedCategories = [...categories, newCategory];
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories }),
      });

      if (!response.ok) throw new Error('Failed to add category');

      setCategories(updatedCategories);
      setNewCategory({ name: '', slug: '' });
      setError(null);
    } catch (error) {
      setError('Failed to add category');
      console.error(error);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (slugToDelete) => {
    const updatedCategories = categories.filter(cat => cat.slug !== slugToDelete);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories }),
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(updatedCategories);
    } catch (error) {
      setError('Failed to delete category');
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Categories Management</h2>
      
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="flex gap-4">
        <Input
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <Input
          placeholder="Category Slug"
          value={newCategory.slug}
          onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
        />
        <Button onClick={handleAddCategory}>Add Category</Button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.slug} className="flex items-center justify-between p-2 bg-background-secondary rounded">
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="ml-2 text-sm text-text-light">({category.slug})</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteCategory(category.slug)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 
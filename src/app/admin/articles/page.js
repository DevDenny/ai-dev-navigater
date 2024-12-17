'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { toast } from "@/components/ui/use-toast";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/articles');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch articles');
      }
      const data = await response.json();
      console.log('Fetched articles:', data);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const response = await fetch('/api/articles/sync', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to sync articles');
      await fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to sync articles');
    }
  };

  const handleEdit = (article) => {
    console.log('Editing article:', article);
    const slug = article.slug || generateSlug(article.title);
    console.log('Generated slug:', slug);
    router.push(`/admin/articles/${slug}/edit`);
  };

  const handleDelete = async (article) => {
    if (!article.slug) {
      toast({
        title: "错误",
        description: "文章缺少必要的标识信息",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`确定要删除文章"${article.title}"吗？`)) return;
    
    try {
      console.log('Deleting article:', article);
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: article.slug })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Delete response:', data);
        throw new Error(
          data.error || 'Failed to delete article' + 
          (data.debug ? `: ${JSON.stringify(data.debug)}` : '')
        );
      }
      
      toast({
        title: "成功",
        description: "文章删除成功",
      });
      
      await fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "错误",
        description: error.message || "删除文章失败",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Article Management</h1>
      <div className="mb-4 flex justify-between">
        <Link href="/admin">
          <Button>Back to Admin Dashboard</Button>
        </Link>
        <div>
          <Button onClick={handleSync} className="mr-2">Sync Articles</Button>
          <Link href="/admin/articles/create">
            <Button>Create New Article</Button>
          </Link>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.path}>
              <TableCell>{article.title}</TableCell>
              <TableCell>{article.description}</TableCell>
              <TableCell>
                {article.categoryName && (
                  <Badge variant="secondary">
                    {article.categoryName}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(article.date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(article.lastModified).toLocaleString()}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEdit(article)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDelete(article)}
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      setError('Failed to load resources');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Resources Management</h1>
      <div className="space-y-4">
        {/* 资源列表 */}
        {resources.map((resource, index) => (
          <div key={index} className="p-4 bg-background-secondary rounded-lg">
            <h3 className="font-medium">{resource.title}</h3>
            <p className="text-sm text-text-light">{resource.description}</p>
            <div className="mt-2">
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-light"
              >
                {resource.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
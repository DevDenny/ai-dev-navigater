'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';

export default function CreateResource() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting resource data:', formData);
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) throw new Error('Failed to create resource');

      toast({
        title: "Success",
        description: "Resource created successfully",
      });

      router.push('/admin/resources');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to create resource",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Resource</h1>
        <Link href="/admin/resources">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Title</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="block mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        
        <div>
          <label className="block mb-2">URL</label>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            required
          />
        </div>

        <Button type="submit">Create Resource</Button>
      </form>
    </div>
  );
} 
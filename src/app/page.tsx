// pages/index.js
import fs from 'fs'
import path from 'path'
import { getSortedPostsData } from '@/lib/posts'
import ResourceList from '@/components/ResourceList'
import ArticleList from '@/components/ArticleList'
import { Metadata } from 'next'
import { getCategories, Category } from '@/lib/categories'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GitBase - Open Source Dynamic Website CMS Without Database',
  description: 'A Next.js site with Tailwind & Shadcn/UI, using GitHub API for content management. No database needed for dynamic updates.',
}

interface Post {
  category: string;
  // ... other post properties
}

export default function Home() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json')
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'))
  const allPostsData = getSortedPostsData()
  const categories = getCategories()

  // 按分类对文章进行分组
  const postsByCategory = categories.reduce((acc: Record<string, any>, category: Category) => {
    const categoryPosts = allPostsData.filter((post: Post) => post.category === category.slug)
    if (categoryPosts.length > 0) {
      acc[category.slug] = {
        name: category.name,
        posts: categoryPosts.slice(0, 6)
      }
    }
    return acc
  }, {})

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-text-dark text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            CodeAI Hub
          </h1>
          <h2 className="text-primary text-2xl tracking-tighter sm:text-3xl md:text-3xl lg:text-3xl">
            探索 AI 编程的无限可能
          </h2>
          <p className="mx-auto max-w-[700px] text-text-default md:text-xl">
            CodeAI Hub 是一个专注于 AI 编程领域的知识分享平台，汇集了AI coding前沿技术的精选内容。
            我们致力于为 AI 开发者提供高质量的技术文章、学习资源，帮助开发者掌握 AI 技术，构建智能化应用。
            无论您是 AI 领域的初学者还是专业开发者，都能在这里找到有价值的知识和见解。
          </p>
        </section>

        <ResourceList resources={resources} />

        {/* 分类文章展示 */}
        {Object.entries(postsByCategory).map(([slug, category]) => (
          <section key={slug}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <a
                href={`/articles/category/${slug}`}
                className="text-primary hover:text-primary/90"
              >
                更多...
              </a>
            </div>
            <ArticleList articles={category.posts} />
          </section>
        ))}
      </div>
    </div>
  )
}
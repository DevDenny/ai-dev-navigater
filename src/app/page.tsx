// pages/index.js
import fs from 'fs'
import path from 'path'
import { getSortedPostsData } from '@/lib/posts'
import ResourceList from '@/components/ResourceList'
import ArticleList from '@/components/ArticleList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GitBase - Open Source Dynamic Website CMS Without Database',
  description: 'A Next.js site with Tailwind & Shadcn/UI, using GitHub API for content management. No database needed for dynamic updates.',
}

export default function Home() {
  const resourcesPath = path.join(process.cwd(), 'data', 'json', 'resources.json')
  const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'))
  const allPostsData = getSortedPostsData().slice(0, 6)

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
        <ArticleList articles={allPostsData} />
      </div>
    </div>
  )
}
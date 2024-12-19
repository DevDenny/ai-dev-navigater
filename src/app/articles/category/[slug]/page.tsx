import { getCategories } from '@/lib/categories'
import { getSortedPostsData } from '@/lib/posts'
import ArticleList from '@/components/ArticleList'

interface Category {
  slug: string;
  name: string;
}

interface Post {
  category: string;
  // ... other post properties
}

export async function generateStaticParams() {
  const categories = getCategories()
  return categories.map((category: Category) => ({
    slug: category.slug,
  }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categories = getCategories()
  const category = categories.find((cat: Category) => cat.slug === params.slug)
  const allPosts = getSortedPostsData()
  const categoryPosts = allPosts.filter((post: Post) => post.category === params.slug)

  if (!category) {
    return <div className="container mx-auto py-12">分类不存在</div>
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
        <p className="text-text-default">
          当前分类下共有 {categoryPosts.length} 篇文章
        </p>
      </div>
      <ArticleList articles={categoryPosts} />
    </div>
  )
} 
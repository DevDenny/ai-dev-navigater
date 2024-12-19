// components/ArticleList.js
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function ArticleList({ articles }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Link
          key={article.slug || article.id}
          href={`/posts/${article.slug || article.id}`}
        >
          <Card className="bg-background-secondary hover:bg-primary-lighter transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle className="text-primary leading-7 line-clamp-2">
                {article.title}
              </CardTitle>
              <CardDescription className="text-text-default line-clamp-3">
                {article.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
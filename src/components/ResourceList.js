// components/ResourceList.js
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function ResourceList({ resources }) {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-text-dark text-2xl font-bold">精选资源</h2>
        <Link href="/resources" className="text-primary hover:text-primary/80">
          更多...
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="bg-background-secondary hover:bg-primary-lighter transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="space-y-3">
                <CardTitle className="text-primary leading-7 line-clamp-2">
                  {resource.name}
                </CardTitle>
                <CardDescription className="text-text-default line-clamp-3">
                  {resource.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </section>
  )
}
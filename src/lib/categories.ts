import fs from 'fs'
import path from 'path'

export interface Category {
  slug: string;
  name: string;
}

export function getCategories(): Category[] {
  const categoriesPath = path.join(process.cwd(), 'data', 'json', 'categories.json')
  const fileContents = fs.readFileSync(categoriesPath, 'utf8')
  return JSON.parse(fileContents)
} 
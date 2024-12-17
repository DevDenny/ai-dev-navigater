import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateSlug } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    console.log('Requested slug:', params.slug);
    
    const articlesPath = path.join(process.cwd(), 'data/json/articles.json');
    if (!fs.existsSync(articlesPath)) {
      console.error('articles.json not found');
      return NextResponse.json({ error: 'Articles index not found' }, { status: 404 });
    }

    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    console.log('Available articles:', articles.map(a => ({
      title: a.title,
      slug: a.slug || generateSlug(a.title)
    })));

    // 尝试多种方式查找文章
    let article = articles.find(a => {
      // 如果文章的 slug 为空但有标题，使用标题生成 slug
      const articleSlug = a.slug || (a.title ? generateSlug(a.title) : null);
      if (!articleSlug) {
        console.warn('Article has no slug or title:', a);
        return false;
      }
      console.log('Comparing:', articleSlug, 'with:', params.slug);
      return articleSlug === params.slug;
    });

    if (!article) {
      console.error('Article not found for slug:', params.slug);
      return NextResponse.json({ 
        error: 'Article not found',
        requestedSlug: params.slug,
        availableSlugs: articles.map(a => a.slug || generateSlug(a.title))
      }, { status: 404 });
    }

    // 确保文章有 slug
    article.slug = article.slug || generateSlug(article.title);

    const mdPath = path.join(process.cwd(), article.path);
    console.log('Reading MD file:', mdPath);

    if (!fs.existsSync(mdPath)) {
      console.error('MD file not found:', mdPath);
      return NextResponse.json({ error: 'Article content not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(mdPath, 'utf8');
    const { data, content } = matter(fileContents);

    const result = {
      ...article,
      ...data,
      content,
      slug: article.slug
    };

    console.log('Returning article:', {
      title: result.title,
      slug: result.slug,
      path: result.path
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch article',
      details: error.message 
    }, { status: 500 });
  }
} 
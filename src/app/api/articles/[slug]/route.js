import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateSlug } from '@/lib/utils';
import { Octokit } from '@octokit/rest';

// 初始化 GitHub API 客户端
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

// 添加分支控制相关代码
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

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

// 添加 PUT 方法处理文章更新
export async function PUT(request, { params }) {
  try {
    const { article } = await request.json();
    const branch = getCurrentBranch();  // 获取当前分支
    
    // 获取文件的当前内容和 SHA
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: article.path,
      ref: branch  // 添加分支参数
    });

    // 更新文章内容
    const content = matter.stringify(article.content, {
      title: article.title,
      description: article.description,
      date: article.date,
      category: article.category,
      categoryName: article.categoryName
    });

    // 更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: article.path,
      message: `Update article: ${article.title}`,
      content: Buffer.from(content).toString('base64'),
      sha: file.sha,
      branch  // 添加分支参数
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
} 
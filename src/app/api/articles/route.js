import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateSlug } from '@/lib/utils';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// 从环境变量获取配置
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_DEV_BRANCH || 'dev'; // 默认使用 dev 分支

// 添加分支控制相关代码
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

export async function GET() {
  try {
    const branch = process.env.GITHUB_DEV_BRANCH || 'dev';  // 使用环境变量中的分支
    console.log('Fetching articles from branch:', branch);

    const { data: indexFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'data/json/articles.json',
      ref: branch  // 指定分支
    });

    const articles = JSON.parse(Buffer.from(indexFile.content, 'base64').toString());
    console.log('Found articles:', articles.length);
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST 方法 - 创建或更新文章
export async function POST(request) {
  const branch = getCurrentBranch();
  try {
    const { article } = await request.json();
    
    // 确保生成 slug
    const slug = article.slug || generateSlug(article.title);
    console.log('Generated slug:', slug);
    
    // 构建文章内容，确保包含 slug
    const fileContent = matter.stringify(article.content, {
      title: article.title,
      description: article.description,
      date: article.date || new Date().toISOString().split('T')[0],
      category: article.category || '',
      categoryName: article.categoryName || '',
      slug: slug  // 确保在 frontmatter 中包含 slug
    });

    // 构建完整的文章对象
    const articleData = {
      ...article,
      slug: slug,
      path: article.path || `data/md/${slug}.md`,
      lastModified: new Date().toISOString()
    };

    // 保存文章到 GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch: branch,
      path: articleData.path,
      message: `Create/Update article: ${article.title}`,
      content: Buffer.from(fileContent).toString('base64'),
    });

    // 更新文章索引
    await updateArticleIndex(articleData, branch);

    return NextResponse.json({ success: true, slug: slug });
  } catch (error) {
    console.error('Error creating/updating article:', error);
    return NextResponse.json(
      { error: 'Failed to create/update article', details: error.message },
      { status: 500 }
    );
  }
}

// 更新文章索引的辅助函数
async function updateArticleIndex(article, branch) {
  try {
    console.log('Updating article index with:', article);
    let articles = [];
    let indexFile;
    
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: 'data/json/articles.json',
        ref: branch
      });
      indexFile = response.data;
      const content = Buffer.from(indexFile.content, 'base64').toString();
      articles = JSON.parse(content);
    } catch (error) {
      console.log('No existing articles.json found, creating new one');
      if (error.status !== 404) throw error;
    }

    // 确保每篇文章都有必要的字段
    const articleToSave = {
      title: article.title,
      description: article.description,
      date: article.date,
      category: article.category,
      categoryName: article.categoryName,
      path: article.path,
      slug: article.slug,
      lastModified: article.lastModified
    };

    // 更新或添加文章
    const existingIndex = articles.findIndex(a => a.slug === article.slug);
    if (existingIndex > -1) {
      articles[existingIndex] = articleToSave;
    } else {
      articles.unshift(articleToSave);
    }

    // 保存更新后的索引
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch: branch,
      path: 'data/json/articles.json',
      message: `Update articles index for: ${article.title}`,
      content: Buffer.from(JSON.stringify(articles, null, 2)).toString('base64'),
      ...(indexFile && { sha: indexFile.sha })
    });
  } catch (error) {
    console.error('Error in updateArticleIndex:', error);
    throw error;
  }
}

export async function DELETE(request) {
  try {
    const { slug } = await request.json();
    const branch = process.env.GITHUB_DEV_BRANCH || 'dev';
    
    console.log('Starting delete operation with:', { slug, branch, owner, repo });
    
    try {
      // 1. 获取文章索引
      console.log('Fetching articles.json from branch:', branch);
      const { data: indexFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'data/json/articles.json',
        ref: branch
      });
      
      console.log('Parsing articles.json...');
      const articles = JSON.parse(Buffer.from(indexFile.content, 'base64').toString());
      console.log('Available articles:', articles.map(a => ({ slug: a.slug, title: a.title })));
      
      const articleToDelete = articles.find(a => a.slug === slug);
      console.log('Article to delete:', articleToDelete);
      
      if (!articleToDelete) {
        console.log('Article not found with slug:', slug);
        return NextResponse.json({ 
          error: 'Article not found',
          debug: { 
            availableSlugs: articles.map(a => a.slug),
            searchedSlug: slug,
            branch
          }
        }, { status: 404 });
      }
      
      // 2. 删除 MD 文件
      console.log('Fetching MD file:', articleToDelete.path);
      const { data: mdFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: articleToDelete.path,
        ref: branch
      });
      
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: articleToDelete.path,
        message: `Delete article: ${articleToDelete.title}`,
        sha: mdFile.sha,
        branch
      });
      
      // 3. 更新文章索引
      const updatedArticles = articles.filter(a => a.slug !== slug);
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch,
        path: 'data/json/articles.json',
        message: `Remove article from index: ${articleToDelete.title}`,
        content: Buffer.from(JSON.stringify(updatedArticles, null, 2)).toString('base64'),
        sha: indexFile.sha
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('GitHub API Error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to delete article',
        details: error.response?.data || {}
      }, { status: error.status || 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
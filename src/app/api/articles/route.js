import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

// 根据环境返回对应的分支
function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

// GET 方法 - 获取文章列表或单篇文章
export async function GET(request) {
  const branch = getCurrentBranch();
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (path) {
      // 获取单篇文章
      try {
        const { data: file } = await octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });

        const content = Buffer.from(file.content, 'base64').toString();
        const { data: frontMatter, content: markdownContent } = matter(content);

        return NextResponse.json({
          ...frontMatter,
          content: markdownContent,
          path
        });
      } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
          { message: 'Article not found' },
          { status: 404 }
        );
      }
    } else {
      // 获取文章列表
      try {
        const { data: indexFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: 'data/json/articles.json',
          ref: branch
        });

        const content = Buffer.from(indexFile.content, 'base64').toString();
        const articles = JSON.parse(content);

        return NextResponse.json(articles);
      } catch (error) {
        console.error('Error fetching articles list:', error);
        // 如果文件不存在，返回空数组
        if (error.status === 404) {
          return NextResponse.json([]);
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in GET articles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST 方法 - 创建或更新文章
export async function POST(request) {
  const branch = getCurrentBranch();
  try {
    const { article } = await request.json();
    
    if (!article.path) {
      return NextResponse.json(
        { message: 'Article path is required' }, 
        { status: 400 }
      );
    }

    // 构建文章内容
    const fileContent = matter.stringify(article.content, {
      title: article.title,
      description: article.description,
      date: new Date().toISOString().split('T')[0],
      category: article.category || '',
      categoryName: article.categoryName || ''
    });

    // 检查文件是否已存在
    let currentSha;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: article.path,
        ref: branch
      });
      currentSha = currentFile.sha;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    // 创建或更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: article.path,
      message: currentSha 
        ? `Update article: ${article.title}`
        : `Create article: ${article.title}`,
      content: Buffer.from(fileContent).toString('base64'),
      ...(currentSha && { sha: currentSha }),
      branch
    });

    // 更新文章索引
    await updateArticleIndex(article, branch);

    return NextResponse.json({ 
      success: true,
      message: currentSha ? '文章更新成功' : '文章创建成功'
    });

  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Failed to save article',
        error: error.toString()
      }, 
      { status: 500 }
    );
  }
}

// 更新文章索引的辅助函数
async function updateArticleIndex(article, branch) {
  try {
    // 获取现有的文章索引
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
      if (error.status !== 404) throw error;
    }

    // 更新或添加文章信息
    const articleIndex = articles.findIndex(a => a.path === article.path);
    const articleInfo = {
      title: article.title,
      description: article.description,
      date: new Date().toISOString().split('T')[0],
      category: article.category || '',
      categoryName: article.categoryName || '',
      path: article.path,
      lastModified: new Date().toISOString()
    };

    if (articleIndex > -1) {
      articles[articleIndex] = articleInfo;
    } else {
      articles.unshift(articleInfo);
    }

    // 保存更新后的索引
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'data/json/articles.json',
      message: `Update articles index for: ${article.title}`,
      content: Buffer.from(JSON.stringify(articles, null, 2)).toString('base64'),
      branch,
      ...(indexFile && { sha: indexFile.sha })
    });
  } catch (error) {
    console.error('Error updating article index:', error);
    throw error;
  }
}
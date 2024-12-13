import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const articlesJsonPath = 'data/json/articles.json';
const mdFolderPath = 'data/md';

/**
 * GET 请求处理函数
 * 支持两种模式：
 * 1. 获取单篇文章（带 path 参数）
 * 2. 获取所有文章列表（不带参数或带 sync 参数）
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sync = searchParams.get('sync');
  const path = searchParams.get('path');

  try {
    if (path) {
      // 获取单篇文章的逻辑
      try {
        // 从 GitHub 获取文件内容
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: decodeURIComponent(path),
        });

        // 解码文件内容并解析 frontmatter
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        const { data: frontMatter, content: articleContent } = matter(content);

        return NextResponse.json({
          ...frontMatter,
          content: articleContent,
          path: data.path,
        });
      } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
      }
    }

    // 如果请求包含 sync 参数，先同步文章
    if (sync === 'true') {
      await syncArticles();
    }

    // 获取文章索引文件
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: articlesJsonPath,
    });

    // 解码并解析文章列表
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const articles = JSON.parse(content);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { article } = await request.json();
    const { title, description, content, category, path } = article;

    // 获取分类信息
    const { data: categoriesFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'data/json/categories.json',
    });

    const categories = JSON.parse(Buffer.from(categoriesFile.content, 'base64').toString('utf8'));
    const categoryInfo = categories.find(cat => cat.slug === category);
    
    // 构建文章内容，包含 frontmatter
    const fileContent = matter.stringify(content, {
      title,
      description,
      date: new Date().toISOString().split('T')[0],
      category: category || '', // 保存分类的 slug
      categoryName: categoryInfo?.name || '', // 额外保存分类的 name
    });

    let currentSha;
    if (path) {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: path,
      });
      currentSha = currentFile.sha;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: path || `data/md/${generateSlug(title)}.md`,
      message: path ? `Update article: ${title}` : `Add article: ${title}`,
      content: Buffer.from(fileContent).toString('base64'),
      ...(currentSha && { sha: currentSha }),
    });

    // 同步文章列表
    await syncArticles();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}

async function syncArticles() {
  try {
    // Fetch all MD files
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: mdFolderPath,
    });

    const mdFiles = files.filter(file => file.name.endsWith('.md'));

    const articles = await Promise.all(mdFiles.map(async file => {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: file.path,
      });

      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const { data: frontMatter, content: articleContent } = matter(content);

      // Fetch the last commit for this file
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        path: file.path,
        per_page: 1
      });

      const lastModified = commits[0]?.commit.committer.date || data.sha;

      return {
        title: frontMatter.title,
        description: frontMatter.description,
        date: frontMatter.date,
        lastModified: lastModified,
        path: file.path,
      };
    }));

    // Update articles.json
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: articlesJsonPath,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: articlesJsonPath,
      message: 'Sync articles',
      content: Buffer.from(JSON.stringify(articles, null, 2)).toString('base64'),
      sha: currentFile.sha,
    });

  } catch (error) {
    console.error('Error syncing articles:', error);
    throw error;
  }
}

async function updateMdFile(article) {
  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: article.path,
    });

    const currentContent = Buffer.from(currentFile.content, 'base64').toString('utf8');
    const { data: frontMatter, content: articleContent } = matter(currentContent);

    const updatedFrontMatter = {
      ...frontMatter,
      title: article.title,
      description: article.description,
      lastModified: new Date().toISOString(),
    };

    const updatedContent = matter.stringify(article.content, updatedFrontMatter);

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: article.path,
      message: `Update article: ${article.title}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: currentFile.sha,
    });

  } catch (error) {
    console.error('Error updating MD file:', error);
    throw error;
  }
}
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const mdFolderPath = 'data/md';
const articlesJsonPath = 'data/json/articles.json';

export async function POST() {
  try {
    // 首先获取分类列表
    const { data: categoriesFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'data/json/categories.json',
    });

    const categories = JSON.parse(Buffer.from(categoriesFile.content, 'base64').toString('utf8'));

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
      const { data: frontMatter } = matter(content);

      // 获取分类信息
      const categorySlug = frontMatter.category || '';
      const categoryInfo = categories.find(cat => cat.slug === categorySlug);

      // Fetch the last commit for this file
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        path: file.path,
        per_page: 1
      });

      const lastModified = commits[0]?.commit.committer.date || data.sha;

      return {
        title: frontMatter.title || '',
        description: frontMatter.description || '',
        date: frontMatter.date || '',
        category: categorySlug, // 保存分类的 slug
        categoryName: categoryInfo?.name || '', // 保存分类的显示名称
        lastModified: lastModified,
        path: file.path,
      };
    }));

    // 按日期排序
    const sortedArticles = articles.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    // Update articles.json
    let currentSha;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: articlesJsonPath,
      });
      currentSha = currentFile.sha;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: articlesJsonPath,
      message: 'Sync articles',
      content: Buffer.from(JSON.stringify(sortedArticles, null, 2)).toString('base64'),
      ...(currentSha && { sha: currentSha }),
    });

    return NextResponse.json({ success: true, articles: sortedArticles });
  } catch (error) {
    console.error('Error syncing articles:', error);
    return NextResponse.json(
      { error: 'Failed to sync articles' },
      { status: 500 }
    );
  }
} 
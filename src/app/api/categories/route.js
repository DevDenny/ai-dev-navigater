import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const categoriesPath = 'data/json/categories.json';

// 获取当前分支
function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' 
    ? (process.env.GITHUB_DEV_BRANCH || 'dev')
    : (process.env.GITHUB_API_BRANCH || 'main');
}

// 获取分类列表
export async function GET() {
  const branch = getCurrentBranch();
  try {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: categoriesPath,
        ref: branch
      });

      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const categories = JSON.parse(content);
      return NextResponse.json(categories);
    } catch (error) {
      // 如果文件不存在，返回空数组
      if (error.status === 404) {
        return NextResponse.json([]);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// 更新分类列表
export async function POST(request) {
  const branch = getCurrentBranch();
  try {
    const { categories } = await request.json();
    let currentSha;

    // 获取当前文件的 SHA（如果存在）
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: categoriesPath,
        ref: branch
      });
      currentSha = currentFile.sha;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    // 更新或创建分类文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: categoriesPath,
      message: 'Update categories',
      content: Buffer.from(JSON.stringify(categories, null, 2)).toString('base64'),
      ...(currentSha && { sha: currentSha })
    });

    // 更新所有文章的分类信息
    await updateArticlesCategories(categories, branch);

    return NextResponse.json({ message: 'Categories updated successfully' });
  } catch (error) {
    console.error('Error updating categories:', error);
    return NextResponse.json(
      { error: 'Failed to update categories' },
      { status: 500 }
    );
  }
}

// 更新所有文章的分类信息
async function updateArticlesCategories(categories, branch) {
  try {
    // 获取文章索引
    const { data: indexFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'data/json/articles.json',
      ref: branch
    });

    const content = Buffer.from(indexFile.content, 'base64').toString();
    const articles = JSON.parse(content);

    // 更新文章的分类名称
    const updatedArticles = articles.map(article => {
      const category = categories.find(cat => cat.slug === article.category);
      return {
        ...article,
        categoryName: category?.name || ''
      };
    });

    // 保存更新后的文章索引
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: 'data/json/articles.json',
      message: 'Update articles categories',
      content: Buffer.from(JSON.stringify(updatedArticles, null, 2)).toString('base64'),
      sha: indexFile.sha
    });
  } catch (error) {
    console.error('Error updating articles categories:', error);
    // 这里我们不抛出错误，因为这是次要操作
    // 但我们会记录错误以便调试
  }
} 
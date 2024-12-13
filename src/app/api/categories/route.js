import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const categoriesPath = 'data/json/categories.json';

// 获取分类列表
export async function GET() {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: categoriesPath,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const categories = JSON.parse(content);

    return NextResponse.json(categories);
  } catch (error) {
    if (error.status === 404) {
      // 如果文件不存在，返回空数组
      return NextResponse.json([]);
    }
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// 创建或更新分类
export async function POST(request) {
  try {
    const { categories } = await request.json();
    
    let currentSha;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: categoriesPath,
      });
      currentSha = currentFile.sha;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: categoriesPath,
      message: 'Update categories',
      content: Buffer.from(JSON.stringify(categories, null, 2)).toString('base64'),
      ...(currentSha && { sha: currentSha }),
    });

    return NextResponse.json({ message: 'Categories updated successfully' });
  } catch (error) {
    console.error('Error updating categories:', error);
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 });
  }
} 
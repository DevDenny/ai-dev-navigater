import { NextResponse } from 'next/server';
import path from 'path';
import { readFileSync, readdirSync } from 'fs';
import matter from 'gray-matter';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
// 保留这些环境变量相关的代码
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

// 保留这个用于环境变量的函数
function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

export async function POST(request) {
  try {
    const { article } = await request.json();
    const { title, description, content, category, path: filePath } = article;

    // 构建文章内容
    const fileContent = matter.stringify(content, {
      title,
      description,
      date: new Date().toISOString().split('T')[0],
      category: category || '',
    });

    // 获取文件的当前 SHA
    let currentSha;
    if (filePath) {
      try {
        const { data: currentFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: getCurrentBranch(), // 添加分支参数
        });
        currentSha = currentFile.sha;
      } catch (error) {
        // 如果文件不存在，继续创建
        if (error.status !== 404) throw error;
      }
    }

    // 更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Update article: ${title}`,
      content: Buffer.from(fileContent).toString('base64'),
      branch: getCurrentBranch(), // 添加分支参数
      ...(currentSha && { sha: currentSha }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (filePath) {
      // 获取单篇文章
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: getCurrentBranch(), // 添加分支参数
      });

      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const { data: frontMatter, content: articleContent } = matter(content);

      return NextResponse.json({
        title: frontMatter.title || '',
        description: frontMatter.description || '',
        content: articleContent || '',
        category: frontMatter.category || '',
        path: filePath,
      });
    }

    // 获取文章列表
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'data/md',
      ref: getCurrentBranch(), // 添加分支参数
    });

    const articles = await Promise.all(
      files
        .filter(file => file.name.endsWith('.md'))
        .map(async file => {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: getCurrentBranch(), // 添加分支参数
          });

          const content = Buffer.from(data.content, 'base64').toString('utf8');
          const { data: frontMatter } = matter(content);

          return {
            title: frontMatter.title || '',
            description: frontMatter.description || '',
            category: frontMatter.category || '',
            path: file.path,
          };
        })
    );

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error reading articles:', error);
    return NextResponse.json({ error: 'Failed to read articles' }, { status: 500 });
  }
}
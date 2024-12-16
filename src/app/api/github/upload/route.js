import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.type.split('/')[1];
    const filename = `${timestamp}_${randomString}.${extension}`;
    
    // 保存到 GitHub 仓库的 uploads/images 目录
    const path = `uploads/images/${filename}`;

    // 上传到 GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Upload image: ${filename}`,
      content: buffer.toString('base64'),
    });

    // 返回 raw.githubusercontent.com 链接
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;

    return NextResponse.json({ 
      success: true,
      url: rawUrl
    });

  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 
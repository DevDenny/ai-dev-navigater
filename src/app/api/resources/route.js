import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const githubPath = 'data/json/resources.json';
const localPath = path.join(process.cwd(), 'data', 'json', 'resources.json');

/**
 * 从 GitHub 获取资源列表
 * @returns {Promise<Array>} 资源列表
 */
async function getResourcesFromGitHub() {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching resources from GitHub:', error);
    throw error;
  }
}

/**
 * 获取本地资源列表
 * @returns {Array} 本地资源列表
 */
function getLocalResources() {
  return JSON.parse(fs.readFileSync(localPath, 'utf8'));
}

/**
 * GET 请求处理函数
 * 支持从 GitHub 或本地获取资源列表
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');

  if (source === 'github') {
    try {
      const resources = await getResourcesFromGitHub();
      return NextResponse.json(resources);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch resources from GitHub' }, { status: 500 });
    }
  } else {
    // 默认从本地文件获取资源（用于首页快速加载）
    const resources = getLocalResources();
    return NextResponse.json(resources);
  }
}

/**
 * POST 请求处理函数
 * 更新资源列表到 GitHub 和本地
 */
export async function POST(req) {
  const updatedResources = await req.json();

  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: githubPath,
      message: 'Update resources',
      content: Buffer.from(JSON.stringify(updatedResources, null, 2)).toString('base64'),
      sha: currentFile.sha,
    });

    // 注意：本地文件更新已被注释，因为在生产环境中可能不需要
    // fs.writeFileSync(localPath, JSON.stringify(updatedResources, null, 2));

    return NextResponse.json(updatedResources);
  } catch (error) {
    console.error('Error updating resources:', error);
    return NextResponse.json({ error: 'Failed to update resources' }, { status: 500 });
  }
}
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

// 添加分支控制
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

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
  try {
    const newResource = await req.json();
    console.log('Received new resource:', newResource);
    const branch = getCurrentBranch();
    console.log('Current branch:', branch);

    // 获取现有资源
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
      ref: branch  // 指定分支
    });

    let resources = [];
    try {
      const content = Buffer.from(currentFile.content, 'base64').toString('utf8');
      resources = JSON.parse(content);
      if (!Array.isArray(resources)) {
        resources = [];
        console.log('Existing resources is not an array, initializing empty array');
      }
    } catch (error) {
      console.log('Error parsing resources, initializing empty array:', error);
      resources = [];
    }
    
    // 添加新资源
    const updatedResources = [...resources, {
      ...newResource,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }];

    // 更新到 GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch: branch,  // 指定分支
      path: githubPath,
      message: 'Add new resource',
      content: Buffer.from(JSON.stringify(updatedResources, null, 2)).toString('base64'),
      sha: currentFile.sha
    });

    console.log('Resource created successfully on branch:', branch);
    return NextResponse.json({ success: true, resource: newResource });
  } catch (error) {
    console.error('Error in POST /api/resources:', error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: error.message },
      { status: 500 }
    );
  }
}
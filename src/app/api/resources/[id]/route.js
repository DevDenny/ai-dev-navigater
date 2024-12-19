import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getCurrentBranch } from '@/lib/utils';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const githubPath = 'data/json/resources.json';

export async function DELETE(request, { params }) {
  try {
    const branch = getCurrentBranch();
    console.log('Starting delete operation:', { id: params.id, branch });

    // 获取现有资源
    const { data: currentFile } = await octokit.repos.getContent({
      owner,
      repo,
      path: githubPath,
      ref: branch
    });

    // 解析当前资源列表
    const content = Buffer.from(currentFile.content, 'base64').toString('utf8');
    const resources = JSON.parse(content);
    console.log('Current resources count:', resources.length);

    // 过滤掉要删除的资源
    const updatedResources = resources.filter(resource => resource.id !== params.id);
    console.log('Updated resources count:', updatedResources.length);

    if (updatedResources.length === resources.length) {
      console.log('Resource not found:', params.id);
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // 更新到 GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: githubPath,
      message: `Delete resource: ${params.id}`,
      content: Buffer.from(JSON.stringify(updatedResources, null, 2)).toString('base64'),
      sha: currentFile.sha
    });

    console.log('Resource deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource', details: error.message },
      { status: 500 }
    );
  }
} 
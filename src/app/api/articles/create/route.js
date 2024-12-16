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
 * 处理文章创建的 POST 请求
 * @param {Request} request - 包含文章信息的请求对象
 * @returns {Promise<NextResponse>} 创建结果的响应
 */
export async function POST(request) {
  const { title, description, content, slug } = await request.json();

  // Validate slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  const path = `data/md/${slug}.md`;

  try {
    // Check if file already exists
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 });
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // 处理 markdown 中的图片路径
    const processedContent = content.replace(
      /!\[([^\]]*)\]\(\/uploads\/images\/([^)]+)\)/g,
      '![$1](/uploads/images/$2)'
    );

    // Create new file
    const fileContent = matter.stringify(processedContent, {
      title,
      description,
      date: new Date().toISOString(),
    });

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Create new article: ${title}`,
      content: Buffer.from(fileContent).toString('base64'),
    });

    // Sync articles
    await syncArticles();

    return NextResponse.json({ message: 'Article created successfully' });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

/**
 * 同步文章列表
 * 获取所有 Markdown 文件并更新 articles.json
 */
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
      const { data: frontMatter } = matter(content);

      // Fetch the last commit for this file
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        path: file.path,
        per_page: 1
      });

      const lastModified = commits[0]?.commit.committer.date || data.sha;

      // 确保所有需要的字段都被包含
      return {
        title: frontMatter.title || '',
        description: frontMatter.description || '',
        date: frontMatter.date || '',
        category: frontMatter.category || '', // 确保分类信息被包含
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

    return sortedArticles;
  } catch (error) {
    console.error('Error syncing articles:', error);
    throw error;
  }
}
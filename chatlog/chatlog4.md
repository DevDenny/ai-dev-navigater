# GitBase 功能优化与问题修复记录

## 一、文章支持图片上传功能

### 功能描述
1. 文章编辑器支持图片上传
2. 图片自动保存到 GitHub 仓库
3. 支持实时预览
4. 支持拖拽上传和粘贴上传
5. 自动生成图片访问链接

### 实现方案
1. 编辑器选型：使用 TinyMCE 编辑器，支持富文本编辑和图片上传
2. 存储方案：
   - 图片存储在 GitHub 仓库的 upload/images 目录
   - 使用时间戳确保文件名唯一性
   - 通过 GitHub raw content 提供访问
3. 访问策略：
   - 配置 Next.js rewrites 实现图片代理
   - 统一图片访问路径为 /images/
   - 支持开发和生产环境

### 涉及代码文件及核心逻辑

1. 编辑器配置与集成：
```javascript
// src/components/ArticleEditor.js
const editorConfig = {
  // 编辑器基础配置
  plugins: ['image'],
  toolbar: 'image',
  // 图片上传处理
  images_upload_handler: async (blobInfo, progress) => {
    const formData = new FormData();
    formData.append('file', blobInfo.blob());
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.location;
  }
};
```

2. 图片上传处理：
```javascript
// src/app/api/upload/route.js
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  // 生成文件名
  const fileName = `${Date.now()}-${file.name}`;
  const path = `public/images/${fileName}`;
  
  // 上传到 GitHub
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `Upload image: ${fileName}`,
    content: Buffer.from(await file.arrayBuffer()).toString('base64')
  });
  
  return NextResponse.json({
    location: `/images/${fileName}`
  });
}
```

3. Next.js 配置：
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['raw.githubusercontent.com']
  },
  async rewrites() {
    return [{
      source: '/images/:path*',
      destination: `https://raw.githubusercontent.com/${owner}/${repo}/main/public/images/:path*`
    }];
  }
};
```

## 二、问题修复记录

### 1. 文章更新失败问题

**问题描述**：
- 更新文章时报错：octokit is not defined

**原因分析**：
- API 路由中缺少必要的初始化代码
- GitHub API 客户端未正确配置

**解决方案**：
```javascript
// src/app/api/articles/route.js
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// 添加必要的常量
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
```

### 2. 本地开发环境同步问题

**问题描述**：
- 本地开发时，更新文章后看不到最新内容
- 需要手动刷新或重启才能看到更新

**原因分析**：
- 开发分支（dev）和生产分支（main）不同步
- 本地环境和 GitHub 仓库内容不一致

**最终解决方案**：
采用环境变量控制分支方案

1. 环境配置：
```plaintext
# .env.development
GITHUB_API_BRANCH=main
GITHUB_DEV_BRANCH=dev
```

2. 分支控制代码：
```javascript
// src/app/api/articles/route.js
const apiBranch = process.env.GITHUB_API_BRANCH || 'main';
const devBranch = process.env.GITHUB_DEV_BRANCH || 'dev';

function getCurrentBranch() {
  return process.env.NODE_ENV === 'development' ? devBranch : apiBranch;
}

// 在 GitHub API 调用时使用对应分支
await octokit.repos.createOrUpdateFileContents({
  owner,
  repo,
  branch: getCurrentBranch(),
  // ...其他参数
});
```

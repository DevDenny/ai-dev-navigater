// GitHub 仓库配置
export const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || '';
export const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || '';

// API 配置
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 10000
}; 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 添加环境变量配置
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO,
    ACCESS_PASSWORD: process.env.ACCESS_PASSWORD,
  }
}

export default nextConfig;

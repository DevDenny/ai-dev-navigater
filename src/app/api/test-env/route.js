export async function GET() {
  // 列出所有环境变量（仅开发环境使用）
  const envVars = {
    ACCESS_PASSWORD: process.env.ACCESS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    // 其他环境变量...
  };

  return Response.json(envVars);
} 
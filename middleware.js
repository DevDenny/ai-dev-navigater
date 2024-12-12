import { NextResponse } from 'next/server';

export function middleware(request) {
  const authToken = request.cookies.get('auth_token');
  
  // 调试日志
  console.log('Middleware checking path:', request.nextUrl.pathname);
  console.log('Auth token:', authToken?.value);

  // 需要保护的路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (authToken?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 已登录用户访问登录页面时重定向到管理页面
  if (request.nextUrl.pathname === '/login' && authToken?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login']
};
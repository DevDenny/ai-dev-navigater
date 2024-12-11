import { NextResponse } from 'next/server';

export function middleware(request) {
  const authToken = request.cookies.get('auth_token');

  // 如果是管理路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authToken?.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 如果是登录页面且已经有token
  if (request.nextUrl.pathname === '/login' && authToken?.value) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login']
};
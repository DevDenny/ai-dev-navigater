import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('Checking auth status...');
  
  // 获取 session cookie
  const sessionCookie = request.cookies.get('session');
  console.log('Session cookie:', sessionCookie);

  if (sessionCookie?.value === 'authenticated') {
    return NextResponse.json({ isLoggedIn: true });
  }

  return NextResponse.json({ isLoggedIn: false });
}
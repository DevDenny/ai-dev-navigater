import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token');
    
    console.log('Checking auth status...');
    console.log('Session cookie:', authToken?.value);

    return NextResponse.json({
      isLoggedIn: authToken?.value === 'authenticated'
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isLoggedIn: false });
  }
}
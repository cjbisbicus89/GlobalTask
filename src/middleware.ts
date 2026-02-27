import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/creditos')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'globaltask_2026');
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
  }
  return NextResponse.next();
}
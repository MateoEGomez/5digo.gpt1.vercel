// Archivo: middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
);

// Rutas que requieren autenticación
const protectedRoutes = ['/chat', '/admin'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener el token de las cookies
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log(`[MIDDLEWARE] Acceso denegado a ${pathname}: sin token`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar y decodificar el token
    const verified = await jwtVerify(token, JWT_SECRET);
    console.log(`[MIDDLEWARE] Token verificado para usuario: ${(verified.payload as any).userId}`);
    
    // Token válido, permitir acceso
    return NextResponse.next();
  } catch (error) {
    console.log(`[MIDDLEWARE] Token inválido o expirado para ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*'],
};

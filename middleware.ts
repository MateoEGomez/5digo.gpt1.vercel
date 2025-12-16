// Archivo: middleware.ts
// Middleware para proteger rutas con Better Auth

import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/chat', '/admin', '/student', '/courses'];

// Rutas públicas
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Obtener la sesión del usuario desde Better Auth
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Si es una ruta protegida y no hay token, redirigir a login
  if (isProtectedRoute && !sessionToken) {
    console.log(`[MIDDLEWARE] Acceso denegado a ${pathname}: sin sesión`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario intenta acceder a login/register pero ya está autenticado
  if ((pathname === '/login' || pathname === '/register') && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger estas rutas
    '/chat/:path*',
    '/admin/:path*',
    '/student/:path*',
    '/courses/:path*',
    // Redirigir si ya está autenticado
    '/login',
    '/register',
  ],
};

// Archivo: middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Rutas que requieren autenticación
const protectedRoutes = ['/chat', '/admin', '/courses'];
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Si es una ruta pública, permitir acceso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Crear cliente de Supabase para el middleware
  const response = NextResponse.next();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Verificar sesión de Supabase
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.log(`[MIDDLEWARE] Acceso denegado a ${pathname}: sin sesión válida`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log(`[MIDDLEWARE] Sesión verificada para usuario: ${session.user.id}`);

  // Sesión válida, permitir acceso
  return response;
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*', '/courses/:path*'],
};

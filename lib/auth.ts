// Archivo: lib/auth.ts
// Utilidades centralizadas de autenticación

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

// Validación estricta de JWT_SECRET
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Interfaz del payload del JWT
 * Extiende el JWTPayload de jose para compatibilidad
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'profesor' | 'alumno';
  [key: string]: unknown; // Index signature requerida por jose
}

/**
 * Crea un JWT con los datos del usuario
 */
export async function createJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un JWT
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error);
    return null;
  }
}

/**
 * Obtiene el userId desde el token JWT en las cookies
 * @returns userId o null si no hay token válido
 */
export async function getUserIdFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('[AUTH] No token found in cookies');
      return null;
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      console.log('[AUTH] Invalid token');
      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error('[AUTH] Error getting userId from token:', error);
    return null;
  }
}

/**
 * Obtiene el payload completo del JWT desde las cookies
 */
export async function getUserFromToken(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    return await verifyJWT(token);
  } catch (error) {
    console.error('[AUTH] Error getting user from token:', error);
    return null;
  }
}

/**
 * Establece el token de autenticación en las cookies
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

/**
 * Elimina el token de autenticación de las cookies
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

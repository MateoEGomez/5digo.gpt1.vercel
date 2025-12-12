// Archivo: lib/auth.ts
// Utilidades centralizadas de autenticación con Supabase

import { createServerSupabaseClient } from './supabase';

/**
 * Interfaz del usuario autenticado
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: 'profesor' | 'alumno';
}

/**
 * Obtiene el usuario actualmente autenticado desde Supabase
 * @returns AuthUser o null si no hay sesión activa
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('[AUTH] No active session');
      return null;
    }

    // Obtener el rol desde la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[AUTH] Error fetching user profile:', profileError);
      return null;
    }

    return {
      userId: user.id,
      email: user.email!,
      role: profile.role as 'profesor' | 'alumno',
    };
  } catch (error) {
    console.error('[AUTH] Error getting auth user:', error);
    return null;
  }
}

/**
 * Obtiene solo el userId del usuario autenticado
 * @returns userId o null si no hay sesión activa
 */
export async function getUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.userId || null;
}

/**
 * Verifica si el usuario autenticado es profesor
 */
export async function isTeacher(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === 'profesor';
}

/**
 * Verifica si el usuario autenticado es alumno
 */
export async function isStudent(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === 'alumno';
}

// Exportar funciones de compatibilidad con el código existente
export const getUserIdFromToken = getUserId;
export const getUserFromToken = getAuthUser;

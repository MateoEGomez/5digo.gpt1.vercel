// Archivo: app/action.ts

"use server";

import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = ((formData.get("role") as string) || 'alumno') as 'profesor' | 'alumno';

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Registrando nuevo usuario: ${email}, role: ${role}`);
    const supabase = await createServerSupabaseClient();

    // 1. Crear usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role, // Metadata del usuario
        },
      },
    });

    if (authError) {
      console.error(`[AUTH] Error en Supabase Auth:`, authError.message);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Error al crear usuario." };
    }

    // 2. Actualizar el rol en la tabla profiles
    // (El trigger ya creó el perfil, solo actualizamos el rol si es profesor)
    if (role === 'profesor') {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'profesor' })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error(`[AUTH] Error actualizando perfil:`, profileError.message);
      }
    }

    console.log(`[AUTH] Usuario registrado con ID: ${authData.user.id}`);

    // Supabase Auth maneja automáticamente la sesión con cookies
    return { success: true, userId: authData.user.id, role };

  } catch (e: any) {
    console.error(`[AUTH] Error en registro:`, e.message);
    return { error: e.message || "Error al registrar usuario." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Intento de login para: ${email}`);
    const supabase = await createServerSupabaseClient();

    // 1. Login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log(`[AUTH] Error de autenticación: ${authError.message}`);
      return { error: "Credenciales inválidas." };
    }

    if (!authData.user) {
      return { error: "Error al iniciar sesión." };
    }

    // 2. Obtener el rol del usuario desde profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error(`[AUTH] Error obteniendo perfil:`, profileError);
      return { error: "Error al obtener datos del usuario." };
    }

    console.log(`[AUTH] Login exitoso para: ${email}`);

    // Supabase Auth maneja automáticamente la sesión con cookies
    return { success: true, userId: authData.user.id, role: profile.role };

  } catch (e: any) {
    console.error(`[AUTH] Error en login:`, e.message);
    return { error: e.message || "Error al iniciar sesión." };
  }
}

export async function logoutUser() {
  try {
    console.log(`[AUTH] Logout solicitado`);
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(`[AUTH] Error en logout:`, error.message);
      return { error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error(`[AUTH] Error en logout:`, e.message);
    return { error: e.message || "Error al cerrar sesión." };
  }
}

export async function getCurrentUser() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { user: null };
    }

    return { user: { id: user.userId, email: user.email, role: user.role } };
  } catch (e: any) {
    console.error(`[AUTH] Error al verificar usuario:`, e.message);
    return { user: null };
  }
}
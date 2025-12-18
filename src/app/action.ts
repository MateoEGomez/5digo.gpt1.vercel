// Archivo: app/action.ts

"use server";

import * as bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { createJWT, setAuthCookie, clearAuthCookie, getUserFromToken } from '@/lib/auth';

const SALT_ROUNDS = 10;

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = ((formData.get("role") as string) || 'alumno') as 'profesor' | 'alumno';

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Registrando nuevo usuario: ${email}, role: ${role}`);

    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Insertar usuario en DB con rol especificado
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ 
        email, 
        password_hash: hashedPassword,
        role: role
      }])
      .select('id')
      .single();

    if (error) throw error;

    console.log(`[AUTH] Usuario registrado con ID: ${data.id}`);

    // 3. Crear JWT automáticamente después del registro
    const token = await createJWT({ userId: data.id, email, role });

    // 4. Guardar JWT en cookie HTTP-Only
    await setAuthCookie(token);

    console.log(`[AUTH] Registro exitoso y JWT creado para: ${email}`);
    return { success: true, userId: data.id, role };

  } catch (e: any) {
    console.error(`[AUTH] Error en registro:`, e.message);
    if (e.code === '23505') {
      return { error: "El email ya está registrado." };
    }
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

    // 1. Buscar usuario en Supabase
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, password_hash, role')
      .eq('email', email)
      .single();

    if (error || !userData) {
      console.log(`[AUTH] Usuario no encontrado: ${email}`);
      return { error: "Credenciales inválidas." };
    }

    // 2. Comparar la contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);

    if (!passwordMatch) {
      console.log(`[AUTH] Contraseña incorrecta para: ${email}`);
      return { error: "Credenciales inválidas." };
    }

    // 3. Crear JWT (como en registerUser)
    const token = await createJWT({ userId: userData.id, email, role: userData.role });

    // 4. Guardar JWT en cookie HTTP-Only
    await setAuthCookie(token);

    console.log(`[AUTH] Login exitoso para: ${email}`);
    return { success: true, userId: userData.id, role: userData.role };

  } catch (e: any) {
    console.error(`[AUTH] Error en login:`, e.message);
    return { error: e.message || "Error al iniciar sesión." };
  }
}

export async function logoutUser() {
  try {
    console.log(`[AUTH] Logout solicitado`);
    await clearAuthCookie();
    return { success: true };
  } catch (e: any) {
    console.error(`[AUTH] Error en logout:`, e.message);
    return { error: e.message || "Error al cerrar sesión." };
  }
}

export async function getCurrentUser() {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return { user: null };
    }

    return { user: { id: user.userId, email: user.email, role: user.role } };
  } catch (e: any) {
    console.error(`[AUTH] Error al verificar token:`, e.message);
    return { user: null };
  }
}
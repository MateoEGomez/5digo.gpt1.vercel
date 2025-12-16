// Archivo: lib/auth.ts
// Configuración de Better Auth con validación de emails

import { betterAuth } from 'better-auth';
import { organization, twoFactor } from 'better-auth/plugins';
import { Pool } from 'pg';

// Validación de DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * Configuración de Better Auth
 * - Database: PostgreSQL usando Pool
 * - Email y Contraseña: Habilitado para autenticación
 * - Plugins: Organización y Autenticación de dos factores
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Configuración adicional de conexión
    max: 10, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // timeout de inactividad
    connectionTimeoutMillis: 2000, // timeout de conexión
  }),
  
  // Configuración de email y contraseña
  emailAndPassword: {
    enabled: true,
    // Validación de email: Solo acepta emails con formato válido
    async emailValidator(email: string) {
      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
      }
      // Aquí podrías agregar validaciones adicionales
      // como verificar si el dominio existe
      return true;
    },
    // Validación de contraseña mínima
    minPasswordLength: 8,
  },

  // Plugins
  plugins: [
    // Plugin de Organización para gestionar equipos/grupos
    organization({
      // Permite que cualquier usuario cree organizaciones
      creationAllowedFor: 'all',
    }),
    
    // Plugin de Autenticación de Dos Factores
    twoFactor({
      // Habilita TOTP (Time-based One-Time Password)
      issuer: '5digo-GPT',
    }),
  ],
});
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

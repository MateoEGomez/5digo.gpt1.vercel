// Archivo: src/app/api/auth/[...path]/route.ts
// Manejo de rutas de autenticación con Better Auth

import { auth } from '@/lib/auth';

/**
 * Exportar todos los métodos HTTP de Better Auth
 * Esto permite que Better Auth maneje las rutas de autenticación
 */
export const { GET, POST, PUT, DELETE } = auth.toNextJsHandler();

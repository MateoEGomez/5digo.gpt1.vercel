// Archivo: lib/authClient.ts
// Cliente de Better Auth para usar en el frontend

import { createAuthClient } from 'better-auth/react';
import { organizationClient, twoFactorClient } from 'better-auth/client/plugins';

/**
 * Cliente de autenticación para el frontend
 * Se conecta a las APIs de Better Auth
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    organizationClient(),
    twoFactorClient(),
  ],
});

// Exportar funciones útiles del cliente
export const { 
  signUp,
  signIn,
  signOut,
  useSession,
  getSession,
  organization: orgClient,
  twoFactor: twoFactorClientFunctions,
} = authClient;

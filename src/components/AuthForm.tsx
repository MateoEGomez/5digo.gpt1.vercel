// Archivo: src/components/AuthForm.tsx
// Componente de formulario de autenticación con validación de email

'use client';

import { useState } from 'react';
import { signUp, signIn } from '@/lib/authClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Validador de email
 * Valida que el email tenga un formato correcto
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface AuthFormProps {
  mode?: 'signin' | 'signup';
}

export function AuthForm({ mode = 'signin' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validación de email
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    // Validación de contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Validación de nombre para signup
        if (!name.trim()) {
          setError('El nombre es requerido');
          return;
        }

        const response = await signUp.email({
          email,
          password,
          name,
        });

        if (response.error) {
          setError(response.error.message || 'Error al crear la cuenta');
          return;
        }

        setSuccess('¡Cuenta creada exitosamente! Por favor, inicia sesión.');
        // Limpiar el formulario
        setEmail('');
        setPassword('');
        setName('');
      } else {
        // Sign In
        const response = await signIn.email({
          email,
          password,
        });

        if (response.error) {
          setError(response.error.message || 'Email o contraseña incorrectos');
          return;
        }

        setSuccess('¡Iniciaste sesión correctamente!');
        // La redirección se manejará desde el servidor
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {isSignup && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre Completo
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          autoComplete="email"
        />
        <p className="text-xs text-gray-500 mt-1">
          Por favor, usa un email válido
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
        <p className="text-xs text-gray-500 mt-1">
          Mínimo 8 caracteres para tu seguridad
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading 
          ? 'Procesando...' 
          : (isSignup ? 'Crear Cuenta' : 'Iniciar Sesión')
        }
      </Button>

      <div className="text-center text-sm">
        {isSignup ? (
          <>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Inicia sesión aquí
            </a>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </a>
          </>
        )}
      </div>
    </form>
  );
}

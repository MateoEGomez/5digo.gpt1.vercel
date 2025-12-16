# Guía de Implementación de Better Auth

## 📋 Descripción General

Se ha implementado **Better Auth** en el proyecto para manejar la autenticación con validación de emails válidos. Better Auth proporciona una solución completa de autenticación con:

- ✅ Autenticación por email y contraseña
- ✅ Validación de formato de email
- ✅ Autenticación de dos factores (2FA)
- ✅ Sistema de organizaciones
- ✅ Gestión de sesiones seguras

## 🚀 Cambios Realizados

### 1. **Actualización del Schema de Base de Datos** (`schema.sql`)
   - Se agregaron tablas de Better Auth:
     - `user`: Tabla principal de usuarios
     - `session`: Sesiones de usuario
     - `account`: Cuentas enlazadas
     - `verification`: Códigos de verificación
     - `twoFactor`: Configuración de 2FA
     - `organization`: Organizaciones/Equipos
     - `organizationMember`: Miembros de organizaciones
   - Se mantuvieron todas las tablas personalizadas del proyecto
   - Se actualiza el tipo de `userId` de UUID a TEXT en tablas relacionadas

### 2. **Configuración de Better Auth** (`lib/auth.ts`)
   - Inicialización con PostgreSQL Pool
   - Validación de emails con regex
   - Validación de contraseñas (mínimo 8 caracteres)
   - Plugins: Organizaciones y 2FA

### 3. **API Route** (`src/app/api/auth/[...path]/route.ts`)
   - Maneja todas las rutas de autenticación
   - Expone los métodos HTTP necesarios (GET, POST, PUT, DELETE)

### 4. **Cliente Better Auth** (`lib/authClient.ts`)
   - Cliente para el frontend
   - Funciones exportadas: `signUp`, `signIn`, `signOut`, `useSession`

### 5. **Componente de Autenticación** (`src/components/AuthForm.tsx`)
   - Formulario de Login/Signup
   - Validación de email en el cliente
   - Mensajes de error y éxito
   - Interfaz responsive

### 6. **Middleware Actualizado** (`middleware.ts`)
   - Protege rutas autenticadas
   - Redirige usuarios no autenticados al login
   - Redirige usuarios autenticados fuera de login/register

## 📝 Validación de Emails

El sistema valida emails en dos niveles:

### **Nivel 1: Cliente (Frontend)**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
validateEmail(email) // retorna true/false
```

### **Nivel 2: Servidor (Better Auth)**
```typescript
emailValidator(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Formato de email inválido');
  }
  return true;
}
```

## 🔧 Configuración Necesaria

### 1. **Variables de Entorno (.env.local)**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/educacion_ai
BETTER_AUTH_SECRET=una-clave-secreta-muy-larga-y-segura
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. **Ejecutar Migrations**
```bash
# Asegúrate de que tu base de datos PostgreSQL esté activa
# Ejecuta el schema.sql en tu base de datos:
psql -U usuario -d educacion_ai -f schema.sql
```

### 3. **Instalar Dependencias** (ya instaladas)
```bash
npm install better-auth pg
```

## 💡 Uso en Componentes

### **Iniciar Sesión**
```typescript
import { signIn } from '@/lib/authClient';

const handleLogin = async (email: string, password: string) => {
  const response = await signIn.email({ email, password });
  if (!response.error) {
    window.location.href = '/dashboard';
  }
};
```

### **Registrarse**
```typescript
import { signUp } from '@/lib/authClient';

const handleSignup = async (email: string, password: string, name: string) => {
  const response = await signUp.email({ email, password, name });
  if (!response.error) {
    // Usuario creado, puede iniciar sesión
  }
};
```

### **Obtener Sesión Actual**
```typescript
import { useSession } from '@/lib/authClient';

export function MyComponent() {
  const { data: session } = useSession();
  
  return <div>{session?.user?.email}</div>;
}
```

### **Cerrar Sesión**
```typescript
import { signOut } from '@/lib/authClient';

const handleLogout = async () => {
  await signOut();
  window.location.href = '/login';
};
```

## 🛡️ Características de Seguridad

1. **Contraseñas Hasheadas**: Better Auth usa bcrypt para hashear contraseñas
2. **Sesiones Seguras**: Tokens JWT encriptados en cookies HTTP-only
3. **Validación de Email**: Se valida el formato de email antes de crear la cuenta
4. **2FA Disponible**: Los usuarios pueden habilitar autenticación de dos factores
5. **CSRF Protection**: Incluida en Better Auth

## 📚 Próximos Pasos

### 1. **Actualizar Páginas de Login/Register**
Usa el componente `AuthForm` en:
- `/src/app/login/page.tsx`
- `/src/app/register/page.tsx`

### 2. **Crear Página de Dashboard**
```typescript
// /src/app/dashboard/page.tsx
import { getSession } from '@/lib/authClient';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Bienvenido, {session.user.name}</div>;
}
```

### 3. **Migrar Tablas de Usuarios**
Si tienes datos en la tabla `users` anterior:
```sql
INSERT INTO "user" (id, email, name, createdAt, updatedAt)
SELECT id, email, name, created_at, updated_at FROM users;
```

### 4. **Habilitar 2FA para Usuarios**
```typescript
import { authClient } from '@/lib/authClient';

const { data } = await authClient.twoFactor.enable();
// data.qrCode contiene el código QR para escanear
```

## 🚨 Consideraciones Importantes

1. **Cambio de tipo de ID**: Se cambió de UUID a TEXT para users. Actualiza cualquier referencia en tu código.
2. **Nombres de cookies**: Better Auth usa diferentes nombres de cookies. Actualiza tu middleware si es necesario.
3. **Base de datos**: Asegúrate de ejecutar el nuevo schema.sql antes de usar Better Auth.
4. **Variables de entorno**: Define `BETTER_AUTH_SECRET` en producción de forma segura.

## 📖 Documentación Oficial

- [Better Auth Docs](https://www.better-auth.com)
- [Next.js Integration](https://www.better-auth.com/docs/integrations/next-js)
- [Email and Password](https://www.better-auth.com/docs/plugins/email-and-password)

## ❓ Preguntas Frecuentes

**P: ¿Cómo valido que el email sea de un dominio específico?**
A: Modifica el `emailValidator` en `lib/auth.ts`:
```typescript
async emailValidator(email: string) {
  if (!email.endsWith('@tudominio.com')) {
    throw new Error('Solo se permiten emails de @tudominio.com');
  }
  return true;
}
```

**P: ¿Cómo verifico si el usuario es profesor o alumno?**
A: Accede a la tabla `user_profile`:
```typescript
const profile = await db.query(
  'SELECT role FROM user_profile WHERE userId = $1',
  [userId]
);
```

**P: ¿Puedo cambiar la longitud mínima de contraseña?**
A: Sí, en `lib/auth.ts`:
```typescript
emailAndPassword: {
  minPasswordLength: 12, // cambiar a 12 caracteres
}
```

---

**Implementación completada** ✅ Better Auth está listo para usar con validación de emails.

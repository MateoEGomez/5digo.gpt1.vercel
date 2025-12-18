# Supabase Authentication Setup Guide

This guide will help you set up Supabase Authentication for the Educación AI project.

## Prerequisites

- A Supabase account (sign up at [https://supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Project name: `educacion-ai` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"
5. Wait for your project to be set up (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon) in the sidebar
2. Click on "API" in the settings menu
3. You'll see two important keys:
   - **Project URL**: Copy this value
   - **anon/public key**: Copy this value
   - **service_role key**: Click "Reveal" and copy this value (⚠️ Keep this secret!)

## Step 3: Configure Environment Variables

1. In your project root, copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Add your AI API keys as well:
   ```bash
   GOOGLE_API_KEY=your-google-api-key-here
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase project dashboard, click on the "SQL Editor" icon in the sidebar
2. Click "New query"
3. Copy the entire contents of the `schema.sql` file from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- The `profiles` table (extends Supabase's `auth.users`)
- All necessary tables for courses, topics, enrollments, etc.
- A database trigger that automatically creates a profile when a user signs up
- Row Level Security (RLS) policies for secure data access

## Step 5: Configure Authentication Settings

1. In your Supabase dashboard, go to "Authentication" → "Providers"
2. Make sure "Email" is enabled (it should be by default)
3. Configure email templates (optional):
   - Go to "Authentication" → "Email Templates"
   - Customize the confirmation email, password reset email, etc.

### Email Confirmation Settings

By default, Supabase requires email confirmation. For development, you can disable this:

1. Go to "Authentication" → "Providers" → "Email"
2. Scroll down to "Confirm email"
3. Toggle it OFF for development (or leave it ON for production)

## Step 6: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Try registering a new user:
   - Go to `/register`
   - Fill in the form
   - Select a role (Alumno or Profesor)
   - Click "Crear Cuenta"

5. Check your Supabase dashboard:
   - Go to "Authentication" → "Users"
   - You should see your new user
   - Go to "Table Editor" → "profiles"
   - You should see a profile record for your user

## Step 7: Set Up Row Level Security (RLS)

The `schema.sql` file already includes basic RLS policies, but you may want to add more:

### Example: Allow teachers to manage their own courses

```sql
-- Policy: Teachers can create courses
CREATE POLICY "Los profesores pueden crear cursos"
  ON courses FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'profesor'
    )
  );

-- Policy: Teachers can view their own courses
CREATE POLICY "Los profesores pueden ver sus cursos"
  ON courses FOR SELECT
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can update their own courses
CREATE POLICY "Los profesores pueden actualizar sus cursos"
  ON courses FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own courses
CREATE POLICY "Los profesores pueden eliminar sus cursos"
  ON courses FOR DELETE
  USING (auth.uid() = teacher_id);

-- Policy: Students can view courses they're enrolled in
CREATE POLICY "Los alumnos pueden ver cursos en los que están inscritos"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_id = courses.id AND student_id = auth.uid()
    )
  );
```

Run these policies in the SQL Editor to add more granular access control.

## Troubleshooting

### Issue: "Invalid API key" error

**Solution**: Make sure you've correctly copied the API keys from your Supabase dashboard and that there are no extra spaces.

### Issue: "Failed to create user" error

**Solution**:
- Check that your Supabase project is running (green status in the dashboard)
- Verify your environment variables are loaded (restart your dev server)
- Check the browser console and server logs for more details

### Issue: "User created but profile not created"

**Solution**:
- Make sure the trigger function was created correctly
- Check the SQL Editor for any errors when running the schema
- Manually create the profile:
  ```sql
  INSERT INTO profiles (id, email, role)
  VALUES ('user-id-here', 'email@example.com', 'alumno');
  ```

### Issue: "Cannot read properties of null (reading 'id')"

**Solution**: This usually means the session is not being persisted. Make sure:
- The middleware is properly configured
- Cookies are being set (check browser DevTools → Application → Cookies)
- Your Supabase URL and keys are correct

## Security Best Practices

1. **Never commit `.env` file**: The `.env` file is already in `.gitignore`. Never commit it to your repository.

2. **Use different keys for development and production**: Create separate Supabase projects for development and production.

3. **Keep service role key secret**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies. Only use it server-side.

4. **Enable RLS on all tables**: Make sure Row Level Security is enabled on all tables that contain user data.

5. **Use HTTPS in production**: Always use HTTPS when deploying to production to protect authentication cookies.

## Deployment to Vercel

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables from your `.env` file
4. Make sure to use your production Supabase project credentials
5. Redeploy your application

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

-- Archivo: schema.sql
-- Esquema de base de datos para Educación AI

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'alumno' CHECK (role IN ('profesor', 'alumno')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de cursos (creados por profesores)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< Updated upstream
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL, -- Código para que alumnos se unan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de temarios dentro de cursos
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  activities TEXT, -- JSON con actividades
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de inscripciones de alumnos a cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5, 2) DEFAULT 0, -- Porcentaje de avance
=======
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  context_data JSONB DEFAULT '[]',
  progress_data JSONB DEFAULT '{}',
>>>>>>> Stashed changes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- 5. Tabla de sesiones de chat por temario
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
-- 6. Tabla de configuración de persona pedagógica (estilo del docente)
CREATE TABLE IF NOT EXISTS persona_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tone VARCHAR(50) DEFAULT 'profesional', -- 'profesional', 'casual', 'motivador'
  explanation_style VARCHAR(50) DEFAULT 'detallado', -- 'detallado', 'conciso', 'socrático'
  language VARCHAR(10) DEFAULT 'es', -- idioma
  difficulty_level VARCHAR(50) DEFAULT 'intermedio', -- 'basico', 'intermedio', 'avanzado'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Syllabus con estado de temas por estudiante
CREATE TABLE IF NOT EXISTS student_syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, topic_id)
);

-- 8. Tabla de resúmenes pedagógicos generados por el Notario
CREATE TABLE IF NOT EXISTS topic_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  topic_completion_summary TEXT NOT NULL, -- resumen conciso del tema
  student_doubts JSONB DEFAULT '[]', -- lista de dudas que tuvo
  effective_analogies TEXT, -- metáforas que funcionaron
  engagement_level VARCHAR(50), -- 'High', 'Medium', 'Low'
  next_session_hook TEXT, -- gancho para la próxima sesión
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_topics_course_id ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_topic_id ON chat_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_persona_configs_course_id ON persona_configs(course_id);
CREATE INDEX IF NOT EXISTS idx_student_syllabus_student_id ON student_syllabus(student_id);
CREATE INDEX IF NOT EXISTS idx_student_syllabus_course_id ON student_syllabus(course_id);
CREATE INDEX IF NOT EXISTS idx_topic_summaries_student_id ON topic_summaries(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_summaries_topic_id ON topic_summaries(topic_id);

ent_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_topic_id ON chat_sessions(topic_id);

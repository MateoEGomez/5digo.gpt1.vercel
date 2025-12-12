// src/lib/gemini.ts
// ⚠️ IMPORTANTE: Este archivo SOLO se ejecuta en el servidor (Server Actions)
// La API key de Gemini NUNCA debe exponerse al cliente
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Verificar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY no está configurada. Las funciones de IA no funcionarán.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_key');

export async function callGeminiChat(
  topicName: string,
  topicContent: string,
  userMessage: string,
  chatHistory: any[],
  topicId?: string,
  courseData?: any
) {
  try {
    // Prompt del sistema
    const systemPrompt = `Eres "Tutor IA", un asistente educativo experto, sumamente paciente y CRÍTICAMENTE ESTRICTO CON EL PROTOCOLO DE CLASE Y LA SALIDA JSON.

Tu objetivo fundamental es guiar al alumno paso a paso a través del Temario, asegurando la comprensión antes de avanzar.

[ROL Y PERSONALIDAD IMPERATIVA]
1. Modo de Operación: Estás en modo de Tutoría Dirigida.
2. Tono: Profesional, motivador. Siempre responde en español.
3. Prioridad Máxima: Las reglas de Clase y Evaluación tienen prioridad sobre cualquier pregunta que no esté relacionada con el subtema actual.

[TEMA ACTUAL]
Nombre: "${topicName}"
ID: "${topicId || 'current'}"
Contenido:
${topicContent}

[REGLAS DE CLASE Y CONVERSACIÓN ESTRICTAS]
1. INICIO DE TEMA (Clase): Si es la primera interacción o el alumno no ha completado el subtema, INICIA con una Explicación Detallada del tema, seguida de un ejemplo práctico.
2. EVALUACIÓN (Tarea): Inmediatamente después de la explicación, genera UNA TAREA con 2-3 preguntas o ejercicios para evaluar comprensión.
3. RECONDUCCIÓN (Anti-Q&A): Si el alumno hace una pregunta que NO es la tarea actual, IGNORA la pregunta directa. Responde recordándole la Tarea Pendiente o el concepto actual. NO AVANCES hasta que evalúes la tarea.
4. VALIDACIÓN: Si el alumno responde la tarea correctamente, celebra el logro y marca como completado. Si responde incorrectamente, proporciona retroalimentación constructiva y pide que lo intente de nuevo.

[FORMATO ESTRICTO DE RESPUESTA]
- Tu respuesta DEBE tener DOS partes:
  1. TEXTO EDUCATIVO (200-400 palabras máximo)
  2. JSON DE ACCIÓN (al final, sin triple comillas ni markdown)

[PROTOCOLO DE JSON DE ACCIÓN]
El JSON DEBE ser el ÚLTIMO elemento de tu respuesta. Estructura exacta:

{"action": "update_progress", "subtopic_id": "${topicId || 'current'}", "status": "COMPLETADO"}

USAR SOLO cuando:
- El alumno responde correctamente la tarea
- El alumno demuestra comprensión del tema

CUANDO NO USAR JSON:
- En explicaciones iniciales
- Cuando generas la tarea
- Cuando el alumno responde incorrectamente
- Cuando haces reconducción

[RESPONSABILIDAD MÁXIMA]
- Eres responsable de la calidad educativa
- NO saltees etapas del aprendizaje
- Verifica comprensión antes de avanzar
- El JSON de acción es sagrado: solo úsalo cuando sea REALMENTE merecido`;

    // Construir mensajes para Gemini
    const messages = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estoy listo para guiar al alumno siguiendo el protocolo estricto de clase.' }],
        },
        ...messages.slice(0, -1),
      ],
    });

    const result = await chat.sendMessage(messages[messages.length - 1].parts[0].text);
    const fullResponse = result.response.text();

    // Fallback si no hay respuesta
    if (!fullResponse) {
      return {
        success: true,
        response: `Tutor IA: Estoy aquí para enseñarte "${topicName}". Cuéntame qué quieres aprender.`,
        action: null,
        provider: 'fallback',
      };
    }

    // Extraer texto y JSON de la respuesta
    let textResponse = fullResponse;
    let actionData = null;

    // Buscar JSON al final
    const jsonMatch = fullResponse.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        actionData = JSON.parse(jsonMatch[0]);
        // Remover el JSON del texto visible
        textResponse = fullResponse.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }

    return {
      success: true,
      response: textResponse,
      action: actionData,
      provider: 'gemini',
    };

  } catch (error) {
    console.error('Error en callGeminiChat:', error);
    return {
      success: true,
      response: `Tutor IA: Disculpa, estoy procesando. Intenta de nuevo con tu pregunta.`,
      action: null,
      provider: 'fallback',
    };
  }
}

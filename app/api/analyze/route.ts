import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend'; // <-- NUEVO: Importamos Resend

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// <-- NUEVO: Inicializamos Resend
const resend = new Resend(process.env.RESEND_API_KEY); 

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    // MODIFICADO: Ahora también pedimos el 'email' de la base de datos
    const { data: diagnostic, error: fetchError } = await supabaseAdmin
      .from('diagnostics')
      .select('answers, email, phone')
      .eq('id', id)
      .single();

    if (fetchError || !diagnostic) {
      console.error("Error obteniendo respuestas:", fetchError);
      return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 });
    }

    const answers = diagnostic.answers;
    const userEmail = diagnostic.email;
    const userPhone = diagnostic.phone || 'No proporcionado';

    const systemPrompt = `
      Eres un agente de diagnóstico comercial senior de El Solar Creative Group.
      Tu trabajo es analizar las respuestas de un sistema B2B y generar un reporte json de diagnóstico.

      SISTEMA DE CALIFICACIÓN:
      - P1 (Antigüedad): <2 años (0), 2-5 años (1), 5-15 años (2), >15 años (3)
      - P2 (Tamaño): 1-2 (0), 3-10 (1), 10-30 (2), >30 (3)
      
      CRITERIOS DE CUELLOS DE BOTELLA:
      - CRÍTICO: Dependencia canales pasivos
      - CRÍTICO: Alto esfuerzo sin sistema
      - MODERADO: Proceso dependiente de individuos
      - MODERADO: Oferta mal articulada
      - LATENTE: Sin datos comerciales
      - LATENTE: Baja inversión en adquisición
      
      Identifica entre 2 y 3 problemas exactos.
      ADICIONALMENTE: Identifica exactamente 2 "Oportunidades de optimización" que el usuario está desaprovechando.

      FÓRMULA DE SCORE:
      Score = 100 - (críticos * 25) - (moderados * 15) - (latentes * 8). Mínimo 20, Máximo 80.

      REGLAS ESTRICTAS DE SALIDA:
      Devuelve ÚNICAMENTE un JSON válido con esta estructura:
      {
        "score": 42,
        "titulo": "Encontramos X problemas que están frenando tu crecimiento",
        "subtitulo_score": "Tu sistema opera en modo reactivo",
        "resumen_ejecutivo": "Tu sistema funciona, pero opera en modo reactivo...",
        "perfil_empresa": "Empresa B2B, >5 años de operación, equipo de 10-30 personas.",
        "puntaje_calificacion": 4,
        "problemas": [
          {
            "numero": "01",
            "etiqueta": "CRÍTICO",
            "titulo": "Tu canal principal no escala sin ti",
            "descripcion": "El voz a voz es eficiente...",
            "senal": "Señal detectada: mayoría de clientes llegan por referidos."
          }
        ],
        "oportunidades": [
          {
            "titulo": "Automatización del seguimiento inicial",
            "descripcion": "Estás perdiendo tiempo valioso al depender de..."
          }
        ],
        "cta_texto": "Para recibir tu plan de acción completo, agenda...",
        "nota_etapa_temprana": false
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza estas respuestas y genera el JSON: ${JSON.stringify(answers)}` }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponseText = completion.choices[0].message.content || '{}';
    const reportData = JSON.parse(aiResponseText);

    const { error: updateError } = await supabaseAdmin
      .from('diagnostics')
      .update({ 
        ai_report: reportData, 
        score: reportData.score,
        status: 'completed' 
      })
      .eq('id', id);

    if (updateError) {
      console.error("Error guardando el reporte generado:", updateError);
      return NextResponse.json({ error: 'Error al actualizar DB' }, { status: 500 });
    }

    // <-- NUEVO: Bloque de envío de correo
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const reportUrl = `${siteUrl}/report/${id}`;

      const scoreColor = reportData.score < 50 ? '#EF4444' : reportData.score < 65 ? '#F97316' : '#22C55E';
      const scoreLabel = reportData.score < 50 ? 'Zona crítica' : reportData.score < 65 ? 'Requiere atención' : 'Buen desempeño';
      const scoreBg = reportData.score < 50 ? '#FEF2F2' : reportData.score < 65 ? '#FFF7ED' : '#F0FDF4';
      const firstProblem = reportData.problemas?.[0];
      const remainingProblems = (reportData.problemas?.length || 1) - 1;
      const etiquetaColor = firstProblem?.etiqueta === 'CRÍTICO' ? '#DC2626' : firstProblem?.etiqueta === 'MODERADO' ? '#EA580C' : '#2563EB';
      const etiquetaBg = firstProblem?.etiqueta === 'CRÍTICO' ? '#FEF2F2' : firstProblem?.etiqueta === 'MODERADO' ? '#FFF7ED' : '#EFF6FF';
      const tidycalUrl = 'https://tidycal.com/elsolar/sesion-de-diagnostico-auditoria-de-adquisicion-b2b';

      await resend.emails.send({
        from: 'El Solar Creative Group <operaciones@elsolaragencia.co>',
        to: userEmail,
        subject: `Tu score de adquisición B2B: ${reportData.score}/100 — aquí está tu diagnóstico`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 16px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

                  <!-- HEADER -->
                  <tr>
                    <td style="background-color:#0f172a; padding: 24px 32px;">
                      <p style="margin:0; color:#94a3b8; font-size:12px; letter-spacing:2px; text-transform:uppercase; font-weight:600;">El Solar Creative Group</p>
                      <p style="margin:4px 0 0; color:#ffffff; font-size:14px;">Diagnóstico de Adquisición B2B</p>
                    </td>
                  </tr>

                  <!-- INTRO -->
                  <tr>
                    <td style="padding: 32px 32px 0;">
                      <h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#0f172a; line-height:1.3;">
                        Tu diagnóstico está listo.
                      </h1>
                      <p style="margin:0; color:#475569; font-size:15px; line-height:1.6;">
                        Analizamos tus respuestas y encontramos los puntos exactos donde tu sistema de adquisición está perdiendo oportunidades de negocio.
                      </p>
                    </td>
                  </tr>

                  <!-- SCORE CARD -->
                  <tr>
                    <td style="padding: 24px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:${scoreBg}; border-radius:12px; border:2px solid ${scoreColor};">
                        <tr>
                          <td style="padding: 24px; text-align:center;">
                            <p style="margin:0 0 8px; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:700; color:#64748b;">TU SCORE DE ADQUISICIÓN B2B</p>
                            <p style="margin:0; line-height:1;">
                              <span style="font-size:64px; font-weight:900; color:${scoreColor};">${reportData.score}</span>
                              <span style="font-size:24px; font-weight:400; color:#94a3b8;">/100</span>
                            </p>
                            <p style="margin:8px 0 0; display:inline-block; background:${scoreColor}; color:#ffffff; font-size:12px; font-weight:700; letter-spacing:1px; padding:4px 12px; border-radius:20px; text-transform:uppercase;">${scoreLabel}</p>
                            <p style="margin:12px 0 0; color:#475569; font-size:14px; font-style:italic; line-height:1.4;">"${reportData.subtitulo_score}"</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- RESUMEN EJECUTIVO -->
                  <tr>
                    <td style="padding: 0 32px 24px;">
                      <p style="margin:0; color:#334155; font-size:15px; line-height:1.7;">${reportData.resumen_ejecutivo}</p>
                    </td>
                  </tr>

                  <!-- PROBLEMA PREVIEW -->
                  ${firstProblem ? `
                  <tr>
                    <td style="padding: 0 32px 8px;">
                      <p style="margin:0 0 12px; font-size:12px; letter-spacing:1px; text-transform:uppercase; font-weight:700; color:#64748b;">Lo que encontramos:</p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:10px; border-left:4px solid ${etiquetaColor};">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0 0 6px;">
                              <span style="background:${etiquetaBg}; color:${etiquetaColor}; font-size:11px; font-weight:700; letter-spacing:1px; padding:3px 8px; border-radius:4px; text-transform:uppercase;">${firstProblem.etiqueta}</span>
                            </p>
                            <p style="margin:0; font-size:15px; font-weight:700; color:#0f172a; line-height:1.4;">${firstProblem.titulo}</p>
                          </td>
                        </tr>
                      </table>
                      ${remainingProblems > 0 ? `
                      <p style="margin:12px 0 0; color:#64748b; font-size:14px;">
                        + <strong>${remainingProblems} problema${remainingProblems > 1 ? 's' : ''} más</strong> detallado${remainingProblems > 1 ? 's' : ''} en tu reporte completo.
                      </p>` : ''}
                    </td>
                  </tr>` : ''}

                  <!-- CTA PRIMARIO -->
                  <tr>
                    <td style="padding: 24px 32px 32px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background-color:#0f172a; border-radius:10px;">
                            <a href="${reportUrl}" style="display:inline-block; padding:16px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; letter-spacing:0.3px;">
                              Ver mi reporte completo →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="padding: 0 32px;">
                      <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;">
                    </td>
                  </tr>

                  <!-- SECCIÓN LLAMADA -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin:0 0 8px; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:700; color:#64748b;">¿Qué sigue?</p>
                      <h2 style="margin:0 0 12px; font-size:18px; font-weight:800; color:#0f172a; line-height:1.3;">
                        El reporte es el primer paso.
                      </h2>
                      <p style="margin:0 0 20px; color:#475569; font-size:15px; line-height:1.7;">
                        Tenemos un <strong>plan de acción personalizado</strong> para tu empresa: qué cambiar primero, cómo hacerlo y qué resultado esperar. Para recibirlo, necesitamos una conversación de 30 minutos.
                      </p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border:2px solid #0f172a; border-radius:10px;">
                            <a href="${tidycalUrl}" style="display:inline-block; padding:14px 28px; color:#0f172a; text-decoration:none; font-size:15px; font-weight:700;">
                              Agenda una llamada gratuita →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0;">
                      <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                        El Solar Creative Group · Bogotá, Colombia<br>
                        <a href="${reportUrl}" style="color:#94a3b8;">Ver mi reporte</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `
      });
      console.log("Correo enviado con éxito a:", userEmail);
    } catch (emailError) {
      console.error("Error enviando el correo (pero el reporte sí se generó):", emailError);
    }

    // Notificación interna al equipo de El Solar
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const reportUrl = `${siteUrl}/report/${id}`;
      await resend.emails.send({
        from: 'El Solar Creative Group <operaciones@elsolaragencia.co>',
        to: 'operaciones@elsolaragencia.co',
        subject: `🎯 Nuevo lead B2B: ${userEmail} — Score ${reportData.score}/100`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a; margin-bottom: 4px;">Nuevo lead completó su diagnóstico</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 0;">Solar Creative Group · Diagnóstico de Adquisición B2B</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 12px; background: #f8fafc; border-radius: 6px 6px 0 0; color: #64748b; font-size: 13px;">Email</td>
                <td style="padding: 10px 12px; background: #f8fafc; border-radius: 6px 6px 0 0; font-weight: bold;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f1f5f9; color: #64748b; font-size: 13px;">Teléfono / WhatsApp</td>
                <td style="padding: 10px 12px; background: #f1f5f9; font-weight: bold;">${userPhone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f8fafc; color: #64748b; font-size: 13px;">Score</td>
                <td style="padding: 10px 12px; background: #f1f5f9; font-weight: bold; color: ${reportData.score >= 65 ? '#16a34a' : reportData.score >= 50 ? '#ea580c' : '#dc2626'};">${reportData.score} / 100</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f8fafc; border-radius: 0 0 6px 6px; color: #64748b; font-size: 13px;">Perfil</td>
                <td style="padding: 10px 12px; background: #f8fafc; border-radius: 0 0 6px 6px;">${reportData.perfil_empresa}</td>
              </tr>
            </table>
            <div style="padding: 16px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
              <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">${reportData.resumen_ejecutivo}</p>
            </div>
            <a href="${reportUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Ver reporte completo
            </a>
          </div>
        `
      });
      console.log("Notificación interna enviada al equipo.");
    } catch (notifError) {
      console.error("Error enviando notificación interna:", notifError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error catastrófico en la API:", error);
    return NextResponse.json({ error: 'Fallo interno del servidor' }, { status: 500 });
  }
}
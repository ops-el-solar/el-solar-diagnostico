'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      const { data } = await supabase.from('diagnostics').select('*').eq('id', id).single();
      if (data?.ai_report) setReport(data.ai_report);
    };
    fetchReport();
  }, [id, supabase]);

  if (!report) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  // Lógica matemática para el Score Circular
  const getScoreColor = (score: number) => {
    if (score < 50) return '#EF4444'; // Rojo
    if (score < 65) return '#F97316'; // Naranja
    return '#22C55E'; // Verde
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.score / 100) * circumference;
  const scoreColor = getScoreColor(report.score);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER & SCORE CIRCULAR PROGRESS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{report.titulo}</h1>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Círculo de fondo gris */}
                <circle cx="70" cy="70" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="none" />
                {/* Círculo de color progresivo */}
                <circle 
                  cx="70" cy="70" r={radius} 
                  stroke={scoreColor} strokeWidth="12" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-4xl font-black" style={{ color: scoreColor }}>
                {report.score}
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-800 mb-2">{report.subtitulo_score}</p>
              <p className="text-slate-500 text-lg">{report.perfil_empresa}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-200/50 rounded-2xl p-6 border-l-4 border-slate-400">
          <p className="text-slate-700 leading-relaxed text-lg">"{report.resumen_ejecutivo}"</p>
        </div>

        {/* PROBLEMAS IDENTIFICADOS */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold px-2">Cuellos de botella detectados</h2>
          {report.problemas?.map((p: any) => (
            <div key={p.numero} className={`bg-white p-8 rounded-2xl shadow-sm border-l-8 ${p.etiqueta === 'CRÍTICO' ? 'border-red-500' : 'border-orange-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-black tracking-widest uppercase text-slate-400">{p.numero}</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${p.etiqueta === 'CRÍTICO' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.etiqueta}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{p.titulo}</h3>
              <p className="text-slate-600 mb-4">{p.descripcion}</p>
              <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">{p.senal}</p>
            </div>
          ))}
        </div>

        {/* OPORTUNIDADES (NUEVO) */}
        {report.oportunidades && report.oportunidades.length > 0 && (
          <div className="space-y-6 mt-12">
            <h2 className="text-2xl font-bold px-2 text-blue-800">Oportunidades de optimización</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.oportunidades.map((op: any, i: number) => (
                <div key={i} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-blue-500 text-xl">💡</span> {op.titulo}
                  </h3>
                  <p className="text-sm text-blue-800/80 leading-relaxed">{op.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN BLOQUEADA Y CTA ACTUALIZADO */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 mt-12">
          
          <div className="absolute inset-0 p-10 opacity-30 select-none pointer-events-none filter blur-[6px]">
            <h3 className="text-2xl font-black mb-6">Tu Plan de Acción Personalizado</h3>
            <div className="space-y-4">
              <div className="h-6 bg-slate-800 w-3/4 rounded"></div>
              <div className="h-6 bg-slate-800 w-full rounded"></div>
            </div>
          </div>

          <div className="relative z-10 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[22px]">
            <span className="text-5xl mb-6 block">🔒</span>
            
            {/* TEXTO NUEVO SOLICITADO */}
            <h3 className="text-2xl font-bold mb-3 max-w-xl text-slate-900">
              Hemos generado un plan de acción específico y personalizado para tu empresa.
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-lg">
              Recíbelo y descúbrelo en una llamada de diagnóstico estratégica con nuestro equipo de expertos.
            </p>

            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] p-4">
              <div className="tidycal-embed" data-path="elsolar/sesion-de-diagnostico-auditoria-de-adquisicion-b2b"></div>
              <Script src="https://asset-tidycal.b-cdn.net/js/embed.js" strategy="afterInteractive" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
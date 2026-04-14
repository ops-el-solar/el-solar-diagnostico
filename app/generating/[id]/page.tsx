'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STEPS = [
  "Analizando la estructura de tu empresa...",
  "Evaluando canales de adquisición actuales...",
  "Cruzando datos con patrones de crecimiento B2B...",
  "Identificando cuellos de botella críticos...",
  "Calculando tu score de salud comercial...",
  "Redactando plan de acción personalizado..."
];

export default function GeneratingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [currentText, setCurrentText] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Textos cambiando
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3500);

    // Barra de progreso subiendo gradualmente hasta el 98%
    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 98) return 98;
        const diff = Math.random() * 5; // Aumenta entre 0 y 5% aleatoriamente
        return Math.min(oldProgress + diff, 98);
      });
    }, 800);

    const triggerAnalysis = async () => {
      if (hasTriggered.current) return;
      hasTriggered.current = true;

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ id }),
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          setProgress(100); // Llenar al 100% justo antes de redirigir
          setTimeout(() => router.push(`/report/${id}`), 500);
        } else {
          alert("Hubo un error generando tu reporte.");
        }
      } catch (error) {
        console.error("Error de red:", error);
      }
    };

    if (id) triggerAnalysis();

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [id, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full flex flex-col items-center border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 transition-all duration-500 h-16 flex items-center justify-center">
          {STEPS[currentText]}
        </h2>
        
        {/* BARRA DE PROGRESO DINÁMICA */}
        <div className="w-full bg-slate-100 h-3 rounded-full mt-6 overflow-hidden relative">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-slate-400 mt-6 text-sm font-medium uppercase tracking-widest">
          {Math.round(progress)}% COMPLETADO
        </p>
      </div>
    </main>
  );
}
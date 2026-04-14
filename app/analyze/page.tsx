'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import PhoneInput, { type Value as PhoneValue } from 'react-phone-number-input';

const QUESTIONS = [
  { id: 'phone', label: '¿Cuál es tu número de WhatsApp o celular?', type: 'tel' },
  { id: 'p1', label: '¿Cuánto tiempo lleva tu empresa operando?', type: 'select', options: ['Menos de 2 años', 'Entre 2 y 5 años', 'Entre 5 y 15 años', 'Más de 15 años'] },
  { id: 'p2', label: '¿Cuántas personas trabajan actualmente en tu empresa?', type: 'select', options: ['Solo yo o 1-2 personas', 'Entre 3 y 10 personas', 'Entre 10 y 30 personas', 'Más de 30 personas'] },
  // P3 ahora es multi-select
  { id: 'p3', label: '¿De dónde viene la mayoría de tus clientes nuevos hoy? (Puedes elegir varias)', type: 'multi-select', options: ['Referidos y voz a voz', 'Mi red de contactos personales', 'Publicidad paga (Meta, Google, etc.)', 'Prospección activa (LinkedIn, etc.)', 'Venta tradicional (puerta a puerta, relaciones)', 'Otro'] },
  { id: 'p4a', label: '¿Tienes algún canal activo hoy que traiga prospectos de forma predecible?', type: 'select', options: ['Sí, funciona con regularidad', 'No, depende del momento', 'Inconsistentes'], route: 'A' },
  { id: 'p5a', label: '¿Cuánto tiempo dedica tu equipo a la adquisición activa cada semana?', type: 'select', options: ['Menos de 2 horas', 'Entre 2 y 8 horas', 'Más de 8 horas'], route: 'A' },
  { id: 'p4b', label: 'Cuando un prospecto muestra interés, ¿qué pasa normalmente después?', type: 'select', options: ['Proceso claro: reunión y propuesta', 'Depende del vendedor o de mí', 'Seguimiento sin criterio claro'], route: 'B' },
  { id: 'p5b', label: '¿Sabes cuántos prospectos necesitas contactar para cerrar una venta?', type: 'select', options: ['Sí, métrica clara', 'Aproximadamente', 'No, sin registro'], route: 'B' },
  { id: 'p6', label: 'Cuando le explicas a alguien lo que hace tu empresa, ¿qué pasa?', type: 'select', options: ['Lo entienden y preguntan cómo contratar', 'Lo entienden pero no ven relevancia', 'Cuesta explicarlo', 'Depende de a quién se lo cuente'] },
  { id: 'p7', label: '¿Cuál es tu mayor frustración hoy con tu proceso de conseguir clientes?', type: 'textarea' },
];

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const userEmail = searchParams.get('email') || '';

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Estado para el selector de teléfono con código de país
  const [phoneValue, setPhoneValue] = useState<PhoneValue | undefined>(undefined);

  // Estados para manejar la opción "Otro"
  const [isEnteringOther, setIsEnteringOther] = useState(false);
  const [otherText, setOtherText] = useState("");

  const getVisibleQuestions = () => {
    return QUESTIONS.filter(q => {
      if (!q.route) return true;
      const p3 = answers['p3'];
      // Convertimos p3 a string para que la validación funcione tanto si es un string (antes) como si es un array (ahora)
      const p3String = Array.isArray(p3) ? p3.join(' ') : (p3 || '');
      
      if (q.route === 'A' && (p3String.includes('Referidos') || p3String.includes('red') || p3String.includes('Otro'))) return true;
      if (q.route === 'B' && (p3String.includes('Publicidad') || p3String.includes('Prospección') || p3String.includes('Venta') || p3String.includes('Otro'))) return true;
      return false;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentStepIndex];

  const saveToSupabase = async (finalAnswers: Record<string, any>) => {
    setIsFinishing(true);
    const { phone, ...diagnosticAnswers } = finalAnswers;
    const { data, error } = await supabase
      .from('diagnostics')
      .insert([{ answers: diagnosticAnswers, email: userEmail, phone: phone || null, status: 'pending' }])
      .select().single();

    if (!error && data) {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }
      router.push(`/generating/${data.id}`);
    } else {
      setIsFinishing(false);
      alert("Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.");
    }
  };

  const handleNext = (value: string | string[]) => {
    if (typeof value === 'string' && value === 'Otro' && !isEnteringOther) {
      setIsEnteringOther(true);
      return;
    }

    let finalValue = value;
    if (isEnteringOther && typeof value === 'string') {
      finalValue = `Otro: ${otherText}`;
      setIsEnteringOther(false);
      setOtherText("");
    }

    const updatedAnswers = { ...answers, [currentQuestion.id]: finalValue };
    setAnswers(updatedAnswers);

    if (currentStepIndex === visibleQuestions.length - 1) {
      saveToSupabase(updatedAnswers);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  if (isFinishing) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-2xl font-bold text-slate-900">Procesando tus respuestas...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">
        Paso {currentStepIndex + 1} de {visibleQuestions.length}
      </span>
      <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
        {currentQuestion.label}
      </h2>

      <div className="grid gap-3">
        {/* RENDERIZADO PARA TEL */}
        {currentQuestion.type === 'tel' ? (
          <div className="space-y-4">
            <PhoneInput
              defaultCountry="CO"
              value={phoneValue}
              onChange={(val) => {
                setPhoneValue(val);
                setAnswers({ ...answers, [currentQuestion.id]: val || '' });
              }}
              placeholder="300 123 4567"
              autoFocus
            />
            <button
              onClick={() => handleNext(phoneValue || '')}
              disabled={!phoneValue}
              className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Continuar →
            </button>
          </div>

        /* RENDERIZADO PARA MULTI-SELECT */
        ) : currentQuestion.type === 'multi-select' ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {currentQuestion.options?.map(opt => {
                const isSelected = (answers[currentQuestion.id] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const current = answers[currentQuestion.id] || [];
                      if (current.includes(opt)) {
                        setAnswers({ ...answers, [currentQuestion.id]: current.filter((item: string) => item !== opt) });
                      } else {
                        setAnswers({ ...answers, [currentQuestion.id]: [...current, opt] });
                      }
                    }}
                    className={`w-full p-5 text-left border-2 rounded-2xl transition-all font-medium flex items-center justify-between
                      ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-700 hover:border-blue-300'}`}
                  >
                    <span>{opt}</span>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                      {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Input "Otro" condicional para Multi-Select */}
            {(answers[currentQuestion.id] || []).includes('Otro') && (
              <input 
                type="text"
                autoFocus
                className="w-full p-5 border-2 border-blue-500 rounded-2xl outline-none text-slate-700 shadow-sm animate-in fade-in zoom-in-95"
                placeholder="Especifica tu otra fuente de clientes..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            )}

            <button 
              onClick={() => {
                let current = answers[currentQuestion.id] || [];
                if (current.length === 0) return; 
                
                let finalAnswers = { ...answers };
                if (current.includes('Otro') && otherText) {
                  finalAnswers[currentQuestion.id] = current.map((item: string) => item === 'Otro' ? `Otro: ${otherText}` : item);
                }
                
                setAnswers(finalAnswers);
                
                if (currentStepIndex === visibleQuestions.length - 1) {
                  saveToSupabase(finalAnswers);
                } else {
                  setCurrentStepIndex(prev => prev + 1);
                  setOtherText(""); 
                }
              }}
              disabled={(answers[currentQuestion.id] || []).length === 0 || ((answers[currentQuestion.id] || []).includes('Otro') && !otherText)}
              className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-50 mt-4 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Continuar →
            </button>
          </div>

        /* RENDERIZADO PARA SELECT ÚNICO */
        ) : currentQuestion.type === 'select' && !isEnteringOther ? (
          currentQuestion.options?.map(opt => (
            <button key={opt} onClick={() => handleNext(opt)} className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-slate-700">
              {opt}
            </button>
          ))

        /* RENDERIZADO CUANDO SE ELIGE "OTRO" EN SELECT ÚNICO */
        ) : isEnteringOther ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <input 
              type="text"
              autoFocus
              className="w-full p-5 border-2 border-blue-500 rounded-2xl outline-none text-slate-700 shadow-sm"
              placeholder="Especifica tu respuesta..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && otherText && handleNext('Otro')}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsEnteringOther(false)} className="w-1/3 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200">
                Volver
              </button>
              <button onClick={() => handleNext('Otro')} disabled={!otherText} className="w-2/3 py-5 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-50">
                Continuar
              </button>
            </div>
          </div>

        /* RENDERIZADO PARA TEXTAREA (Última pregunta) */
        ) : (
          <div className="space-y-4">
            <textarea
              className="w-full p-5 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none min-h-[120px] text-slate-700"
              placeholder="Escribe aquí tu respuesta..."
              onBlur={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            />
            <button onClick={() => handleNext(answers[currentQuestion.id] || '')} className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              Finalizar Diagnóstico
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
        <Suspense fallback={<p className="text-center">Cargando...</p>}>
          <AnalyzeContent />
        </Suspense>
      </div>
    </main>
  );
}
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./components/ThemeToggle";
import Reveal from "./components/Reveal";

/* ─────────────────────────────────────────────
   Iconos SVG
───────────────────────────────────────────── */
function IconSearch() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function IconStar() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>; }
function IconShare() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>; }
function IconGlobe() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>; }
function IconMapPin() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function IconTrending() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }
function IconArrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>; }
function IconQuote() { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-20"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>; }

/* ─────────────────────────────────────────────
   Datos Estáticos
───────────────────────────────────────────── */
const testimonials = [
  {
    initials: "MM",
    color: "bg-orange-600",
    quote: "Desde que arrancamos con la publicidad generamos 583 contactos. El trabajo fue sorprendente, considerando que el área técnica de mi negocio no es la especialidad de la agencia. El nivel de servicio y respuesta ha sido excelente — muy recomendable.",
    name: "Miguel Ángel M.",
    role: "Fundador — Manual del Independiente",
    city: "Argentina",
  },
  {
    initials: "DR",
    color: "bg-purple-600",
    quote: "Pensaba que mi proceso comercial era el problema. Resultó que mi propuesta de valor no estaba diferenciada. Un insight que cambió mi enfoque completamente.",
    name: "Daniela R.",
    role: "Directora Comercial — Empresa de Servicios IT",
    city: "Medellín",
  },
  {
    initials: "AP",
    color: "bg-indigo-600",
    quote: "En menos de 2 minutos tuve claridad sobre algo que llevaba meses tratando de entender: por qué llegaban prospectos pero no cerraban.",
    name: "Andrés P.",
    role: "CEO — Consultoría Empresarial",
    city: "Bogotá",
  },
];

const features = [
  { icon: <IconSearch />, label: "FUENTES DE ADQUISICIÓN", title: "¿De dónde vienen tus clientes hoy?", desc: "Evaluamos si tu mix de canales —referidos, publicidad, prospección activa— es sostenible o si depende de la suerte y el momento.", accent: "purple", wide: true },
  { icon: <IconStar />, label: "CANAL PREDECIBLE", title: "Consistencia en el flujo de prospectos", desc: "Identificamos si tienes un sistema que opera con regularidad o si el negocio llega solo cuando hay momentum.", accent: "green", wide: false },
  { icon: <IconShare />, label: "PROCESO COMERCIAL", title: "Qué pasa después del primer contacto", desc: "Analizamos si hay un proceso claro de seguimiento o si cada oportunidad depende de quién la atiende.", accent: "purple", wide: false },
  { icon: <IconGlobe />, label: "ESFUERZO VS. SISTEMA", title: "Tiempo y recursos invertidos en vender", desc: "Medimos si tu equipo dedica tiempo real a la adquisición activa y si esa inversión tiene estructura detrás.", accent: "green", wide: false },
  { icon: <IconMapPin />, label: "PROPUESTA DE VALOR", title: "Claridad del mensaje de tu empresa", desc: "Detectamos si tu oferta genera interés inmediato o si cuesta explicar lo que haces y por qué le importa al cliente.", accent: "purple", wide: false },
  { icon: <IconTrending />, label: "INFORME ESTRATÉGICO", title: "Plan de acción priorizado para tu empresa", desc: "Las 2 o 3 palancas de mayor impacto en tu sistema de adquisición, con señales claras de dónde actuar primero.", accent: "green", wide: true },
];

const steps = [
  { num: "01", title: "Ingresa tu email de negocio", desc: "Es el único dato que necesitamos para empezar." },
  { num: "02", title: "Responde 9 preguntas clave", desc: "Nuestro motor analiza tu sistema comercial." },
  { num: "03", title: "Recibe tu informe al instante", desc: "Un diagnóstico claro con puntuación y próximos pasos." },
];

const trustItems = [
  "Sin pitch de ventas",
  "Sin propuestas no solicitadas",
  "Solo el diagnóstico, 100% gratuito",
];

export default function Home() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return;
    router.push(`/analyze?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen transition-colors duration-300">

      {/* ══ NAVBAR ══ */}
      <header className="sticky top-0 z-50 border-b border-light-border dark:border-dark-border bg-light-card/70 dark:bg-dark-card/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://elsolaragencia.co">
            <img src="/logo-white.png" alt="El Solar" className="h-6 w-auto hidden dark:block" />
            <img src="/logo-blue.png" alt="El Solar" className="h-6 w-auto block dark:hidden" />
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden min-h-[calc(100vh-56px)] flex flex-col justify-center bg-gradient-to-br from-[#F5F8FF] via-[#F0F4FF] to-[#EAF0FF] dark:from-[#050505] dark:via-[#070710] dark:to-[#0A0A1A]">

        {/* Orbes de fondo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-500/6 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 pt-12 pb-20 w-full">

          {/* Badge */}
          <div className="hero-item hero-d1 mb-8 inline-flex">
            <span className="inline-flex items-center gap-2 border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-accent text-[10px] uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Diagnóstico B2B · El Solar Creative Group
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-item hero-d2 font-display text-5xl sm:text-6xl lg:text-[4.2rem] font-medium leading-[1.06] tracking-tight max-w-2xl mb-4">
            Tu negocio genera interés.{" "}
            <span className="text-light-muted dark:text-dark-muted">Pero no cierra ventas.</span>
          </h1>
          <p className="hero-item hero-d3 font-sans font-light text-lg text-light-muted dark:text-dark-muted mb-10 max-w-xl">
            Descubre exactamente <strong className="text-blue-600 dark:text-blue-400 font-medium">por qué</strong> — y las 2 o 3 palancas que debes mover primero. Gratis, en menos de 2 minutos.
          </p>

          {/* Form card */}
          <div className="hero-item hero-d4">
            <form onSubmit={handleStart}>
              <div className="bg-white dark:bg-dark-card border border-[#D1D5DB] dark:border-dark-border shadow-lg dark:shadow-none rounded-xl p-3 sm:p-2 flex flex-col sm:flex-row gap-2 max-w-xl">
                <input
                  type="email"
                  required
                  placeholder="tu@empresa.com"
                  className="form-email-input flex-1 bg-[#F8FAFF] dark:bg-[#0F0F0F] border border-[#E2E8F0] dark:border-[#2A2A2A] rounded-lg px-5 font-sans font-light text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder:text-[#9CA3AF] dark:placeholder:text-[#555555] text-[#111111] dark:text-[#EDEDED] transition-all"
                  style={{ height: "52px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="form-submit-btn btn-fill inline-flex items-center justify-center gap-2.5 bg-blue-600 text-white font-accent text-[10px] uppercase tracking-[0.22em] px-7 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  style={{ height: "52px" }}
                >
                  <span>Quiero mi diagnóstico</span>
                  <IconArrow />
                </button>
              </div>

              {/* Trust checkmarks */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-1">
                {["Gratis", "Resultado en menos de 2 min", "Sin llamada de ventas"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 font-accent text-[10px] uppercase tracking-[0.18em] text-light-muted dark:text-dark-muted">
                    <span className="text-green-500 flex-shrink-0"><IconCheck /></span>
                    {item}
                  </span>
                ))}
              </div>
            </form>
          </div>

          {/* Preview del informe */}
          <div className="hero-item hero-d5 mt-14">
            <p className="font-accent text-[9px] uppercase tracking-[0.28em] text-light-muted dark:text-dark-muted mb-4">
              Vista previa del informe que recibirás
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {/* Card 1: Score */}
              <div className="bg-white dark:bg-dark-card border border-[#E2E8F0] dark:border-dark-border rounded-lg p-4 shadow-sm">
                <p className="font-accent text-[8px] uppercase tracking-widest text-light-muted dark:text-dark-muted mb-2">Score total</p>
                <p className="font-display text-3xl font-medium leading-none">68<span className="text-sm text-light-muted dark:text-dark-muted font-light">/100</span></p>
                <div className="mt-2.5 h-1 bg-[#F0F0F0] dark:bg-dark-border rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: "68%" }} />
                </div>
                <p className="mt-2 font-accent text-[8px] uppercase tracking-widest text-yellow-600 dark:text-yellow-400">Mejorable</p>
              </div>
              {/* Card 2: Canal */}
              <div className="bg-white dark:bg-dark-card border border-[#E2E8F0] dark:border-dark-border rounded-lg p-4 shadow-sm">
                <p className="font-accent text-[8px] uppercase tracking-widest text-light-muted dark:text-dark-muted mb-2">Canal principal</p>
                <p className="font-display text-sm font-medium leading-snug">Solo referidos</p>
                <div className="mt-2.5 h-1 bg-[#F0F0F0] dark:bg-dark-border rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "30%" }} />
                </div>
                <p className="mt-2 font-accent text-[8px] uppercase tracking-widest text-red-500">Punto de falla</p>
              </div>
              {/* Card 3: Próxima acción */}
              <div className="bg-white dark:bg-dark-card border border-[#E2E8F0] dark:border-dark-border rounded-lg p-4 shadow-sm">
                <p className="font-accent text-[8px] uppercase tracking-widest text-light-muted dark:text-dark-muted mb-2">Próxima acción</p>
                <p className="font-display text-sm font-medium leading-snug">Diversificar fuentes</p>
                <div className="mt-2.5 h-1 bg-[#F0F0F0] dark:bg-dark-border rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }} />
                </div>
                <p className="mt-2 font-accent text-[8px] uppercase tracking-widest text-blue-600 dark:text-blue-400">Alta prioridad</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <div className="border-y border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {trustItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 font-accent text-[10px] uppercase tracking-[0.22em] text-light-muted dark:text-dark-muted">
              <span className="text-green-500"><IconCheck /></span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ TESTIMONIOS ══ */}
      <section className="border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Reveal className="mb-12 text-center">
            <p className="font-accent text-[10px] uppercase tracking-[0.32em] text-light-muted dark:text-dark-muted">
              Lo que descubren quienes lo hacen
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ initials, color, quote, name, role, city }, i) => (
              <Reveal key={name} delay={i * 80} className="relative bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="font-accent text-[11px] font-medium text-white tracking-wide">{initials}</span>
                  </div>
                  <IconQuote />
                </div>
                <p className="font-sans font-light text-sm leading-relaxed text-light-text dark:text-dark-text italic flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="border-t border-light-border dark:border-dark-border pt-4">
                  <p className="font-accent text-[10px] uppercase tracking-[0.18em] text-light-text dark:text-dark-text">{name}</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.15em] text-light-muted dark:text-dark-muted mt-0.5">{role} · {city}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESULTADOS REALES ══ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Reveal className="mb-14 text-center">
          <p className="font-accent text-[10px] uppercase tracking-[0.32em] text-light-muted dark:text-dark-muted mb-3">
            Resultados reales con El Solar
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
            Números que hablan por sí solos.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Tarjeta MDI con screenshot real */}
          <Reveal delay={0} className="relative bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden sm:col-span-3">
            <div className="border-b border-light-border dark:border-dark-border overflow-hidden">
              <img
                src="/mdi-metrics.png"
                alt="Resultados de campaña Meta Ads — Manual del Independiente"
                className="w-full object-cover object-top"
                style={{ maxHeight: "220px" }}
              />
            </div>
            <div className="p-5 flex flex-wrap gap-6 items-center justify-between">
              <div>
                <p className="font-accent text-[10px] uppercase tracking-[0.18em] text-light-text dark:text-dark-text">Manual del Independiente</p>
                <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted mt-0.5">Cursos técnicos · Argentina</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-blue-600 dark:text-blue-400">646</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">conversaciones</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-green-600 dark:text-green-400">$0.21</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">costo por resultado</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-purple-600 dark:text-purple-400">199K</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">impresiones</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Tarjeta Kizen con screenshot real */}
          <Reveal delay={80} className="relative bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden sm:col-span-3">
            <div className="border-b border-light-border dark:border-dark-border overflow-hidden">
              <img
                src="/kizen-metrics.png"
                alt="Resultados de campaña Meta Ads — Kizen"
                className="w-full object-cover object-top"
                style={{ maxHeight: "220px" }}
              />
            </div>
            <div className="p-5 flex flex-wrap gap-6 items-center justify-between">
              <div>
                <p className="font-accent text-[10px] uppercase tracking-[0.18em] text-light-text dark:text-dark-text">Pilar</p>
                <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted mt-0.5">Consultoría de trámites migratorios · Canadá</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-blue-600 dark:text-blue-400">171</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">conversaciones</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-green-600 dark:text-green-400">$0.60</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">costo por resultado</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-semibold text-purple-600 dark:text-purple-400">15.7K</p>
                  <p className="font-accent text-[9px] uppercase tracking-[0.14em] text-light-muted dark:text-dark-muted">impresiones</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FEATURES BENTO ══ */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <Reveal className="mb-20">
          <p className="font-accent text-[10px] uppercase tracking-[0.32em] text-light-muted dark:text-dark-muted mb-4">Qué analizamos</p>
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight max-w-xl">Tu sistema de adquisición B2B, analizado en detalle.</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-light-border dark:bg-dark-border border border-light-border dark:border-dark-border">
          {features.map(({ icon, label, title, desc, accent, wide }, i) => (
            <Reveal key={title} delay={i * 55} className={`relative bg-light-card dark:bg-dark-card p-8 overflow-hidden ${wide ? "sm:col-span-2 lg:col-span-2" : ""}`}>
              <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${accent === "purple" ? "bg-purple-500/5" : "bg-green-500/5"}`} />
              <span className="text-light-muted dark:text-dark-muted mb-6 block">{icon}</span>
              <p className="font-accent text-[10px] uppercase tracking-[0.22em] text-light-muted dark:text-dark-muted mb-3">{label}</p>
              <h3 className="font-display text-lg font-medium mb-3">{title}</h3>
              <p className="font-sans font-light text-sm text-light-muted dark:text-dark-muted leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <Reveal className="mb-20">
            <p className="font-accent text-[10px] uppercase tracking-[0.32em] text-light-muted dark:text-dark-muted mb-4">El proceso</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">Tres pasos. Ningún rodeo.</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-light-border dark:bg-dark-border border border-light-border dark:border-dark-border">
            {steps.map(({ num, title, desc }, i) => (
              <Reveal key={num} delay={i * 100} className="bg-light-bg dark:bg-dark-bg p-10">
                <span className="font-display text-7xl font-medium text-light-border dark:text-dark-border block mb-8 select-none leading-none">{num}</span>
                <h3 className="font-display text-base font-medium mb-3">{title}</h3>
                <p className="font-sans font-light text-sm text-light-muted dark:text-dark-muted leading-relaxed">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <Reveal className="relative overflow-hidden border border-light-border dark:border-dark-border bg-gradient-to-br from-[#F5F8FF] to-[#EEF2FF] dark:from-dark-card dark:to-[#0A0A18] rounded-2xl p-14 sm:p-20 text-center flex flex-col items-center">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <p className="font-accent text-[10px] uppercase tracking-[0.32em] text-light-muted dark:text-dark-muted mb-5">
            Sin rodeos
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-4 leading-tight max-w-2xl">
            No hacemos pitch de ventas.<br />Hacemos diagnóstico.
          </h2>
          <p className="font-sans font-light text-base text-light-muted dark:text-dark-muted mb-12 max-w-md">
            Recibes un informe claro con tu puntuación y las acciones específicas que debes tomar primero.
          </p>

          <form onSubmit={handleStart} className="w-full max-w-sm flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="tu@empresa.com"
              className="w-full bg-white dark:bg-[#0F0F0F] border border-[#D1D5DB] dark:border-[#2A2A2A] rounded-lg px-5 font-sans font-light text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder:text-[#9CA3AF] dark:placeholder:text-[#555555] text-[#111111] dark:text-[#EDEDED] transition-all shadow-sm"
              style={{ height: "52px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="btn-fill w-full bg-blue-600 text-white font-accent text-[10px] uppercase tracking-[0.22em] rounded-lg hover:bg-blue-700 transition-colors border border-blue-600"
              style={{ height: "52px" }}
            >
              Ver dónde pierdo clientes
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
            {["Gratis", "Menos de 2 min", "Sin llamada de ventas"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 font-accent text-[9px] uppercase tracking-[0.18em] text-light-muted dark:text-dark-muted">
                <span className="text-green-500"><IconCheck /></span>
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-light-border dark:border-dark-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-5">
          <span className="font-accent text-xs uppercase tracking-[0.22em]">Solar Creative Group</span>

          {/* Redes sociales */}
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/elsolar.creativegroup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-accent text-[10px] uppercase tracking-[0.18em] text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              El Solar
            </a>
            <a
              href="https://instagram.com/jara.mkt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-accent text-[10px] uppercase tracking-[0.18em] text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              Jara
            </a>
          </div>

          <p className="font-accent text-[10px] uppercase tracking-[0.22em] text-light-muted dark:text-dark-muted">
            © {new Date().getFullYear()} · Diagnóstico digital B2B
          </p>
        </div>
      </footer>
      {/* ══ WHATSAPP STICKY ══ */}
      <a
        href="https://wa.me/573203223580?text=Hola%2C%20vengo%20desde%20la%20web%20del%20diagn%C3%B3stico%20B2B"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatea por WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg hover:shadow-xl rounded-full px-4 py-3 transition-all duration-200 group"
      >
        {/* Ícono WhatsApp */}
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.054 23.25a.75.75 0 0 0 .916.921l5.453-1.49A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.942-1.354l-.355-.212-3.676 1.004 1.004-3.588-.232-.368A9.693 9.693 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        <span className="font-accent text-[10px] uppercase tracking-[0.18em] whitespace-nowrap">
          Escríbenos
        </span>
      </a>

    </main>
  );
}

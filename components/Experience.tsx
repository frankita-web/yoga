"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAKRA_ARC, STAGE, WEEK_ARC, arcPath } from "@/lib/arc";
import { CHAKRAS } from "@/lib/chakras";
import { summarize } from "@/lib/practiceStore";
import { usePracticeStore, useToday } from "@/lib/usePractice";
import { dayName, shortDate } from "@/lib/week";
import AshtangaPlayer from "./AshtangaPlayer";
import ChakraArc from "./ChakraArc";
import ChakraBody, { type BodyMode } from "./ChakraBody";
import DailyHeader from "./DailyHeader";
import InviteButton from "./InviteButton";
import SavasanaTimer from "./SavasanaTimer";
import WeekTracker from "./WeekTracker";

// Bottom-to-top order, as chakras are counted (1 = root).
const ASCENDING = [...CHAKRAS].reverse();
const LISTEN_TICK = 5;

export default function Experience() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [resting, setResting] = useState(false);
  const [pauseAshtanga, setPauseAshtanga] = useState(0);
  const [pauseSavasana, setPauseSavasana] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const today = useToday();
  const store = usePracticeStore();

  const mode: BodyMode = resting ? "savasana" : practicing ? "practice" : "idle";

  // While a class or savasana plays, light the chakras one by one:
  // rising with the practice, descending (grounding) in savasana.
  const [beat, setBeat] = useState<{ mode: BodyMode; n: number }>({ mode: "idle", n: 0 });
  useEffect(() => {
    if (mode === "idle") return;
    const step = mode === "practice" ? 4000 : 60000 / CHAKRAS.length;
    const t = setInterval(() => {
      setBeat((b) => (b.mode === mode ? { mode, n: b.n + 1 } : { mode, n: 1 }));
    }, step);
    return () => clearInterval(t);
  }, [mode]);
  const order = mode === "practice" ? ASCENDING : CHAKRAS;
  const ambient = mode === "idle" ? null : order[(beat.mode === mode ? beat.n : 0) % order.length].id;

  // Listening to a class counts toward today's practice.
  useEffect(() => {
    if (!practicing || !today) return;
    const t = setInterval(() => {
      if (!store.addListened(today, LISTEN_TICK)) return;
      const { count, goal } = summarize(store.getSnapshot(), today);
      setToast(`Práctica registrada · ${count} de ${goal} esta semana`);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    }, LISTEN_TICK * 1000);
    return () => clearInterval(t);
  }, [practicing, today, store]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onPracticeChange = useCallback((playing: boolean) => {
    setPracticing(playing);
    if (playing) setPauseSavasana((n) => n + 1);
  }, []);

  const onRestChange = useCallback((running: boolean) => {
    setResting(running);
    if (running) setPauseAshtanga((n) => n + 1);
  }, []);

  const select = (id: string) => setSelected((s) => (s === id ? null : id));

  const activeId = hovered ?? selected ?? ambient;
  const active = CHAKRAS.find((c) => c.id === activeId) ?? null;
  const number = active ? ASCENDING.indexOf(active) + 1 : null;

  return (
    <div className="app" data-mode={mode} style={{ ["--accent" as string]: active?.color ?? "#d9d9d6" }}>
      <header className="topbar">
        <span className="wordmark">Prana</span>
        <span className="topbar__end">
          <span className="mono">{today ? `${dayName(today)} ${shortDate(today)}` : ""}</span>
          <InviteButton />
        </span>
      </header>

      <DailyHeader />

      <main className="stage">
        <svg className="stage__rails" viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} aria-hidden="true">
          <path d={arcPath(CHAKRA_ARC)} />
          <path d={arcPath(WEEK_ARC)} />
        </svg>

        <p className="stage__title mono" aria-live="polite">
          {active ? `Chakra ${number} de 7 · ${active.sanskrit}` : "Elige un chakra"}
        </p>

        <ChakraArc active={active} selected={selected} onHover={setHovered} onSelect={select} />

        <div className="orbit">
          <svg className="orbit__ring" viewBox="0 0 560 560" aria-hidden="true">
            <g className="orbit__spin">
              <circle cx="280" cy="280" r="272" className="orbit__dots" />
              <circle cx="280" cy="8" r="6" className="orbit__bead" />
              <circle cx="44.4" cy="416" r="6" className="orbit__bead" />
              <circle cx="535.6" cy="187" r="6" className="orbit__bead" />
            </g>
          </svg>
          <div className="orbit__sphere" />
          <ChakraBody active={active} mode={mode} onHover={setHovered} onSelect={select} />
        </div>

        <div className="stage__detail">
          {active ? (
            <div key={active.id} className="stage__detail-inner">
              <p className="stage__essence">{active.essence}</p>
              <p className="mono stage__facts">
                {active.location} · {active.element} · Mantra {active.mantra} · {active.petals} pétalos
              </p>
            </div>
          ) : (
            <p className="mono stage__facts">Siete centros de energía, de la raíz a la corona</p>
          )}
        </div>

        <AshtangaPlayer onPlayingChange={onPracticeChange} pauseSignal={pauseAshtanga} />
        <SavasanaTimer onRunningChange={onRestChange} pauseSignal={pauseSavasana} />
        <WeekTracker />
      </main>

      <div className="toast mono" data-show={toast ? "true" : "false"} role="status">
        {toast}
      </div>

      <footer className="footer mono">
        Clases vía YouTube: R. Sharath Jois, Philippa Asher y Krista · Tu registro se guarda en este navegador
      </footer>
    </div>
  );
}

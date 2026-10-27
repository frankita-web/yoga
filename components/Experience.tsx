"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAKRAS } from "@/lib/chakras";
import AshtangaPlayer from "./AshtangaPlayer";
import ChakraBody, { type BodyMode } from "./ChakraBody";
import SavasanaTimer from "./SavasanaTimer";

// Bottom-to-top order, as chakras are counted (1 = root).
const ASCENDING = [...CHAKRAS].reverse();

export default function Experience() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [resting, setResting] = useState(false);
  const [pauseAshtanga, setPauseAshtanga] = useState(0);
  const [pauseSavasana, setPauseSavasana] = useState(0);

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
    <div
      className="experience"
      data-mode={mode}
      style={{ ["--accent" as string]: active?.color ?? "#5E5CE6" }}
    >
      <div className="aura" aria-hidden="true" data-on={active ? "true" : "false"} />

      <header className="hero">
        <span className="hero__eyebrow">Prana</span>
        <h1 className="hero__title">
          Siente cada <span className="hero__gradient">chakra.</span>
        </h1>
        <p className="hero__lede">Toca o pasa el cursor por el cuerpo. Dale play. Respira.</p>
      </header>

      <main className="stage">
        <div className="stage__player">
          <AshtangaPlayer onPlayingChange={onPracticeChange} pauseSignal={pauseAshtanga} />
        </div>

        <div className="stage__body">
          <ChakraBody active={active} mode={mode} onHover={setHovered} onSelect={select} />

          <div className="chakra-card" data-empty={active ? "false" : "true"} aria-live="polite">
            {active ? (
              <div className="chakra-card__inner" key={active.id}>
                <div className="chakra-card__top">
                  <span className="chakra-card__dot" />
                  <span className="chakra-card__num">Chakra {number} de 7</span>
                </div>
                <h3 className="chakra-card__name">{active.sanskrit}</h3>
                <p className="chakra-card__es">{active.name}</p>
                <p className="chakra-card__essence">{active.essence}</p>
                <dl className="chakra-card__facts">
                  <div>
                    <dt>Ubicación</dt>
                    <dd>{active.location}</dd>
                  </div>
                  <div>
                    <dt>Elemento</dt>
                    <dd>{active.element}</dd>
                  </div>
                  <div>
                    <dt>Mantra</dt>
                    <dd>{active.mantra}</dd>
                  </div>
                  <div>
                    <dt>Pétalos</dt>
                    <dd>{active.petals}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="chakra-card__hint">Pasa el cursor sobre un chakra para descubrirlo.</p>
            )}
          </div>

          <nav className="chakra-dots" aria-label="Elegir chakra">
            {ASCENDING.map((c, i) => (
              <button
                key={c.id}
                className="chakra-dots__dot"
                data-active={active?.id === c.id ? "true" : "false"}
                style={{ ["--c" as string]: c.color }}
                onClick={() => select(c.id)}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`${i + 1}. ${c.sanskrit}`}
                aria-pressed={selected === c.id}
              />
            ))}
          </nav>
        </div>

        <div className="stage__savasana">
          <SavasanaTimer onRunningChange={onRestChange} pauseSignal={pauseSavasana} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Clases de Ashtanga vía YouTube: R. Sharath Jois, Philippa Asher y Krista. Todo el crédito a sus
          autores.
        </p>
      </footer>
    </div>
  );
}

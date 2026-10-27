"use client";

import { useEffect, useRef, useState } from "react";
import { SavasanaAudio } from "@/lib/savasanaAudio";
import { formatTime } from "@/lib/classes";
import { PauseIcon, PlayIcon, ResetIcon } from "./icons";

const DURATION = 60;
const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CUES: [number, string][] = [
  [0, "Acuéstate boca arriba"],
  [10, "Brazos sueltos, palmas al cielo"],
  [22, "Respira suave por la nariz"],
  [36, "Deja que el cuerpo pese"],
  [50, "Vuelve lentamente"],
];

type Status = "ready" | "running" | "paused" | "done";

type Props = {
  onRunningChange: (running: boolean) => void;
  pauseSignal: number;
};

export default function SavasanaTimer({ onRunningChange, pauseSignal }: Props) {
  const [status, setStatus] = useState<Status>("ready");
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<SavasanaAudio | null>(null);
  const elapsedRef = useRef(0);
  const statusRef = useRef<Status>("ready");

  const onRunningChangeRef = useRef(onRunningChange);
  useEffect(() => {
    onRunningChangeRef.current = onRunningChange;
  });

  useEffect(() => {
    statusRef.current = status;
    onRunningChangeRef.current(status === "running");
  }, [status]);

  useEffect(() => {
    if (status !== "running") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsedRef.current = Math.min(DURATION, elapsedRef.current + (now - last) / 1000);
      last = now;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= DURATION) {
        audioRef.current?.bowl(196);
        audioRef.current?.stop(6);
        setStatus("done");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  useEffect(() => {
    if (pauseSignal > 0 && statusRef.current === "running") {
      audioRef.current?.pause();
      setStatus("paused");
    }
  }, [pauseSignal]);

  useEffect(() => () => void audioRef.current?.close(), []);

  const audio = () => (audioRef.current ??= new SavasanaAudio());

  const start = async () => {
    elapsedRef.current = 0;
    setElapsed(0);
    setStatus("running");
    await audio().start();
    audio().bowl(196);
  };

  const toggle = async () => {
    if (status === "running") {
      setStatus("paused");
      await audio().pause();
    } else if (status === "paused") {
      setStatus("running");
      await audio().resume();
    } else {
      await start();
    }
  };

  const reset = () => {
    audioRef.current?.stop(1.2);
    elapsedRef.current = 0;
    setElapsed(0);
    setStatus("ready");
  };

  const shown = status === "done" ? 0 : Math.ceil(DURATION - elapsed);
  const progress = elapsed / DURATION;
  const cue =
    status === "done"
      ? "Namasté"
      : status === "ready"
        ? "Un minuto para soltar"
        : [...CUES].reverse().find(([t]) => elapsed >= t)![1];

  return (
    <section className="card savasana" data-status={status} aria-labelledby="savasana-title">
      <header className="card__header">
        <span className="card__eyebrow">Relajación final</span>
        <h2 id="savasana-title" className="card__title">Savasana</h2>
        <p className="card__subtitle">Dale play, acuéstate y cierra los ojos. Un cuenco te avisa al terminar.</p>
      </header>

      <div className="dial">
        <svg viewBox="0 0 220 220" className="dial__svg" aria-hidden="true">
          <defs>
            <linearGradient id="savasana-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#BF5AF2" />
              <stop offset="0.5" stopColor="#5E5CE6" />
              <stop offset="1" stopColor="#32ADE6" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r={RADIUS} className="dial__track" />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            className="dial__progress"
            stroke="url(#savasana-ring)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="dial__orb" />
        <div className="dial__center">
          <span className="dial__time" aria-live="off">
            {formatTime(shown)}
          </span>
          <span className="dial__cue" key={cue} aria-live="polite">
            {cue}
          </span>
        </div>
      </div>

      <div className="transport">
        <button
          className="icon-btn"
          onClick={reset}
          disabled={status === "ready"}
          aria-label="Reiniciar savasana"
        >
          <ResetIcon size={22} />
        </button>
        <button
          className="play-btn play-btn--calm"
          onClick={toggle}
          aria-label={status === "running" ? "Pausar savasana" : "Comenzar savasana"}
        >
          {status === "running" ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
        </button>
        <span className="icon-btn icon-btn--ghost" aria-hidden="true" />
      </div>

      <p className="savasana__hint">Mejor con audífonos · 1 minuto</p>
    </section>
  );
}

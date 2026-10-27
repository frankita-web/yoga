"use client";

import { useEffect, useRef, useState } from "react";
import { SavasanaAudio } from "@/lib/savasanaAudio";
import { formatTime } from "@/lib/classes";
import { PauseIcon, PlayIcon, ResetIcon } from "./icons";

const DURATION = 60;
const RADIUS = 104;
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
    <section className="savasana" data-status={status} aria-label="Savasana de un minuto">
      <div className="savasana__circle">
        <svg viewBox="0 0 220 220" className="savasana__ring" aria-hidden="true">
          <circle cx="110" cy="110" r={RADIUS} className="savasana__track" />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            className="savasana__progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="savasana__orb" />
        <div className="savasana__center">
          <span className="savasana__time">{formatTime(shown)}</span>
          <span className="savasana__cue" key={cue} aria-live="polite">
            {cue}
          </span>
        </div>
        <button
          className="badge badge--violet badge--button"
          onClick={toggle}
          aria-label={status === "running" ? "Pausar savasana" : "Comenzar savasana"}
        >
          {status === "running" ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
      </div>

      <div className="pill savasana__pill">
        <span className="pill__text">
          <strong>Savasana · 1 minuto</strong>
          <span className="mono">Cierra los ojos</span>
        </span>
        <button className="pill__tool" onClick={reset} disabled={status === "ready"} aria-label="Reiniciar savasana">
          <ResetIcon size={18} />
        </button>
      </div>
    </section>
  );
}

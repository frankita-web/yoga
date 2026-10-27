"use client";

import { useEffect, useRef, useState } from "react";
import { CHAKRAS } from "@/lib/chakras";
import { REPETITIONS, mantraFor } from "@/lib/mantras";
import { summarize } from "@/lib/practiceStore";
import { greeting } from "@/lib/profile";
import { markMantraSeen, useHour, useMantraSeen, usePractice, useProfile, useToday } from "@/lib/usePractice";
import { dayName, shortDate } from "@/lib/week";

const BEAD_RADIUS = 104;

function weekLine(count: number, goal: number) {
  if (count >= goal) return "Meta de la semana cumplida. Qué constancia.";
  if (count === 0) return `Tu meta son ${goal} prácticas esta semana. Hoy puede ser la primera.`;
  const left = goal - count;
  return `Vas ${count} de ${goal} esta semana. ${left === 1 ? "Te falta solo 1." : `Te faltan ${left}.`}`;
}

export default function DailyHeader() {
  const today = useToday();
  const hour = useHour();
  const seen = useMantraSeen();
  const practice = usePractice();
  const { id: profileId, name } = useProfile();
  const [reopened, setReopened] = useState(false);
  const [count, setCount] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const mantra = today ? mantraFor(today) : null;
  const chakra = CHAKRAS.find((c) => c.id === mantra?.chakra);
  const summary = today ? summarize(practice, today) : null;
  // Opens by itself the first visit of each day; the pill reopens it.
  const open = !!mantra && (reopened || (seen !== null && seen !== today));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    if (today) markMantraSeen(profileId, today);
    setReopened(false);
  };

  const reopen = () => {
    setCount(0);
    setReopened(true);
  };

  const repeat = () => setCount((c) => Math.min(REPETITIONS, c + 1));
  const done = count >= REPETITIONS;

  return (
    <section className="daily">
      <h1 className="daily__hello">
        {greeting(hour)}, {name}.
      </h1>
      <p className="daily__sub">{summary ? weekLine(summary.count, summary.goal) : " "}</p>

      {mantra && (
        <button
          className="pill daily__mantra"
          onClick={reopen}
          style={{ ["--c" as string]: chakra?.color ?? "#a78bfa" }}
        >
          <span className="daily__mantra-dot" aria-hidden="true">
            ॐ
          </span>
          <span className="pill__text">
            <span className="mono">Mantra de hoy</span>
            <strong>{mantra.text}</strong>
          </span>
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="mantra"
        onClose={close}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-labelledby="mantra-text"
        style={{ ["--c" as string]: chakra?.color ?? "#a78bfa" }}
      >
        {mantra && (
          <div className="mantra__card">
            <p className="mono mantra__eyebrow">
              Mantra del día · {today ? `${dayName(today)} ${shortDate(today)}` : ""}
            </p>
            <p className="mantra__hello">
              {greeting(hour)}, {name}. Repite conmigo:
            </p>
            <h2 id="mantra-text" className="mantra__text">
              {mantra.text}
            </h2>
            <p className="mantra__meaning">{mantra.meaning}</p>
            {chakra && (
              <p className="mono mantra__chakra">
                <span className="mantra__chakra-dot" /> {chakra.sanskrit} · {chakra.name}
              </p>
            )}

            <div className="mantra__mala">
              <svg viewBox="0 0 240 240" aria-hidden="true">
                <circle cx="120" cy="120" r={BEAD_RADIUS} className="mantra__orbit" />
                {Array.from({ length: REPETITIONS }, (_, i) => {
                  const a = (i / REPETITIONS) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <circle
                      key={i}
                      cx={120 + BEAD_RADIUS * Math.cos(a)}
                      cy={120 + BEAD_RADIUS * Math.sin(a)}
                      r={9}
                      className="mantra__bead"
                      data-on={i < count ? "true" : "false"}
                    />
                  );
                })}
              </svg>
              <button
                className="mantra__repeat"
                onClick={repeat}
                disabled={done}
                autoFocus
                aria-label={done ? "Repeticiones completas" : `Repetir, ${count} de ${REPETITIONS}`}
              >
                <strong>{done ? "✓" : count}</strong>
                <span className="mono">{done ? "Completo" : `de ${REPETITIONS} · toca`}</span>
              </button>
            </div>

            <p className="mono mantra__hint">{mantra.hint ?? "Dilo en voz alta o en silencio, una vez por cuenta."}</p>

            <button className="mantra__close" onClick={close}>
              {done ? "Empezar mi día" : "Cerrar"}
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}

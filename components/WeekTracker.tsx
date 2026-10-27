"use client";

import { WEEK_ARC, arcPoints } from "@/lib/arc";
import {
  AUTO_LOG_SECONDS,
  WEEKS_TO_LEVEL_UP,
  setGoal,
  summarize,
  toggleDay,
  type GoalSetting,
} from "@/lib/practiceStore";
import { usePractice, useToday } from "@/lib/usePractice";
import { dayName, isoWeek, shortDate, weekDays } from "@/lib/week";

const POINTS = arcPoints(7, WEEK_ARC);

const GOALS: { value: GoalSetting; label: string }[] = [
  { value: "auto", label: "Plan" },
  { value: 2, label: "2×" },
  { value: 3, label: "3×" },
];

export default function WeekTracker() {
  const state = usePractice();
  const today = useToday();
  const ready = today !== "";
  const summary = ready ? summarize(state, today) : null;
  const days = ready ? weekDays(today) : [];
  const listenedMin = ready ? Math.floor((state.listened[today] ?? 0) / 60) : 0;
  const loggedToday = ready && state.days.includes(today);
  const goal = summary?.goal ?? 2;
  const count = summary?.count ?? 0;

  const status = !summary
    ? ""
    : count >= goal
      ? "Meta cumplida esta semana"
      : `Te ${goal - count === 1 ? "falta 1 práctica" : `faltan ${goal - count} prácticas`}`;

  return (
    <section className="week" aria-labelledby="week-title">
      <header className="rail-head rail-head--right">
        <span className="mono" id="week-title">
          Tu semana{ready ? ` · S${isoWeek(today)}` : ""}
        </span>
        <div className="week__count" data-met={count >= goal ? "true" : "false"}>
          <strong>{count}</strong>
          <span>/{goal}</span>
        </div>
        <p className="week__status">{status}</p>
        <div className="segmented" role="radiogroup" aria-label="Meta semanal">
          {GOALS.map((g) => (
            <button
              key={g.label}
              role="radio"
              aria-checked={state.goal === g.value}
              className="segmented__opt"
              onClick={() => setGoal(g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
        {summary?.levelUpProgress != null && (
          <p className="week__plan">
            {summary.levelUpProgress >= WEEKS_TO_LEVEL_UP
              ? "La próxima semana subes a 3×"
              : `${summary.levelUpProgress}/${WEEKS_TO_LEVEL_UP} semanas a 2× · luego 3×`}
          </p>
        )}
      </header>

      <ol className="week__days">
        {days.map((d, i) => {
          const done = state.days.includes(d);
          const future = d > today;
          const kind = done ? "done" : d === today ? "today" : future ? "future" : "past";
          return (
            <li
              key={d}
              className="week__day"
              style={{ ["--x" as string]: `${POINTS[i].x}px`, ["--y" as string]: `${POINTS[i].y}px` }}
            >
              <button
                className="week__btn"
                data-kind={kind}
                disabled={future}
                aria-pressed={done}
                aria-label={`${dayName(d)} ${shortDate(d)}${done ? ", practicado" : ""}`}
                onClick={() => toggleDay(d)}
              >
                <span className="week__dot">
                  {done && (
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="week__label">
                  <strong>{d === today ? "Hoy" : dayName(d)}</strong>
                  <span>{shortDate(d)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <footer className="week__foot">
        <div className="boxed">
          <span className="boxed__cell">
            Racha · {summary?.streak ?? 0} sem
          </span>
          <button
            className="boxed__cell boxed__cell--action"
            onClick={() => ready && toggleDay(today)}
            disabled={!ready}
            aria-pressed={loggedToday}
          >
            {loggedToday ? "Hoy ✓" : "Registrar hoy"}
          </button>
        </div>
        <p className="week__auto">
          {loggedToday
            ? "Práctica de hoy registrada"
            : `Escuchaste ${listenedMin} de ${AUTO_LOG_SECONDS / 60} min · se registra sola`}
        </p>
      </footer>
    </section>
  );
}

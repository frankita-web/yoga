"use client";

import { useEffect, useRef } from "react";
import { takeNewDays, useFriendPractice, useNow, type Friend } from "@/lib/cloud";
import { ONLINE_MS } from "@/lib/shared";
import { summarize } from "@/lib/practiceStore";
import { useProfile, useToday } from "@/lib/usePractice";
import { addDays, parseKey, weekDays } from "@/lib/week";

function lastPracticeLabel(days: string[], today: string) {
  const last = days.filter((d) => d <= today).at(-1);
  if (!last) return "aún sin prácticas";
  if (last === today) return "practicó hoy";
  if (last === addDays(today, -1)) return "practicó ayer";
  const diff = Math.round((parseKey(today).getTime() - parseKey(last).getTime()) / 86_400_000);
  return `última hace ${diff} días`;
}

function ago(ms: number) {
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `hace ${Math.max(1, min)} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

const NO_DAYS: string[] = [];

type Props = {
  friend: Friend;
  notify: (message: string) => void;
};

/**
 * A friend's week at a glance: whether they're in the app right now, when
 * they last came by, and a heads-up when they arrive or log a practice.
 */
export default function FriendPill({ friend, notify }: Props) {
  const viewer = useProfile();
  const today = useToday();
  const state = useFriendPractice(friend.id);
  const data = state.status === "ok" ? state.data : null;

  // A friend who hasn't joined yet counts as "no days", so their first
  // practice still triggers a heads-up.
  const days = data ? data.days : state.status === "missing" ? NO_DAYS : null;
  const name = data?.name || friend.name;

  useEffect(() => {
    if (!days || !today) return;
    const fresh = takeNewDays(viewer, friend.id, days);
    if (!fresh.length) return;
    notify(
      fresh.includes(today)
        ? `${name} practicó hoy`
        : `${name} registró ${fresh.length === 1 ? "una práctica" : `${fresh.length} prácticas`}`,
    );
  }, [days, today, viewer, friend.id, name, notify]);

  const now = useNow();
  const lastSeen = data?.lastSeen;
  const online = !!lastSeen && now > 0 && now - lastSeen < ONLINE_MS;

  // Announce arrivals that happen while this page is open (not on load).
  const wasOnline = useRef<boolean | null>(null);
  useEffect(() => {
    // Not joined yet counts as offline, so their very first visit is announced.
    if (state.status === "missing") wasOnline.current = false;
    if (!data) return;
    if (wasOnline.current === false && online) notify(`${name} acaba de entrar`);
    wasOnline.current = online;
  }, [state.status, data, online, name, notify]);

  // Nothing to show until the shared database is connected.
  if (state.status === "offline" || state.status === "loading" || !today) return null;

  const summary = data ? summarize({ days: data.days, listened: {}, goal: data.goal }, today) : null;
  const week = weekDays(today);

  return (
    <div className="pill friend" data-online={online ? "true" : "false"}>
      <span className="friend__avatar" aria-hidden="true">
        {name.charAt(0)}
        <span className="friend__online" />
      </span>
      <span className="pill__text">
        <strong>
          {name}
          {summary && (
            <span className="friend__count">
              {" "}
              {summary.count}/{summary.goal}
            </span>
          )}
        </strong>
        <span className="mono">
          {!data
            ? "aún no entra"
            : online
              ? `en la app ahora · ${lastPracticeLabel(data.days, today)}`
              : lastSeen && now > 0
                ? `${lastPracticeLabel(data.days, today)} · entró ${ago(now - lastSeen)}`
                : lastPracticeLabel(data.days, today)}
        </span>
      </span>
      {data && (
        <span className="friend__week" aria-label={`${summary?.count} de ${summary?.goal} esta semana`}>
          {week.map((d) => (
            <i
              key={d}
              data-done={data.days.includes(d) ? "true" : "false"}
              data-today={d === today ? "true" : "false"}
            />
          ))}
        </span>
      )}
    </div>
  );
}

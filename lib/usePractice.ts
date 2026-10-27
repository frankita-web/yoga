"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./practiceStore";
import { dateKey } from "./week";

function subscribeClock(onChange: () => void) {
  const t = setInterval(onChange, 60_000);
  return () => clearInterval(t);
}

/** Today's local date key, or "" during the server render. */
export function useToday() {
  return useSyncExternalStore(
    subscribeClock,
    () => dateKey(new Date()),
    () => "",
  );
}

export function usePractice() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Current hour (0–23), or -1 during the server render. */
export function useHour() {
  return useSyncExternalStore(
    subscribeClock,
    () => new Date().getHours(),
    () => -1,
  );
}

// The day the mantra pop-up was last shown, so it opens once per day.
const SEEN_KEY = "prana.mantra.seen";
const seenListeners = new Set<() => void>();

function subscribeSeen(listener: () => void) {
  seenListeners.add(listener);
  return () => seenListeners.delete(listener);
}

export function markMantraSeen(day: string) {
  localStorage.setItem(SEEN_KEY, day);
  seenListeners.forEach((l) => l());
}

/** Day key the mantra was last seen, or null during the server render. */
export function useMantraSeen() {
  return useSyncExternalStore(
    subscribeSeen,
    () => localStorage.getItem(SEEN_KEY) ?? "",
    () => null,
  );
}

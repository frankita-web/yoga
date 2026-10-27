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
  return useSyncExternalStore(subscribeClock, () => dateKey(new Date()), () => "");
}

export function usePractice() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

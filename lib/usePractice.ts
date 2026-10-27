"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { getServerSnapshot, practiceStore } from "./practiceStore";
import { OWNER, type Profile } from "./profile";
import { dateKey } from "./week";

export const ProfileContext = createContext<Profile>(OWNER);

export function useProfile() {
  return useContext(ProfileContext);
}

/** Practice store for the current profile. */
export function usePracticeStore() {
  return practiceStore(useProfile().id);
}

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
  const store = usePracticeStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
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
const seenKey = (profileId: string) => (profileId ? `prana.mantra.seen.${profileId}` : "prana.mantra.seen");
const seenListeners = new Set<() => void>();

function subscribeSeen(listener: () => void) {
  seenListeners.add(listener);
  return () => seenListeners.delete(listener);
}

export function markMantraSeen(profileId: string, day: string) {
  localStorage.setItem(seenKey(profileId), day);
  seenListeners.forEach((l) => l());
}

/** Day key the mantra was last seen, or null during the server render. */
export function useMantraSeen() {
  const { id } = useProfile();
  return useSyncExternalStore(
    subscribeSeen,
    () => localStorage.getItem(seenKey(id)) ?? "",
    () => null,
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { OWNER, slugFor, type Profile } from "./profile";
import type { SharedPractice } from "./shared";
import { usePractice, usePracticeStore, useProfile } from "./usePractice";

/** Server-side id: the owner is stored as "franca". */
export const cloudId = (p: Profile) => p.id || slugFor(OWNER.name);

const endpoint = (id: string) => `/api/practice/${encodeURIComponent(id)}`;

/**
 * Keeps this profile's practice days in the shared database so friends can
 * see them. Pulls first (so a fresh device never wipes the log), then pushes
 * every change.
 */
export function useCloudSync() {
  const profile = useProfile();
  const store = usePracticeStore();
  const state = usePractice();
  const [ready, setReady] = useState(false);
  const id = cloudId(profile);

  useEffect(() => {
    let cancelled = false;
    fetch(endpoint(id), { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) store.mergeDays(((await res.json()) as SharedPractice).days);
        // 503 means the database isn't connected: stay local-only.
        if (res.ok || res.status === 404) setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, store]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      fetch(endpoint(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, days: state.days, goal: state.goal }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [ready, id, profile.name, state.days, state.goal]);
}

const HEARTBEAT_MS = 60_000;

/** Tells friends this profile has the app open (every minute while visible). */
export function usePresence() {
  const id = cloudId(useProfile());

  useEffect(() => {
    const beat = () => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/presence/${encodeURIComponent(id)}`, { method: "POST" }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [id]);
}

let now = 0;

/** Current time in ms, refreshed every 30 s (0 during the server render). */
export function useNow() {
  return useSyncExternalStore(
    (onChange) => {
      const t = setInterval(() => {
        now = Date.now();
        onChange();
      }, 30_000);
      return () => clearInterval(t);
    },
    () => (now ||= Date.now()),
    () => 0,
  );
}

export type FriendState = { status: "loading" | "missing" | "offline" } | { status: "ok"; data: SharedPractice };

const POLL_MS = 60_000;

/** A friend's shared practice, refreshed every minute and on focus. */
export function useFriendPractice(friendId: string) {
  const [state, setState] = useState<FriendState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(endpoint(friendId), { cache: "no-store" })
        .then(async (res) => {
          if (cancelled) return;
          if (res.ok) setState({ status: "ok", data: await res.json() });
          else setState({ status: res.status === 404 ? "missing" : "offline" });
        })
        .catch(() => !cancelled && setState({ status: "offline" }));
    load();
    const t = setInterval(load, POLL_MS);
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [friendId]);

  return state;
}

// ---------- Friends list (per viewer, in localStorage) ----------

export type Friend = { id: string; name: string };

const friendsKey = (viewerId: string) => `prana.friends.${viewerId}`;
const friendListeners = new Set<() => void>();
const friendCache = new Map<string, { raw: string | null; list: Friend[] }>();

function defaultsFor(viewerId: string): Friend[] {
  const owner = slugFor(OWNER.name);
  return viewerId === owner ? [{ id: "antonia", name: "Antonia" }] : [{ id: owner, name: OWNER.name }];
}

function readFriends(viewerId: string): Friend[] {
  const raw = localStorage.getItem(friendsKey(viewerId));
  const cached = friendCache.get(viewerId);
  if (cached && cached.raw === raw) return cached.list;
  let list = defaultsFor(viewerId);
  try {
    if (raw) list = JSON.parse(raw);
  } catch {}
  list = list.filter((f) => f.id !== viewerId);
  friendCache.set(viewerId, { raw, list });
  return list;
}

const NO_FRIENDS: Friend[] = [];

export function useFriends() {
  const viewerId = cloudId(useProfile());
  return useSyncExternalStore(
    (l) => {
      friendListeners.add(l);
      return () => friendListeners.delete(l);
    },
    () => readFriends(viewerId),
    () => NO_FRIENDS,
  );
}

export function addFriend(viewer: Profile, friend: Friend) {
  const viewerId = cloudId(viewer);
  if (friend.id === viewerId) return;
  const list = readFriends(viewerId);
  if (list.some((f) => f.id === friend.id)) return;
  localStorage.setItem(friendsKey(viewerId), JSON.stringify([...list, friend]));
  friendListeners.forEach((l) => l());
}

// ---------- "What's new" since the last visit ----------

/** Days this friend logged since we last looked; records the current set. */
export function takeNewDays(viewer: Profile, friendId: string, days: string[]) {
  const key = `prana.known.${cloudId(viewer)}.${friendId}`;
  const raw = localStorage.getItem(key);
  localStorage.setItem(key, JSON.stringify(days));
  if (raw === null) return [];
  try {
    const known = new Set(JSON.parse(raw) as string[]);
    return days.filter((d) => !known.has(d));
  } catch {
    return [];
  }
}

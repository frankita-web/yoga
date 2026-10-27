import { addDays, weekStart } from "./week";

// Practice log kept in localStorage. Read through useSyncExternalStore so the
// server render (no storage) and the first client render agree.

export type GoalSetting = "auto" | 2 | 3;

export type PracticeState = {
  /** Days with a practice, as "YYYY-MM-DD". */
  days: string[];
  /** Seconds of class listened per day, used for automatic logging. */
  listened: Record<string, number>;
  goal: GoalSetting;
};

/** Listening this long to a class in one day counts as a practice. */
export const AUTO_LOG_SECONDS = 20 * 60;
/** In auto mode, weeks at 2× needed before the goal rises to 3×. */
export const WEEKS_TO_LEVEL_UP = 4;

const EMPTY: PracticeState = { days: [], listened: {}, goal: "auto" };

export const getServerSnapshot = () => EMPTY;

export type PracticeStore = ReturnType<typeof createStore>;

// One store per profile, each under its own localStorage key, so a shared
// link (e.g. /antonia) keeps its own log even on the same browser.
function createStore(key: string) {
  let cache: PracticeState = EMPTY;
  let cacheRaw: string | null = null;
  const listeners = new Set<() => void>();

  const read = (): PracticeState => {
    const raw = localStorage.getItem(key);
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    try {
      cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      cache = EMPTY;
    }
    return cache;
  };

  const write = (next: PracticeState) => {
    const raw = JSON.stringify(next);
    localStorage.setItem(key, raw);
    cacheRaw = raw;
    cache = next;
    listeners.forEach((l) => l());
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => e.key === key && listener();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },

    getSnapshot: read,

    toggleDay(day: string) {
      const s = read();
      const days = s.days.includes(day) ? s.days.filter((d) => d !== day) : [...s.days, day].sort();
      write({ ...s, days });
    },

    setGoal(goal: GoalSetting) {
      write({ ...read(), goal });
    },

    /** Adds listening time for `day`; returns true if this logged the day. */
    addListened(day: string, seconds: number) {
      const s = read();
      const total = (s.listened[day] ?? 0) + seconds;
      // Keep only the last two weeks of listening data.
      const cutoff = addDays(day, -14);
      const listened = Object.fromEntries(Object.entries({ ...s.listened, [day]: total }).filter(([d]) => d >= cutoff));
      const logs = total >= AUTO_LOG_SECONDS && !s.days.includes(day);
      write({ ...s, listened, days: logs ? [...s.days, day].sort() : s.days });
      return logs;
    },
  };
}

const stores = new Map<string, PracticeStore>();

/** Store for a profile; the owner ("") keeps the original key. */
export function practiceStore(profileId: string) {
  const key = profileId ? `prana.practice.v1.${profileId}` : "prana.practice.v1";
  let store = stores.get(key);
  if (!store) {
    store = createStore(key);
    stores.set(key, store);
  }
  return store;
}

export type Summary = {
  goal: 2 | 3;
  count: number;
  streak: number;
  /** Weeks completed at 2× while in auto mode (only while the goal is 2). */
  levelUpProgress: number | null;
};

export function summarize(state: PracticeState, today: string): Summary {
  const perWeek = new Map<string, number>();
  for (const d of state.days) {
    const w = weekStart(d);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }

  const current = weekStart(today);
  const first = state.days.length ? weekStart(state.days[0]) : current;
  const goals = new Map<string, 2 | 3>();
  let goal: 2 | 3 = state.goal === "auto" ? 2 : state.goal;
  let weeksAtTwo = 0;

  for (let w = first; w <= current; w = addDays(w, 7)) {
    goals.set(w, goal);
    if (state.goal === "auto" && goal === 2 && (perWeek.get(w) ?? 0) >= 2) {
      weeksAtTwo++;
      // The new goal starts the week after reaching the milestone.
      if (weeksAtTwo >= WEEKS_TO_LEVEL_UP && w !== current) goal = 3;
    }
  }

  const met = (w: string) => (perWeek.get(w) ?? 0) >= (goals.get(w) ?? goal);
  let streak = 0;
  let w = met(current) ? current : addDays(current, -7);
  while (w >= first && met(w)) {
    streak++;
    w = addDays(w, -7);
  }

  const currentGoal = goals.get(current) ?? goal;
  return {
    goal: currentGoal,
    count: perWeek.get(current) ?? 0,
    streak,
    levelUpProgress: state.goal === "auto" && currentGoal === 2 ? Math.min(weeksAtTwo, WEEKS_TO_LEVEL_UP) : null,
  };
}

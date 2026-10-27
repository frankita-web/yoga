import type { GoalSetting } from "./practiceStore";

/** What each profile shares with friends: practice days and goal only. */
export type SharedPractice = {
  name: string;
  days: string[];
  goal: GoalSetting;
  updatedAt: number;
};

export const SLUG_PATTERN = /^[\p{Ll}][\p{Ll}'-]{0,29}$/u;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseShared(body: unknown): Omit<SharedPractice, "updatedAt"> | null {
  if (!body || typeof body !== "object") return null;
  const { name, days, goal } = body as Record<string, unknown>;
  if (typeof name !== "string" || name.length > 30) return null;
  if (!Array.isArray(days) || days.length > 1000 || !days.every((d) => typeof d === "string" && DAY_PATTERN.test(d)))
    return null;
  if (goal !== "auto" && goal !== 2 && goal !== 3) return null;
  return { name, days: [...new Set(days as string[])].sort(), goal };
}

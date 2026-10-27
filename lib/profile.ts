export type Profile = {
  /** "" for the owner; otherwise the URL slug, used to keep storage separate. */
  id: string;
  name: string;
};

export const OWNER: Profile = { id: "", name: "Franca" };

const NAME_PATTERN = /^[\p{L}][\p{L} '-]{0,29}$/u;

/** "Antonia" → "antonia", "María José" → "maría-josé". */
export function slugFor(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Profile for a URL segment, or null if it doesn't look like a name. */
export function profileFromSlug(segment: string): Profile | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return null;
  }
  const name = decoded
    .replace(/-/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toLocaleUpperCase("es") + w.slice(1).toLocaleLowerCase("es"))
    .join(" ");
  if (!NAME_PATTERN.test(name)) return null;
  return { id: slugFor(name), name };
}

export function isValidName(name: string) {
  return NAME_PATTERN.test(name.trim());
}

export function greeting(hour: number) {
  if (hour < 0) return "Hola";
  if (hour >= 5 && hour < 12) return "Buen día";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

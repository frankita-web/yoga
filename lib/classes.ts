export type YogaClass = {
  videoId: string;
  title: string;
  teacher: string;
  /** Length in seconds, shown before the player has loaded the track. */
  length: number;
};

// Led Primary Series classes on YouTube, counted in Sanskrit.
export const CLASSES: YogaClass[] = [
  {
    videoId: "JWDse8F67GQ",
    title: "Led Primary · solo audio",
    teacher: "R. Sharath Jois",
    length: 5233,
  },
  {
    videoId: "0KMbO52LLqk",
    title: "Primary Series · conteo pausado",
    teacher: "Conteo de Sharath Jois",
    length: 5381,
  },
  {
    videoId: "xrcmlIMXUC4",
    title: "Led Primary en sánscrito",
    teacher: "Philippa Asher",
    length: 5380,
  },
  {
    videoId: "QB_Xt0sZjM8",
    title: "Primary Series contada",
    teacher: "Krista",
    length: 4690,
  },
];

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

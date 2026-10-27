export const NAME = "Franca";

export function greeting(hour: number) {
  if (hour < 0) return "Hola";
  if (hour >= 5 && hour < 12) return "Buen día";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

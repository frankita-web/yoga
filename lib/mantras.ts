import { parseKey } from "./week";

export type Mantra = {
  text: string;
  meaning: string;
  /** Optional cue for how to say it. */
  hint?: string;
  /** Chakra it resonates with, used to tint the pop-up. */
  chakra?: string;
};

// One per day, rotating. 30 entries so a month goes by without repeats.
export const MANTRAS: Mantra[] = [
  { text: "So Hum", meaning: "Yo soy eso.", hint: "«So» al inhalar, «Hum» al exhalar." },
  { text: "Om Shanti Shanti Shanti", meaning: "Paz en el cuerpo, en la mente y en el espíritu." },
  {
    text: "Lokah Samastah Sukhino Bhavantu",
    meaning: "Que todos los seres, en todas partes, sean felices y libres.",
    chakra: "anahata",
  },
  {
    text: "LAM",
    meaning: "Estoy en mi cuerpo, segura y enraizada.",
    hint: "Siente la base de la columna.",
    chakra: "muladhara",
  },
  { text: "Om Namah Shivaya", meaning: "Me inclino ante la conciencia que vive en mí." },
  {
    text: "Vande Gurunam Charanaravinde",
    meaning: "Me inclino ante los pies de loto de los maestros. Así abre la práctica de Ashtanga.",
  },
  { text: "Aham Prema", meaning: "Yo soy amor.", chakra: "anahata" },
  {
    text: "VAM",
    meaning: "Fluyo con lo que siento y lo que creo.",
    hint: "Siente el espacio bajo el ombligo.",
    chakra: "svadhisthana",
  },
  { text: "Om Gam Ganapataye Namaha", meaning: "Saludo a Ganesha, que despeja los obstáculos del camino." },
  { text: "Sat Nam", meaning: "La verdad es mi esencia.", hint: "«Sat» largo al inhalar, «Nam» corto al exhalar." },
  { text: "Asato Ma Sat Gamaya", meaning: "Llévame de lo irreal a lo real, de la oscuridad a la luz.", chakra: "ajna" },
  {
    text: "RAM",
    meaning: "Confío en mi fuerza y en mi voluntad.",
    hint: "Siente el calor sobre el ombligo.",
    chakra: "manipura",
  },
  { text: "Om Mani Padme Hum", meaning: "La joya está en el loto: la compasión vive en mí.", chakra: "anahata" },
  {
    text: "Om Aim Saraswatyai Namaha",
    meaning: "Saludo a Saraswati: que fluyan la sabiduría y la creatividad.",
    chakra: "vishuddha",
  },
  { text: "Aham Brahmasmi", meaning: "Soy parte del todo.", chakra: "sahasrara" },
  { text: "YAM", meaning: "Doy y recibo amor con facilidad.", hint: "Siente el centro del pecho.", chakra: "anahata" },
  { text: "Om Sahana Vavatu", meaning: "Que estemos protegidos juntos y crezcamos juntos." },
  { text: "Om Shreem Mahalakshmiyei Namaha", meaning: "Me abro a la abundancia y la gratitud." },
  { text: "Tat Tvam Asi", meaning: "Tú eres eso: lo que buscas ya está en ti.", chakra: "sahasrara" },
  { text: "HAM", meaning: "Digo mi verdad con calma.", hint: "Siente la garganta.", chakra: "vishuddha" },
  { text: "Om Dum Durgayei Namaha", meaning: "Saludo a Durga: tengo fuerza y estoy protegida.", chakra: "manipura" },
  { text: "Ong Namo Guru Dev Namo", meaning: "Me inclino ante la sabiduría creativa y ante mi maestra interior." },
  { text: "Om Purnamadah Purnamidam", meaning: "Aquello es completo, esto es completo. Nada falta." },
  {
    text: "OM",
    meaning: "El sonido de todo lo que existe.",
    hint: "Deja que la vibración llene la cabeza.",
    chakra: "ajna",
  },
  { text: "Om Tare Tuttare Ture Soha", meaning: "Que Tara me libere del miedo." },
  { text: "Ra Ma Da Sa Sa Say So Hung", meaning: "Sol, luna, tierra, infinito: yo soy eso. Un mantra para sanar." },
  { text: "Om Namo Bhagavate Vasudevaya", meaning: "Me inclino ante lo divino que habita en todo." },
  {
    text: "Svasti Prajabhyah Paripalayantam",
    meaning: "Que el bienestar de todos sea protegido. Así cierra la práctica de Ashtanga.",
  },
  { text: "Om Shri Dhanvantaraye Namaha", meaning: "Saludo a Dhanvantari: salud para mi cuerpo y mi mente." },
  {
    text: "Om Bhur Bhuva Swaha",
    meaning: "Tierra, aire y cielo: el comienzo del Gayatri, que pide luz para el entendimiento.",
    chakra: "sahasrara",
  },
];

/** The same mantra all day, a different one the next. */
export function mantraFor(dayKey: string) {
  const days = Math.floor(parseKey(dayKey).getTime() / 86_400_000 + 0.5);
  return MANTRAS[((days % MANTRAS.length) + MANTRAS.length) % MANTRAS.length];
}

/** Repetitions per sitting: a twelfth of a 108-bead mala. */
export const REPETITIONS = 9;

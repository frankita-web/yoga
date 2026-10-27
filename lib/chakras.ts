export type Chakra = {
  id: string;
  sanskrit: string;
  name: string;
  location: string;
  element: string;
  mantra: string;
  petals: number;
  essence: string;
  color: string;
  /** Vertical position on the figure (SVG units, viewBox 0 0 400 520). */
  y: number;
};

// Ordered from the crown down, as they are read on the body.
export const CHAKRAS: Chakra[] = [
  {
    id: "sahasrara",
    sanskrit: "Sahasrara",
    name: "Chakra corona",
    location: "Coronilla",
    element: "Conciencia",
    mantra: "Silencio",
    petals: 1000,
    essence: "Conexión espiritual, unidad y presencia.",
    color: "#BF5AF2",
    y: 36,
  },
  {
    id: "ajna",
    sanskrit: "Ajna",
    name: "Tercer ojo",
    location: "Entrecejo",
    element: "Luz",
    mantra: "OM",
    petals: 2,
    essence: "Intuición, claridad y percepción.",
    color: "#5E5CE6",
    y: 88,
  },
  {
    id: "vishuddha",
    sanskrit: "Vishuddha",
    name: "Chakra garganta",
    location: "Garganta",
    element: "Éter",
    mantra: "HAM",
    petals: 16,
    essence: "Comunicación, verdad y expresión.",
    color: "#32ADE6",
    y: 150,
  },
  {
    id: "anahata",
    sanskrit: "Anahata",
    name: "Chakra corazón",
    location: "Centro del pecho",
    element: "Aire",
    mantra: "YAM",
    petals: 12,
    essence: "Amor, compasión y equilibrio.",
    color: "#30D158",
    y: 212,
  },
  {
    id: "manipura",
    sanskrit: "Manipura",
    name: "Plexo solar",
    location: "Sobre el ombligo",
    element: "Fuego",
    mantra: "RAM",
    petals: 10,
    essence: "Voluntad, energía personal y confianza.",
    color: "#FFD60A",
    y: 272,
  },
  {
    id: "svadhisthana",
    sanskrit: "Svadhisthana",
    name: "Chakra sacro",
    location: "Bajo el ombligo",
    element: "Agua",
    mantra: "VAM",
    petals: 6,
    essence: "Creatividad, placer y fluidez emocional.",
    color: "#FF9F0A",
    y: 326,
  },
  {
    id: "muladhara",
    sanskrit: "Muladhara",
    name: "Chakra raíz",
    location: "Base de la columna",
    element: "Tierra",
    mantra: "LAM",
    petals: 4,
    essence: "Seguridad, estabilidad y conexión con la tierra.",
    color: "#FF453A",
    y: 378,
  },
];

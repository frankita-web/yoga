"use client";

import { CHAKRA_ARC, arcPoints } from "@/lib/arc";
import { CHAKRAS, type Chakra } from "@/lib/chakras";

type Props = {
  active: Chakra | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

const POINTS = arcPoints(CHAKRAS.length, CHAKRA_ARC);

export default function ChakraArc({ active, selected, onHover, onSelect }: Props) {
  return (
    <nav className="chakra-arc" aria-label="Los siete chakras">
      <header className="rail-head rail-head--left">
        <span className="mono">Siete chakras</span>
        <p>Pasa el cursor por el cuerpo o por la lista.</p>
      </header>
      <ol className="chakra-arc__list">
        {CHAKRAS.map((c, i) => (
          <li
            key={c.id}
            className="chakra-arc__item"
            style={{ ["--x" as string]: `${POINTS[i].x}px`, ["--y" as string]: `${POINTS[i].y}px`, ["--c" as string]: c.color }}
          >
            <button
              className="chakra-arc__btn"
              data-active={active?.id === c.id ? "true" : "false"}
              aria-pressed={selected === c.id}
              onMouseEnter={() => onHover(c.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(c.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(c.id)}
            >
              <span className="chakra-arc__label">
                <strong>{c.sanskrit}</strong>
                <span>{c.name}</span>
              </span>
              <span className="chakra-arc__dot" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

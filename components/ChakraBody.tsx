"use client";

import { useId } from "react";
import { CHAKRAS, type Chakra } from "@/lib/chakras";

export type BodyMode = "idle" | "practice" | "savasana";

type Props = {
  active: Chakra | null;
  mode: BodyMode;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

const CX = 200;

function Silhouette() {
  return (
    <>
      {/* Crossed legs */}
      <path d="M130 372C100 376 60 392 46 414C34 434 44 456 74 462C120 470 170 462 200 452C230 462 280 470 326 462C356 456 366 434 354 414C340 392 300 376 270 372C246 368 154 368 130 372Z" />
      {/* Arms */}
      <path d="M126 178C104 190 98 220 96 250C94 290 84 330 74 370C68 392 64 410 70 424C76 436 96 436 102 424C106 412 104 398 106 384C114 350 122 316 128 284C132 262 136 240 140 226Z" />
      <path d="M274 178C296 190 302 220 304 250C306 290 316 330 326 370C332 392 336 410 330 424C324 436 304 436 298 424C294 412 296 398 294 384C286 350 278 316 272 284C268 262 264 240 260 226Z" />
      {/* Torso */}
      <path d="M200 156C232 156 258 162 274 176C288 188 284 214 276 236C266 270 256 300 252 330C250 350 258 368 270 386L130 386C142 368 150 350 148 330C144 300 134 270 124 236C116 214 112 188 126 176C142 162 168 156 200 156Z" />
      {/* Neck */}
      <rect x="185" y="122" width="30" height="46" rx="12" />
      {/* Head */}
      <ellipse cx="200" cy="90" rx="35" ry="43" />
    </>
  );
}

function Petals({ count, color }: { count: number; color: string }) {
  const n = Math.min(count, 28);
  const r = count === 2 ? 17 : 16;
  const h = count === 2 ? 9 : 6.5;
  const w = Math.max(1.4, Math.min(6, ((Math.PI * r) / n) * 0.7));
  return (
    <g className="chakra__petals">
      {Array.from({ length: n }, (_, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-r}
          rx={w}
          ry={h}
          fill="none"
          stroke={color}
          strokeWidth={1}
          transform={`rotate(${(360 / n) * i + (count === 2 ? 90 : 0)})`}
        />
      ))}
    </g>
  );
}

export default function ChakraBody({ active, mode, onHover, onSelect }: Props) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    fill: `fill-${uid}`,
    clip: `clip-${uid}`,
    glow: `glow-${uid}`,
    spine: `spine-${uid}`,
    rim: `rim-${uid}`,
    halo: `halo-${uid}`,
  };
  const glowColor = active?.color ?? "#ffffff";

  return (
    <div className="body" data-mode={mode} data-active={active ? "true" : "false"}>
      <svg
        className="body__svg"
        viewBox="0 0 400 500"
        role="group"
        aria-label="Silueta humana con los siete chakras"
      >
        <defs>
          <linearGradient id={ids.fill} x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3a3a3f" />
            <stop offset="0.55" stopColor="#222226" />
            <stop offset="1" stopColor="#161618" />
          </linearGradient>
          <linearGradient id={ids.spine} x1="0" y1="40" x2="0" y2="378" gradientUnits="userSpaceOnUse">
            {CHAKRAS.map((c, i) => (
              <stop key={c.id} offset={i / (CHAKRAS.length - 1)} stopColor={c.color} />
            ))}
          </linearGradient>
          <radialGradient id={ids.glow}>
            <stop offset="0" style={{ stopColor: glowColor, stopOpacity: 0.85 }} />
            <stop offset="0.45" style={{ stopColor: glowColor, stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: glowColor, stopOpacity: 0 }} />
          </radialGradient>
          {CHAKRAS.map((c) => (
            <radialGradient key={c.id} id={`${ids.halo}-${c.id}`}>
              <stop offset="0" stopColor={c.color} stopOpacity="0.9" />
              <stop offset="0.35" stopColor={c.color} stopOpacity="0.35" />
              <stop offset="1" stopColor={c.color} stopOpacity="0" />
            </radialGradient>
          ))}
          <clipPath id={ids.clip}>
            <Silhouette />
          </clipPath>
          {/* Hairline rim light around the silhouette */}
          <filter id={ids.rim} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="grown" />
            <feComposite in="grown" in2="SourceAlpha" operator="out" result="edge" />
            <feFlood floodColor="#ffffff" floodOpacity="0.22" />
            <feComposite in2="edge" operator="in" result="rim" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="rim" />
            </feMerge>
          </filter>
        </defs>

        <g className="body__figure" fill={`url(#${ids.fill})`} filter={`url(#${ids.rim})`}>
          <Silhouette />
        </g>

        {/* Inner light that travels to the active chakra */}
        <g clipPath={`url(#${ids.clip})`}>
          <g
            className="body__inner-glow"
            style={{ transform: `translateY(${active?.y ?? 250}px)` }}
          >
            <circle cx={CX} cy={0} r={150} fill={`url(#${ids.glow})`} />
          </g>
        </g>

        <line
          className="body__spine"
          x1={CX}
          y1={40}
          x2={CX}
          y2={378}
          stroke={`url(#${ids.spine})`}
          strokeWidth={1.25}
          strokeLinecap="round"
        />

        {CHAKRAS.map((c, i) => {
          const isActive = active?.id === c.id;
          return (
            <g
              key={c.id}
              className="chakra"
              data-active={isActive ? "true" : "false"}
              transform={`translate(${CX} ${c.y})`}
              style={{ color: c.color, ["--i" as string]: CHAKRAS.length - 1 - i }}
              tabIndex={0}
              role="button"
              aria-label={`${c.sanskrit}, ${c.name}`}
              aria-pressed={isActive}
              onPointerEnter={(e) => e.pointerType === "mouse" && onHover(c.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
              onFocus={() => onHover(c.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(c.id)}
            >
              <g className="chakra__scale">
                <circle className="chakra__halo" r={46} fill={`url(#${ids.halo}-${c.id})`} />
                <Petals count={c.petals} color={c.color} />
                <circle className="chakra__ring" r={9.5} fill="none" stroke={c.color} strokeWidth={1.5} />
                <circle className="chakra__core" r={4.5} fill={c.color} />
              </g>
              <circle r={22} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* Floating label next to the lit chakra */}
      <div
        className="body__label"
        aria-hidden={!active}
        style={{
          top: `${((active?.y ?? 250) / 500) * 100}%`,
          ["--c" as string]: active?.color ?? "#fff",
        }}
      >
        <span className="body__label-line" />
        <span className="body__label-text">
          <strong>{active?.sanskrit}</strong>
          <span>{active?.name}</span>
        </span>
      </div>
    </div>
  );
}

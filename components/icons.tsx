type IconProps = { size?: number };

export function PlayIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.3 0-1.7l-10-6.4C8.9 4.3 8 4.8 8 5.6Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function SkipIcon({ size = 22, direction }: IconProps & { direction: "back" | "forward" }) {
  const flip = direction === "back" ? "translate(24 0) scale(-1 1)" : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g transform={flip} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12a7 7 0 1 1-2.05-4.95" />
        <path d="M17.5 3.5v4h-4" />
      </g>
      <text x="12" y="15.2" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="currentColor">
        15
      </text>
    </svg>
  );
}

export function ResetIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 0 2.34-5.66" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  );
}

export function VolumeIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5v5c0 .6.4 1 1 1h3l4.3 3.6c.7.5 1.7.1 1.7-.8V5.7c0-.9-1-1.3-1.7-.8L8 8.5H5c-.6 0-1 .4-1 1Z" fill="currentColor" />
      <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EqualizerIcon({ playing }: { playing: boolean }) {
  return (
    <span className="eq" data-playing={playing ? "true" : "false"} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

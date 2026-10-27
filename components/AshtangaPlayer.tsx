"use client";

import { useEffect, useRef, useState } from "react";
import { CLASSES, formatTime } from "@/lib/classes";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube";
import { EqualizerIcon, ListIcon, PauseIcon, PlayIcon } from "./icons";

const YT_PLAYING = 1;
const YT_BUFFERING = 3;
const RING = 2 * Math.PI * 24;

type Props = {
  onPlayingChange: (playing: boolean) => void;
  /** Bumped by the parent when another player starts, so this one pauses. */
  pauseSignal: number;
};

export default function AshtangaPlayer({ onPlayingChange, pauseSignal }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(CLASSES[0].length);
  const [listOpen, setListOpen] = useState(false);
  const [error, setError] = useState(false);

  const onPlayingChangeRef = useRef(onPlayingChange);
  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  });

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    // YouTube replaces this node with its iframe, so keep it out of React's tree.
    const mount = document.createElement("div");
    host.appendChild(mount);

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(mount, {
        videoId: CLASSES[0].videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(100);
            setReady(true);
          },
          onStateChange: (e) => {
            const isPlaying = e.data === YT_PLAYING;
            setBuffering(e.data === YT_BUFFERING);
            if (e.data !== YT_BUFFERING) {
              setPlaying(isPlaying);
              onPlayingChangeRef.current(isPlaying);
            }
            if (isPlaying) setError(false);
            const d = e.target.getDuration();
            if (d > 0) setDuration(d);
          },
          onError: () => setError(true),
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setTime(p.getCurrentTime());
    }, 250);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (pauseSignal > 0) playerRef.current?.pauseVideo();
  }, [pauseSignal]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p || !ready) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const select = (i: number) => {
    const p = playerRef.current;
    if (!p || !ready) return;
    if (i === index) return toggle();
    setIndex(i);
    setTime(0);
    setDuration(CLASSES[i].length);
    setError(false);
    p.loadVideoById(CLASSES[i].videoId);
  };

  const seek = (value: number) => {
    playerRef.current?.seekTo(value, true);
    setTime(value);
  };

  const current = CLASSES[index];
  const progress = duration > 0 ? time / duration : 0;

  return (
    <section className="ashtanga" aria-label="Clase de Ashtanga" data-playing={playing ? "true" : "false"}>
      <div className="ashtanga__tile">
        <div ref={hostRef} className="ashtanga__frame" />
        {!ready && <div className="ashtanga__loading mono">Cargando</div>}
        <span className="badge badge--blue" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3" y="6.5" width="12" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M15 10.5l5-3v9l-5-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="ashtanga__scrub">
        <span className="mono">{formatTime(time)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.floor(duration))}
          step={1}
          value={Math.floor(time)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!ready}
          aria-label="Progreso de la clase"
          style={{ ["--p" as string]: `${progress * 100}%` }}
        />
        <span className="mono">{formatTime(duration)}</span>
      </div>

      <div className="pill ashtanga__pill">
        <button
          className="pill__play"
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? "Pausar clase" : "Reproducir clase"}
          data-busy={buffering ? "true" : "false"}
        >
          <svg className="pill__ring" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" />
            <circle cx="26" cy="26" r="24" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
          </svg>
          {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        <span className="pill__text">
          <strong>{current.title}</strong>
          <span className="mono">{current.teacher}</span>
        </span>
        <span className="pill__tools">
          <button
            className="pill__tool"
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
            aria-label="Elegir clase"
          >
            <ListIcon />
          </button>
        </span>
      </div>

      {listOpen && (
        <ol className="classes" aria-label="Clases">
          {CLASSES.map((c, i) => (
            <li key={c.videoId}>
              <button
                className="classes__item"
                data-current={i === index ? "true" : "false"}
                onClick={() => {
                  select(i);
                  setListOpen(false);
                }}
                disabled={!ready}
              >
                <span className="classes__num mono">
                  {i === index && playing ? <EqualizerIcon playing /> : `0${i + 1}`}
                </span>
                <span className="classes__meta">
                  <strong>{c.title}</strong>
                  <span>{c.teacher}</span>
                </span>
                <span className="classes__len mono">{formatTime(c.length)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="ashtanga__error">
          Esta clase no se pudo cargar aquí.{" "}
          <a href={`https://www.youtube.com/watch?v=${current.videoId}`} target="_blank" rel="noreferrer">
            Ábrela en YouTube
          </a>
        </p>
      )}
    </section>
  );
}

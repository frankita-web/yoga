"use client";

import { useEffect, useRef, useState } from "react";
import { CLASSES, formatTime } from "@/lib/classes";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube";
import { EqualizerIcon, PauseIcon, PlayIcon, SkipIcon, VolumeIcon } from "./icons";

const YT_PLAYING = 1;
const YT_BUFFERING = 3;

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
  const [volume, setVolume] = useState(90);
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
            e.target.setVolume(90);
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

  const skip = (delta: number) => {
    const p = playerRef.current;
    if (!p || !ready) return;
    const next = Math.min(Math.max(0, p.getCurrentTime() + delta), duration);
    p.seekTo(next, true);
    setTime(next);
  };

  const seek = (value: number) => {
    playerRef.current?.seekTo(value, true);
    setTime(value);
  };

  const changeVolume = (value: number) => {
    setVolume(value);
    playerRef.current?.setVolume(value);
  };

  const current = CLASSES[index];
  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section className="card player" aria-labelledby="ashtanga-title">
      <header className="card__header">
        <span className="card__eyebrow">Clase guiada · audio</span>
        <h2 id="ashtanga-title" className="card__title">Ashtanga</h2>
        <p className="card__subtitle">Serie primaria contada en sánscrito. Solo play y respira.</p>
      </header>

      <div className="player__artwork" data-playing={playing ? "true" : "false"}>
        <div ref={hostRef} className="player__frame" />
        {!ready && <div className="player__loading">Cargando clase…</div>}
      </div>

      <div className="player__now">
        <div>
          <div className="player__track">{current.title}</div>
          <div className="player__teacher">{current.teacher}</div>
        </div>
        <EqualizerIcon playing={playing} />
      </div>

      <div className="scrubber">
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.floor(duration))}
          step={1}
          value={Math.floor(time)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!ready}
          aria-label="Progreso de la clase"
          style={{ ["--p" as string]: `${progress}%` }}
        />
        <div className="scrubber__times">
          <span>{formatTime(time)}</span>
          <span>−{formatTime(duration - time)}</span>
        </div>
      </div>

      <div className="transport">
        <button className="icon-btn" onClick={() => skip(-15)} disabled={!ready} aria-label="Retroceder 15 segundos">
          <SkipIcon direction="back" size={26} />
        </button>
        <button
          className="play-btn"
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? "Pausar clase" : "Reproducir clase"}
          data-busy={buffering ? "true" : "false"}
        >
          {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
        </button>
        <button className="icon-btn" onClick={() => skip(15)} disabled={!ready} aria-label="Adelantar 15 segundos">
          <SkipIcon direction="forward" size={26} />
        </button>
      </div>

      <label className="volume">
        <VolumeIcon />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label="Volumen"
          style={{ ["--p" as string]: `${volume}%` }}
        />
      </label>

      {error && (
        <p className="player__error">
          Esta clase no se pudo cargar aquí.{" "}
          <a href={`https://www.youtube.com/watch?v=${current.videoId}`} target="_blank" rel="noreferrer">
            Ábrela en YouTube
          </a>
        </p>
      )}

      <ol className="tracklist">
        {CLASSES.map((c, i) => (
          <li key={c.videoId}>
            <button
              className="tracklist__item"
              data-current={i === index ? "true" : "false"}
              onClick={() => select(i)}
              disabled={!ready}
            >
              <span className="tracklist__num">
                {i === index && playing ? <EqualizerIcon playing /> : i + 1}
              </span>
              <span className="tracklist__meta">
                <span className="tracklist__title">{c.title}</span>
                <span className="tracklist__teacher">{c.teacher}</span>
              </span>
              <span className="tracklist__len">{formatTime(c.length)}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

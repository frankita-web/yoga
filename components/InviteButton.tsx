"use client";

import { useRef, useState } from "react";
import { addFriend } from "@/lib/cloud";
import { isValidName, profileFromSlug, slugFor } from "@/lib/profile";
import { useProfile } from "@/lib/usePractice";

export default function InviteButton() {
  const profile = useProfile();
  const { id } = profile;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(id ? "" : "Antonia");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const valid = isValidName(name);
  const link = valid ? `${origin}/${encodeURIComponent(slugFor(name))}` : "";

  const open = () => {
    setOrigin(window.location.origin);
    setCanShare("share" in navigator);
    setCopied(false);
    dialogRef.current?.showModal();
  };

  // Whoever you invite shows up next to your greeting.
  const remember = () => {
    const friend = profileFromSlug(slugFor(name));
    if (friend) addFriend(profile, friend);
  };

  const copy = async () => {
    remember();
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };

  const share = () => {
    remember();
    navigator
      .share({
        title: "Prana",
        text: `${name.trim()}, te armé tu espacio de yoga: chakras, Ashtanga, Savasana y tu mantra del día.`,
        url: link,
      })
      .catch(() => {});
  };

  return (
    <>
      <button className="invite-btn mono" onClick={open}>
        Invitar
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        className="invite"
        aria-labelledby="invite-title"
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      >
        <div className="invite__card">
          <p className="mono">Invitar</p>
          <h2 id="invite-title" className="invite__title">
            Su propio espacio, a la par del tuyo
          </h2>
          <p className="invite__lede">
            Con su saludo, su mantra del día y su propio registro. Verás su avance junto al tuyo y te avisaremos cuando
            practique.
          </p>

          <label className="invite__field">
            <span className="mono">Nombre</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setCopied(false);
              }}
              placeholder="Antonia"
              maxLength={30}
              autoComplete="off"
            />
          </label>

          <div className="invite__link mono" aria-live="polite">
            {valid ? link.replace(/^https?:\/\//, "") : "Escribe un nombre"}
          </div>

          <div className="invite__actions">
            <button className="invite__primary" onClick={copy} disabled={!valid}>
              {copied ? "Link copiado ✓" : "Copiar link"}
            </button>
            {canShare && (
              <button className="invite__secondary" onClick={share} disabled={!valid}>
                Compartir
              </button>
            )}
          </div>
          {valid && (
            <a className="invite__preview mono" href={link} target="_blank" rel="noreferrer">
              Ver cómo lo verá {name.trim()} ↗
            </a>
          )}

          <button className="invite__close" onClick={() => dialogRef.current?.close()} aria-label="Cerrar">
            ×
          </button>
        </div>
      </dialog>
    </>
  );
}

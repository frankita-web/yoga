"use client";

import type { Profile } from "@/lib/profile";
import { ProfileContext } from "@/lib/usePractice";
import Experience from "./Experience";

export default function App({ profile }: { profile: Profile }) {
  return (
    <ProfileContext value={profile}>
      <Experience />
    </ProfileContext>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import App from "@/components/App";
import { OWNER, profileFromSlug } from "@/lib/profile";

// Personal links, e.g. /antonia. Other names render on first visit.
export async function generateStaticParams() {
  return [{ nombre: "antonia" }];
}

export async function generateMetadata({ params }: PageProps<"/[nombre]">): Promise<Metadata> {
  const profile = profileFromSlug((await params).nombre);
  return profile ? { title: `Prana · ${profile.name}` } : {};
}

export default async function PersonalPage({ params }: PageProps<"/[nombre]">) {
  const profile = profileFromSlug((await params).nombre);
  if (!profile) notFound();
  // "/franca" is the same as the home page.
  return <App profile={profile.name === OWNER.name ? OWNER : profile} />;
}

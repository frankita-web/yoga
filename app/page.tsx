import App from "@/components/App";
import { OWNER } from "@/lib/profile";

export default function Home() {
  return <App profile={OWNER} />;
}

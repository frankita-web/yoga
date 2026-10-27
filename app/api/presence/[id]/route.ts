import { getRedis } from "@/lib/redis";
import { SLUG_PATTERN } from "@/lib/shared";

/** Heartbeat sent while the app is open, so friends see "in the app now". */
export async function POST(_req: Request, ctx: RouteContext<"/api/presence/[id]">) {
  const id = decodeURIComponent((await ctx.params).id);
  if (!SLUG_PATTERN.test(id)) return Response.json({ error: "invalid id" }, { status: 400 });
  const redis = getRedis();
  if (!redis) return Response.json({ error: "storage not configured" }, { status: 503 });
  await redis.set(`seen:${id}`, Date.now());
  return Response.json({ ok: true });
}

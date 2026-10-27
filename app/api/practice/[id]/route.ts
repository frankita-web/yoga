import { getRedis } from "@/lib/redis";
import { SLUG_PATTERN, parseShared, type SharedPractice } from "@/lib/shared";

const keyFor = (id: string) => `practice:${id}`;

async function profileId(ctx: RouteContext<"/api/practice/[id]">) {
  const id = decodeURIComponent((await ctx.params).id);
  return SLUG_PATTERN.test(id) ? id : null;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/practice/[id]">) {
  const id = await profileId(ctx);
  if (!id) return Response.json({ error: "invalid id" }, { status: 400 });
  const redis = getRedis();
  if (!redis) return Response.json({ error: "storage not configured" }, { status: 503 });
  const data = await redis.get<SharedPractice>(keyFor(id));
  if (!data) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request, ctx: RouteContext<"/api/practice/[id]">) {
  const id = await profileId(ctx);
  if (!id) return Response.json({ error: "invalid id" }, { status: 400 });
  const redis = getRedis();
  if (!redis) return Response.json({ error: "storage not configured" }, { status: 503 });
  const parsed = parseShared(await req.json().catch(() => null));
  if (!parsed) return Response.json({ error: "invalid body" }, { status: 400 });
  const data: SharedPractice = { ...parsed, updatedAt: Date.now() };
  await redis.set(keyFor(id), data);
  return Response.json({ ok: true });
}

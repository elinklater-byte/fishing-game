// Leaderboard API for Hook, Line & Sinker.
// Each player is stored as their own small JSON file in a private Vercel Blob store,
// so two players saving at the same moment never overwrite each other.
//
//   GET  /api/leaderboard  -> { players: [{ name, earned, caught, env, trophies, updated }] }
//   POST /api/leaderboard  <- { name, key, earned, caught, env: { ocean, arctic, swamp }, trophies: [...] }
//
// `key` is a random secret the game makes once per device. It claims the username,
// so nobody else can post scores under your name.
import { put, get, list } from '@vercel/blob';
import { createHash } from 'node:crypto';

const PREFIX = 'players/';
const ENVS = ['ocean', 'arctic', 'swamp'];
const NAME_RE = /^[A-Za-z0-9 _-]{3,16}$/;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const sha = s => createHash('sha256').update(s).digest('hex');
const idFor = name => name.toLowerCase().replace(/[^a-z0-9]/g, '_');
const num = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

async function readPlayer(pathname) {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  try { return JSON.parse(await new Response(res.stream).text()); } catch { return null; }
}

export async function GET() {
  try {
    const players = [];
    let cursor;
    do {
      const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
      const recs = await Promise.all(page.blobs.map(b => readPlayer(b.pathname).catch(() => null)));
      recs.filter(Boolean).forEach(({ keyHash, ...pub }) => players.push(pub));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return json({ players });
  } catch (err) {
    console.error('leaderboard GET failed', err);
    return json({ error: 'Could not load the leaderboard.' }, 500);
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400); }

  const name = String(body.name || '').trim().replace(/\s+/g, ' ');
  if (!NAME_RE.test(name)) return json({ error: 'Usernames need 3–16 letters, numbers, spaces, - or _.' }, 400);
  const key = String(body.key || '');
  if (key.length < 16 || key.length > 128) return json({ error: 'Bad request.' }, 400);

  try {
    const pathname = `${PREFIX}${idFor(name)}.json`;
    const existing = await readPlayer(pathname).catch(() => null);
    const keyHash = sha(key);
    if (existing && existing.keyHash !== keyHash) return json({ error: 'That username is already taken. Try another one!' }, 409);

    const env = {};
    ENVS.forEach(e => { env[e] = num(body.env && body.env[e], 1e9); });
    const trophies = ENVS.filter(e => Array.isArray(body.trophies) && body.trophies.includes(e));
    const rec = {
      name, keyHash,
      earned: num(body.earned, 1e13),
      caught: num(body.caught, 1e9),
      env, trophies,
      updated: Date.now(),
    };
    // Keep each player's best ever scores, even if they start a new game.
    if (existing) {
      rec.earned = Math.max(rec.earned, existing.earned || 0);
      rec.caught = Math.max(rec.caught, existing.caught || 0);
      ENVS.forEach(e => { rec.env[e] = Math.max(rec.env[e], (existing.env && existing.env[e]) || 0); });
      rec.trophies = ENVS.filter(e => rec.trophies.includes(e) || (existing.trophies || []).includes(e));
    }
    await put(pathname, JSON.stringify(rec), {
      access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
    });
    const { keyHash: _, ...pub } = rec;
    return json({ ok: true, player: pub });
  } catch (err) {
    console.error('leaderboard POST failed', err);
    return json({ error: 'Could not save your score right now.' }, 500);
  }
}

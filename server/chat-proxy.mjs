/**
 * Local-only OpenRouter proxy. Keeps OPENROUTER_API_KEY off the frontend bundle.
 * Run from project root: npm run chat-server
 */
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadRootEnv() {
  const rootEnv = resolve(process.cwd(), '.env');
  if (!existsSync(rootEnv)) return;
  for (const line of readFileSync(rootEnv, 'utf8').split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadRootEnv();

const PORT = Number(process.env.CHAT_SERVER_PORT) || 8787;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return true;
    }
    if (u.protocol === 'https:' && u.hostname.endsWith('.github.io')) return true;
    if (u.protocol === 'https:' && u.hostname === 'github.io') return true;
  } catch {
    return false;
  }
  const extra = process.env.CHAT_ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
  if (extra?.includes(origin)) return true;
  return false;
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  const allow = isAllowedOrigin(origin) ? origin || '*' : null;
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (allow) h['Access-Control-Allow-Origin'] = allow;
  return h;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(req) };

  if (req.method === 'OPTIONS' && req.url === '/api/chat') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404, headers);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    res.writeHead(403, headers);
    res.end(JSON.stringify({ error: 'Origin not allowed' }));
    return;
  }

  if (!OPENROUTER_API_KEY) {
    res.writeHead(500, headers);
    res.end(
      JSON.stringify({
        error: 'Server missing OPENROUTER_API_KEY in .env (project root).',
      })
    );
    return;
  }

  const body = await readJsonBody(req);
  if (!body?.model || !Array.isArray(body.messages)) {
    res.writeHead(400, headers);
    res.end(JSON.stringify({ error: 'Expected JSON: { model, messages }' }));
    return;
  }

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || 'http://localhost',
        'X-Title': 'Innovatek AI (local proxy)',
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
      }),
    });

    const data = await r.json().catch(() => ({}));
    res.writeHead(r.ok ? 200 : r.status, headers);
    res.end(JSON.stringify(data));
  } catch (e) {
    res.writeHead(502, headers);
    res.end(JSON.stringify({ error: e?.message || 'Upstream error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Chat proxy listening on http://127.0.0.1:${PORT}/api/chat`);
  if (!OPENROUTER_API_KEY) {
    console.warn('Warning: OPENROUTER_API_KEY is not set in .env');
  }
});

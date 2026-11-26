import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 5199;
const DB_FILE = path.resolve(process.cwd(), '.local-sync-db.json');

let statePayload = null;
if (fs.existsSync(DB_FILE)) {
  try {
    statePayload = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    statePayload = null;
  }
}

const clients = new Set();

function broadcast(data, senderId) {
  const msg = `data: ${JSON.stringify({ ...data, senderId })}\n\n`;
  for (const res of clients) {
    try {
      res.write(msg);
    } catch {
      clients.delete(res);
    }
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, connectedTabs: clients.size }));
    return;
  }

  if (req.url === '/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(statePayload || { empty: true }));
    return;
  }

  if (req.url === '/state' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        statePayload = {
          updatedAt: parsed.updatedAt || Date.now(),
          db: parsed.db,
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(statePayload, null, 2));
        broadcast(statePayload, parsed.senderId || '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ saved: true, updatedAt: statePayload.updatedAt }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', hasState: Boolean(statePayload) })}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\x1b[36m[Campus Sync Relay]\x1b[0m Live cross-app sync running on http://localhost:${PORT}`);
});

import http from 'node:http';
import fs from 'node:fs';

const routes = { '/': ['deployment/deploy.html', 'text/html; charset=utf-8'], '/deploy.js': ['deployment/deploy.js', 'text/javascript; charset=utf-8'], '/registry-artifact.json': ['deployment/registry-artifact.json', 'application/json'] };
const server = http.createServer((req, res) => {
  if (req.method !== 'GET' || !['127.0.0.1:3189', 'localhost:3189'].includes(req.headers.host) || !routes[req.url]) { res.writeHead(404).end(); return; }
  const [file, type] = routes[req.url];
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
    res.end(data);
  } catch { res.writeHead(500).end('Missing local artifact. Run npm run compile:registry.'); }
});
server.listen(3189, '127.0.0.1', () => console.log('Open http://127.0.0.1:3189/ with QoreX on Diana testnet.'));

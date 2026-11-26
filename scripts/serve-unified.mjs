import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4173;
const DIST = path.resolve(process.cwd(), 'dist-pages');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  let filePath = path.join(DIST, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    const seg = urlPath.split('/').filter(Boolean)[0];
    if (['master', 'college', 'teacher', 'student'].includes(seg)) {
      filePath = path.join(DIST, seg, 'index.html');
    } else {
      filePath = path.join(DIST, 'index.html');
    }
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\nUnified 4-App Campus Portal running at: http://localhost:${PORT}`);
  console.log(`  - Master App : http://localhost:${PORT}/master/`);
  console.log(`  - College App: http://localhost:${PORT}/college/`);
  console.log(`  - Teacher App: http://localhost:${PORT}/teacher/`);
  console.log(`  - Student App: http://localhost:${PORT}/student/\n`);
});

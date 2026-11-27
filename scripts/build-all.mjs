import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outRoot = path.join(root, 'dist-pages');
const repoBase = (process.env.REPO_BASE || '').replace(/\/$/, '');

const apps = [
  { name: 'master-app', slug: 'master' },
  { name: 'college-app', slug: 'college' },
  { name: 'teacher-app', slug: 'teacher' },
  { name: 'student-app', slug: 'student' },
];

fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(outRoot, { recursive: true });

for (const app of apps) {
  const basePath = `${repoBase}/${app.slug}/`;
  console.log(`\nBuilding ${app.name} with base="${basePath}" ...`);
  execSync(`npm --workspace=apps/${app.name} run build`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_BASE_PATH: basePath },
  });
  const srcDist = path.join(root, 'apps', app.name, 'dist');
  const destDist = path.join(outRoot, app.slug);
  fs.cpSync(srcDist, destDist, { recursive: true });
  // SPA refresh fallback inside each subpath
  fs.copyFileSync(path.join(destDist, 'index.html'), path.join(destDist, '404.html'));
}

const landingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Management Platform v2 — 4 Connected Portals</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif; }
    body { min-height: 100vh; background: radial-gradient(circle at 15% 15%, #1d2559 0%, #090d1f 55%, #050712 100%); color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .wrap { max-width: 1020px; width: 100%; }
    .hero { text-align: center; margin-bottom: 36px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(99,102,241,0.18); border: 1px solid rgba(129,140,248,0.35); color: #a5b4fc; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    h1 { font-size: clamp(28px, 4vw, 44px); background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 55%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    p { color: #94a3b8; font-size: 15px; max-width: 680px; margin: 0 auto; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(225px, 1fr)); gap: 18px; }
    a.card { text-decoration: none; color: inherit; padding: 24px; border-radius: 18px; background: rgba(15,23,42,0.74); border: 1px solid rgba(148,163,184,0.18); backdrop-filter: blur(14px); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; display: flex; flex-direction: column; gap: 10px; }
    a.card:hover { transform: translateY(-4px); border-color: rgba(129,140,248,0.65); box-shadow: 0 18px 40px rgba(79,70,229,0.22); }
    .tag { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; padding: 4px 10px; border-radius: 8px; width: fit-content; }
    .t-master { background: rgba(168,85,247,0.2); color: #d8b4fe; }
    .t-college { background: rgba(59,130,246,0.2); color: #93c5fd; }
    .t-teacher { background: rgba(6,182,212,0.2); color: #67e8f9; }
    .t-student { background: rgba(16,185,129,0.2); color: #6ee7b7; }
    h2 { font-size: 19px; color: #f8fafc; }
    .desc { font-size: 13px; color: #94a3b8; line-height: 1.5; flex: 1; }
    .cta { font-size: 13px; font-weight: 600; color: #818cf8; margin-top: 6px; }
    .foot { text-align: center; margin-top: 28px; color: #64748b; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <span class="badge">v2.0 • 100% Original Data • Role-Scoped Live Portals</span>
      <h1>Campus Academic Management Platform</h1>
      <p>Start in Master Portal to set your Institution Name and create real accounts for College Office Staff, HODs, Faculty, and Students — zero demo data.</p>
    </div>
    <div class="grid">
      <a class="card" href="./master/">
        <span class="tag t-master">Master Portal</span>
        <h2>Master Control</h2>
        <div class="desc">Set Institution Name, manage Teachers, Students, Office Workers, Library Books catalog & GitHub Cloud Sync.</div>
        <div class="cta">Launch Master App &rarr;</div>
      </a>
      <a class="card" href="./college/">
        <span class="tag t-college">Office & Admin</span>
        <h2>College Portal</h2>
        <div class="desc">Role-isolated portals for College Admin, Accountant, Peon, Clerk & Librarian. Admissions, Calendar, Certificates & Meetings.</div>
        <div class="cta">Launch College App &rarr;</div>
      </a>
      <a class="card" href="./teacher/">
        <span class="tag t-teacher">HOD & Faculty</span>
        <h2>Teachers Portal</h2>
        <div class="desc">Dedicated HOD Portal (Eligibility, Year Back, Hall Tickets, Timetable, Leave, Startups) & Job-Scoped Faculty Portal.</div>
        <div class="cta">Launch Teachers App &rarr;</div>
      </a>
      <a class="card" href="./student/">
        <span class="tag t-student">Learners</span>
        <h2>Student Portal</h2>
        <div class="desc">Semester Subjects, Year-Back lock, Timetable & Replacements, Quizzes, Assignments, Result Entry & Meeting Attendance.</div>
        <div class="cta">Launch Student App &rarr;</div>
      </a>
    </div>
    <div class="foot">Connected live via Same-Origin Bus, MacBook Dev Relay & Autofill-Proof GitHub Gist Cloud Sync.</div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outRoot, 'index.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '404.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '.nojekyll'), '');
console.log('\nAll 4 v2 apps built cleanly into ./dist-pages !');

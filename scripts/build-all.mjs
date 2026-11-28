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
  fs.copyFileSync(path.join(destDist, 'index.html'), path.join(destDist, '404.html'));
}

const landingHtml = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Academic Management System</title>
  <style>
    :root, [data-theme="light"] {
      --bg-base: #f2f2ef;
      --surface: #ffffff;
      --surface-subtle: #ecece8;
      --border: #dcdcd6;
      --border-strong: #c5c5be;
      --text-primary: #1a1a19;
      --text-secondary: #4c4c48;
      --text-muted: #70706b;
      --accent: #0f4c81;
      --accent-soft: #ebf2f8;
      --accent-border: #bfd4e6;
    }
    [data-theme="dark"] {
      --bg-base: #141414;
      --surface: #1d1d1d;
      --surface-subtle: #2a2a2a;
      --border: #333333;
      --border-strong: #464646;
      --text-primary: #ecece9;
      --text-secondary: #b5b5af;
      --text-muted: #8a8a84;
      --accent: #4f8cc9;
      --accent-soft: #1b2836;
      --accent-border: #2f4b66;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    header {
      background: var(--surface);
      border-top: 3px solid var(--accent);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
    }
    .header-inner {
      max-width: 1040px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand { font-size: 17px; font-weight: 700; color: var(--text-primary); }
    .theme-btn {
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid var(--border-strong);
      background: var(--surface);
      color: var(--text-primary);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .theme-btn:hover { border-color: var(--accent); color: var(--accent); }
    main {
      flex: 1;
      max-width: 1040px;
      width: 100%;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .hero { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    h1 { font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.015em; }
    .hero p { color: var(--text-secondary); font-size: 14px; max-width: 660px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 16px;
    }
    a.card {
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: 3px solid var(--accent);
      border-radius: 5px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      transition: border-color 0.14s ease, box-shadow 0.14s ease;
    }
    a.card:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .num { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    h2 { font-size: 17px; font-weight: 700; color: var(--text-primary); }
    .desc { font-size: 13px; color: var(--text-secondary); flex: 1; }
    .cta { font-size: 13px; font-weight: 600; color: var(--accent); padding-top: 8px; border-top: 1px solid var(--border); }
    footer {
      text-align: center;
      padding: 16px;
      color: var(--text-muted);
      font-size: 12px;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="brand">Campus Academic Management System</div>
      <button class="theme-btn" id="themeToggle" type="button">Dark Theme</button>
    </div>
  </header>
  <main>
    <div class="hero">
      <h1>Institutional Portals</h1>
      <p>Select your portal below. Administrators start in the Master Portal to configure institution details and issue staff and student credentials.</p>
    </div>
    <div class="grid">
      <a class="card" href="./master/">
        <span class="num">01 &middot; Master</span>
        <h2>Master Portal</h2>
        <div class="desc">Institution settings, teachers, students, office staff directory, library catalog, circulars, and system reset.</div>
        <div class="cta">Open Master Portal &rarr;</div>
      </a>
      <a class="card" href="./college/">
        <span class="num">02 &middot; Office</span>
        <h2>College Portal</h2>
        <div class="desc">Role-based workspaces for College Admin, Accountant, Peon, Clerk, and Librarian. Admissions, calendar, and certificates.</div>
        <div class="cta">Open College Portal &rarr;</div>
      </a>
      <a class="card" href="./teacher/">
        <span class="num">03 &middot; Academics</span>
        <h2>Teachers Portal</h2>
        <div class="desc">Dedicated HOD management (eligibility, hall tickets, timetables, leaves, startups) and subject-scoped Faculty workspace.</div>
        <div class="cta">Open Teachers Portal &rarr;</div>
      </a>
      <a class="card" href="./student/">
        <span class="num">04 &middot; Learners</span>
        <h2>Student Portal</h2>
        <div class="desc">Semester subjects, timetable and replacements, quizzes, assignments, result entry, and project meeting attendance.</div>
        <div class="cta">Open Student Portal &rarr;</div>
      </a>
    </div>
  </main>
  <footer>Campus Academic Management System</footer>
  <script>
    const key = 'campus_portal_v3_theme';
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    function apply(t) {
      root.setAttribute('data-theme', t);
      localStorage.setItem(key, t);
      btn.textContent = t === 'dark' ? 'Light Theme' : 'Dark Theme';
    }
    apply(localStorage.getItem(key) || 'light');
    btn.addEventListener('click', () => apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outRoot, 'index.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '404.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '.nojekyll'), '');
console.log('\nAll 4 classic v4 apps built cleanly into ./dist-pages !');

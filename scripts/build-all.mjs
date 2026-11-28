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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Academic Management Platform — 4 Connected Portals</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #f6f7f9;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      border-top: 4px solid #1e3a5f;
      padding: 20px 28px;
    }
    .header-inner {
      max-width: 1080px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .brand {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 20px;
      font-weight: 700;
      color: #1e3a5f;
    }
    .pill {
      font-size: 12px;
      font-weight: 600;
      color: #1e3a5f;
      background: #eef3f9;
      border: 1px solid #bfd0e6;
      padding: 4px 10px;
      border-radius: 5px;
    }
    main {
      flex: 1;
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: 44px 24px;
    }
    .hero { margin-bottom: 34px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(26px, 3.6vw, 36px);
      color: #0f172a;
      margin-bottom: 8px;
      letter-spacing: -0.015em;
    }
    .hero p { color: #475569; font-size: 15px; max-width: 680px; line-height: 1.6; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
      gap: 18px;
    }
    a.card {
      text-decoration: none;
      color: inherit;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-top: 3px solid #1e3a5f;
      border-radius: 9px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    a.card:hover {
      border-color: #1e3a5f;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      transform: translateY(-2px);
    }
    .num {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #64748b;
    }
    h2 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 19px;
      color: #0f172a;
    }
    .desc { font-size: 13.5px; color: #475569; line-height: 1.55; flex: 1; }
    .cta {
      font-size: 13px;
      font-weight: 600;
      color: #1e3a5f;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }
    footer {
      text-align: center;
      padding: 20px;
      color: #64748b;
      font-size: 12.5px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="brand">Campus Academic Management Platform</div>
      <span class="pill">4 Connected Role-Scoped Portals</span>
    </div>
  </header>
  <main>
    <div class="hero">
      <h1>Select Your Institutional Portal</h1>
      <p>Start in the Master Portal to configure your Institution Name and issue login credentials for College Office Staff, HODs, Faculty, and Students. All 4 portals stay synchronized locally and across devices via GitHub Cloud Sync.</p>
    </div>
    <div class="grid">
      <a class="card" href="./master/">
        <span class="num">Portal 01 &middot; Master Control</span>
        <h2>Master Portal</h2>
        <div class="desc">Set Institution Name, manage Teachers, Students, Office Workers, Library Catalog, Global Circulars &amp; Factory Reset.</div>
        <div class="cta">Open Master Portal &rarr;</div>
      </a>
      <a class="card" href="./college/">
        <span class="num">Portal 02 &middot; Administration</span>
        <h2>College Portal</h2>
        <div class="desc">Dedicated portals for College Admin, Accountant, Peon, Clerk &amp; Librarian. Admissions, Calendar, Certificates &amp; Meetings.</div>
        <div class="cta">Open College Portal &rarr;</div>
      </a>
      <a class="card" href="./teacher/">
        <span class="num">Portal 03 &middot; Academics</span>
        <h2>Teachers Portal</h2>
        <div class="desc">Split HOD Portal (Eligibility, Year Back, Hall Tickets, Timetable, Leave, Startups) &amp; Job-Scoped Faculty Portal.</div>
        <div class="cta">Open Teachers Portal &rarr;</div>
      </a>
      <a class="card" href="./student/">
        <span class="num">Portal 04 &middot; Learners</span>
        <h2>Student Portal</h2>
        <div class="desc">Semester Subjects, Year-Back lock, Timetable &amp; Replacements, Quizzes, Assignments, Result Entry &amp; Project Meetings.</div>
        <div class="cta">Open Student Portal &rarr;</div>
      </a>
    </div>
  </main>
  <footer>Campus Sync Portal &middot; Simple, Classic Institutional Edition</footer>
</body>
</html>`;

fs.writeFileSync(path.join(outRoot, 'index.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '404.html'), landingHtml);
fs.writeFileSync(path.join(outRoot, '.nojekyll'), '');
console.log('\nAll 4 classic v3 apps built cleanly into ./dist-pages !');

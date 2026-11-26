export const PORTAL_CONFIG = {
  master: {
    id: 'master',
    title: 'Master Portal',
    subtitle: 'System Rules & Gateway',
    devPort: 5170,
    slug: 'master',
    accent: '#a855f7',
  },
  college: {
    id: 'college',
    title: 'College Portal',
    subtitle: 'Admin & Management',
    devPort: 5171,
    slug: 'college',
    accent: '#3b82f6',
  },
  teacher: {
    id: 'teacher',
    title: 'Teacher Portal',
    subtitle: 'Faculty & Mentors',
    devPort: 5172,
    slug: 'teacher',
    accent: '#06b6d4',
  },
  student: {
    id: 'student',
    title: 'Student Portal',
    subtitle: 'Learners Hub',
    devPort: 5173,
    slug: 'student',
    accent: '#10b981',
  },
};

export function getPortalUrl(targetId, currentId) {
  const cfg = PORTAL_CONFIG[targetId];
  if (!cfg) return '#';
  const { protocol, hostname, port, pathname } = window.location;

  // Local multi-port Vite dev mode (ports 5170-5173)
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && ['5170', '5171', '5172', '5173'].includes(port)) {
    return `${protocol}//${hostname}:${cfg.devPort}/${cfg.slug}/`;
  }

  // Same-origin subpath mode (GitHub Pages or unified serve:all)
  const currentSlug = PORTAL_CONFIG[currentId]?.slug || currentId;
  const regex = new RegExp(`/${currentSlug}(/.*)?$`);
  if (regex.test(pathname)) {
    const prefix = pathname.replace(regex, '');
    return `${window.location.origin}${prefix}/${cfg.slug}/`;
  }

  return `/${cfg.slug}/`;
}

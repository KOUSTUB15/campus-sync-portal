export const PORTAL_CONFIG = {
  master: { id: 'master', title: 'Master Portal', subtitle: 'Institution & System Control', devPort: 5170, slug: 'master' },
  college: { id: 'college', title: 'College Portal', subtitle: 'Office & Administration', devPort: 5171, slug: 'college' },
  teacher: { id: 'teacher', title: 'Teachers Portal', subtitle: 'HOD & Faculty Workspace', devPort: 5172, slug: 'teacher' },
  student: { id: 'student', title: 'Student Portal', subtitle: 'Semester Learners Hub', devPort: 5173, slug: 'student' },
};

export function getPortalUrl(targetId, currentId) {
  const cfg = PORTAL_CONFIG[targetId];
  if (!cfg) return '#';
  const { protocol, hostname, port, pathname } = window.location;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && ['5170', '5171', '5172', '5173'].includes(port)) {
    return `${protocol}//${hostname}:${cfg.devPort}/${cfg.slug}/`;
  }
  const currentSlug = PORTAL_CONFIG[currentId]?.slug || currentId;
  const regex = new RegExp(`/${currentSlug}(/.*)?$`);
  if (regex.test(pathname)) {
    const prefix = pathname.replace(regex, '');
    return `${window.location.origin}${prefix}/${cfg.slug}/`;
  }
  return `/${cfg.slug}/`;
}

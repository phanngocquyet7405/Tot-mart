// Select one leaf, preferring the most specific path segment match.
export function activeNavigationHref(items, pathname) {
  const leaves = items.flatMap(item => item.children || [item]);
  return leaves
    .filter(item => pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export async function performWorkspaceLogout({ logout, beforeLogout, lock, setPending, setError }) {
  if (lock.current || beforeLogout?.() === false) return false;
  lock.current = true;
  setPending(true);
  setError('');
  try {
    if (await logout() === false) throw new Error('logout rejected');
    return true;
  } catch {
    setError('Chưa đăng xuất được. Vui lòng kiểm tra kết nối và thử lại.');
    return false;
  } finally {
    lock.current = false;
    setPending(false);
  }
}

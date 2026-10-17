// Select one leaf, preferring the most specific path segment match.
export function activeNavigationHref(items, pathname) {
  const leaves = items.flatMap(item => item.children || [item]);
  return leaves
    .filter(item => pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

// Ctrl/Cmd+B toggles the sidebar. Some browser-generated key events (for example autofill)
// carry no `key`, so the check must tolerate a missing value instead of throwing.
export function isSidebarShortcut(event) {
  if (!event || event.defaultPrevented || event.altKey || event.shiftKey) return false;
  if (event.target?.closest?.(EDITABLE)) return false;
  return Boolean(event.ctrlKey || event.metaKey) && String(event.key || '').toLowerCase() === 'b';
}

// Two code points, never half of a surrogate pair (emoji) or an empty avatar.
export function accountInitials(name) {
  return Array.from(String(name || '').trim()).slice(0, 2).join('').toLocaleUpperCase('vi') || '?';
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

// frontend/lib/utils/csrf.ts

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Not in a browser environment
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

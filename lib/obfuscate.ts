/**
 * Client-safe, non-secret encoding for values that should not appear as
 * plain text in a URL (e.g. a phone number mid-login-flow), but that carry
 * no access-control meaning. Never use this for anything that guards
 * authorization — it is reversible by anyone and requires no key.
 */
export function obfuscate(value: string): string {
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(value, 'utf-8').toString('base64')
      : btoa(value);

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function deobfuscate(value: string): string | null {
  try {
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    return typeof window === 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : atob(base64);
  } catch {
    return null;
  }
}

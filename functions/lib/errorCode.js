/** A short, safe label for logs. Never the message: messages can contain visitor data. */
export function errorCode(error) {
  const code = error && typeof error === 'object' ? error.code : undefined;
  return typeof code === 'string' && /^[A-Za-z0-9_]{1,40}$/.test(code) ? code : 'unknown';
}

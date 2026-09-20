export function generateId(): string {
  // Good enough locally-unique id for an offline-first, single-device MVP.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

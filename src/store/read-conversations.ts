const readIds = new Set<string>();

export function markConversationRead(id: string) {
  readIds.add(id);
}

export function isConversationRead(id: string) {
  return readIds.has(id);
}

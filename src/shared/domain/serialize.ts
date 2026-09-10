/**
 * Converts a domain entity (or array of entities) into a plain object
 * before it crosses the Server -> Client Component boundary. Next.js's RSC
 * serializer rejects class instances outright and does NOT call `toJSON()`
 * automatically (unlike `JSON.stringify`), so every entity's own `toJSON()`
 * must be invoked explicitly here.
 */
export function toPlain<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toPlain(item)) as unknown as T;
  }
  if (value && typeof value === "object" && "toJSON" in value && typeof (value as { toJSON: unknown }).toJSON === "function") {
    return (value as { toJSON: () => T }).toJSON();
  }
  return value;
}

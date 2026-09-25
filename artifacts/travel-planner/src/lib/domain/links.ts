/** A maps search for a stored place name — never invented coordinates. */
export function mapsSearchUrl(name: string, city: string | null): string {
  const query = city ? `${name}, ${city}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Only http(s) links are ever rendered as links. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function bigIntToStringReplacer(value: string | number | boolean | null | object | bigint): string | number | boolean | null | object {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
    .replace(/\s+/g, '-')     // Replace spaces with dashes
    .replace(/--+/g, '-')     // Replace multiple dashes with single dash
    .trim();                  // Trim dashes from start and end
}

export function unslugify(slug: string): string {
  const text = slug.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, dashes, and spaces
  return /^[a-zA-Z0-9-\s]+$/.test(slug);
}

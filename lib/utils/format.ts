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

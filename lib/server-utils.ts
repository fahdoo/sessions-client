import { headers } from 'next/headers';

export function getServerBaseUrl() {
  const host = headers().get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

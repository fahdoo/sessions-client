import { auth } from '@clerk/nextjs/server';

export const checkRole = (role: string) => {
  const { sessionClaims } = auth();
  return sessionClaims?.metadata.role === role;
};

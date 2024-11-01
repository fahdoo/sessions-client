import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/', 
  '/feed',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/profile/:username',
  '/api/webhooks(.*)', 
  '/api/sessions/public', 
  '/api/sessions/:id',
  '/api/sessions/:id/audio-url',
  '/api/users/:username',
  '/api/users/:username/sessions',
  '/api/test(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

const middleware = async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
  console.log('Middleware processing URL:', request.url);

  // Handle OPTIONS requests first
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Create base response
  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Skip auth check for public routes
  if (isPublicRoute(request)) {
    return response;
  }

  // Check authentication for protected routes
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin access
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
};

export default clerkMiddleware(middleware);

// Update matcher to include all relevant paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)',
  ],
};

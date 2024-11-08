import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/', 
  '/feed',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/profile/:username(.*)',
  '/sessions/:id(.*)',
  '/topics(.*)',
  '/api/webhooks(.*)', 
  '/api/sessions/public(.*)', 
  '/api/sessions/:id(.*)',
  '/api/sessions/:id/audio-url(.*)',
  '/api/users/:username(.*)',
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
  console.log('Is public route:', isPublicRoute(request));

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

  // Check if it's a public route
  if (isPublicRoute(request)) {
    console.log('Public route accessed:', request.url);
    return response;
  }

  // For non-public routes, check authentication
  const { userId } = await auth();
  if (!userId) {
    console.log('Unauthorized access, redirecting to sign-in:', request.url);
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin access
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== 'admin') {
      console.log('Non-admin accessing admin route, redirecting to home:', request.url);
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
};

export default clerkMiddleware(middleware);

// Update matcher to include all relevant paths but exclude static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)).*)',
    '/(api|trpc)(.*)',
  ],
};

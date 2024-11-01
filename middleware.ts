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
  console.log('Is public route:', isPublicRoute(request));

  if (request.method === "OPTIONS") {
    return NextResponse.json({}, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check if route requires authentication
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      // Redirect to our custom sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Check admin access
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
};

export default clerkMiddleware(middleware);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

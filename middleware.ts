import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/', 
  '/profile/:username',
  '/api/webhooks(.*)', 
  '/api/sessions/public', 
  '/api/sessions/:id',
  '/api/sessions/:id/audio-url',
  '/api/users/:username',
  '/api/test(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }

    // Protect all routes starting with `/admin`
    if (isAdminRoute(request) && auth().sessionClaims?.metadata?.role !== 'admin') {
      const url = new URL('/', request.url)
      return NextResponse.redirect(url)
    }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

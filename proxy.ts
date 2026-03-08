import { type NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 16 Proxy — replaces middleware.ts.
 *
 * Runs on the Node.js runtime at the network boundary.
 * Rename the exported function to `proxy` (was `middleware`).
 *
 * Use this file for:
 *  - Auth / session checks before any page renders
 *  - Request header injection (e.g. correlation IDs)
 *  - Global redirects and rewrites
 *  - Security headers on every response
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 */
export function proxy(_request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
  );

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

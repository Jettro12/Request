import type { NextRequest } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // You can add custom logic here if needed
  },
  {
    pages: {},
  },
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/requests/:path*',
    '/search/:path*',
  ],
};

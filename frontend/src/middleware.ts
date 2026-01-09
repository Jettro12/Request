import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(request: NextRequest) {
    // You can add custom logic here if needed
  },
  {
    pages: { 
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/requests/:path*",
    "/search/:path*",
  ],
};

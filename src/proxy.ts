import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user;
  const role = user?.role;

  const isLoginPath = nextUrl.pathname === "/login";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isClientRoute = nextUrl.pathname.startsWith("/client");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth") || isLoginPath;
  const isWebhookRoute = nextUrl.pathname === "/api/webhooks/stripe";

  // Bypass webhook signature validations and NextAuth internals
  if (isWebhookRoute || isAuthRoute) {
    return;
  }

  // Protect admin, client, and secure api routes
  if (!isLoggedIn && (isAdminRoute || isClientRoute || isApiRoute)) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(new URL("/login", nextUrl));
  }

  // Enforce specific Role-Based Access Control (RBAC) boundaries
  if (isLoggedIn) {
    // If they are on /login, redirect to their proper dashboard
    if (isLoginPath) {
      const target = role === "admin" ? "/admin/dashboard" : "/client/dashboard";
      return Response.redirect(new URL(target, nextUrl));
    }

    if (isAdminRoute && role !== "admin") {
      return Response.redirect(new URL("/403", nextUrl));
    }
    if (isClientRoute && role !== "client") {
      return Response.redirect(new URL("/403", nextUrl));
    }
  }
});

// Configure middleware matching scope
export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/api/:path*",
    "/login"
  ]
};

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

  if (isWebhookRoute || isAuthRoute) {
    return;
  }

  if (!isLoggedIn && (isAdminRoute || isClientRoute || isApiRoute)) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn) {
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

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/api/:path*",
    "/login"
  ]
};

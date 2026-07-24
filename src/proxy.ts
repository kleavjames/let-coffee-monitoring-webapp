import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isAuthPage = createRouteMatcher(["/login", "/signup"])
const isProtectedRoute = createRouteMatcher([
  "/",
  "/sales(.*)",
  "/products(.*)",
  "/ingredients(.*)",
  "/categories(.*)",
])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated()

  if (isAuthPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/")
  }

  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/login")
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

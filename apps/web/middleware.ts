import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isLoginPage = createRouteMatcher(['/login']);

// Authentication gate only. Role-based authorization (admin check) is enforced
// at the Convex layer via requireAdmin(). Querying Convex for role here would
// add latency to every middleware invocation.
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  if (isLoginPage(request) && authenticated) {
    return nextjsMiddlewareRedirect(request, '/admin/blog');
  }
  if (isAdminRoute(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, '/login');
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};

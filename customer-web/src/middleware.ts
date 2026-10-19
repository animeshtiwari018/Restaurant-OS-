import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface StaffTokenPayload {
  id?: string;
  name?: string;
  email?: string;
  role?: 'WAITER' | 'KITCHEN' | 'ADMIN' | 'MANAGER' | string;
  scope?: string;
  exp?: number;
}

/**
 * Safely decodes standard JWT payload without requiring external crypto packages
 * Works in Edge Runtime and Node.js environments
 */
function parseJwtPayload(token: string): StaffTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow staff login page through without token checks
  if (pathname === '/staff/login') {
    // If staff user is already authenticated with a valid token, auto-forward to assigned dashboard
    const existingToken =
      request.cookies.get('staff_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (existingToken) {
      const payload = parseJwtPayload(existingToken);
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        const role = (payload.role || '').toUpperCase();
        if (role === 'KITCHEN') {
          return NextResponse.redirect(new URL('/kitchen', request.url));
        } else if (role === 'ADMIN' || role === 'MANAGER') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (role === 'WAITER') {
          return NextResponse.redirect(new URL('/waiter', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Extract staff token from cookies or authorization header
  const token =
    request.cookies.get('staff_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // 1. Missing Token: Redirect immediately to staff login with return url
  if (!token) {
    const loginUrl = new URL('/staff/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Decode and validate token payload
  const payload = parseJwtPayload(token);

  if (!payload) {
    const loginUrl = new URL('/staff/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_token');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('staff_token');
    return response;
  }

  // 3. Expiration Check
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/staff/login', request.url);
    loginUrl.searchParams.set('error', 'token_expired');
    loginUrl.searchParams.set('redirect', pathname + search);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('staff_token');
    return response;
  }

  // 4. Reject customer session tokens attempting to access staff routes
  if (payload.scope === 'CUSTOMER_SESSION' || payload.scope === 'TABLE_ORDER') {
    const loginUrl = new URL('/staff/login', request.url);
    loginUrl.searchParams.set('error', 'customer_token_forbidden');
    return NextResponse.redirect(loginUrl);
  }

  const role = (payload.role || '').toUpperCase();

  // 5. Role-Level Boundaries Enforcement
  // /kitchen -> Kitchen, Chef, Admin, Manager only
  if (pathname.startsWith('/kitchen') || pathname.startsWith('/staff/kitchen')) {
    if (role === 'WAITER') {
      const waiterUrl = new URL('/waiter', request.url);
      waiterUrl.searchParams.set('error', 'unauthorized_station');
      return NextResponse.redirect(waiterUrl);
    }
  }

  // /waiter -> Waiter, Captain, Admin, Manager only
  if (pathname.startsWith('/waiter') || pathname.startsWith('/staff/waiter')) {
    if (role === 'KITCHEN') {
      const kitchenUrl = new URL('/kitchen', request.url);
      kitchenUrl.searchParams.set('error', 'unauthorized_station');
      return NextResponse.redirect(kitchenUrl);
    }
  }

  // /admin -> Admin, Manager only
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff/admin')) {
    if (role !== 'ADMIN' && role !== 'MANAGER') {
      const fallbackUrl = new URL(role === 'KITCHEN' ? '/kitchen' : '/waiter', request.url);
      fallbackUrl.searchParams.set('error', 'admin_access_required');
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/waiter/:path*',
    '/kitchen/:path*',
    '/admin/:path*',
    '/staff/:path*',
  ],
};

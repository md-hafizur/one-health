import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('roleName')?.value;
  const pagePermissionsRaw = request.cookies.get('page_permissions')?.value;

  let pagePermissions: { route: string }[] = [];
  try {
    pagePermissions = JSON.parse(pagePermissionsRaw || '[]');
  } catch (e) {
    console.error('Failed to parse page_permissions cookie:', e);
  }

  const currentPath = request.nextUrl.pathname;

  // Allow public access to certain paths like login or root
  const publicPaths = ['/', '/login'];
  if (publicPaths.includes(currentPath)) {
    return NextResponse.next();
  }

  const isAuthorized = pagePermissions.some(p =>
    currentPath.startsWith(p.route)
  );

  if (!isAuthorized) {
    // Optional: redirect based on role
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (role === 'dataCollector') {
      return NextResponse.redirect(new URL('/collector/dashboard', request.url));
    } else if (role === 'public') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

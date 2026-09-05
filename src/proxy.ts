import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Dhyan dijiye: Yahan function ka naam 'middleware' se badalkar 'proxy' kar diya gaya hai
export function proxy(request: NextRequest) { 
  const hasToken = request.cookies.has('sb-yahan-apna-project-ref-auth-token'); 

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!isLoginPage) {
    // Asli auth logic backend connect hone ke baad lagayenge
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
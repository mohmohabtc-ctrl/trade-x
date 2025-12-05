import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Check for Custom Demo Cookie (Bypass Supabase Auth but enforce RBAC)
    const demoCookie = request.cookies.get('tradeX_demo_user')
    if (demoCookie) {
        try {
            // Cookie value might be URI encoded
            const cookieValue = decodeURIComponent(demoCookie.value)
            const userData = JSON.parse(cookieValue)
            const role = userData.role
            const path = request.nextUrl.pathname

            // Merchandiser trying to access Dashboard -> Redirect to App
            if (role === 'MERCHANDISER' && path.startsWith('/dashboard')) {
                return NextResponse.redirect(new URL('/app', request.url))
            }

            // Admin/Manager trying to access App -> Redirect to Dashboard
            if ((role === 'ADMIN' || role === 'MANAGER' || role === 'SUPERVISOR') && path.startsWith('/app')) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch (e) {
            // If cookie parse fails, proceed to standard auth or allow (safer to allow and let client handle)
            console.error('Error parsing demo cookie in middleware:', e)
        }

        // If we have a valid demo cookie and no redirect needed, we allow access
        return response
    }

    // 2. Standard Supabase Auth Check
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect Dashboard and App Routes
    if ((request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/app')) && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Role-Based Access Control
    if (user) {
        const role = user.user_metadata?.role;
        const path = request.nextUrl.pathname;

        // Merchandiser trying to access Dashboard -> Redirect to App
        if (role === 'MERCHANDISER' && path.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/app', request.url));
        }

        // Admin/Manager trying to access App -> Redirect to Dashboard
        if ((role === 'ADMIN' || role === 'MANAGER' || role === 'SUPERVISOR') && path.startsWith('/app')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

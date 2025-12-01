import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const formData = await request.json()
    const email = formData.email
    const password = formData.password
    const supabase = createClient()

    console.log(`🔐 [API] Login attempt for: ${email}`)

    // 1. PRIMARY METHOD: Try Demo User Login via RPC FIRST (avoids rate limiting)
    // This is the robust "RPC First" strategy we implemented
    const { data: demoUser, error: demoError } = await supabase.rpc('login_demo_user', {
        email_input: email,
        password_input: password
    })

    if (demoUser && !demoError) {
        console.log(`✅ [API] RPC Login success for: ${email}`)

        // If it's a demo user, we might not have a Supabase Auth session
        // BUT we need one to protect routes via middleware.
        // TRICK: For demo users, we can't create a real session if they don't exist in Auth.
        // HOWEVER, our goal is to bypass Auth for them.

        // Option A: If they exist in Auth (Managers), we should sign them in via Auth to get a session.
        // Option B: If they are purely virtual (Merchandisers), we can't give them a Supabase session easily.

        // HYBRID APPROACH:
        // If RPC succeeds, we check if we can ALSO sign in via Auth to get a cookie.
        // If Auth fails (rate limit or no account), we return the user data and handle session client-side (or via custom cookie).

        // Let's try to sign in via Auth silently to establish session if possible
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            console.warn(`⚠️ [API] RPC success but Auth failed (expected for pure demo users): ${authError.message}`)
            // For pure demo users, we can set a custom cookie "demo_user" 
            // The middleware should allow access if this cookie is present.

            const response = NextResponse.json({ user: demoUser, type: 'demo_rpc' })
            response.cookies.set('tradeX_demo_user', JSON.stringify(demoUser), {
                path: '/',
                httpOnly: false, // Accessible to client to read user info
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })
            return response
        }

        console.log(`✅ [API] Auth session established for: ${email}`)
        return NextResponse.json({ user: demoUser, type: 'authenticated' })
    }

    // 2. FALLBACK: Try Supabase Auth directly (if RPC failed)
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error(`❌ [API] Login failed for ${email}:`, error.message)
        return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 })
    }

    return NextResponse.json({ user: data.user, type: 'authenticated' })
}

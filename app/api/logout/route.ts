import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error logging out from Supabase:', error)
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Forcefully clear the demo user cookie
    response.cookies.set('tradeX_demo_user', '', {
        path: '/',
        httpOnly: false,
        maxAge: 0,
        expires: new Date(0)
    })

    return response
}

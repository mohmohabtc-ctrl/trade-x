import { createClient } from '@/utils/supabase/server';
import { MobileHome } from '@/components/mobile/MobileHome';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function MobileAppPage() {
    const supabase = await createClient();

    // 1. Get Current User (Simulated for Demo or Real)
    let user = null;
    let userId = null;

    // Check Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
        user = authUser;
        userId = authUser.id;
    } else {
        // Fallback: Check Demo Cookie
        const cookieStore = await cookies();
        const demoCookie = cookieStore.get('tradeX_demo_user');
        if (demoCookie) {
            try {
                const demoUser = JSON.parse(decodeURIComponent(demoCookie.value));
                userId = demoUser.id;
                // Mock a user object structure if needed, or just use ID
            } catch (e) {
                console.error('Invalid demo cookie');
            }
        }
    }

    if (!userId) {
        redirect('/login');
    }

    // 2. Get Merchandiser Profile
    const { data: merchandiser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    // 3. Get Visits for this Merchandiser (Today)
    const today = new Date().toISOString().split('T')[0];
    const { data: visits } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .eq('merchandiser_id', userId)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lte('scheduled_start', `${today}T23:59:59`)
        .order('scheduled_start', { ascending: true });

    const formattedVisits = (visits || []).map(v => ({
        ...v,
        merchandiserId: v.merchandiser_id,
        storeId: v.store_id,
        scheduledStart: v.scheduled_start,
        scheduledEnd: v.scheduled_end,
        checkInTime: v.check_in_time,
        checkOutTime: v.check_out_time,
        photoAvant: v.photo_avant,
        photoApres: v.photo_apres,
        ruptureItems: v.rupture_items
    }));

    return (
        <MobileHome
            user={merchandiser}
            visits={formattedVisits}
        />
    );
}

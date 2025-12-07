import { createClient } from '@/utils/supabase/server';
import { VisitList } from '@/components/mobile/VisitList';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function VisitsPage() {
    const supabase = await createClient();

    let userId = null;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        userId = user.id;
    } else {
        const cookieStore = await cookies();
        const demoCookie = cookieStore.get('tradeX_demo_user');
        if (demoCookie) {
            try {
                const demoUser = JSON.parse(decodeURIComponent(demoCookie.value));
                userId = demoUser.id;
            } catch (e) { }
        }
    }

    if (!userId) {
        redirect('/login');
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: visits } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .eq('merchandiser_id', userId)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lte('scheduled_start', `${today}T23:59:59`)
        .order('scheduled_start', { ascending: true });

    // Map snake_case to camelCase
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
        <VisitList visits={formattedVisits} />
    );
}

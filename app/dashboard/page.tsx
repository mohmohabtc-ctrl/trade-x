import { createClient } from '@/utils/supabase/server';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch visits
    const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*');

    if (visitsError) {
        console.error('Error fetching visits:', visitsError);
    }

    // Fetch merchandisers
    const { data: merchandisers, error: merchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'MERCHANDISER');

    if (merchError) {
        console.error('Error fetching merchandisers:', merchError);
    }

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
        <DashboardClient
            visits={formattedVisits}
            merchandisers={merchandisers || []}
        />
    );
}

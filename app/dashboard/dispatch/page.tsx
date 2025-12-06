import { createClient } from '@/utils/supabase/server';
import { DispatchClient } from './DispatchClient';

export default async function DispatchPage() {
    const supabase = await createClient();

    // Fetch visits with store details
    const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .order('scheduled_start', { ascending: true });

    if (visitsError) {
        console.error('Error fetching visits:', visitsError);
    }

    // Fetch merchandisers (users with role MERCHANDISER)
    const { data: merchandisers, error: merchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'MERCHANDISER');

    if (merchError) {
        console.error('Error fetching merchandisers:', merchError);
    }

    // Fetch all stores (for reference if needed)
    const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('*');

    if (storesError) {
        console.error('Error fetching stores:', storesError);
    }

    // Map DB snake_case to Frontend camelCase
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
        <DispatchClient
            initialVisits={formattedVisits}
            merchandisers={merchandisers || []}
            stores={stores || []}
        />
    );
}

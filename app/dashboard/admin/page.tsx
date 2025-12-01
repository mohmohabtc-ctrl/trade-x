import { createClient } from '@/utils/supabase/server';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
    const supabase = await createClient();

    // Fetch visits with store details
    const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .order('scheduled_start', { ascending: false });

    if (visitsError) {
        console.error('Error fetching visits for admin:', visitsError);
    }

    // Fetch merchandisers
    const { data: merchandisers, error: merchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'MERCHANDISER');

    if (merchError) {
        console.error('Error fetching merchandisers:', merchError);
    }

    // Fetch stores (fallback)
    const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('*');

    if (storesError) {
        console.error('Error fetching stores:', storesError);
    }

    return (
        <AdminClient
            visits={visits || []}
            merchandisers={merchandisers || []}
            stores={stores || []}
        />
    );
}

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

    return (
        <DispatchClient
            initialVisits={visits || []}
            merchandisers={merchandisers || []}
            stores={stores || []}
        />
    );
}

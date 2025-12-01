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

    return (
        <DashboardClient
            visits={visits || []}
            merchandisers={merchandisers || []}
        />
    );
}

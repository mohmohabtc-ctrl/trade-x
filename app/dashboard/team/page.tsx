import { createClient } from '@/utils/supabase/server';
import { TeamClient } from './TeamClient';

export default async function TeamPage() {
    const supabase = await createClient();

    // Fetch merchandisers from users table
    const { data: merchandisers, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'MERCHANDISER')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching merchandisers:', error);
    }

    return <TeamClient initialMerchandisers={merchandisers || []} />;
}

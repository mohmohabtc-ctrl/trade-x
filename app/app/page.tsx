import { createClient } from '@/utils/supabase/server';
import { MobileHome } from '@/components/mobile/MobileHome';
import { redirect } from 'next/navigation';

export default async function MobileAppPage() {
    const supabase = await createClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Get Merchandiser Profile
    const { data: merchandiser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // 3. Get Visits for this Merchandiser (Today)
    const today = new Date().toISOString().split('T')[0];
    const { data: visits } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .eq('merchandiser_id', user.id)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lte('scheduled_start', `${today}T23:59:59`)
        .order('scheduled_start', { ascending: true });

    return (
        <MobileHome
            user={merchandiser}
            visits={visits || []}
        />
    );
}

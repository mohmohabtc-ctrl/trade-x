import { createClient } from '@/utils/supabase/server';
import { VisitList } from '@/components/mobile/VisitList';
import { redirect } from 'next/navigation';

export default async function VisitsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: visits } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .eq('merchandiser_id', user.id)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lte('scheduled_start', `${today}T23:59:59`)
        .order('scheduled_start', { ascending: true });

    return (
        <VisitList visits={visits || []} />
    );
}

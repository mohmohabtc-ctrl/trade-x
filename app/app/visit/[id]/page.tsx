import { createClient } from '@/utils/supabase/server';
import { VisitExecution } from '@/components/mobile/VisitExecution';
import { redirect } from 'next/navigation';

export default async function VisitPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Visit
    const { data: visit, error } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .eq('id', params.id)
        .single();

    if (error || !visit) {
        return <div className="p-8 text-center">Visite introuvable</div>;
    }

    // Fetch Products for Rupture Checklist
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('name');

    return (
        <VisitExecution
            visit={visit}
            products={products || []}
        />
    );
}

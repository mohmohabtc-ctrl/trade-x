import { createClient } from '@/utils/supabase/server';
import { StoresClient } from './StoresClient';

export default async function StoresPage() {
    const supabase = await createClient();

    // Fetch stores from Supabase
    const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching stores:', error);
    }

    return <StoresClient initialStores={stores || []} />;
}

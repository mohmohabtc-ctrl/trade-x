import { createClient } from '@/utils/supabase/server';
import { AddMissionForm } from '@/components/mobile/AddMissionForm';
import { redirect } from 'next/navigation';

export default async function AddMissionPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .order('name');

    return (
        <AddMissionForm
            stores={stores || []}
            userId={user.id}
        />
    );
}

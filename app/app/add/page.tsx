import { createClient } from '@/utils/supabase/server';
import { AddMissionForm } from '@/components/mobile/AddMissionForm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AddMissionPage() {
    const supabase = await createClient();

    let userId = null;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        userId = user.id;
    } else {
        const cookieStore = await cookies();
        const demoCookie = cookieStore.get('tradeX_demo_user');
        if (demoCookie) {
            try {
                const demoUser = JSON.parse(decodeURIComponent(demoCookie.value));
                userId = demoUser.id;
            } catch (e) { }
        }
    }

    if (!userId) {
        redirect('/login');
    }

    const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .order('name');

    return (
        <AddMissionForm
            stores={stores || []}
            userId={userId}
        />
    );
}

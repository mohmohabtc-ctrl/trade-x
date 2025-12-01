import { createClient } from '@/utils/supabase/server';
import { GalleryClient } from './GalleryClient';
import { PhotoItem } from '@/utils/types';

export default async function GalleryPage() {
    const supabase = await createClient();

    // Fetch visits with photos
    // We only need visits that have at least one photo
    const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*, store:stores(*)')
        .or('photo_avant.neq.null,photo_apres.neq.null')
        .order('scheduled_start', { ascending: false });

    if (visitsError) {
        console.error('Error fetching visits for gallery:', visitsError);
    }

    // Fetch merchandisers to map names
    const { data: merchandisers, error: merchError } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'MERCHANDISER');

    if (merchError) {
        console.error('Error fetching merchandisers:', merchError);
    }

    // Transform visits into PhotoItems
    const photos: PhotoItem[] = [];

    if (visits) {
        visits.forEach((v: any) => {
            const merchName = merchandisers?.find(m => m.id === v.merchandiser_id)?.name || 'Inconnu';
            const storeName = v.store?.name || 'Inconnu';
            const dateStr = new Date(v.scheduled_start).toLocaleDateString();

            if (v.photo_avant) {
                photos.push({
                    id: `${v.id}-avant`,
                    url: v.photo_avant,
                    merch: merchName,
                    store: storeName,
                    date: dateStr,
                    anomalyType: 'Avant',
                    comment: 'Photo AVANT'
                });
            }
            if (v.photo_apres) {
                photos.push({
                    id: `${v.id}-apres`,
                    url: v.photo_apres,
                    merch: merchName,
                    store: storeName,
                    date: dateStr,
                    anomalyType: 'Après',
                    comment: 'Photo APRÈS'
                });
            }
        });
    }

    return <GalleryClient initialPhotos={photos} />;
}

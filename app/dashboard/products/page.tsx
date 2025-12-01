import { createClient } from '@/utils/supabase/server';
import { ProductsClient } from './ProductsClient';

export default async function ProductsPage() {
    const supabase = await createClient();

    // Fetch products from Supabase
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
    }

    return <ProductsClient initialProducts={products || []} />;
}

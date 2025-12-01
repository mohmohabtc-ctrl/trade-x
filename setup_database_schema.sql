-- =====================================================
-- TradeX - Complete Database Schema Setup
-- =====================================================
-- This script ensures all tables, columns, and functions
-- exist for the Next.js application to work properly.
-- Safe to run multiple times (idempotent).
-- =====================================================

-- =====================================================
-- 1. STORES TABLE
-- =====================================================

-- Create stores table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    type TEXT,
    lat NUMERIC,
    lng NUMERIC,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure ID has default value (fix for existing tables created without default)
ALTER TABLE public.stores ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing columns to existing stores table
DO $$ 
BEGIN
    -- Add phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN phone TEXT;
    END IF;

    -- Add type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN type TEXT;
    END IF;

    -- Add lat column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'lat'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN lat NUMERIC;
    END IF;

    -- Add lng column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'lng'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN lng NUMERIC;
    END IF;

    -- Add owner_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN owner_id UUID;
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'stores' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS on stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow authenticated users to insert stores" ON public.stores;
DROP POLICY IF EXISTS "Allow authenticated users to update stores" ON public.stores;

-- Create RLS policies for stores
CREATE POLICY "Allow public read access to stores"
    ON public.stores FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert stores"
    ON public.stores FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update stores"
    ON public.stores FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    facing INTEGER NOT NULL DEFAULT 1,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure ID has default value
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing columns to existing products table
DO $$ 
BEGIN
    -- Add owner_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE public.products ADD COLUMN owner_id UUID;
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;

-- Create RLS policies for products
CREATE POLICY "Allow public read access to products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert products"
    ON public.products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products"
    ON public.products FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. USERS TABLE (for merchandisers)
-- =====================================================

-- Note: This table stores demo merchandisers
-- Real auth users are in auth.users

-- Add missing columns to existing users table
DO $$ 
BEGIN
    -- Add zone column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'zone'
        ) THEN
            ALTER TABLE public.users ADD COLUMN zone TEXT;
        END IF;

        -- Add active column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'active'
        ) THEN
            ALTER TABLE public.users ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;

        -- Add manager_id column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'manager_id'
        ) THEN
            ALTER TABLE public.users ADD COLUMN manager_id UUID;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 4. VISITS TABLE
-- =====================================================

-- Create visits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchandiser_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES public.stores(id),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'TODO',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    dlc TEXT,
    veille TEXT,
    rupture TEXT,
    photo_avant TEXT,
    photo_apres TEXT,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure ID has default value
ALTER TABLE public.visits ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable RLS on visits
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to visits" ON public.visits;
DROP POLICY IF EXISTS "Allow authenticated users to manage visits" ON public.visits;

-- Create RLS policies for visits
CREATE POLICY "Allow public read access to visits"
    ON public.visits FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to manage visits"
    ON public.visits FOR ALL
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_visits_updated_at ON public.visits;
CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON public.visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON public.stores(created_at DESC);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON public.products(owner_id);

-- Visits indexes
CREATE INDEX IF NOT EXISTS idx_visits_merchandiser_id ON public.visits(merchandiser_id);
CREATE INDEX IF NOT EXISTS idx_visits_store_id ON public.visits(store_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON public.visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start ON public.visits(scheduled_start);

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify stores table schema
SELECT 'STORES TABLE SCHEMA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'stores'
ORDER BY ordinal_position;

-- Verify products table schema
SELECT 'PRODUCTS TABLE SCHEMA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- Verify visits table schema
SELECT 'VISITS TABLE SCHEMA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'visits'
ORDER BY ordinal_position;

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================
-- All tables, columns, indexes, and policies are now set up.
-- Your Next.js application should work correctly.
-- =====================================================

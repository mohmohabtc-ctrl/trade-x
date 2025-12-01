-- =====================================================
-- Fix: Add missing 'phone' column to stores table
-- =====================================================

-- Add phone column to stores table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stores' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN phone TEXT;
        RAISE NOTICE 'Column phone added to stores table';
    ELSE
        RAISE NOTICE 'Column phone already exists in stores table';
    END IF;
END $$;

-- Add type column to stores table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stores' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN type TEXT;
        RAISE NOTICE 'Column type added to stores table';
    ELSE
        RAISE NOTICE 'Column type already exists in stores table';
    END IF;
END $$;

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'stores'
ORDER BY ordinal_position;

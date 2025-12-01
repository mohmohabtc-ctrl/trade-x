-- Fix for "null value in column id" error
-- This ensures the ID is automatically generated when inserting a new store

ALTER TABLE public.stores ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the change
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name = 'id';

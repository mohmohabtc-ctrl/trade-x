DO $$
DECLARE
    mgr_id text;
    merch_email text := 'mobile.mohmohabtc@gmail.com';
BEGIN
    -- 1. Get Manager ID (Admin)
    SELECT id INTO mgr_id FROM public.users WHERE email = 'mohmohabtc@gmail.com';

    IF mgr_id IS NOT NULL THEN
        -- 2. Check if Merchandiser exists
        IF EXISTS (SELECT 1 FROM public.users WHERE email = merch_email) THEN
            -- UPDATE existing password
            UPDATE public.users 
            SET password = '123456', 
                active = true,
                manager_id = mgr_id
            WHERE email = merch_email;
            RAISE NOTICE 'Updated password for existing merchandiser: %', merch_email;
        ELSE
            -- INSERT new merchandiser
             INSERT INTO public.users (id, email, name, password, role, active, zone, phone, manager_id)
            VALUES (
                gen_random_uuid()::text,
                merch_email,
                'Merch Demo',
                '123456',
                'MERCHANDISER',
                true,
                'Terrain',
                '0550000000',
                mgr_id
            );
            RAISE NOTICE 'Created new merchandiser: %', merch_email;
        END IF;
    ELSE
        RAISE NOTICE 'Admin user mohmohabtc@gmail.com not found. Cannot create merch link.';
    END IF;
END $$;

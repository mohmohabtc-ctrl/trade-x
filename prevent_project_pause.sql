-- =====================================================
-- TradeX - Prevent Supabase Project Pause
-- =====================================================
-- This script sets up a scheduled job using pg_cron to 
-- generate database activity once a day. This ensures
-- the project is not automatically paused due to inactivity.
-- =====================================================

-- 1. Enable pg_cron extension
-- This extension is required for scheduling jobs.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create keep_alive table
-- This table is used solely to record the "heartbeat".
CREATE TABLE IF NOT EXISTS public.keep_alive (
    last_ping timestamptz DEFAULT now()
);

-- 3. Cleanup existing jobs
-- Removes any previous job with the same name to avoid duplicates.
-- Uses a DO block to prevent error if the job doesn't exist yet.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prevent_project_pause') THEN
        PERFORM cron.unschedule('prevent_project_pause');
    END IF;
END $$;

-- 4. Schedule the daily job
-- Runs at 00:00 UTC every day.
-- Clears the table and inserts a new record (generating write activity).
SELECT cron.schedule(
    'prevent_project_pause',
    '0 0 * * *',
    $$DELETE FROM public.keep_alive; INSERT INTO public.keep_alive DEFAULT VALUES;$$
);

-- 5. Immediate Trigger
-- Run once immediately to initialize and ensure activity is recorded now.
DELETE FROM public.keep_alive;
INSERT INTO public.keep_alive DEFAULT VALUES;

-- =====================================================
-- DIAGNOSTIC / VERIFICATION
-- =====================================================
-- Run the following query to verify the job is active and running:
/*
SELECT
    J.jobname AS "Job Name",
    CASE
        WHEN J.active IS TRUE THEN '✅ ACTIVE'
        ELSE '❌ INACTIVE'
    END AS "Scheduler State",
    CASE
        WHEN (SELECT status FROM cron.job_run_details WHERE jobid = J.jobid ORDER BY start_time DESC LIMIT 1) = 'succeeded' 
            THEN '✅ SUCCESS (Via Cron)'
        WHEN (SELECT last_ping FROM public.keep_alive LIMIT 1) > (now() - interval '5 minutes') 
            THEN '✅ SUCCESS (Manual Test OK)'
        ELSE '⚠️ NOT DETECTED'
    END AS "Operational Status",
    COALESCE(
        (SELECT to_char(last_ping, 'DD/MM/YYYY HH24:MI:SS') FROM public.keep_alive LIMIT 1),
        'No Data'
    ) AS "Last Ping"
FROM
    cron.job J
WHERE
    J.jobname = 'prevent_project_pause';
*/

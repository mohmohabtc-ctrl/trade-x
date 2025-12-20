-- ==========================================
-- TradeX Security Fixes
-- Remediation for 'function_search_path_mutable'
-- ==========================================

-- 1. Secure hash_user_password
-- Sets search_path to empty string to prevent search_path hijacking
ALTER FUNCTION public.hash_user_password() SET search_path = '';

-- 2. Secure update_updated_at_column
-- Sets search_path to empty string to prevent search_path hijacking
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- ==========================================
-- Verification
-- ==========================================
-- After running this, re-run the Supabase Security Linter.
-- The 'function_search_path_mutable' warnings for these functions should disappear.

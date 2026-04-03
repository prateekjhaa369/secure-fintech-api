-- Row-Level Security policy draft (work in progress)
-- Target: 100% tenant-safe access for multi-tenant financial records.

-- TODO: finalize schema names and role mapping.

-- 1) Enable RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

-- 2) Read policy
CREATE POLICY IF NOT EXISTS tenant_read_user_profiles
ON public.user_profiles
FOR SELECT
USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- 3) Write policy
CREATE POLICY IF NOT EXISTS tenant_write_transactions
ON public.transactions
FOR INSERT
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- TODO:
-- - Add UPDATE/DELETE policies
-- - Add admin override policy
-- - Add policy test cases for cross-tenant access denial

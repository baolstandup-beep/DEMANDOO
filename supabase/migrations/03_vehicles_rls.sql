-- ==============================================================================
-- DEMANDOO SÉNÉGAL — MIGRATION: RLS POLICIES FOR VEHICLES TABLE
-- ==============================================================================

ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON public.vehicles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers can insert own vehicles" ON public.vehicles;
CREATE POLICY "Drivers can insert own vehicles" ON public.vehicles
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can update own vehicles" ON public.vehicles;
CREATE POLICY "Drivers can update own vehicles" ON public.vehicles
    FOR UPDATE TO authenticated USING ((select auth.uid()) = driver_id) WITH CHECK ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Drivers can delete own vehicles" ON public.vehicles;
CREATE POLICY "Drivers can delete own vehicles" ON public.vehicles
    FOR DELETE TO authenticated USING ((select auth.uid()) = driver_id);

-- ==============================================================================
-- UPDATE TRIPS RLS POLICIES
-- ==============================================================================
-- This script updates the Row Level Security (RLS) policies on the `trips` table.
-- It ensures that:
-- 1. Anonymous users (visitors) can only see available, scheduled trips in the future.
-- 2. Authenticated users can see those same public trips, AND their own trips, 
--    AND trips they have booked.
-- ==============================================================================

-- Drop the overly permissive select policy
DROP POLICY IF EXISTS "Trips are viewable by everyone" ON public.trips;

-- 1. Policy for anonymous users
CREATE POLICY "Trips viewable by anon" ON public.trips
    FOR SELECT TO anon USING (
        status = 'scheduled' 
        AND seats_available > 0 
        AND departure_datetime >= NOW()
    );

-- 2. Policy for authenticated users
CREATE POLICY "Trips viewable by authenticated" ON public.trips
    FOR SELECT TO authenticated USING (
        -- Publicly available trips
        (status = 'scheduled' AND seats_available > 0 AND departure_datetime >= NOW())
        OR 
        -- Driver's own trips (including past, cancelled, completed)
        driver_id = auth.uid()
        OR 
        -- Trips that the passenger has booked
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.trip_id = trips.id 
            AND bookings.passenger_id = auth.uid()
        )
    );

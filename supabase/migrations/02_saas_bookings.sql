-- 02_saas_bookings.sql
-- Migration to support SaaS Pivot: Privacy and Bookings

-- 1. Restrict phone number visibility for passengers unless booking is accepted
CREATE OR REPLACE FUNCTION mask_phone_if_not_accepted(phone TEXT, status TEXT)
RETURNS TEXT AS $$
BEGIN
    IF status IN ('accepted', 'completed') THEN
        RETURN phone;
    ELSE
        RETURN '*** ** ** **';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add Row Level Security (RLS) for Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Passengers can view their own bookings
CREATE POLICY "passengers_select_own_bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = passenger_id);

-- Drivers can view bookings associated with their trips
CREATE POLICY "drivers_select_trip_bookings"
ON public.bookings
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = bookings.trip_id 
        AND trips.driver_id = auth.uid()
    )
);

-- Passengers can insert bookings for themselves
CREATE POLICY "passengers_insert_bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = passenger_id);

-- Drivers can update booking status (accept/reject)
CREATE POLICY "drivers_update_trip_bookings"
ON public.bookings
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = bookings.trip_id 
        AND trips.driver_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = bookings.trip_id 
        AND trips.driver_id = auth.uid()
    )
);

-- SafeSignal Database Migration: 002_rls_policies.sql
-- Row Level Security (RLS) Policies for SafeSignal

-- 1. Enable RLS on all user data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Trusted Contacts Policies
CREATE POLICY "Users can view their own trusted contacts"
    ON public.trusted_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trusted contacts"
    ON public.trusted_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts"
    ON public.trusted_contacts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts"
    ON public.trusted_contacts FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Safety Incidents Policies
CREATE POLICY "Users can view their own safety incidents"
    ON public.safety_incidents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own safety incidents"
    ON public.safety_incidents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own safety incidents"
    ON public.safety_incidents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Journey Check-ins Policies
CREATE POLICY "Users can view their own journey checkins"
    ON public.journey_checkins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey checkins"
    ON public.journey_checkins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey checkins"
    ON public.journey_checkins FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journey checkins"
    ON public.journey_checkins FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Evidence Records Policies
CREATE POLICY "Users can view their own evidence records"
    ON public.evidence_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evidence records"
    ON public.evidence_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence records"
    ON public.evidence_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence records"
    ON public.evidence_records FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Notification Events Policies
CREATE POLICY "Users can view their own notification events"
    ON public.notification_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification events"
    ON public.notification_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 8. Storage Bucket Policies (Private bucket: evidence_vault)
-- Note: Create bucket 'evidence_vault' with public=false in Supabase Storage dashboard
-- The following policies secure storage access:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence_vault', 'evidence_vault', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload evidence files to their folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'evidence_vault' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Authenticated users can read their own evidence files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'evidence_vault' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Authenticated users can delete their own evidence files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'evidence_vault' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

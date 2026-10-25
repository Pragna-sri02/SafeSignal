-- SafeSignal Database Migration: 001_initial_schema.sql
-- Unified Women's Safety Platform Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    phone_number TEXT DEFAULT '',
    emergency_note TEXT DEFAULT '',
    safety_checkin_frequency INT DEFAULT 30, -- minutes
    is_onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Trusted Contacts Table
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT DEFAULT 'Family',
    is_sos_recipient BOOLEAN DEFAULT TRUE,
    email TEXT DEFAULT '',
    notify_by_sms BOOLEAN DEFAULT TRUE,
    notify_by_call BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Safety Incidents (SOS and physical alerts)
CREATE TABLE IF NOT EXISTS public.safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL DEFAULT 'sos' CHECK (incident_type IN ('sos', 'journey_alert', 'manual_report', 'digital')),
    status TEXT NOT NULL DEFAULT 'Created' CHECK (status IN ('Created', 'Pending', 'Sent', 'Delivered', 'Acknowledged', 'Cancelled', 'Resolved', 'Failed')),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    address_text TEXT DEFAULT '',
    details JSONB DEFAULT '{}'::jsonb,
    is_demo BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Journey Check-ins Table
CREATE TABLE IF NOT EXISTS public.journey_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_name TEXT NOT NULL,
    expected_arrival_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'overdue', 'escalated')),
    last_checkin_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    checkin_interval_minutes INT DEFAULT 30,
    notify_contacts_on_overdue BOOLEAN DEFAULT TRUE,
    start_lat DOUBLE PRECISION,
    start_lng DOUBLE PRECISION,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Evidence Records Table (Digital Safety & Cyber Incidents)
CREATE TABLE IF NOT EXISTS public.evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'hacked_account',
        'cyberbullying',
        'impersonation',
        'deepfake',
        'threats_blackmail',
        'privacy_breach',
        'suspicious_activity',
        'image_misuse',
        'physical_incident',
        'other'
    )),
    incident_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    platform_name TEXT DEFAULT '',
    suspect_identifier TEXT DEFAULT '',
    incident_url TEXT DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    notes TEXT DEFAULT '',
    reporting_status TEXT NOT NULL DEFAULT 'evidence_preserved' CHECK (reporting_status IN (
        'draft',
        'evidence_preserved',
        'reported_to_platform',
        'reported_to_cybercrime',
        'resolved'
    )),
    file_attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Notification Events Table
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.safety_incidents(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'call', 'app', 'email', 'demo')),
    recipient_contact_id UUID REFERENCES public.trusted_contacts(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'demo_mode' CHECK (delivery_status IN ('demo_mode', 'pending', 'sent', 'delivered', 'acknowledged', 'failed')),
    provider_name TEXT DEFAULT 'DemoProvider',
    provider_message_id TEXT,
    provider_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_user_id ON public.safety_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_created_at ON public.safety_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_checkins_user_id ON public.journey_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_checkins_status ON public.journey_checkins(status);
CREATE INDEX IF NOT EXISTS idx_evidence_records_user_id ON public.evidence_records(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_records_category ON public.evidence_records(category);
CREATE INDEX IF NOT EXISTS idx_notification_events_incident ON public.notification_events(incident_id);

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trusted_contacts_updated_at ON public.trusted_contacts;
CREATE TRIGGER set_trusted_contacts_updated_at BEFORE UPDATE ON public.trusted_contacts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_safety_incidents_updated_at ON public.safety_incidents;
CREATE TRIGGER set_safety_incidents_updated_at BEFORE UPDATE ON public.safety_incidents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_journey_checkins_updated_at ON public.journey_checkins;
CREATE TRIGGER set_journey_checkins_updated_at BEFORE UPDATE ON public.journey_checkins
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_evidence_records_updated_at ON public.evidence_records;
CREATE TRIGGER set_evidence_records_updated_at BEFORE UPDATE ON public.evidence_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

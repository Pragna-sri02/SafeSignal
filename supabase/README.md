# Supabase Setup Guide for SafeSignal

SafeSignal uses **Supabase PostgreSQL**, **Supabase Auth**, **Row Level Security (RLS)**, and **Supabase Storage** for secure evidence file management.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project** and name it `SafeSignal`.
3. Choose a strong database password and pick the closest region (e.g. `ap-south-1` for Mumbai / India).
4. Wait for the project to provision.

## 2. Apply Database Migrations

You can run these SQL scripts directly in the **SQL Editor** in your Supabase dashboard:

1. Open `migrations/001_initial_schema.sql` and paste it into a new query in the Supabase SQL Editor. Click **Run**.
2. Open `migrations/002_rls_policies.sql` and paste it into another new query in the Supabase SQL Editor. Click **Run**.

This will create:
- `profiles`: user profile & safety preferences
- `trusted_contacts`: authorized emergency contacts
- `safety_incidents`: SOS activation records & status tracking
- `journey_checkins`: travel arrival estimates & check-in monitor
- `evidence_records`: incident records for online harassment & threats
- `notification_events`: audit log of simulated or sent alerts
- `evidence_vault`: private storage bucket with folder isolation per `user_id`

## 3. Obtain Credentials for `.env`

In your Supabase project dashboard, navigate to **Project Settings** -> **API**:

- **Project URL**: Use for `SUPABASE_URL` (backend) and `VITE_SUPABASE_URL` (frontend).
- **anon / public key**: Use for `SUPABASE_ANON_KEY` (backend) and `VITE_SUPABASE_ANON_KEY` (frontend).
- **service_role key**: Use for `SUPABASE_SERVICE_ROLE_KEY` (backend ONLY). **NEVER expose this key in the frontend!**

## 4. Auth Settings

Under **Authentication** -> **Providers** -> **Email**:
- Enable Email Signup.
- In development/hackathon testing, you may optionally disable "Confirm email" for immediate access, or test with email verification enabled.

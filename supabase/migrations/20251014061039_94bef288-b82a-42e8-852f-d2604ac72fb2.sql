-- Add new columns to credentials table for storing credential details
ALTER TABLE public.credentials
ADD COLUMN IF NOT EXISTS nullifier text,
ADD COLUMN IF NOT EXISTS issuer_did text,
ADD COLUMN IF NOT EXISTS issued_date date,
ADD COLUMN IF NOT EXISTS credential_valid_from timestamp with time zone,
ADD COLUMN IF NOT EXISTS credential_valid_until timestamp with time zone;
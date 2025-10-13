-- Update existing volksbegehren records
-- Set start_date from sign_date where sign_date exists
UPDATE public.volksbegehren
SET start_date = sign_date::date
WHERE sign_date IS NOT NULL AND start_date IS NULL;

-- Set end_date for initiatives (start_date + 18 months)
UPDATE public.volksbegehren
SET end_date = (start_date + INTERVAL '18 months')::date
WHERE type = 'initiative' AND start_date IS NOT NULL AND end_date IS NULL;

-- Set end_date for referendums (start_date + 100 days)
UPDATE public.volksbegehren
SET end_date = (start_date + INTERVAL '100 days')::date
WHERE type = 'referendum' AND start_date IS NOT NULL AND end_date IS NULL;

-- Drop the sign_date column
ALTER TABLE public.volksbegehren
DROP COLUMN IF EXISTS sign_date;
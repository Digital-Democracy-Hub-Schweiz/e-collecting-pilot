-- Add did column to gemeinden table
ALTER TABLE public.gemeinden
ADD COLUMN did TEXT;

-- Add start_date and end_date columns to volksbegehren table
ALTER TABLE public.volksbegehren
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;
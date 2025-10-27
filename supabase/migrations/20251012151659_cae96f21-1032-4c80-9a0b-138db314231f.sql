-- Add ON DELETE CASCADE to foreign keys for gemeinden cleanup

-- Update gemeinde_admins foreign key
ALTER TABLE public.gemeinde_admins
DROP CONSTRAINT IF EXISTS gemeinde_admins_gemeinde_id_fkey;

ALTER TABLE public.gemeinde_admins
ADD CONSTRAINT gemeinde_admins_gemeinde_id_fkey 
FOREIGN KEY (gemeinde_id) 
REFERENCES public.gemeinden(id) 
ON DELETE CASCADE;

-- Update einwohner foreign key
ALTER TABLE public.einwohner
DROP CONSTRAINT IF EXISTS einwohner_gemeinde_id_fkey;

ALTER TABLE public.einwohner
ADD CONSTRAINT einwohner_gemeinde_id_fkey 
FOREIGN KEY (gemeinde_id) 
REFERENCES public.gemeinden(id) 
ON DELETE CASCADE;
-- Fix search_path for existing functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.add_creator_as_admin() CASCADE;

-- Recreate update_updated_at_column with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate add_creator_as_admin with proper search_path
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.gemeinde_admins (gemeinde_id, user_id, invited_by)
  VALUES (NEW.id, NEW.created_by, NEW.created_by);
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_gemeinden_updated_at
  BEFORE UPDATE ON public.gemeinden
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_einwohner_updated_at
  BEFORE UPDATE ON public.einwohner
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volksbegehren_updated_at
  BEFORE UPDATE ON public.volksbegehren
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER add_gemeinde_creator_as_admin
  AFTER INSERT ON public.gemeinden
  FOR EACH ROW EXECUTE FUNCTION public.add_creator_as_admin();
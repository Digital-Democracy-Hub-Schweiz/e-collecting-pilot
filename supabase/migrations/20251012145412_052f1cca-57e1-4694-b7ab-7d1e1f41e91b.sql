-- Make add_creator_as_admin idempotent to avoid duplicate key errors
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.gemeinde_admins (gemeinde_id, user_id, invited_by)
  VALUES (NEW.id, NEW.created_by, NEW.created_by)
  ON CONFLICT (gemeinde_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS add_creator_as_admin_trigger ON public.gemeinden;
CREATE TRIGGER add_creator_as_admin_trigger
  AFTER INSERT ON public.gemeinden
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_admin();
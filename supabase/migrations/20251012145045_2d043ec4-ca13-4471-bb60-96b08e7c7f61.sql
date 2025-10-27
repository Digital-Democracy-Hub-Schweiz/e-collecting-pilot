-- Fix infinite recursion in gemeinde_admins policies
-- The current INSERT policy causes infinite recursion because it queries gemeinde_admins while inserting into it

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can add other admins to their gemeinden" ON public.gemeinde_admins;

-- Create a simpler policy that allows admins to add admins without recursion
-- This is safe because only users with admin role can do this
CREATE POLICY "Admins can add admins to gemeinden"
ON public.gemeinde_admins FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Also ensure the trigger function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.add_creator_as_admin()
RETURNS trigger
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS add_creator_as_admin_trigger ON public.gemeinden;
CREATE TRIGGER add_creator_as_admin_trigger
  AFTER INSERT ON public.gemeinden
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_admin();
-- Create a security definer function to check if user is admin of a gemeinde
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_gemeinde_admin(_user_id uuid, _gemeinde_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.gemeinde_admins
    WHERE user_id = _user_id
      AND gemeinde_id = _gemeinde_id
  )
$$;

-- Update einwohner policies to use the new function instead of direct JOIN
DROP POLICY IF EXISTS "Admins can create einwohner in their gemeinden" ON public.einwohner;
CREATE POLICY "Admins can create einwohner in their gemeinden"
ON public.einwohner FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);

DROP POLICY IF EXISTS "Admins can view einwohner in their gemeinden" ON public.einwohner;
CREATE POLICY "Admins can view einwohner in their gemeinden"
ON public.einwohner FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);

DROP POLICY IF EXISTS "Admins can update einwohner in their gemeinden" ON public.einwohner;
CREATE POLICY "Admins can update einwohner in their gemeinden"
ON public.einwohner FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);

DROP POLICY IF EXISTS "Admins can delete einwohner in their gemeinden" ON public.einwohner;
CREATE POLICY "Admins can delete einwohner in their gemeinden"
ON public.einwohner FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);
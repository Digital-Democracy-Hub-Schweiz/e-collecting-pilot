-- Make gemeinden visible to any admin (not only assigned ones)
DROP POLICY IF EXISTS "Admins can view gemeinden they manage" ON public.gemeinden;

CREATE POLICY "Admins can view all gemeinden"
ON public.gemeinden FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Keep existing INSERT/UPDATE/DELETE policies unchanged
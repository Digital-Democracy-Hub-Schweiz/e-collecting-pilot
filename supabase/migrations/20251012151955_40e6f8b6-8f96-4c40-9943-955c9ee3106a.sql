-- Fix recursive RLS on gemeinde_admins and add trigger to add creator as admin

-- 1) Create trigger to auto-add creator as admin of the new gemeinde
DROP TRIGGER IF EXISTS add_creator_as_admin_trigger ON public.gemeinden;
CREATE TRIGGER add_creator_as_admin_trigger
AFTER INSERT ON public.gemeinden
FOR EACH ROW
EXECUTE FUNCTION public.add_creator_as_admin();

-- 2) Replace recursive policies on gemeinde_admins with ones using security definer function
DROP POLICY IF EXISTS "Admins can remove admins from their gemeinden" ON public.gemeinde_admins;
CREATE POLICY "Admins can remove admins from their gemeinden"
ON public.gemeinde_admins
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);

DROP POLICY IF EXISTS "Admins can view gemeinde_admins for their gemeinden" ON public.gemeinde_admins;
CREATE POLICY "Admins can view gemeinde_admins for their gemeinden"
ON public.gemeinde_admins
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND (
    user_id = auth.uid() OR public.is_gemeinde_admin(auth.uid(), gemeinde_id)
  )
);
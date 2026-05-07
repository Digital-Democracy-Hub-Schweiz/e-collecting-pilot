
-- Tighten gemeinde_admins INSERT: must already be admin of that gemeinde
DROP POLICY IF EXISTS "Admins can add admins to gemeinden" ON public.gemeinde_admins;
CREATE POLICY "Admins can add admins to gemeinden"
ON public.gemeinde_admins
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND public.is_gemeinde_admin(auth.uid(), gemeinde_id)
);

-- Explicit deny-by-default policies on user_roles for INSERT/UPDATE/DELETE
CREATE POLICY "Deny all client inserts on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Deny all client updates on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all client deletes on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated, anon
USING (false);

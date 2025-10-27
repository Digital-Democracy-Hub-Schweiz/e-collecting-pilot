-- Fix the gemeinden INSERT policy to include WITH CHECK
DROP POLICY IF EXISTS "Admins can create gemeinden" ON public.gemeinden;

CREATE POLICY "Admins can create gemeinden"
  ON public.gemeinden FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND 
    auth.uid() = created_by
  );
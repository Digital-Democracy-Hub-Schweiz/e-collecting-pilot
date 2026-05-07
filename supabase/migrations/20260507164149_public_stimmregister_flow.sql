-- Enable the public stimmregister flow (/:lang/stimmregister) for anonymous citizens.
--
-- Strategy:
--   * gemeinden:   public SELECT (BFS / name / kanton / DID is non-sensitive public info).
--   * einwohner:   stays admin-only. Public access goes through a SECURITY DEFINER RPC
--                  that takes vorname/nachname/geburtsdatum and returns ONLY the
--                  einwohner_id when an exact match exists in the given gemeinde.
--                  This prevents bulk-scraping of the citizen registry.
--   * credentials: stays admin-only for direct table access. The public flow uses
--                  three SECURITY DEFINER RPCs to request, finalize and fail a
--                  credential request. Duplicate detection happens server-side
--                  inside request_stimmregister_credential().

-- 1. Public SELECT on gemeinden ---------------------------------------------
DROP POLICY IF EXISTS "Public can view gemeinden" ON public.gemeinden;
CREATE POLICY "Public can view gemeinden"
  ON public.gemeinden
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- 2. RPC: lookup an einwohner inside a gemeinde -----------------------------
-- Returns the einwohner.id when (gemeinde_id, vorname, nachname, geburtsdatum)
-- match exactly. Comparison is case-insensitive on names. NULL when no match.
CREATE OR REPLACE FUNCTION public.find_einwohner_in_gemeinde(
  _gemeinde_id   uuid,
  _vorname       text,
  _nachname      text,
  _geburtsdatum  date
)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.einwohner
  WHERE gemeinde_id = _gemeinde_id
    AND lower(vorname)  = lower(_vorname)
    AND lower(nachname) = lower(_nachname)
    AND geburtsdatum    = _geburtsdatum
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_einwohner_in_gemeinde(uuid, text, text, date)
  TO anon, authenticated;


-- 3. RPC: request a new pending credential ----------------------------------
-- Cleans up prior non-issued credentials for the same (einwohner, volksbegehren)
-- and inserts a new pending row. Raises 'credential_already_issued' if an
-- already-issued credential exists.
CREATE OR REPLACE FUNCTION public.request_stimmregister_credential(
  _einwohner_id            uuid,
  _volksbegehren_id        uuid,
  _nullifier               text,
  _issuer_did              text,
  _issued_date             date,
  _credential_valid_from   timestamptz,
  _credential_valid_until  timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id uuid;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.credentials
    WHERE einwohner_id    = _einwohner_id
      AND volksbegehren_id = _volksbegehren_id
      AND status           = 'issued'
  ) THEN
    RAISE EXCEPTION 'credential_already_issued'
      USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.credentials
  WHERE einwohner_id    = _einwohner_id
    AND volksbegehren_id = _volksbegehren_id
    AND status          <> 'issued';

  INSERT INTO public.credentials (
    einwohner_id,
    volksbegehren_id,
    status,
    nullifier,
    issuer_did,
    issued_date,
    credential_valid_from,
    credential_valid_until
  ) VALUES (
    _einwohner_id,
    _volksbegehren_id,
    'pending',
    _nullifier,
    _issuer_did,
    _issued_date,
    _credential_valid_from,
    _credential_valid_until
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_stimmregister_credential(
  uuid, uuid, text, text, date, timestamptz, timestamptz
) TO anon, authenticated;


-- 4. RPC: mark a credential as issued ---------------------------------------
CREATE OR REPLACE FUNCTION public.finalize_stimmregister_credential(
  _credential_db_id  uuid,
  _credential_id     text,
  _management_id     text,
  _offer_deeplink    text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.credentials
  SET credential_id  = _credential_id,
      management_id  = _management_id,
      offer_deeplink = _offer_deeplink,
      status         = 'issued'
  WHERE id     = _credential_db_id
    AND status = 'pending';
$$;

GRANT EXECUTE ON FUNCTION public.finalize_stimmregister_credential(uuid, text, text, text)
  TO anon, authenticated;


-- 5. RPC: mark a pending credential as errored ------------------------------
CREATE OR REPLACE FUNCTION public.fail_stimmregister_credential(
  _credential_db_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.credentials
  SET status = 'error'
  WHERE id     = _credential_db_id
    AND status = 'pending';
$$;

GRANT EXECUTE ON FUNCTION public.fail_stimmregister_credential(uuid)
  TO anon, authenticated;

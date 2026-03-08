
-- Enable pgcrypto in extensions schema (Supabase standard)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate set_user_pin using extensions.crypt and extensions.gen_salt
CREATE OR REPLACE FUNCTION public.set_user_pin(pin_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(pin_code) != 4 OR pin_code !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'PIN must be exactly 4 digits';
  END IF;
  
  UPDATE profiles 
  SET pin_hash = extensions.crypt(pin_code, extensions.gen_salt('bf'))
  WHERE id = auth.uid() AND pin_hash IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Recreate verify_user_pin using extensions.crypt
CREATE OR REPLACE FUNCTION public.verify_user_pin(pin_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash 
  FROM profiles 
  WHERE id = auth.uid();
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_hash = extensions.crypt(pin_code, stored_hash);
END;
$$;

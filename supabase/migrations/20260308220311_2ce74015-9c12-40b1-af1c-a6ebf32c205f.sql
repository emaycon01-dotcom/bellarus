
-- Add pin_hash column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin_hash text DEFAULT NULL;

-- Function to set PIN (hashes it with pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  SET pin_hash = crypt(pin_code, gen_salt('bf'))
  WHERE id = auth.uid() AND pin_hash IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to verify PIN
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
  
  RETURN stored_hash = crypt(pin_code, stored_hash);
END;
$$;

-- Function to check if user has PIN set
CREATE OR REPLACE FUNCTION public.has_user_pin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND pin_hash IS NOT NULL
  );
END;
$$;

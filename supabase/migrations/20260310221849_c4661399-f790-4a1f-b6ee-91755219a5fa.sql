
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  credits integer,
  plan text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin emails
  IF (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) NOT IN ('admin@orion.com', 'souzagestao@gmail.com') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
    SELECT 
      p.id,
      u.email::text,
      p.name,
      p.credits,
      p.plan,
      p.created_at
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;

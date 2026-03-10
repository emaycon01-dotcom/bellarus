
-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email IN ('admin@orion.com', 'souzagestao@gmail.com')
  )
$$;

-- Recreate profiles policies using the function
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can update all profiles" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow insert for new users" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Recreate credit_transactions policies
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admin can read all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

CREATE POLICY "Users can read own transactions" ON public.credit_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all transactions" ON public.credit_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can create own transactions" ON public.credit_transactions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

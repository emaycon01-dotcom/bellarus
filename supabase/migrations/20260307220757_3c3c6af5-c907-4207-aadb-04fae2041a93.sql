
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

-- Recreate user policies as permissive (default)
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can read own transactions"
ON public.credit_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
ON public.credit_transactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admin can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@orion.com'
);

CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@orion.com'
);

CREATE POLICY "Admin can read all transactions"
ON public.credit_transactions FOR SELECT TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@orion.com'
);

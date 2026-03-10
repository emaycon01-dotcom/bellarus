
-- Drop old RESTRICTIVE policies and recreate as PERMISSIVE with both admin emails

-- PROFILES TABLE
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;

CREATE POLICY "Admin can read all profiles" ON public.profiles
FOR SELECT TO authenticated USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);

CREATE POLICY "Admin can update all profiles" ON public.profiles
FOR UPDATE TO authenticated USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);

CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow insert for new users" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- CREDIT_TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Admin can read all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

CREATE POLICY "Admin can read all transactions" ON public.credit_transactions
FOR SELECT TO authenticated USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);

CREATE POLICY "Users can read own transactions" ON public.credit_transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.credit_transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

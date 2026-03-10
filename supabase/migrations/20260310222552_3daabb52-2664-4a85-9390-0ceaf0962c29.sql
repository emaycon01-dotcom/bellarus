
-- Drop all restrictive policies on profiles and recreate as permissive
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Allow insert for new users" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Drop restrictive policies on credit_transactions and recreate as permissive
DROP POLICY IF EXISTS "Admin can read all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

CREATE POLICY "Users can read own transactions" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all transactions" ON public.credit_transactions FOR SELECT TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Users can create own transactions" ON public.credit_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Set 999 credits for souzagestao@gmail.com
UPDATE public.profiles SET credits = 999 WHERE id = 'b05b01e0-b2d6-4dcb-94d9-7bfb1d135cae';

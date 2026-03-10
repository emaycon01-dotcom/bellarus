
-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.profiles;

-- Recreate as explicitly PERMISSIVE
CREATE POLICY "Users can read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can update all profiles" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
) WITH CHECK (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Allow insert for new users" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Drop ALL existing policies on credit_transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admin can read all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.credit_transactions;

-- Recreate as explicitly PERMISSIVE
CREATE POLICY "Users can read own transactions" ON public.credit_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all transactions" ON public.credit_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (
  (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()) IN ('admin@orion.com', 'souzagestao@gmail.com')
);
CREATE POLICY "Users can create own transactions" ON public.credit_transactions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


CREATE TABLE public.document_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'valid'
);

ALTER TABLE public.document_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verifications" ON public.document_verifications FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can insert own verifications" ON public.document_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


CREATE TABLE public.document_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON public.document_history
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all documents" ON public.document_history
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can insert own documents" ON public.document_history
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

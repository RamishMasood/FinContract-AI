
-- 1. Table for user-generated legal agreements (NDAs, work-for-hire, etc.)
CREATE TABLE public.legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  context TEXT NOT NULL,      -- what the agreement is about (e.g. freelance logo)
  disclosing_party TEXT NOT NULL,
  receiving_party TEXT NOT NULL,
  agreement_text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'nda',  -- Can be "nda", "work-for-hire", etc. (for extensibility)
  title TEXT,                        -- optional, auto/or-user-generated title
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS on the new table
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;

-- Only users can SELECT/INSERT/UPDATE/DELETE their own legal agreements
CREATE POLICY "Users can view their own agreements"
  ON public.legal_agreements
  FOR SELECT
  USING (auth.uid() = user_id AND deleted = FALSE);

CREATE POLICY "Users can insert their own agreements"
  ON public.legal_agreements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agreements"
  ON public.legal_agreements
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agreements"
  ON public.legal_agreements
  FOR DELETE
  USING (auth.uid() = user_id);


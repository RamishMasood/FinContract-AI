
-- Table for user jurisdiction suggestions
CREATE TABLE public.legal_jurisdiction_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  region TEXT NOT NULL,
  suggestion TEXT NOT NULL
);

ALTER TABLE public.legal_jurisdiction_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select their own jurisdiction suggestions"
  ON public.legal_jurisdiction_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jurisdiction suggestions"
  ON public.legal_jurisdiction_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jurisdiction suggestions"
  ON public.legal_jurisdiction_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jurisdiction suggestions"
  ON public.legal_jurisdiction_suggestions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Table for user dispute email drafts
CREATE TABLE public.dispute_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient TEXT NOT NULL,
  invoice TEXT NOT NULL,
  email_to TEXT NOT NULL,
  draft TEXT NOT NULL
);

ALTER TABLE public.dispute_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select their own dispute emails"
  ON public.dispute_emails
  FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dispute emails"
  ON public.dispute_emails
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dispute emails"
  ON public.dispute_emails
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dispute emails"
  ON public.dispute_emails
  FOR DELETE
  USING (auth.uid() = user_id);

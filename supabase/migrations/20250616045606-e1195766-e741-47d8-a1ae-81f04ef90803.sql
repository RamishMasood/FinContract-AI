
-- Enable RLS on legal_agreements table if not already enabled
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own agreements" ON public.legal_agreements;
DROP POLICY IF EXISTS "Users can insert own agreements" ON public.legal_agreements;
DROP POLICY IF EXISTS "Users can update own agreements" ON public.legal_agreements;
DROP POLICY IF EXISTS "Users can delete own agreements" ON public.legal_agreements;

-- Create comprehensive RLS policies for legal_agreements
CREATE POLICY "Users can view own agreements" 
  ON public.legal_agreements 
  FOR SELECT 
  USING (auth.uid() = user_id AND deleted = false);

CREATE POLICY "Users can insert own agreements" 
  ON public.legal_agreements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agreements" 
  ON public.legal_agreements 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agreements" 
  ON public.legal_agreements 
  FOR DELETE 
  USING (auth.uid() = user_id);

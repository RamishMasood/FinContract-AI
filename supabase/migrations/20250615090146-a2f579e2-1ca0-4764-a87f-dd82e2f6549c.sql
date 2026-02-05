
-- Create table to store each user's selected pricing plan
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL, -- e.g. 'free', 'pay-per-use', 'monthly', 'pro'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Optional: Only one plan per user
  UNIQUE (user_id)
);

-- Enable Row Level Security for user_plans
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own plan
CREATE POLICY "Users can select their own plan"
ON public.user_plans
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert their own plan record if none exists yet
CREATE POLICY "Users can insert their own plan"
ON public.user_plans
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own plan
CREATE POLICY "Users can update their own plan"
ON public.user_plans
FOR UPDATE
USING (user_id = auth.uid());


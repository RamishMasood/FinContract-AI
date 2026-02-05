
-- Create a table to track Gumroad purchases
CREATE TABLE public.gumroad_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  gumroad_order_id TEXT UNIQUE,
  product_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, completed, refunded
  expires_at TIMESTAMP WITH TIME ZONE, -- for subscriptions
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.gumroad_purchases ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own purchases
CREATE POLICY "Users can view their own purchases" 
  ON public.gumroad_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for insert (system only)
CREATE POLICY "System can create purchases" 
  ON public.gumroad_purchases 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for update (system only)
CREATE POLICY "System can update purchases" 
  ON public.gumroad_purchases 
  FOR UPDATE 
  USING (true);

-- Create index for better query performance
CREATE INDEX idx_gumroad_purchases_user_id ON public.gumroad_purchases(user_id);
CREATE INDEX idx_gumroad_purchases_expires_at ON public.gumroad_purchases(expires_at);
CREATE INDEX idx_gumroad_purchases_status ON public.gumroad_purchases(status);

-- Update user_plans table to track expiration for monthly subscriptions
ALTER TABLE public.user_plans 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN gumroad_purchase_id UUID REFERENCES public.gumroad_purchases(id);

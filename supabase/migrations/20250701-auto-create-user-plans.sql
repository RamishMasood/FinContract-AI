
-- Function to handle new user registration and create free plan
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert a free plan for the new user
  INSERT INTO public.user_plans (user_id, plan_id, started_at, updated_at)
  VALUES (NEW.id, 'free', now(), now());
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create free plan for new users
DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_plan();

-- Add free plans for existing users who don't have plans
INSERT INTO public.user_plans (user_id, plan_id, started_at, updated_at)
SELECT 
  au.id,
  'free',
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.user_plans up ON au.id = up.user_id
WHERE up.user_id IS NULL;

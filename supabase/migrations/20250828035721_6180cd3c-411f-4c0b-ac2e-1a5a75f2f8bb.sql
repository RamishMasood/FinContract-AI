-- Create a function to get document usage count including deleted documents
CREATE OR REPLACE FUNCTION public.get_user_document_usage(
  user_uuid uuid,
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  usage_count integer;
BEGIN
  -- Count all documents (including deleted ones) created in the date range
  SELECT COUNT(*)
  INTO usage_count
  FROM public.documents
  WHERE user_id = user_uuid
    AND created_at >= start_date
    AND created_at <= end_date;
  
  RETURN usage_count;
END;
$$;
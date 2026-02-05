-- Fix RLS policies for documents table to allow soft delete (UPDATE operation)
-- The existing UPDATE policy should already allow users to update their own documents
-- But let's make sure it's working correctly by recreating it

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can soft delete their own documents" ON public.documents;

-- Create a comprehensive UPDATE policy that allows both regular updates and soft deletes
CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
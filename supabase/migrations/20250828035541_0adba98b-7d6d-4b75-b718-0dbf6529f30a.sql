-- Add deleted column to documents table to implement soft delete
ALTER TABLE public.documents ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to only show non-deleted documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id AND deleted = false);

-- Allow users to soft delete (update deleted flag)
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can soft delete their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
-- Add DELETE RLS policy for documents table to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);
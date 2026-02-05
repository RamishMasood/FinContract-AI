
-- Add analysis_data column to documents table to store analysis results
ALTER TABLE documents ADD COLUMN IF NOT EXISTS analysis_data JSONB;

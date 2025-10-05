-- Add unique constraint to config_key if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'school_config_config_key_key'
  ) THEN
    ALTER TABLE public.school_config 
    ADD CONSTRAINT school_config_config_key_key UNIQUE (config_key);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_school_config_config_key ON public.school_config(config_key);
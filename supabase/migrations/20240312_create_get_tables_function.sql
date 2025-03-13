
-- Create a function to get all tables in the public schema
-- This will be used by the admin panel to display table data
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE (table_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_name::text 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  ORDER BY table_name;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_tables() IS 'Gets all tables in the public schema for admin panel use';

-- Create foreign key references to make joins work in the admin panel
ALTER TABLE IF EXISTS public.item_claims 
  ADD CONSTRAINT IF NOT EXISTS item_claims_claimer_id_fkey 
  FOREIGN KEY (claimer_id) REFERENCES public.profiles(id);

ALTER TABLE IF EXISTS public.item_claims 
  ADD CONSTRAINT IF NOT EXISTS item_claims_item_id_fkey 
  FOREIGN KEY (item_id) REFERENCES public.found_items(id);

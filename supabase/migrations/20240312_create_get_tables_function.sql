
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

-- Create function to clear all data from a table
CREATE OR REPLACE FUNCTION public.admin_clear_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'TRUNCATE TABLE public.' || quote_ident(table_name) || ' CASCADE';
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.admin_clear_table(text) IS 'Clears all data from a specified table (admin use only)';

-- Create a function to reset profiles but keep structure
CREATE OR REPLACE FUNCTION public.admin_reset_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep admin users but clear regular user profiles
  DELETE FROM public.profiles 
  WHERE id NOT IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.admin_reset_profiles() IS 'Resets all user profiles except admin users';

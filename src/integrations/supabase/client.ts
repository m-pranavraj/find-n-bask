
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://owuvfujjvlpjbkvxdafz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dXZmdWpqdmxwamJrdnhkYWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MDk5NzYsImV4cCI6MjA1NjE4NTk3Nn0.oS3i2I6_ns7ixo1fw_rEJdlhOIcrIiKJqCh7aniafwQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Supabase-Client-Info': 'lovable-app',
      },
    },
  }
);

// Initialize application - create required storage buckets if they don't exist
(async () => {
  try {
    console.log("Checking if required storage buckets exist...");
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return;
    }
    
    // Check if found-item-images bucket exists
    const foundItemBucket = buckets.find(bucket => bucket.name === 'found-item-images');
    
    if (!foundItemBucket) {
      console.log("Creating found-item-images bucket...");
      // Note: This will only work with service_role key, not anon key
      // This is handled server-side via SQL migrations
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
})();

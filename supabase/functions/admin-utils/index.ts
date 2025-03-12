
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request
    const requestData = await req.json();
    const { operation } = requestData;
    
    let result;
    
    switch (operation) {
      case "getTables":
        // Query to get all tables in the public schema
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_tables');
          
        if (tablesError) {
          throw tablesError;
        }
        
        result = tables;
        break;
        
      case "deleteStorage":
        const { path, bucket } = requestData;
        
        if (!path || !bucket) {
          throw new Error("Missing path or bucket for storage deletion");
        }
        
        const { error: storageError } = await supabase
          .storage
          .from(bucket)
          .remove([path]);
          
        if (storageError) {
          throw storageError;
        }
        
        result = { success: true, message: "File deleted successfully" };
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Admin utils error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

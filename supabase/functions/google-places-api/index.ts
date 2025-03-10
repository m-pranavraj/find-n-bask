
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") || "";

if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { input, sessionToken } = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: "Input parameter is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`Searching for places with input: "${input}"`);

    // Call Google Places Autocomplete API
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.append("input", input);
    url.searchParams.append("key", GOOGLE_API_KEY);
    
    // Add optional parameters
    if (sessionToken) {
      url.searchParams.append("sessiontoken", sessionToken);
    }
    
    // For focusing on places in India
    url.searchParams.append("components", "country:in");
    
    console.log(`Making request to Google Places API: ${url.toString().replace(GOOGLE_API_KEY, "API_KEY_REDACTED")}`);
    
    const response = await fetch(url.toString());
    const data = await response.json();

    console.log(`Got ${data.predictions?.length || 0} predictions from Google Places API`);

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch place suggestions", 
          details: data.error_message,
          status: data.status
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Transform the response to match our application's format
    const suggestions = data.predictions.map((prediction: any) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: {
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text,
      },
    }));

    return new Response(JSON.stringify({ suggestions }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in Google Places API function:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch place suggestions", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});

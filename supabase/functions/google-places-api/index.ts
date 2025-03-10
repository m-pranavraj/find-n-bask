
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") || "";

if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY environment variable");
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
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
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Call Google Places Autocomplete API
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.append("input", input);
    url.searchParams.append("key", GOOGLE_API_KEY);
    
    // Add optional parameters
    if (sessionToken) {
      url.searchParams.append("sessiontoken", sessionToken);
    }
    
    // For focusing on places in India, you can add this parameter
    url.searchParams.append("components", "country:in");
    
    const response = await fetch(url.toString());
    const data = await response.json();

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
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in Google Places API function:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch place suggestions" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

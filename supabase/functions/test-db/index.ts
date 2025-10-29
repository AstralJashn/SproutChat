import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const result = {
      step: "1-env-check",
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValue: supabaseUrl || "missing",
    };

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    result.step = "2-creating-client";
    const supabase = createClient(supabaseUrl, supabaseKey);

    result.step = "3-querying-db";
    const { data, error } = await supabase
      .from("api_keys")
      .select("provider, model, user_id")
      .eq("provider", "groq")
      .is("user_id", null)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ ...result, step: "4-db-error", error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ...result, step: "5-success", found: !!data, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

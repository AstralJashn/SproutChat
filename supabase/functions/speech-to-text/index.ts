import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const audioFile = formData.get('file');
    const model = formData.get('model') || 'whisper-large-v3';
    const language = formData.get('language') || 'en';

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Audio file is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[STT] Audio file received:', audioFile.size, 'bytes');

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('provider', 'groq')
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      console.error('[STT] Groq API key not found in database');
      return new Response(
        JSON.stringify({
          error: "Groq API key not configured",
          message: "Get free key at https://console.groq.com"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const groqApiKey = apiKeyData.api_key;

    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', model as string);
    groqFormData.append('language', language as string);
    groqFormData.append('temperature', '0.0');
    groqFormData.append('response_format', 'verbose_json');

    console.log('[STT] Sending to Groq Whisper API');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const groqResponse = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
          },
          body: groqFormData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('[STT] Groq API error:', groqResponse.status, errorText);
        return new Response(
          JSON.stringify({
            error: "Whisper API failed",
            details: errorText,
            status: groqResponse.status
          }),
          {
            status: groqResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const result = await groqResponse.json();
      console.log('[STT] Transcription successful:', result.text?.length || 0, 'chars');

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('[STT] Request timeout after 25s');
        return new Response(
          JSON.stringify({
            error: "Request timeout",
            message: "Speech recognition took too long"
          }),
          {
            status: 408,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('[STT] Error:', error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
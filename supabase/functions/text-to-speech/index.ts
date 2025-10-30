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

    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('provider', 'murf')
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      console.log('[TTS] No Murf API key, falling back to browser TTS');
      return new Response(
        JSON.stringify({
          error: "use_browser_tts",
          message: "Murf API key not configured"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const murfApiKey = apiKeyData.api_key;
    const voiceId = "en-AU-kylie";
    const maxTextLength = 3000;

    const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) + '...' : text;

    console.log('[TTS] Calling Murf API', {
      textLength: truncatedText.length,
      originalLength: text.length,
      truncated: text.length > maxTextLength,
      voiceId
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    try {
      const murfResponse = await fetch(
        "https://api.murf.ai/v1/speech/generate",
        {
          method: "POST",
          headers: {
            "api-key": murfApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: truncatedText,
            voiceId: voiceId,
            style: "Conversational",
            modelVersion: "GEN2",
            rate: 5,
            pitch: 0,
            format: "MP3",
            sampleRate: 48000,
            audioBitRate: 128
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!murfResponse.ok) {
        const errorText = await murfResponse.text();
        console.error('[TTS] Murf API error:', murfResponse.status, errorText);

        console.log('[TTS] Falling back to browser TTS');
        return new Response(
          JSON.stringify({
            error: "use_browser_tts",
            message: "Murf API failed, using browser text-to-speech"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const responseData = await murfResponse.json();

      if (!responseData.audioFile) {
        console.error('[TTS] No audioFile in response:', responseData);
        return new Response(
          JSON.stringify({
            error: "use_browser_tts",
            message: "No audio file in Murf response"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const audioUrl = responseData.audioFile;
      console.log('[TTS] Murf audio URL received, returning URL to client for direct streaming');

      return new Response(
        JSON.stringify({
          audioUrl: audioUrl,
          success: true,
          duration: responseData.duration || null
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        }
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('[TTS] Request timeout after 40s');
        return new Response(
          JSON.stringify({
            error: "use_browser_tts",
            message: "TTS request timeout, using browser fallback"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('[TTS] Error:', error);
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
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QueryIntent {
  type: 'navigation' | 'general';
  navigationRequest?: {
    from: string;
    to: string;
    mode: 'driving' | 'walking' | 'cycling';
  };
}

interface NavigationExtraction {
  isNavigation: boolean;
  from?: string;
  to?: string;
  mode?: 'driving' | 'walking' | 'cycling';
}

async function useGroqForNavigationExtraction(query: string, supabase: any): Promise<NavigationExtraction | null> {
  try {
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('provider', 'groq')
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      console.error('[GROQ NAV] ❌ Groq API key not found in database!');
      console.error('[GROQ NAV] Navigation detection REQUIRES Groq AI.');
      console.error('[GROQ NAV] Get free key at: https://console.groq.com');
      console.error('[GROQ NAV] Add to database via your app settings');
      throw new Error('Groq API key not configured in database. Get free key at https://console.groq.com');
    }

    const groqApiKey = apiKeyData.api_key;

    const prompt = `You are a PRECISE navigation intent analyzer. Your job is to distinguish between:
1. ACTUAL navigation requests (user wants directions/route to a physical place)
2. INFORMATIONAL questions (user asking for advice/information about places/safety)

User query: "${query}"

🚨 CRITICAL: Only classify as navigation if the user wants PHYSICAL DIRECTIONS to travel somewhere RIGHT NOW.

✅ IS NAVIGATION (return true):
- "take me to Oslo"
- "directions to the hospital"
- "navigate to Bergen"
- "show me the route to the airport"
- "how do I get to the train station" (wants physical route)
- "I need to go to Stavanger" (wants to travel there)
- "guide me to the nearest shelter"
- "til Oslo" / "to Paris" / "a Madrid"

❌ NOT NAVIGATION (return false):
- "where should I go during an earthquake?" → Asking for SAFETY ADVICE, not directions
- "what's the safest place in a hurricane?" → Asking for INFORMATION
- "where is water found?" → General question
- "where should I evacuate to?" → Asking for ADVICE on where to evacuate (informational)
- "what places are safe during a tornado?" → Asking for INFORMATION
- "tell me about Oslo" → Information request
- "where is Norway?" → Geographic information
- "what should I do in an emergency?" → Advice question

KEY RULE: If the query is asking for ADVICE, RECOMMENDATIONS, or INFORMATION about places/safety → NOT navigation.
Only actual "take me there" / "show me the route" / "navigate to" = navigation.

EXTRACT (only if IS navigation):
1. from: Starting location (default: "Current Location" if not mentioned)
2. to: Destination (specific place name they want directions to)
3. mode: "driving" (default), "walking" (if walking/foot mentioned), "cycling" (if bike/cycling mentioned)

Respond with ONLY valid JSON (no other text):
{"isNavigation": true, "from": "X", "to": "Y", "mode": "driving/walking/cycling"}

OR if NOT navigation:
{"isNavigation": false}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are an ultra-precise navigation intent analyzer. Respond with ONLY valid JSON, no other text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ NAV] ❌ API error:', response.status, errorText);

      if (response.status === 429) {
        console.error('[GROQ NAV] 🚫 QUOTA EXCEEDED - Free tier limit reached!');
        console.error('[GROQ NAV] Get more at: https://console.groq.com');
      } else if (response.status === 401) {
        console.error('[GROQ NAV] 🔑 INVALID API KEY');
      }

      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    const jsonMatch = content.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return null;
    }

    const extracted: NavigationExtraction = JSON.parse(jsonMatch[0]);
    console.log('[GROQ NAV] Extracted:', extracted);

    return extracted;
  } catch (error) {
    console.error('[GROQ NAV ERROR]', error);
    return null;
  }
}

async function analyzeQueryIntent(query: string, supabase: any): Promise<QueryIntent> {
  console.log('[AI NAV] 🤖 Using Groq AI for ultra-intelligent navigation detection...');

  const groqExtraction = await useGroqForNavigationExtraction(query, supabase);

  if (groqExtraction?.isNavigation && groqExtraction.to) {
    const navigationRequest = {
      from: groqExtraction.from || 'Current Location',
      to: groqExtraction.to,
      mode: groqExtraction.mode || 'driving'
    };
    console.log('[AI NAV] ✅ Groq AI detected navigation:', navigationRequest);

    return {
      type: 'navigation',
      navigationRequest
    };
  }

  console.log('[AI NAV] ℹ️ Not a navigation request, treating as general query');
  return {
    type: 'general'
  };
}

async function streamGroqResponse(
  userQuery: string,
  supabase: any
): Promise<ReadableStream> {
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('api_key, model')
    .eq('provider', 'groq')
    .maybeSingle();

  if (apiKeyError || !apiKeyData) {
    throw new Error('Groq API key not configured in database');
  }

  const apiKey = apiKeyData.api_key;
  const model = apiKeyData.model || 'llama-3.3-70b-versatile';

  const systemPrompt = `You are a survival expert. Give clear, actionable advice. Be concise.`;

  console.log('[GROQ CHAT] Streaming with model:', model);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ],
      temperature: 0.5,
      max_tokens: 300,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[GROQ CHAT ERROR]', response.status, errorText);
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            break;
          }

          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }

    const userMessage = messages[messages.length - 1];
    const userQuery = userMessage.content;

    console.log(`\n[CHAT] User query: "${userQuery}"`);

    const navKeywords = ['navigate', 'directions', 'route', 'take me', 'guide me', 'how do i get', 'show me the way'];
    const isLikelyNavigation = navKeywords.some(kw => userQuery.toLowerCase().includes(kw));

    let intent: QueryIntent;

    if (isLikelyNavigation) {
      intent = await analyzeQueryIntent(userQuery, supabase);
      console.log(`[CHAT] Intent:`, intent.type);

      if (intent.type === 'navigation' && intent.navigationRequest) {
        const { from, to, mode } = intent.navigationRequest;
        const modeText = mode === 'walking' ? 'walking' : mode === 'cycling' ? 'cycling' : 'driving';
        const fromText = from === 'Current Location' ? 'your current location' : from;

        return new Response(
          JSON.stringify({
            content: `🧭 Here is your route from ${fromText} to ${to} by ${modeText}. The map below shows the detailed path with turn-by-turn directions.`,
            intent,
            navigationData: {
              from,
              to,
              mode
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      intent = { type: 'general' };
      console.log(`[CHAT] Skipping navigation check (no nav keywords)`);
    }

    console.log('[CHAT] 🤖 Streaming Groq AI response');

    const stream = await streamGroqResponse(userQuery, supabase);

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error("[CHAT ERROR]", error);

    const errorMessage = error.message || "Sorry, there was an error processing your request. Please try again.";

    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

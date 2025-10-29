import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function testOpenAI(apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "test" }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "success";
}

async function testMistral(apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "test" }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "success";
}

async function testGroq(apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "test" }],
      max_tokens: 10,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "success";
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { provider, model, apiKey } = await req.json();

    if (!provider || !model || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let result: string;

    switch (provider) {
      case "openai":
        result = await testOpenAI(apiKey, model);
        break;
      case "mistral":
        result = await testMistral(apiKey, model);
        break;
      case "groq":
        result = await testGroq(apiKey, model);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

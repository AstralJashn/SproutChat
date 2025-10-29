import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PlantSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images?: Array<{ url: string }>;
  details?: {
    common_names?: string[];
    taxonomy?: {
      genus?: string;
      family?: string;
    };
    url?: string;
    wiki_url?: string;
    edible_parts?: string[];
    watering?: { min?: number; max?: number };
    propagation_methods?: string[];
  };
}

interface KindwiseResponse {
  result?: {
    classification?: {
      suggestions?: PlantSuggestion[];
    };
  };
  access_token?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('provider', 'kindwise')
      .maybeSingle();

    if (apiKeyError) {
      console.error('[Kindwise] Error fetching API key:', apiKeyError);
      throw new Error('Failed to fetch Kindwise API key');
    }

    if (!apiKeyData || !apiKeyData.api_key) {
      console.error('[Kindwise] No API key found in database');
      return new Response(
        JSON.stringify({
          content: `# Plant Identification Setup Required\n\nTo identify plants, you need to add a Kindwise Plant.id API key:\n\n1. Visit [kindwise.com](https://kindwise.com) and sign up for a free account\n2. Get your API key from the dashboard\n3. Store it in the database with provider 'kindwise'\n\n**Note:** For mushroom identification, use the Mushroom.id API instead, as it's specialized for fungi.`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    console.log('[Kindwise] Calling Plant.id API...');

    const kindwiseResponse = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Api-Key': apiKeyData.api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [`data:image/jpeg;base64,${image}`],
        similar_images: true,
        latitude: 0,
        longitude: 0,
      })
    });

    if (!kindwiseResponse.ok) {
      const errorText = await kindwiseResponse.text();
      console.error('[Kindwise] API error:', kindwiseResponse.status, errorText);
      throw new Error(`Kindwise API error: ${kindwiseResponse.status}`);
    }

    const data: KindwiseResponse = await kindwiseResponse.json();
    console.log('[Kindwise] API response received');

    if (!data.result?.classification?.suggestions || data.result.classification.suggestions.length === 0) {
      return new Response(
        JSON.stringify({
          content: `# Unable to Identify Plant\n\nI couldn't identify this plant from the photo. This could be because:\n\n• The image is unclear or too far away\n• The plant is not in the database\n• The lighting conditions are poor\n\n**What to do next:**\n\nDescribe what you see:\n• Leaf shape and arrangement\n• Flower color and shape\n• Berries or fruits\n• Bark texture\n• Location and habitat\n\nI'll help you identify if it's safe to eat.\n\n**Note:** If this is a mushroom, please use the Mushroom.id API as this tool is optimized for plants.`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const topSuggestion = data.result.classification.suggestions[0];
    const confidence = Math.round(topSuggestion.probability * 100);

    if (confidence < 30) {
      const suggestions = data.result.classification.suggestions.slice(0, 3);
      const suggestionsList = suggestions.map((s, i) =>
        `${i + 1}. **${s.details?.common_names?.[0] || s.name}** (${Math.round(s.probability * 100)}% confidence)`
      ).join('\n');

      return new Response(
        JSON.stringify({
          content: `# Low Confidence Identification\n\nI found some possible matches, but confidence is too low to make a reliable identification:\n\n${suggestionsList}\n\n**Why low confidence?**\n\n• Image may be unclear or taken from wrong angle\n• Plant may be partially visible\n• Lighting conditions not ideal\n• Young plant without distinctive features\n• Uncommon species or hybrid\n\n**What to do next:**\n\nFor better results:\n• Take a clearer, well-lit photo\n• Include flowers, fruits, or distinctive features\n• Show leaf arrangement and shape clearly\n• Take photo from multiple angles\n\nOr describe the plant details so I can help identify it manually.\n\n⚠️ **SAFETY WARNING:** Never consume any plant unless you are 100% certain of its identity.`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const scientificName = topSuggestion.name || 'Unknown';
    const commonNames = topSuggestion.details?.common_names?.slice(0, 3).join(', ') || scientificName;
    const wikiUrl = topSuggestion.details?.wiki_url || topSuggestion.details?.url;
    const edibleParts = topSuggestion.details?.edible_parts || [];

    let edibilityInfo = '';
    if (edibleParts.length > 0) {
      edibilityInfo = `\n\n# Edibility\n\n**Edible parts:** ${edibleParts.join(', ')}\n\n⚠️ **IMPORTANT SAFETY WARNING:**\n• Always be 100% certain of identification before consuming\n• Some plants have toxic look-alikes\n• Consult multiple field guides and experts\n• When in doubt, don't eat it\n• Start with small amounts to test for allergies`;
    } else {
      edibilityInfo = `\n\n# Edibility Unknown\n\nThis database doesn't have edibility information for this plant.\n\n⚠️ **DO NOT EAT unless you can verify it's safe from multiple reliable sources.**`;
    }

    const familyInfo = topSuggestion.details?.taxonomy?.family
      ? `\n**Family:** ${topSuggestion.details.taxonomy.family}`
      : '';

    const genusInfo = topSuggestion.details?.taxonomy?.genus
      ? `\n**Genus:** ${topSuggestion.details.taxonomy.genus}`
      : '';

    const wikiLink = wikiUrl ? `\n\n[Learn more on Wikipedia →](${wikiUrl})` : '';

    const otherSuggestions = data.result.classification.suggestions.slice(1, 4);
    let alternativesSection = '';
    if (otherSuggestions.length > 0) {
      alternativesSection = '\n\n# Other Possibilities\n\n' + otherSuggestions.map((s, i) =>
        `${i + 1}. **${s.details?.common_names?.[0] || s.name}** (${Math.round(s.probability * 100)}% match)`
      ).join('\n');
    }

    const mushroomNote = scientificName.toLowerCase().includes('fungi') ||
                        scientificName.toLowerCase().includes('mushroom') ||
                        commonNames.toLowerCase().includes('mushroom')
      ? '\n\n**Note:** This appears to be a mushroom/fungus. For better accuracy, please use the **Mushroom.id API** which specializes in fungi identification.'
      : '';

    const confidenceWarning = confidence < 70
      ? '\n\n⚠️ **Moderate Confidence:** This identification has moderate confidence. For safety, verify with multiple sources before considering edibility.'
      : confidence < 90
      ? '\n\n✓ **Good Confidence:** This identification is fairly reliable, but always verify with field guides before consuming.'
      : '\n\n✓ **High Confidence:** This identification is highly reliable.';

    const content = `# Plant Identified: ${commonNames}\n\n**Scientific name:** *${scientificName}*${familyInfo}${genusInfo}\n**Confidence:** ${confidence}%${confidenceWarning}${edibilityInfo}${wikiLink}${alternativesSection}${mushroomNote}\n\n---\n\n**Remember:** In survival situations, proper plant identification can be life-saving. Never consume a plant unless you are absolutely certain of its identity and edibility.`;

    return new Response(
      JSON.stringify({ content }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[Kindwise] Error:', error);
    return new Response(
      JSON.stringify({
        content: `# Identification Failed\n\nThere was an error identifying this plant: ${error.message}\n\nPlease try again or describe the plant manually so I can help identify if it's safe to eat.`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
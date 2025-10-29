import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChunkData {
  content: string;
  questionVariants: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { title, content, source, chunks, documentId, questionVariants } = await req.json() as {
      title?: string;
      content?: string;
      source?: string;
      chunks?: ChunkData[];
      documentId?: string;
      questionVariants?: string[];
    };

    // Mode 1: Add single chunk to existing document
    if (documentId && content && questionVariants) {
      console.log(`Adding single chunk to document: ${documentId}`);

      const { data: existingChunks } = await supabase
        .from("document_chunks")
        .select("chunk_index")
        .eq("document_id", documentId)
        .order("chunk_index", { ascending: false })
        .limit(1);

      const nextIndex = existingChunks && existingChunks.length > 0 ? existingChunks[0].chunk_index + 1 : 0;

      const model = new Supabase.ai.Session("gte-small");
      const variantSample = questionVariants.slice(0, 10).join(" ");
      const textForEmbedding = `${content} ${variantSample}`;

      console.log(`Generating embedding...`);
      const embeddingResult = await model.run(textForEmbedding, {
        mean_pool: true,
        normalize: true,
      });

      let embeddingVector;
      if (Array.isArray(embeddingResult.output)) {
        embeddingVector = JSON.stringify(embeddingResult.output);
      } else if (embeddingResult.output?.data && Array.isArray(embeddingResult.output.data)) {
        embeddingVector = JSON.stringify(embeddingResult.output.data);
      } else {
        embeddingVector = JSON.stringify(embeddingResult);
      }

      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert({
          document_id: documentId,
          chunk_index: nextIndex,
          content: content,
          embedding: embeddingVector,
          metadata: {
            question_variants: questionVariants,
            variant_count: questionVariants.length,
          },
        });

      if (chunkError) throw chunkError;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Chunk ${nextIndex} added successfully`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mode 2: Add full document with chunks
    if (!title || !content || !chunks) {
      throw new Error("Missing required fields: title, content, and chunks");
    }

    console.log(`Adding document: ${title}`);
    console.log(`Total chunks: ${chunks.length}`);

    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        title,
        content,
        source: source || "",
        metadata: { chunk_count: chunks.length },
      })
      .select()
      .single();

    if (docError) throw docError;
    console.log(`Document created with ID: ${document.id}`);

    const model = new Supabase.ai.Session("gte-small");
    let processedCount = 0;

    // Process chunks sequentially with small batches to avoid timeout
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);

      const variantSample = chunk.questionVariants.slice(0, 10).join(" ");
      const textForEmbedding = `${chunk.content} ${variantSample}`;

      console.log(`Generating embedding...`);
      const embeddingResult = await model.run(textForEmbedding, {
        mean_pool: true,
        normalize: true,
      });

      let embeddingVector;
      if (Array.isArray(embeddingResult.output)) {
        embeddingVector = JSON.stringify(embeddingResult.output);
      } else if (embeddingResult.output?.data && Array.isArray(embeddingResult.output.data)) {
        embeddingVector = JSON.stringify(embeddingResult.output.data);
      } else {
        embeddingVector = JSON.stringify(embeddingResult);
      }

      console.log(`Inserting chunk ${i + 1}...`);
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert({
          document_id: document.id,
          chunk_index: i,
          content: chunk.content,
          embedding: embeddingVector,
          metadata: {
            question_variants: chunk.questionVariants,
            variant_count: chunk.questionVariants.length,
          },
        });

      if (chunkError) {
        console.error(`Error inserting chunk ${i}:`, chunkError);
        throw chunkError;
      }

      processedCount++;
      console.log(`Chunk ${i + 1} completed`);
    }

    console.log(`All chunks processed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        document_id: document.id,
        chunks_added: processedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding knowledge:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

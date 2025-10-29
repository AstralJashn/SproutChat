/*
  # Survival Knowledge Base Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key) - Unique document identifier
      - `title` (text) - Document title or filename
      - `content` (text) - Full document text content
      - `source` (text) - Original source or URL
      - `uploaded_at` (timestamptz) - Upload timestamp
      - `metadata` (jsonb) - Additional metadata (file size, type, etc.)

    - `document_chunks`
      - `id` (uuid, primary key) - Unique chunk identifier
      - `document_id` (uuid, foreign key) - Reference to parent document
      - `chunk_index` (integer) - Order within document
      - `content` (text) - Chunk text content
      - `embedding` (vector(384)) - Semantic embedding vector
      - `metadata` (jsonb) - Chunk-specific metadata (page number, section, etc.)
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Allow public read access for retrieval (survival knowledge is public)
    - Restrict writes to authenticated users only

  3. Indexes
    - Vector similarity search index on embeddings
    - Foreign key index for chunk lookups
    - Text search index on content

  4. Important Notes
    - Uses pgvector extension for semantic search
    - Embedding dimension is 384 (matches gte-small model)
    - Chunks are typically 500-1000 tokens with 100 token overlap
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  source text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create document_chunks table with embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(384),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Documents policies: public read, authenticated write
CREATE POLICY "Anyone can view documents"
  ON documents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Document chunks policies: public read, authenticated write
CREATE POLICY "Anyone can view document chunks"
  ON document_chunks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert chunks"
  ON document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chunks"
  ON document_chunks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chunks"
  ON document_chunks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id
  ON document_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at
  ON documents(uploaded_at DESC);

-- Create function for semantic search
CREATE OR REPLACE FUNCTION search_survival_knowledge(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_title text,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id AS chunk_id,
    dc.document_id,
    d.title AS document_title,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

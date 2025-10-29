import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_SERVICE_ROLE_KEY = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

const guideData = JSON.parse(
  readFileSync(join(__dirname, '..', 'concise-disaster-guide.json'), 'utf-8')
);

async function addConciseGuide() {
  console.log('🚀 Adding Concise Disaster Guide');
  console.log('=====================================\n');

  // Create document
  const docResponse = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      title: guideData.title,
      content: guideData.content,
      source: guideData.source
    })
  });

  const docResult = await docResponse.json();
  const doc = Array.isArray(docResult) ? docResult[0] : docResult;

  if (!doc || !doc.id) {
    console.error('Failed to create document:', docResult);
    return;
  }

  console.log(`✅ Document created: ${doc.id}\n`);

  let successCount = 0;

  for (let i = 0; i < guideData.chunks.length; i++) {
    const chunk = guideData.chunks[i];
    const firstLine = chunk.content.split('\n')[0];

    console.log(`[${i+1}/${guideData.chunks.length}] ${firstLine}`);

    const chunkResponse = await fetch(`${SUPABASE_URL}/rest/v1/document_chunks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        document_id: doc.id,
        chunk_index: i,
        content: chunk.content
      })
    });

    if (chunkResponse.ok) {
      successCount++;
      console.log(`   ✅ Added\n`);
    } else {
      console.log(`   ❌ Failed\n`);
    }
  }

  console.log('================================================================================\n');
  console.log(`✅ ${successCount}/${guideData.chunks.length} chunks added successfully!\n`);
}

addConciseGuide().catch(console.error);

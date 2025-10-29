import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

// Test with completely diverse queries - NO hardcoded patterns
const testQueries = [
  "earthquake",
  "panic",
  "flood",
  "power outage",
  "hurricane",
  "tornado",
  "shelter",
  "water",
  "fire",
  "stress",
  "emergency",
  "evacuation"
];

async function testQuery(query) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: query }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ "${query}" - ERROR: ${error.substring(0, 150)}`);
      return false;
    }

    const result = await response.json();
    const preview = result.content.substring(0, 200).replace(/\n/g, ' ');
    console.log(`✅ "${query}" - ${preview}...`);
    return true;

  } catch (error) {
    console.log(`❌ "${query}" - EXCEPTION: ${error.message}`);
    return false;
  }
}

(async () => {
  console.log('PURE SEMANTIC SEARCH TEST');
  console.log('No hardcoded expansions - pure text matching\n');
  console.log('='.repeat(80) + '\n');

  let successCount = 0;

  for (const query of testQueries) {
    const success = await testQuery(query);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nRESULTS: ${successCount}/${testQueries.length} queries returned knowledge`);
  console.log(`Success rate: ${((successCount / testQueries.length) * 100).toFixed(1)}%\n`);
})();

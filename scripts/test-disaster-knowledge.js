import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

const testQuestions = [
  "What should I do during an earthquake?",
  "How do I prepare for a hurricane?",
  "Can I drive through flood water?",
  "Where is the safest place during a tornado?"
];

async function testQuery(question) {
  console.log('\n' + '='.repeat(80));
  console.log('Question: ' + question);
  console.log('='.repeat(80));

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: question }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('Error:', error.substring(0, 200));
      return;
    }

    const result = await response.json();
    console.log('\nAI Response:');
    console.log(result.content);
    console.log('');

  } catch (error) {
    console.log('Exception:', error.message);
  }
}

(async () => {
  console.log('Testing Disaster Knowledge Integration');
  console.log('=======================================\n');

  for (const question of testQuestions) {
    await testQuery(question);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\nTest complete!');
})();

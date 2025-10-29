import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const testQuestions = [
  // Psychology questions - various phrasings
  "How do I stay calm in a crisis?",
  "What is box breathing?",
  "Why do people panic in emergencies?",
  "How does stress affect my memory?",
  "What is the STOP technique?",
  "How can I maintain hope during survival?",
  "Why is mental resilience important?",
  "What are grounding techniques?",
  "How do I practice meditation?",
  "What breathing exercises help with panic?",

  // Shelter questions - various phrasings
  "How do I build a shelter?",
  "What is the biggest survival threat?",
  "How do I build a snow cave?",
  "Where should I build my shelter?",
  "How far should my fire be from shelter?",
  "What materials insulate best?",
  "How do I stay warm?",
  "What is wind chill?",
  "How do I prevent hypothermia?",
  "Why are wet clothes dangerous?",

  // Natural language variations
  "I'm feeling panicked, what should I do?",
  "Help me understand why I freeze up in emergencies",
  "Teach me how to build a debris hut",
  "I need to know about shelter location",
  "What's the best way to stay calm under pressure?",
];

async function testQuestion(question) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: question }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result.content;
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

async function main() {
  console.log('🧪 Testing SproutChat Knowledge Base');
  console.log('====================================\n');
  console.log(`Testing ${testQuestions.length} questions...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n[${i + 1}/${testQuestions.length}] Question: "${question}"`);
    console.log('─'.repeat(80));

    const answer = await testQuestion(question);

    if (answer.startsWith('ERROR:')) {
      console.log(`❌ ${answer}`);
      errorCount++;
    } else {
      console.log(`✅ Answer: ${answer.substring(0, 200)}${answer.length > 200 ? '...' : ''}`);
      successCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Successful: ${successCount}/${testQuestions.length}`);
  console.log(`   ❌ Errors: ${errorCount}/${testQuestions.length}`);
  console.log(`   Success rate: ${((successCount / testQuestions.length) * 100).toFixed(1)}%`);

  if (successCount === testQuestions.length) {
    console.log('\n🎉 All tests passed! Knowledge base is working correctly.');
  } else if (successCount > 0) {
    console.log('\n⚠️  Some tests passed, but there were errors.');
  } else {
    console.log('\n💥 All tests failed. Check your configuration.');
  }
}

main();

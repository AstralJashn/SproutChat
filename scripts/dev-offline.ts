import { ensureModel, loadModel, generate, unload } from '../src/offlineRuntime';

(async () => {
  try {
    console.log('=== Offline LLM Runtime Test ===\n');

    console.log('Step 1: Ensuring model is downloaded...');
    const path = await ensureModel(
      'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
      'TinyLlama.gguf'
    );
    console.log(`✓ Model available at: ${path}\n`);

    console.log('Step 2: Loading model into memory...');
    await loadModel({
      path,
      nCtx: 2048,
      nThreads: 4,
      useMetal: true
    });
    console.log('✓ Model loaded successfully\n');

    console.log('Step 3: Generating response...');
    console.log('Prompt: "Hello from offline Bolt app!"');
    console.log('Response: ');

    let tokenCount = 0;
    const startTime = Date.now();

    await generate(
      {
        prompt: 'Hello from offline Bolt app!',
        maxTokens: 64,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1
      },
      (token) => {
        process.stdout.write(token);
        tokenCount++;
      },
      (stats) => {
        const duration = Date.now() - startTime;
        console.log('\n');
        console.log('=== Generation Stats ===');
        console.log(`Tokens: ${stats.tokens}`);
        console.log(`Duration: ${stats.ms}ms`);
        console.log(`Tokens/sec: ${stats.tps.toFixed(2)}`);
        console.log(`Wall time: ${duration}ms`);
      }
    );

    console.log('\nStep 4: Unloading model...');
    await unload();
    console.log('✓ Model unloaded\n');

    console.log('=== Test completed successfully ===');
  } catch (error) {
    console.error('Error during offline test:', error);
    process.exit(1);
  }
})();

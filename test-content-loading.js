// Simple test to verify content loading works
import { readFileSync } from 'fs';

try {
  console.log('🧪 Testing content loading...');
  
  // Test JSON file loading
  const tips = JSON.parse(readFileSync('src/server/content/educational-tips.json', 'utf8'));
  const facts = JSON.parse(readFileSync('src/server/content/ai-facts.json', 'utf8'));
  const inspiration = JSON.parse(readFileSync('src/server/content/inspirational-content.json', 'utf8'));
  
  console.log('✅ JSON files loaded successfully:');
  console.log(`   - Tips: ${tips.tips.length}`);
  console.log(`   - Facts: ${facts.facts.length}`);
  console.log(`   - Quotes: ${inspiration.quotes.length}`);
  console.log(`   - Jokes: ${inspiration.jokes.length}`);
  
  // Test content samples
  console.log('\n📝 Sample content:');
  console.log(`   - Sample tip: "${tips.tips[0]}"`);
  console.log(`   - Sample fact: "${facts.facts[0]}"`);
  console.log(`   - Sample quote: "${inspiration.quotes[0]}"`);
  console.log(`   - Sample joke: "${inspiration.jokes[0]}"`);
  
} catch (error) {
  console.error('❌ Content loading test failed:', error);
  process.exit(1);
}

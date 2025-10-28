// Quick test to verify random content endpoint
const fetch = require('node-fetch');

async function testRandomContent() {
  try {
    console.log('Testing random content endpoint...');
    
    // Test multiple calls to verify randomness
    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Test ${i} ---`);
      
      const response = await fetch('http://localhost:3000/api/content/random');
      const data = await response.json();
      
      if (data.success) {
        console.log('✓ Success!');
        console.log('Tip:', data.tip.substring(0, 80) + '...');
        console.log('Fact:', data.fact.substring(0, 80) + '...');
        console.log('Inspiration:', data.inspiration.substring(0, 80) + '...');
      } else {
        console.log('✗ Failed:', data.error);
      }
    }
    
    // Test the regular current content endpoint too
    console.log('\n--- Testing current content endpoint ---');
    const currentResponse = await fetch('http://localhost:3000/api/content/current');
    const currentData = await currentResponse.json();
    
    if (currentData.success) {
      console.log('✓ Current content success!');
      console.log('Tip:', currentData.tip.substring(0, 80) + '...');
      console.log('Fact:', currentData.fact.substring(0, 80) + '...');
    } else {
      console.log('✗ Current content failed:', currentData.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRandomContent();

// Quick script to verify environment variables
const fs = require('fs');

console.log('\n📋 Checking Local Environment Variables:\n');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredVars.forEach(varName => {
  const line = lines.find(l => l.startsWith(varName));
  if (line) {
    const value = line.split('=')[1]?.replace(/"/g, '');
    console.log(`✅ ${varName}: ${value?.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
  }
});

console.log('\n⚠️  Make sure these same variables are set in Vercel:\n');
console.log('   1. Go to https://vercel.com/dashboard');
console.log('   2. Select your project');
console.log('   3. Go to Settings → Environment Variables');
console.log('   4. Verify all three variables are set\n');

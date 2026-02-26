const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  console.log('Analyzing user accounts and providers...\n');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total users: ${users.length}\n`);
  
  users.forEach((user, i) => {
    console.log(`[User ${i+1}]`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Provider: ${user.app_metadata?.provider || 'unknown'}`);
    console.log(`  All Providers: ${user.app_metadata?.providers?.join(', ') || 'none'}`);
    console.log(`  Identities: ${user.identities?.length || 0}`);
    if (user.identities && user.identities.length > 0) {
      user.identities.forEach((identity) => {
        console.log(`    - ${identity.provider} (${identity.identity_data?.email || 'no email'})`);
      });
    }
    console.log(`  Created: ${user.created_at}`);
    console.log(`  Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log('');
  });

  // Check if auto-linking is configured
  console.log('\n🔍 Checking Supabase Auth Configuration:');
  console.log('Note: Account linking settings must be checked in Supabase Dashboard');
  console.log('Go to: Authentication > Providers > Email');
  console.log('Setting: "Confirm email" should be enabled');
  console.log('Setting: "Allow duplicate emails" should be DISABLED\n');
})();

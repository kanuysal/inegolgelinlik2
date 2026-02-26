const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  console.log('Checking for duplicate emails in auth.users...\n');
  
  // Query users via admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by email
  const emailMap = new Map();
  users.forEach(user => {
    const email = user.email?.toLowerCase();
    if (!email) return;
    
    if (!emailMap.has(email)) {
      emailMap.set(email, []);
    }
    emailMap.get(email).push({
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider || 'email',
      providers: user.app_metadata?.providers || [],
      created_at: user.created_at,
      confirmed: user.email_confirmed_at ? 'Yes' : 'No'
    });
  });

  // Find duplicates
  const duplicates = [];
  emailMap.forEach((accounts, email) => {
    if (accounts.length > 1) {
      duplicates.push({ email, accounts });
    }
  });

  if (duplicates.length === 0) {
    console.log('✅ No duplicate emails found!');
    console.log(`Total users: ${users.length}`);
  } else {
    console.log(`🚨 Found ${duplicates.length} duplicate email(s):\n`);
    duplicates.forEach(({ email, accounts }) => {
      console.log(`📧 Email: ${email}`);
      console.log(`   Accounts: ${accounts.length}`);
      accounts.forEach((acc, i) => {
        console.log(`   [${i+1}] ID: ${acc.id.substring(0, 8)}...`);
        console.log(`       Provider: ${acc.provider}`);
        console.log(`       All Providers: ${acc.providers.join(', ')}`);
        console.log(`       Confirmed: ${acc.confirmed}`);
        console.log(`       Created: ${acc.created_at}`);
      });
      console.log('');
    });
  }
})();

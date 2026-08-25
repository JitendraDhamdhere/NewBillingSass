const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#]+?)=(.+)/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[key] = value;
  }
});

async function createAdmin() {
  console.log('Connecting to Supabase...');
  const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'],
    envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  );

  console.log('Creating admin account...');
  const { data, error } = await supabase.auth.signUp({
    email: 'jitendradeveloper333@gmail.com',
    password: 'password123',
  });

  if (error) {
    console.error('Error creating admin:', error.message);
  } else {
    console.log('\n✅ Admin account created successfully (or already exists)!');
    console.log('-------------------------------------------');
    console.log('Email:    jitendradeveloper333@gmail.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('You can now log in at http://localhost:3000/login');
  }
}

createAdmin();

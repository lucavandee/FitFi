#!/usr/bin/env node

/**
 * Supabase CLI setup script voor FitFi
 * Automatiseert de baseline migratie setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FitFi Supabase CLI Setup');
console.log('================================');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env bestand niet gevonden');
  console.log('📝 Kopieer .env.example naar .env en vul de Supabase credentials in');
  process.exit(1);
}

// Read environment variables
require('dotenv').config();

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF) {
  console.error('❌ SUPABASE_PROJECT_REF niet gevonden in .env');
  console.log('📝 Voeg SUPABASE_PROJECT_REF toe aan je .env bestand');
  process.exit(1);
}

console.log(`📋 Project ref: ${PROJECT_REF}`);

try {
  // Check Supabase CLI version
  console.log('\n🔍 Checking Supabase CLI...');
  const version = execSync('npx supabase --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Supabase CLI: ${version}`);

  // Login to Supabase (if access token provided)
  if (ACCESS_TOKEN) {
    console.log('\n🔐 Logging in to Supabase...');
    process.env.SUPABASE_ACCESS_TOKEN = ACCESS_TOKEN;
    execSync('npx supabase auth login --token $SUPABASE_ACCESS_TOKEN', { stdio: 'inherit' });
    console.log('✅ Logged in to Supabase');
  } else {
    console.log('\n🔐 Starting device flow login...');
    console.log('📱 Follow the instructions to login via browser');
    execSync('npx supabase auth login', { stdio: 'inherit' });
  }

  // Link project
  console.log('\n🔗 Linking project...');
  execSync(`npx supabase link --project-ref ${PROJECT_REF}`, { stdio: 'inherit' });
  console.log('✅ Project linked successfully');

  // Pull current schema as baseline
  console.log('\n📥 Pulling current database schema...');
  execSync('npx supabase db pull', { stdio: 'inherit' });
  console.log('✅ Schema pulled successfully');

  // Commit baseline migration
  console.log('\n💾 Creating baseline migration...');
  execSync('npx supabase db commit -m "baseline: synced production schema"', { stdio: 'inherit' });
  console.log('✅ Baseline migration created');

  console.log('\n🎉 Supabase CLI setup complete!');
  console.log('\n📚 Next steps:');
  console.log('   • Create new migrations: npx supabase db diff -f <migration_name>');
  console.log('   • Push migrations: npx supabase db push');
  console.log('   • Reset local DB: npx supabase db reset');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   • Check your SUPABASE_PROJECT_REF in .env');
  console.log('   • Ensure you have access to the Supabase project');
  console.log('   • Try manual login: npx supabase auth login');
  process.exit(1);
}
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPublish() {
  try {
    // Note: To test we need a valid user. But since we want to give the user the exact values:
    console.log("To run full test, we must execute inside React context because auth requires session.");
  } catch(e) {
    console.error(e);
  }
}
testPublish();

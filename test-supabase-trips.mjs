import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = 'https://izoytsibwmnzagbraqdg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3l0c2lid21uemFnYnJhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzAwNjIsImV4cCI6MjEwNDYwNjA2Mn0.hteTL5iggI1lltIDBIsO1q375DQiMNnQsntN3eU_jAk';
const supabase = createClient(url, key);

async function test() {
  console.log("Testing trips table select...");
  const { data, error } = await supabase.from('trips').select('*').limit(5);
  console.log("Data:", data?.length);
  if (error) console.error("Error:", error);
}

test();

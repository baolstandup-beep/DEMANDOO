// Configuration du client Supabase pour Demandoo
const SUPABASE_URL = 'https://izoytsibwmnzagbraqdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3l0c2lid21uemFnYnJhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzAwNjIsImV4cCI6MjEwNDYwNjA2Mn0.hteTL5iggI1lltIDBIsO1q375DQiMNnQsntN3eU_jAk';

// Initialisation du client Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

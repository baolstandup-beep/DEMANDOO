// ==============================================================================
// Demandoo — Supabase Client Configuration
// ==============================================================================

(function() {
  var url = 'https://izoytsibwmnzagbraqdg.supabase.co';
  var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3l0c2lid21uemFnYnJhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzAwNjIsImV4cCI6MjEwNDYwNjA2Mn0.hteTL5iggI1lltIDBIsO1q375DQiMNnQsntN3eU_jAk';

  window.DEMANDOO_SUPABASE_URL = url;
  window.DEMANDOO_SUPABASE_KEY = key;

  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.supabaseClient = window.supabase.createClient(url, key);
      console.log("[Demandoo] Client Supabase initialisé avec succès.");
    }
  } catch (e) {
    console.error("[Demandoo] Erreur init client Supabase:", e);
  }
})();

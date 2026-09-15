export default async function handler(req, res) {
  // CORS Headers pour permettre à l'application web d'appeler l'API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { driver_id, image_base64 } = req.body;

    if (!driver_id || !image_base64) {
      return res.status(400).json({ error: "Missing driver_id or image_base64" });
    }

    // Récupérer la clé Google Gemini depuis les variables d'environnement Vercel
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel" });
    }

    // Le prompt strict pour l'Agent IA
    const prompt = "Tu es un agent de sécurité intraitable de l'entreprise Demandoo. Analyse cette photo de permis de conduire ou carte d'identité. Vérifie si le document semble vrai, net, et légal. Réponds uniquement par un objet JSON strict avec deux clés : 'is_valid' (true ou false) et 'reason' (une phrase courte expliquant pourquoi).";

    // Nettoyer la chaîne base64 (enlever le préfixe data:image/jpeg;base64, si présent)
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");

    // 1. Appeler l'IA Google Gemini Vision
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    const geminiData = await geminiResponse.json();

    if (geminiData.error) {
      console.error("Gemini API Error:", geminiData.error);
      return res.status(500).json({ error: "Erreur de l'intelligence artificielle", details: geminiData.error });
    }

    // 2. Analyser la réponse de l'IA
    const textResponse = geminiData.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    // 3. Mettre à jour Supabase en fonction de la décision de l'IA
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clé secrète requise pour contourner RLS

    if (supabaseUrl && supabaseServiceKey) {
      if (result.is_valid) {
        // Approuver le compte
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${driver_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            driver_status: 'VERIFIED',
            kyc_status: 'verified',
            is_driver_active: true
          })
        });
      } else {
        // Rejeter le compte
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${driver_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            driver_status: 'REJECTED',
            kyc_status: 'rejected'
          })
        });
      }
    }

    // Retourner la décision de l'IA au client
    return res.status(200).json(result);

  } catch (error) {
    console.error("KYC Verification Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

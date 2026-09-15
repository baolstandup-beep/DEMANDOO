document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('driver-form');
  const alertContainer = document.getElementById('alert-container');

  // Vérifier si Supabase est correctement configuré
  const isConfigured = typeof SUPABASE_URL !== 'undefined' && 
                       typeof supabase !== 'undefined' && supabase !== null;

  if (!isConfigured) {
    showAlert('Erreur de configuration de la base de données.', 'danger');
    return;
  }

  // Soumission automatique du formulaire de conducteur
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enregistrement en cours...';

      try {
        const nom = document.getElementById('nom').value.trim();
        const prenom = document.getElementById('prenom').value.trim();
        const telephone = document.getElementById('telephone').value.trim();
        const email = document.getElementById('email').value.trim();
        const permisNumero = document.getElementById('permis_numero').value.trim();
        const vehiculeType = document.getElementById('vehicule_type').value;
        const ville = document.getElementById('ville').value.trim();
        const permisFile = document.getElementById('permis_file').files[0];

        let permisImageUrl = null;

        // 1. Upload automatique du document permis de conduire si fourni
        if (permisFile) {
          const fileExt = permisFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `permis/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('permis-conducteurs')
            .upload(filePath, permisFile);

          if (uploadError) {
            console.warn("Avertissement Upload :", uploadError.message);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('permis-conducteurs')
              .getPublicUrl(filePath);
            
            permisImageUrl = publicUrlData ? publicUrlData.publicUrl : null;
          }
        }

        // 2. Enregistrement automatique dans la table Supabase
        const { error } = await supabase
          .from('conducteurs')
          .insert([
            {
              nom,
              prenom,
              telephone,
              email: email || null,
              permis_numero: permisNumero,
              vehicule_type: vehiculeType,
              ville,
              permis_image_url: permisImageUrl,
              statut: 'en_attente'
            }
          ]);

        if (error) throw error;

        showAlert(`Merci ${prenom} ! Votre inscription est prise en compte et en attente de validation.`, 'success');
        form.reset();

      } catch (err) {
        console.error(err);
        showAlert(`Erreur lors de la sauvegarde : ${err.message || err}`, 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  function showAlert(message, type) {
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        ${message}
      </div>
    `;
  }

  function clearAlert() {
    if (alertContainer) alertContainer.innerHTML = '';
  }
});

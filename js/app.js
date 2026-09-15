document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('driver-form');
  const alertContainer = document.getElementById('alert-container');
  const driversList = document.getElementById('drivers-list');
  const emptyState = document.getElementById('empty-state');
  const configWarning = document.getElementById('config-warning');

  // Vérifier si Supabase est correctement configuré
  const isConfigured = typeof SUPABASE_URL !== 'undefined' && 
                       !SUPABASE_URL.includes('VOTRE-PROJET') && 
                       typeof supabase !== 'undefined' && supabase !== null;

  if (!isConfigured) {
    if (configWarning) configWarning.style.display = 'block';
  } else {
    if (configWarning) configWarning.style.display = 'none';
    chargerConducteurs();
  }

  // Soumission automatique du formulaire de conducteur
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      if (!isConfigured) {
        showAlert('Veuillez d\'abord configurer vos clés Supabase dans js/supabaseClient.js', 'danger');
        return;
      }

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
        const { data, error } = await supabase
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
          ])
          .select();

        if (error) throw error;

        showAlert(`Conducteur <strong>${prenom} ${nom}</strong> enregistré avec succès dans Demandoo !`, 'success');
        form.reset();
        chargerConducteurs();

      } catch (err) {
        console.error(err);
        showAlert(`Erreur lors de la sauvegarde : ${err.message || err}`, 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Chargement et affichage de la liste des conducteurs
  async function chargerConducteurs() {
    if (!isConfigured || !driversList) return;

    try {
      const { data: conducteurs, error } = await supabase
        .from('conducteurs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      driversList.innerHTML = '';

      if (!conducteurs || conducteurs.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      conducteurs.forEach(c => {
        const tr = document.createElement('tr');
        
        const dateFormatted = new Date(c.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const badgeClass = c.statut === 'valide' ? 'badge-success' : 
                           c.statut === 'suspendu' ? 'badge-danger' : 'badge-warning';

        const statutLabel = c.statut === 'valide' ? 'Validé' : 
                            c.statut === 'suspendu' ? 'Suspendu' : 'En attente';

        tr.innerHTML = `
          <td><strong>${escapeHtml(c.nom)} ${escapeHtml(c.prenom)}</strong></td>
          <td>${escapeHtml(c.telephone)}</td>
          <td><span class="tag">${escapeHtml(c.vehicule_type.toUpperCase())}</span></td>
          <td>${escapeHtml(c.ville)}</td>
          <td><code>${escapeHtml(c.permis_numero)}</code></td>
          <td>
            ${c.permis_image_url ? `<a href="${c.permis_image_url}" target="_blank" class="btn-link">📄 Voir permis</a>` : '<span class="text-muted">Aucun</span>'}
          </td>
          <td><span class="badge ${badgeClass}">${statutLabel}</span></td>
          <td><small>${dateFormatted}</small></td>
        `;
        driversList.appendChild(tr);
      });

    } catch (err) {
      console.error("Erreur de chargement :", err);
    }
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

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});

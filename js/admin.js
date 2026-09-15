document.addEventListener('DOMContentLoaded', async () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const driversList = document.getElementById('drivers-list');
  const emptyState = document.getElementById('empty-state');
  const alertContainer = document.getElementById('alert-container');

  // Vérifier la session actuelle
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showDashboard();
  }

  // Gérer la connexion
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showAlert(error.message, 'danger');
    } else {
      showDashboard();
    }
  });

  // Gérer la déconnexion
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    loginScreen.style.display = 'block';
    dashboardScreen.style.display = 'none';
    logoutBtn.style.display = 'none';
  });

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    logoutBtn.style.display = 'block';
    chargerConducteurs();
  }

  // Charger la liste
  async function chargerConducteurs() {
    try {
      const { data: conducteurs, error } = await supabase
        .from('conducteurs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      driversList.innerHTML = '';

      if (!conducteurs || conducteurs.length === 0) {
        emptyState.style.display = 'block';
        return;
      }
      emptyState.style.display = 'none';

      conducteurs.forEach(c => {
        const tr = document.createElement('tr');
        
        const dateFormatted = new Date(c.created_at).toLocaleDateString('fr-FR');
        const badgeClass = c.statut === 'valide' ? 'badge-success' : 
                           c.statut === 'suspendu' ? 'badge-danger' : 'badge-warning';
        const statutLabel = c.statut === 'valide' ? 'Validé' : 
                            c.statut === 'suspendu' ? 'Suspendu' : 'En attente';

        tr.innerHTML = `
          <td><strong>${escapeHtml(c.prenom)} ${escapeHtml(c.nom)}</strong></td>
          <td>${escapeHtml(c.telephone)}</td>
          <td><span class="tag">${escapeHtml(c.vehicule_type.toUpperCase())}</span></td>
          <td>${escapeHtml(c.ville)}</td>
          <td><code>${escapeHtml(c.permis_numero)}</code></td>
          <td>
            ${c.permis_image_url ? `<a href="${c.permis_image_url}" target="_blank" class="btn-link">📄 Voir</a>` : '-'}
          </td>
          <td><span class="badge ${badgeClass}" id="badge-${c.id}">${statutLabel}</span></td>
          <td><small>${dateFormatted}</small></td>
          <td style="display:flex; gap:8px;">
            <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--success)" onclick="changerStatut('${c.id}', 'valide')">Valider</button>
            <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--danger)" onclick="changerStatut('${c.id}', 'suspendu')">Suspendre</button>
          </td>
        `;
        driversList.appendChild(tr);
      });
    } catch (err) {
      showAlert(`Erreur chargement : ${err.message}`, 'danger');
    }
  }

  // Rendre la fonction changerStatut globale pour le onClick HTML
  window.changerStatut = async function(id, nouveauStatut) {
    if (!confirm(`Voulez-vous vraiment changer le statut à : ${nouveauStatut} ?`)) return;

    try {
      const { error } = await supabase
        .from('conducteurs')
        .update({ statut: nouveauStatut })
        .eq('id', id);

      if (error) throw error;
      
      showAlert('Statut mis à jour !', 'success');
      chargerConducteurs(); // Recharger la liste
    } catch (err) {
      showAlert(`Erreur mise à jour : ${err.message}`, 'danger');
    }
  };

  function showAlert(message, type) {
    alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => clearAlert(), 5000);
  }

  function clearAlert() {
    alertContainer.innerHTML = '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});

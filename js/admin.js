// ==============================================================================
// Demandoo — Administration
// Gestion de la connexion et de la validation des conducteurs
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Éléments DOM
  const loadingScreen = document.getElementById('loading-screen');
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('login-submit-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const driversList = document.getElementById('drivers-list');
  const emptyState = document.getElementById('empty-state');
  const alertContainer = document.getElementById('alert-container');

  // Gestion des états UI
  function showLoading() {
    if (loadingScreen) loadingScreen.style.display = 'block';
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  function showLogin() {
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'block';
    if (dashboardScreen) dashboardScreen.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  function showDashboard() {
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    chargerConducteurs();
  }

  function setSubmitLoading(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connexion...';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  }

  function showAlert(message, type = 'danger') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
  }

  function clearAlert() {
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 1. VÉRIFICATION INITIALE DE LA SESSION (Route Admin Protégée)
  async function checkAdminSession() {
    if (!supabase) {
      showAlert("Configuration Supabase manquante ou indisponible.", "danger");
      showLogin();
      return;
    }

    showLoading();

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        showLogin();
        return;
      }

      // Vérification stricte du rôle via app_metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        showLogin();
        return;
      }

      if (user?.app_metadata?.role === 'admin') {
        showDashboard();
      } else {
        await supabase.auth.signOut();
        showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
        showLogin();
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de session admin :", err);
      showLogin();
    }
  }

  // Écouter les changements d'état d'authentification Supabase
  if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        showLogin();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!session) {
          showLogin();
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.app_metadata?.role === 'admin') {
          showDashboard();
        } else {
          await supabase.auth.signOut();
          showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
          showLogin();
        }
      }
    });
  }

  // Lancer la vérification dès le chargement du DOM
  await checkAdminSession();

  // 2. SOUMISSION DU FORMULAIRE DE CONNEXION ADMIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const email = (emailInput?.value || '').trim();
      const password = passwordInput?.value || '';

      if (!email || !password) {
        showAlert("Veuillez renseigner votre email et mot de passe.", "danger");
        return;
      }

      if (!supabase) {
        showAlert("Service d'authentification non initialisé.", "danger");
        return;
      }

      setSubmitLoading(true);

      try {
        // Authentification via Supabase Auth uniquement
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          setSubmitLoading(false);
          const errCode = error.status || 0;
          const errMsg = (error.message || '').toLowerCase();

          if (errMsg.includes('invalid login') || errMsg.includes('invalid_grant') || errMsg.includes('credentials') || errCode === 400) {
            showAlert("Email ou mot de passe incorrect.", "danger");
          } else if (errMsg.includes('fetch') || errMsg.includes('network') || errCode >= 500) {
            showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
          } else {
            showAlert("Email ou mot de passe incorrect.", "danger");
          }
          return;
        }

        if (!data?.user) {
          setSubmitLoading(false);
          showAlert("Email ou mot de passe incorrect.", "danger");
          return;
        }

        // 3. VÉRIFICATION DU RÔLE ADMIN VIA app_metadata
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setSubmitLoading(false);
          await supabase.auth.signOut();
          showAlert("Impossible de récupérer les informations du compte.", "danger");
          return;
        }

        if (user?.app_metadata?.role === 'admin') {
          setSubmitLoading(false);
          clearAlert();
          showDashboard();
        } else {
          // Déconnexion immédiate si l'utilisateur n'est pas administrateur
          await supabase.auth.signOut();
          setSubmitLoading(false);
          showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
          showLogin();
        }
      } catch (err) {
        console.error("Exception connexion admin :", err);
        setSubmitLoading(false);
        showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
      }
    });
  }

  // 4. DÉCONNEXION ADMIN
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      clearAlert();
      if (supabase) {
        await supabase.auth.signOut();
      }
      showLogin();
      if (passwordInput) passwordInput.value = '';
    });
  }

  // 5. CHARGEMENT DES CONDUCTEURS (Dashboard)
  async function chargerConducteurs() {
    if (!driversList) return;

    try {
      const { data: conducteurs, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      if (error) {
        showAlert("Erreur lors de la récupération des conducteurs.", "danger");
        return;
      }

      driversList.innerHTML = '';

      if (!conducteurs || conducteurs.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      conducteurs.forEach(c => {
        const tr = document.createElement('tr');
        
        const dateFormatted = c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-';
        const badgeClass = c.driver_status === 'VERIFIED' ? 'badge-success' : 
                           c.driver_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning';
        const statutLabel = c.driver_status === 'VERIFIED' ? 'Validé' : 
                            c.driver_status === 'SUSPENDED' ? 'Suspendu' : 'En attente';

        tr.innerHTML = `
          <td><strong>${escapeHtml(c.full_name || 'Inconnu')}</strong></td>
          <td>${escapeHtml(c.phone || '-')}</td>
          <td><span class="tag">Chauffeur</span></td>
          <td>${escapeHtml(c.city || '-')}</td>
          <td><code>${escapeHtml(c.license_number || '-')}</code></td>
          <td>-</td>
          <td><span class="badge ${badgeClass}" id="badge-${c.id}">${statutLabel}</span></td>
          <td><small>${dateFormatted}</small></td>
          <td style="display:flex; gap:8px;">
            <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--success)" onclick="changerStatut('${c.id}', 'VERIFIED')">Valider</button>
            <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--danger)" onclick="changerStatut('${c.id}', 'SUSPENDED')">Suspendre</button>
          </td>
        `;
        driversList.appendChild(tr);
      });
    } catch (err) {
      console.error("Erreur chargement conducteurs :", err);
      showAlert("Impossible de charger la liste des conducteurs.", "danger");
    }
  }

  // 6. ACTION VALIDER / SUSPENDRE CONDUCTEUR
  window.changerStatut = async function(id, nouveauStatut) {
    if (!confirm(`Voulez-vous vraiment changer le statut à : ${nouveauStatut === 'VERIFIED' ? 'Validé' : 'Suspendu'} ?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          driver_status: nouveauStatut, 
          is_driver_active: nouveauStatut === 'VERIFIED' 
        })
        .eq('id', id);

      if (error) throw error;
      
      showAlert('Statut mis à jour avec succès.', 'success');
      chargerConducteurs();
    } catch (err) {
      console.error("Erreur mise à jour statut conducteur :", err);
      showAlert("Erreur lors de la mise à jour du statut.", "danger");
    }
  };
});

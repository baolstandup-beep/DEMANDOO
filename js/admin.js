// ==============================================================================
// Demandoo — Administration
// Gestion de la connexion et de la validation des conducteurs
// ==============================================================================

const SUPABASE_URL = 'https://izoytsibwmnzagbraqdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3l0c2lid21uemFnYnJhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzAwNjIsImV4cCI6MjEwNDYwNjA2Mn0.hteTL5iggI1lltIDBIsO1q375DQiMNnQsntN3eU_jAk';

function getSupabase() {
  if (window.supabaseClient) {
    return window.supabaseClient;
  }
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabaseClient;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = getSupabase();

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

  let isAuthenticating = false;

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
    if (emailInput && (!emailInput.value.includes('@') || emailInput.value.includes('773033196'))) {
      emailInput.value = '';
    }
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

  function checkAdminRole(user) {
    const role = user?.app_metadata?.role;
    return role === 'admin' || role === 'ADMIN' || (typeof role === 'string' && role.toLowerCase() === 'admin');
  }

  // 1. VÉRIFICATION INITIALE DE LA SESSION
  async function checkAdminSession() {
    if (!supabase) {
      console.warn("Client Supabase introuvable.");
      showLogin();
      return;
    }

    showLoading();

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        showLogin();
        return;
      }

      console.log("SESSION EXISTANTE :", session.user.email);
      console.log("APP METADATA :", session.user.app_metadata);
      console.log("ROLE ADMIN :", session.user.app_metadata?.role);

      if (checkAdminRole(session.user)) {
        showDashboard();
      } else {
        await supabase.auth.signOut();
        showLogin();
      }
    } catch (err) {
      console.error("Erreur vérification session admin :", err);
      showLogin();
    }
  }

  // Écouteur auth state change
  if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("ÉVÉNEMENT AUTH :", event);
      if (event === 'SIGNED_OUT') {
        showLogin();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!session || !session.user) {
          if (!isAuthenticating) showLogin();
          return;
        }

        if (checkAdminRole(session.user)) {
          showDashboard();
        } else if (!isAuthenticating) {
          await supabase.auth.signOut();
          showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
          showLogin();
        }
      }
    });
  }

  // Lancement de la vérification de session au chargement
  await checkAdminSession();

  // 2. SOUMISSION DU FORMULAIRE DE CONNEXION
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

      const client = getSupabase();
      if (!client) {
        showAlert("Service d'authentification indisponible.", "danger");
        return;
      }

      isAuthenticating = true;
      setSubmitLoading(true);

      try {
        console.log("Connexion avec Supabase Auth pour :", email);

        const { data, error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          console.error("Erreur de connexion Supabase Auth :", error);
          setSubmitLoading(false);
          isAuthenticating = false;
          const errMsg = (error.message || '').toLowerCase();
          if (errMsg.includes('invalid login') || errMsg.includes('invalid_grant') || errMsg.includes('credentials') || error.status === 400) {
            showAlert("Email ou mot de passe incorrect.", "danger");
          } else {
            showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
          }
          return;
        }

        // Diagnostic demandé
        console.log("AUTH USER:", data.user);
        console.log("AUTH SESSION:", data.session);
        console.log("APP METADATA:", data.user?.app_metadata);
        console.log("ADMIN ROLE:", data.user?.app_metadata?.role);

        const isAdmin = checkAdminRole(data.user);

        if (isAdmin) {
          setSubmitLoading(false);
          isAuthenticating = false;
          clearAlert();
          console.log("Authentification Admin Réussie. Affichage du Dashboard...");
          showDashboard();
        } else {
          console.warn("Compte non administrateur :", data.user?.app_metadata?.role);
          await client.auth.signOut();
          setSubmitLoading(false);
          isAuthenticating = false;
          showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
          showLogin();
        }
      } catch (err) {
        console.error("Exception lors de la connexion :", err);
        setSubmitLoading(false);
        isAuthenticating = false;
        showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
      }
    });
  }

  // 3. BOUTON DÉCONNEXION
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      clearAlert();
      const client = getSupabase();
      if (client) {
        await client.auth.signOut();
      }
      showLogin();
      if (passwordInput) passwordInput.value = '';
    });
  }

  // 4. CHARGEMENT DES CONDUCTEURS
  async function chargerConducteurs() {
    if (!driversList) return;

    const client = getSupabase();
    if (!client) return;

    try {
      const { data: conducteurs, error } = await client
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Erreur chargement conducteurs :", error);
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
    }
  }

  // 5. VALIDER OU SUSPENDRE CONDUCTEUR
  window.changerStatut = async function(id, nouveauStatut) {
    if (!confirm(`Voulez-vous vraiment changer le statut à : ${nouveauStatut === 'VERIFIED' ? 'Validé' : 'Suspendu'} ?`)) return;

    const client = getSupabase();
    if (!client) return;

    try {
      const { error } = await client
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
      console.error("Erreur mise à jour statut :", err);
      showAlert("Erreur lors de la mise à jour du statut.", "danger");
    }
  };
});

// ==============================================================================
// Demandoo — Administration
// Gestion de la connexion et de la validation des conducteurs
// ==============================================================================

(function() {
  'use strict';

  var SUPABASE_URL = window.DEMANDOO_SUPABASE_URL || 'https://izoytsibwmnzagbraqdg.supabase.co';
  var SUPABASE_KEY = window.DEMANDOO_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3l0c2lid21uemFnYnJhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzAwNjIsImV4cCI6MjEwNDYwNjA2Mn0.hteTL5iggI1lltIDBIsO1q375DQiMNnQsntN3eU_jAk';

  function getClient() {
    if (window.supabaseClient) {
      return window.supabaseClient;
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return window.supabaseClient;
    }
    return null;
  }

  function initAdmin() {
    var supabase = getClient();
    console.log("[Demandoo Admin] Initialisation du panneau d'administration...");

    var loadingScreen = document.getElementById('loading-screen');
    var loginScreen = document.getElementById('login-screen');
    var dashboardScreen = document.getElementById('dashboard-screen');
    var loginForm = document.getElementById('login-form');
    var emailInput = document.getElementById('admin-email');
    var passwordInput = document.getElementById('admin-password');
    var submitBtn = document.getElementById('login-submit-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var driversList = document.getElementById('drivers-list');
    var emptyState = document.getElementById('empty-state');
    var alertContainer = document.getElementById('alert-container');

    var isAuthenticating = false;

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

    function showAlert(message, type) {
      type = type || 'danger';
      if (!alertContainer) return;
      alertContainer.innerHTML = '<div class="alert alert-' + type + '">' + escapeHtml(message) + '</div>';
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
      if (!user) return false;
      var role = user.app_metadata && user.app_metadata.role;
      return role === 'admin' || role === 'ADMIN' || (typeof role === 'string' && role.toLowerCase() === 'admin');
    }

    // 1. VÉRIFICATION DE LA SESSION INITIALE
    async function checkAdminSession() {
      var client = getClient();
      if (!client) {
        console.warn("[Demandoo Admin] Client Supabase non initialisé lors du check session.");
        showLogin();
        return;
      }

      showLoading();

      try {
        var res = await client.auth.getSession();
        var session = res.data && res.data.session;

        if (!session || !session.user) {
          showLogin();
          return;
        }

        console.log("[Demandoo Admin] Session détectée pour :", session.user.email);
        console.log("[Demandoo Admin] Role app_metadata :", session.user.app_metadata && session.user.app_metadata.role);

        if (checkAdminRole(session.user)) {
          showDashboard();
        } else {
          await client.auth.signOut();
          showLogin();
        }
      } catch (err) {
        console.error("[Demandoo Admin] Erreur lors de la vérification de session :", err);
        showLogin();
      }
    }

    // ÉCOUTEUR ON AUTH STATE CHANGE
    if (supabase) {
      supabase.auth.onAuthStateChange(async function(event, session) {
        console.log("[Demandoo Admin] Auth State Change:", event);
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

    checkAdminSession();

    // 2. SOUMISSION DU FORMULAIRE DE CONNEXION
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAlert();

        var email = (emailInput && emailInput.value ? emailInput.value : '').trim();
        var password = passwordInput && passwordInput.value ? passwordInput.value : '';

        if (!email || !password) {
          showAlert("Veuillez renseigner votre email et mot de passe.", "danger");
          return;
        }

        var client = getClient();
        if (!client) {
          showAlert("Service d'authentification indisponible.", "danger");
          return;
        }

        isAuthenticating = true;
        setSubmitLoading(true);

        try {
          console.log("[Demandoo Admin] Tentative signInWithPassword pour :", email);

          var authRes = await client.auth.signInWithPassword({
            email: email,
            password: password
          });

          var data = authRes.data;
          var error = authRes.error;

          if (error) {
            console.error("[Demandoo Admin] Erreur auth:", error);
            setSubmitLoading(false);
            isAuthenticating = false;
            var errMsg = (error.message || '').toLowerCase();
            if (errMsg.includes('invalid login') || errMsg.includes('invalid_grant') || errMsg.includes('credentials') || error.status === 400) {
              showAlert("Email ou mot de passe incorrect.", "danger");
            } else {
              showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
            }
            return;
          }

          // Diagnostic
          console.log("AUTH USER:", data.user);
          console.log("AUTH SESSION:", data.session);
          console.log("APP METADATA:", data.user && data.user.app_metadata);
          console.log("ADMIN ROLE:", data.user && data.user.app_metadata && data.user.app_metadata.role);

          var isAdmin = checkAdminRole(data.user);

          if (isAdmin) {
            setSubmitLoading(false);
            isAuthenticating = false;
            clearAlert();
            console.log("[Demandoo Admin] Authentification Admin confirmée -> Affichage Dashboard.");
            showDashboard();
          } else {
            console.warn("[Demandoo Admin] Non admin:", data.user && data.user.app_metadata && data.user.app_metadata.role);
            await client.auth.signOut();
            setSubmitLoading(false);
            isAuthenticating = false;
            showAlert("Accès refusé. Ce compte n'est pas administrateur.", "danger");
            showLogin();
          }
        } catch (err) {
          console.error("[Demandoo Admin] Exception formulaire:", err);
          setSubmitLoading(false);
          isAuthenticating = false;
          showAlert("Impossible de se connecter. Vérifiez votre connexion et réessayez.", "danger");
        }
      });
    }

    // 3. BOUTON DÉCONNEXION
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function() {
        clearAlert();
        var client = getClient();
        if (client) {
          await client.auth.signOut();
        }
        showLogin();
        if (passwordInput) passwordInput.value = '';
      });
    }

    // 4. CHARGER LES CONDUCTEURS
    async function chargerConducteurs() {
      if (!driversList) return;
      var client = getClient();
      if (!client) return;

      try {
        var queryRes = await client
          .from('profiles')
          .select('*')
          .eq('role', 'driver')
          .order('created_at', { ascending: false });

        var conducteurs = queryRes.data;
        var error = queryRes.error;

        if (error) {
          console.warn("[Demandoo Admin] Erreur profiles:", error);
          return;
        }

        driversList.innerHTML = '';

        if (!conducteurs || conducteurs.length === 0) {
          if (emptyState) emptyState.style.display = 'block';
          return;
        }

        if (emptyState) emptyState.style.display = 'none';

        conducteurs.forEach(function(c) {
          var tr = document.createElement('tr');
          var dateFormatted = c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-';
          var badgeClass = c.driver_status === 'VERIFIED' ? 'badge-success' : 
                             c.driver_status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning';
          var statutLabel = c.driver_status === 'VERIFIED' ? 'Validé' : 
                              c.driver_status === 'SUSPENDED' ? 'Suspendu' : 'En attente';

          tr.innerHTML = 
            '<td><strong>' + escapeHtml(c.full_name || 'Inconnu') + '</strong></td>' +
            '<td>' + escapeHtml(c.phone || '-') + '</td>' +
            '<td><span class="tag">Chauffeur</span></td>' +
            '<td>' + escapeHtml(c.city || '-') + '</td>' +
            '<td><code>' + escapeHtml(c.license_number || '-') + '</code></td>' +
            '<td>-</td>' +
            '<td><span class="badge ' + badgeClass + '" id="badge-' + c.id + '">' + statutLabel + '</span></td>' +
            '<td><small>' + dateFormatted + '</small></td>' +
            '<td style="display:flex; gap:8px;">' +
              '<button class="btn" style="padding:4px 8px; font-size:12px; background:var(--success)" onclick="changerStatut(\'' + c.id + '\', \'VERIFIED\')">Valider</button>' +
              '<button class="btn" style="padding:4px 8px; font-size:12px; background:var(--danger)" onclick="changerStatut(\'' + c.id + '\', \'SUSPENDED\')">Suspendre</button>' +
            '</td>';
          driversList.appendChild(tr);
        });
      } catch (err) {
        console.error("[Demandoo Admin] Erreur chargerConducteurs:", err);
      }
    }

    // 5. CHANGER STATUT CONDUCTEUR
    window.changerStatut = async function(id, nouveauStatut) {
      if (!confirm('Voulez-vous vraiment changer le statut à : ' + (nouveauStatut === 'VERIFIED' ? 'Validé' : 'Suspendu') + ' ?')) return;

      var client = getClient();
      if (!client) return;

      try {
        var updateRes = await client
          .from('profiles')
          .update({ 
            driver_status: nouveauStatut, 
            is_driver_active: nouveauStatut === 'VERIFIED' 
          })
          .eq('id', id);

        if (updateRes.error) throw updateRes.error;
        
        showAlert('Statut mis à jour avec succès.', 'success');
        chargerConducteurs();
      } catch (err) {
        console.error("[Demandoo Admin] Erreur mise à jour statut :", err);
        showAlert("Erreur lors de la mise à jour du statut.", "danger");
      }
    };
  }

  // Démarrage sûr
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
  } else {
    initAdmin();
  }
})();

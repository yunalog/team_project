// Local development auth adapter.
// It activates only after entering through local-dev.html or with ?localAuth=1.
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("localAuth") !== "1") return;

  const onlineAdapter = window.FirebaseGame || {};
  const localUser = {
    uid: "local-battle-dev",
    displayName: "로컬 테스트",
    email: "local@dev.invalid",
    isAnonymous: true,
  };

  async function saveLocalGameState(gameState, options = {}) {
    if (!gameState) return false;
    if (options.updateLastActive !== false) gameState.lastActiveAtMs = Date.now();
    return true;
  }

  async function setOfflineRewardPlan(gameState, hours) {
    if (!gameState) return false;
    const normalize = onlineAdapter.normalizeOfflinePlan || ((value) => Number(value) || 8);
    gameState.offlineRewardPlan = normalize(hours);
    return true;
  }

  window.FirebaseGame = {
    ...onlineAdapter,
    isLocalAuthBypass: true,
    initFirebase: () => true,
    getCurrentUser: () => localUser,
    onAuthStateChanged(callback) {
      if (typeof callback === "function") {
        window.setTimeout(() => callback(localUser), 0);
      }
      return () => {};
    },
    loginWithGoogle: async () => localUser,
    logout: async () => true,
    loadUserGameState: async () => null,
    saveUserGameState: saveLocalGameState,
    setOfflineRewardPlan,
  };

  document.documentElement.dataset.authMode = "local";
})();

// Local development auth adapter for the battle branch.
// Remove its script tag from index.html before merging the auth flow into main.
(function () {
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

// js/firebase.js
// Firebase 로그인 / Firestore 저장 / 불러오기 / 방치 보상 전용
// 현재 프로젝트는 일반 <script> 방식이라 Firebase compat SDK 기준으로 작성했습니다.

(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyC9yMim-QjYLRwHZEBxM5yIgmGv-q0Kigw",
    authDomain: "rpg-team-e83d9.firebaseapp.com",
    projectId: "rpg-team-e83d9",
    storageBucket: "rpg-team-e83d9.firebasestorage.app",
    messagingSenderId: "979370993077",
    appId: "1:979370993077:web:29b3cd441e2b730da825fc",
    measurementId: "G-7ZTLVRP3NK",
  };

  const OFFLINE_REWARD_PLANS = {
    4: { hours: 4, maxSeconds: 4 * 60 * 60, multiplier: 1.2, label: "4시간 / 1.2배" },
    8: { hours: 8, maxSeconds: 8 * 60 * 60, multiplier: 1, label: "8시간 / 1배" },
    12: { hours: 12, maxSeconds: 12 * 60 * 60, multiplier: 0.85, label: "12시간 / 0.85배" },
  };

  const DEFAULT_OFFLINE_PLAN = 8;

  let app = null;
  let auth = null;
  let db = null;
  let provider = null;
  let initialized = false;

  function initFirebase() {
    if (!window.firebase) {
      console.error("Firebase SDK가 로드되지 않았습니다. index.html의 Firebase CDN script를 확인하세요.");
      return false;
    }

    if (initialized) return true;

    try {
      app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      provider = new firebase.auth.GoogleAuthProvider();
      initialized = true;
      return true;
    } catch (error) {
      console.error("Firebase 초기화 실패:", error);
      return false;
    }
  }

  function getCurrentUser() {
    if (!initFirebase()) return null;
    return auth.currentUser;
  }

  function onAuthStateChanged(callback) {
    if (!initFirebase()) {
      if (typeof callback === "function") window.setTimeout(() => callback(null), 0);
      return () => {};
    }

    return auth.onAuthStateChanged((user) => {
      if (user) {
        ensureUserDocument(user).catch((error) => {
          console.error("Firebase 사용자 문서 확인 실패:", error);
        });
      }

      if (typeof callback === "function") callback(user || null);
    });
  }

  async function loginWithGoogle() {
    if (!initFirebase()) return null;

    if (auth.currentUser) return auth.currentUser;

    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    try {
      await ensureUserDocument(user);
    } catch (error) {
      console.error("Firebase 사용자 문서 확인 실패:", error);
    }
    return user;
  }

  async function logout() {
    if (!initFirebase()) return false;
    await auth.signOut();
    return true;
  }

  async function ensureUserDocument(user) {
    if (!user || !db) return;

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        uid: user.uid,
        displayName: user.displayName || "익명 사원",
        email: user.email || "",
        gameState: null,
        offlineRewardPlan: DEFAULT_OFFLINE_PLAN,
        lastActiveAtMs: Date.now(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  async function loadUserGameState() {
    if (!initFirebase()) return null;

    const user = auth.currentUser;
    if (!user) return null;

    await ensureUserDocument(user);

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();
    if (!snap.exists) return null;

    const data = snap.data() || {};
    const savedState = data.gameState || null;
    if (!savedState) return null;

    return {
      ...savedState,
      offlineRewardPlan: Number(savedState.offlineRewardPlan || data.offlineRewardPlan || DEFAULT_OFFLINE_PLAN),
      lastActiveAtMs: Number(savedState.lastActiveAtMs || data.lastActiveAtMs || Date.now()),
    };
  }

  async function saveUserGameState(gameState, options = {}) {
    if (!initFirebase()) return false;

    const user = auth.currentUser;
    if (!user || !gameState) return false;

    const shouldUpdateLastActive = options.updateLastActive !== false;
    const nextLastActiveAtMs = shouldUpdateLastActive ? Date.now() : Number(gameState.lastActiveAtMs || Date.now());
    const nextState = {
      ...gameState,
      offlineRewardPlan: normalizeOfflinePlan(gameState.offlineRewardPlan),
      lastActiveAtMs: nextLastActiveAtMs,
    };

    await db.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        displayName: user.displayName || "익명 사원",
        email: user.email || "",
        gameState: nextState,
        offlineRewardPlan: nextState.offlineRewardPlan,
        lastActiveAtMs: nextState.lastActiveAtMs,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    gameState.offlineRewardPlan = nextState.offlineRewardPlan;
    gameState.lastActiveAtMs = nextState.lastActiveAtMs;
    return true;
  }

  async function setOfflineRewardPlan(gameState, hours) {
    const normalizedHours = normalizeOfflinePlan(hours);
    if (!gameState) return false;

    gameState.offlineRewardPlan = normalizedHours;

    if (!initFirebase()) return false;
    const user = auth.currentUser;
    if (!user) return false;

    await db.collection("users").doc(user.uid).set(
      {
        offlineRewardPlan: normalizedHours,
        "gameState.offlineRewardPlan": normalizedHours,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  }

  function normalizeOfflinePlan(hours) {
    const value = Number(hours || DEFAULT_OFFLINE_PLAN);
    return OFFLINE_REWARD_PLANS[value] ? value : DEFAULT_OFFLINE_PLAN;
  }

  function applyOfflineReward(gameState, goldPerSecond) {
    if (!gameState) {
      return { applied: false, rewardGold: 0, rewardSeconds: 0, actualOfflineSeconds: 0, plan: OFFLINE_REWARD_PLANS[DEFAULT_OFFLINE_PLAN] };
    }

    const nowMs = Date.now();
    const lastActiveAtMs = Number(gameState.lastActiveAtMs || nowMs);
    const actualOfflineSeconds = Math.max(0, Math.floor((nowMs - lastActiveAtMs) / 1000));
    const plan = OFFLINE_REWARD_PLANS[normalizeOfflinePlan(gameState.offlineRewardPlan)];
    const rewardSeconds = Math.min(actualOfflineSeconds, plan.maxSeconds);
    const safeGoldPerSecond = Math.max(0, Number(goldPerSecond || 0));
    const rewardGold = Math.floor(rewardSeconds * safeGoldPerSecond * plan.multiplier);

    gameState.gold = Math.floor(Number(gameState.gold || 0) + rewardGold);
    gameState.offlineRewardPlan = plan.hours;
    gameState.lastActiveAtMs = nowMs;

    return {
      applied: rewardGold > 0,
      rewardGold,
      rewardSeconds,
      actualOfflineSeconds,
      plan,
    };
  }

  function formatOfflineRewardMessage(result) {
    const rewardSeconds = Number(result?.rewardSeconds || 0);
    const hours = Math.floor(rewardSeconds / 3600);
    const minutes = Math.floor((rewardSeconds % 3600) / 60);
    const plan = result?.plan || OFFLINE_REWARD_PLANS[DEFAULT_OFFLINE_PLAN];

    return (
      `비접속 보상 수령!\n\n` +
      `설정: ${plan.label}\n` +
      `인정 시간: ${hours}시간 ${minutes}분\n` +
      `획득 자금: ${Number(result?.rewardGold || 0).toLocaleString("ko-KR")}`
    );
  }

  window.FirebaseGame = {
    OFFLINE_REWARD_PLANS,
    DEFAULT_OFFLINE_PLAN,
    initFirebase,
    loginWithGoogle,
    logout,
    loadUserGameState,
    saveUserGameState,
    setOfflineRewardPlan,
    applyOfflineReward,
    formatOfflineRewardMessage,
    normalizeOfflinePlan,
    getCurrentUser,
    onAuthStateChanged,
  };
})();

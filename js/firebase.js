// js/firebase.js
// Firebase 로그인 / Firestore 저장 / 불러오기 / 방치 보상 전용

(function () {
  const firebaseConfig = {
  apiKey: "AIzaSyC9yMim-QjYLRwHZEBxM5yIgmGv-q0Kigw",
  authDomain: "rpg-team-e83d9.firebaseapp.com",
  projectId: "rpg-team-e83d9",
  storageBucket: "rpg-team-e83d9.firebasestorage.app",
  messagingSenderId: "979370993077",
  appId: "1:979370993077:web:29b3cd441e2b730da825fc",
  measurementId: "G-7ZTLVRP3NK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
  const OFFLINE_REWARD_PLANS = {
    4: {
      hours: 4,
      maxSeconds: 4 * 60 * 60,
      multiplier: 1.2,
      label: "4시간 / 1.2배",
    },
    8: {
      hours: 8,
      maxSeconds: 8 * 60 * 60,
      multiplier: 1,
      label: "8시간 / 1배",
    },
    12: {
      hours: 12,
      maxSeconds: 12 * 60 * 60,
      multiplier: 0.85,
      label: "12시간 / 0.85배",
    },
  };

  const DEFAULT_OFFLINE_PLAN = 8;

  let app = null;
  let auth = null;
  let db = null;
  let provider = null;

  function initFirebase() {
    if (!window.firebase) {
      console.error("Firebase SDK가 로드되지 않았습니다.");
      return false;
    }

    if (!app) {
      app = firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      provider = new firebase.auth.GoogleAuthProvider();
    }

    return true;
  }

  function getCurrentUser() {
    if (!auth) return null;
    return auth.currentUser;
  }

  async function loginWithGoogle() {
    if (!initFirebase()) return null;

    const result = await auth.signInWithPopup(provider);
    const user = result.user;

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

    return user;
  }

  async function loadUserGameState() {
    if (!initFirebase()) return null;

    const user = getCurrentUser();
    if (!user) return null;

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();

    if (!snap.exists) return null;

    const data = snap.data();
    return data.gameState || null;
  }

  async function saveUserGameState(gameState) {
    if (!initFirebase()) return false;

    const user = getCurrentUser();
    if (!user || !gameState) return false;

    const nextState = {
      ...gameState,
      offlineRewardPlan: Number(gameState.offlineRewardPlan || DEFAULT_OFFLINE_PLAN),
      lastActiveAtMs: Date.now(),
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

    return true;
  }

  async function setOfflineRewardPlan(gameState, hours) {
    const plan = OFFLINE_REWARD_PLANS[hours];
    if (!plan || !gameState) return false;

    gameState.offlineRewardPlan = Number(hours);

    const user = getCurrentUser();
    if (user && db) {
      await db.collection("users").doc(user.uid).set(
        {
          offlineRewardPlan: Number(hours),
          "gameState.offlineRewardPlan": Number(hours),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return true;
  }

  function applyOfflineReward(gameState, goldPerSecond) {
    if (!gameState) {
      return {
        applied: false,
        rewardGold: 0,
        rewardSeconds: 0,
      };
    }

    const nowMs = Date.now();
    const lastActiveAtMs = Number(gameState.lastActiveAtMs || nowMs);

    const actualOfflineSeconds = Math.max(
      0,
      Math.floor((nowMs - lastActiveAtMs) / 1000)
    );

    const selectedPlan = Number(gameState.offlineRewardPlan || DEFAULT_OFFLINE_PLAN);
    const plan = OFFLINE_REWARD_PLANS[selectedPlan] || OFFLINE_REWARD_PLANS[DEFAULT_OFFLINE_PLAN];

    const rewardSeconds = Math.min(actualOfflineSeconds, plan.maxSeconds);
    const safeGoldPerSecond = Math.max(0, Number(goldPerSecond || 0));

    const rewardGold = Math.floor(
      rewardSeconds * safeGoldPerSecond * plan.multiplier
    );

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
    const minutes = Math.floor((result.rewardSeconds || 0) / 60);
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;

    return (
      `비접속 보상 수령!\n\n` +
      `설정: ${result.plan.label}\n` +
      `인정 시간: ${hours}시간 ${remainMinutes}분\n` +
      `획득 자금: ${Number(result.rewardGold || 0).toLocaleString("ko-KR")}`
    );
  }

  window.FirebaseGame = {
    OFFLINE_REWARD_PLANS,
    DEFAULT_OFFLINE_PLAN,
    initFirebase,
    loginWithGoogle,
    loadUserGameState,
    saveUserGameState,
    setOfflineRewardPlan,
    applyOfflineReward,
    formatOfflineRewardMessage,
    getCurrentUser,
  };
})();
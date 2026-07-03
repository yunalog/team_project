const STORAGE_KEY = "studioCrewRpgSave";
const AUDIO_SETTINGS_KEY = "studioCrewRpgAudioSettings";
const ENEMY_SPAWN_X = 86;
const ENEMY_CONTACT_X = 38;
const ENEMY_MAX_COUNT = 5;
const NORMAL_STAGES_PER_CHAPTER = 5;
const BASIC_ATTACK_RATE = 1;
const SKILL_ATTACK_RATE = 4;
const TICK_RATE = 1000 / 30;
const CRITICAL_CHANCE = 0.16;
const CRITICAL_MULTIPLIER = 1.85;
const EQUIPMENT_DRAW_COST = 10;
const SPEED_TICKET_SECONDS = 600;
const BGM_TRACKS = {
  title: "Resource/Sound/BGM_Main_Theme.mp3",
  field: "Resource/Sound/BGM_Field.mp3",
  boss: "Resource/Sound/BGM_Boss.mp3",
};
const defaultAudioSettings = {
  volume: 0.45,
  muted: false,
};

const recruits = [
  {
    id: "planner",
    name: "기획자",
    shortName: "기획",
    mark: "P",
    color: "#f59e0b",
    desc: "요구사항을 정리해 자동 기여도를 올립니다.",
    category: "기획직군",
    baseCost: 25,
    dps: 1,
    attackType: "plan",
    skill: { type: "chain", name: "일정 공유", targets: 3, multiplier: 1.2 },
    sprites: {
      idle: "Anim/Player_2/GD_Idle.png",
      attack: "Anim/Player_2/GD_ATK.png",
      skill: "Anim/Player_2/GD_Skill.png",
    },
  },
  {
    id: "developer",
    name: "개발자",
    shortName: "개발",
    mark: "D",
    color: "#2563eb",
    desc: "핵심 기능을 빠르게 구현합니다.",
    category: "개발직군",
    baseCost: 55,
    dps: 3,
    attackType: "code",
    skill: { type: "aoe", name: "빌드 폭발", radius: 14, multiplier: 1.45 },
  },
  {
    id: "artist",
    name: "일러스트레이터",
    shortName: "아트",
    mark: "A",
    color: "#ec4899",
    desc: "펜으로 근접 베기 공격을 합니다.",
    category: "아트직군",
    baseCost: 90,
    dps: 5,
    attackType: "slash",
    skill: { type: "cleave", name: "잉크 소용돌이", targets: 2, multiplier: 1.9 },
  },
  {
    id: "business",
    name: "사업 운영자",
    shortName: "사업",
    mark: "B",
    color: "#f97316",
    desc: "사업과 운영을 관리해 팀의 성장을 지원합니다.",
    category: "사업/운영직군",
    baseCost: 80,
    dps: 4,
    attackType: "plan",
    skill: { type: "chain", name: "협업 조율", targets: 2, multiplier: 1.3 },
  },
  {
    id: "qa",
    name: "QA",
    shortName: "QA",
    mark: "Q",
    color: "#7c3aed",
    desc: "버그를 발견해 적 체력을 꾸준히 깎습니다.",
    category: "QA직군",
    baseCost: 140,
    dps: 8,
    attackType: "qa",
    skill: { type: "all", name: "전체 회귀 테스트", multiplier: 0.9 },
  },
];

const recruitCategories = ["개발직군", "아트직군", "기획직군", "사업/운영직군", "QA직군"];

const recruitRankNames = {
  developer: ["코딩 뉴비", "주니어 개발자", "시니어 개발자", "테크 리드", "코드 마법사", "전설의 개발 CTO"],
  artist: ["낙서장인", "컨셉 아티스트", "비주얼 메이커", "연출 마스터", "아트 디렉터", "전설의 신의 손"],
  planner: ["기획 인턴", "주니어 기획자", "시스템 설계자", "메인 설계자", "디렉터", "전설의 갓 디렉터"],
  business: ["민원 해결사", "이벤트 기획자", "운영 전문가", "라이브 PM", "사업 총괄자", "전설의 매출의 신"],
  qa: ["버그 탐지기", "버그 사냥꾼", "QA 전문가", "디버깅 장인", "품질 수호자", "전설의 버그 슬레이어"],
};

function getRecruitRankLabel(recruit, count) {
  const rankNames = recruitRankNames[recruit.id];
  if (!rankNames) return recruit.name;
  const tier = Math.min(rankNames.length - 1, Math.floor(count / 10));
  return rankNames[tier];
}

const growthConfigs = {
  process: { label: "작업처리능력", baseCost: 18 },
  critical: { label: "실수 감소", baseCost: 20 },
  skill: { label: "새로운 아이디어", baseCost: 22 },
  speed: { label: "작업 속도", baseCost: 16 },
  hp: { label: "야근 버티기", baseCost: 24 },
};

const companyLevels = [
  { name: "1인 창업실", minXp: 0, desc: "작은 책상에서 첫 프로젝트를 시작했습니다.", benefit: "창문과 업무 공간 확장" },
  { name: "작은 작업실", minXp: 24, desc: "동료를 맞이할 작은 작업실이 생겼습니다.", benefit: "두 번째 업무 공간 개방" },
  { name: "프로젝트 팀", minXp: 60, desc: "각자의 역할을 갖춘 팀이 자리를 잡았습니다.", benefit: "사무실 간판과 휴게 공간" },
  { name: "초기 스타트업", minXp: 114, desc: "정식 회사의 모습을 갖추기 시작합니다.", benefit: "2층 오피스로 이전" },
  { name: "성장 스타트업", minXp: 186, desc: "입소문을 타고 더 큰 의뢰가 들어옵니다.", benefit: "회의실과 조경 추가" },
  { name: "전문 스튜디오", minXp: 282, desc: "전문 제작 조직으로 업계에 이름을 알립니다.", benefit: "전문 부서층 개방" },
  { name: "소형 기업", minXp: 408, desc: "안정적인 조직과 여러 프로젝트를 운영합니다.", benefit: "독립 사옥 착공" },
  { name: "확장 오피스", minXp: 570, desc: "새 사옥에서 더 많은 인재와 함께합니다.", benefit: "대형 로비와 편의 시설" },
  { name: "중견 기업", minXp: 774, desc: "시장을 이끄는 탄탄한 회사로 성장했습니다.", benefit: "도심 타워로 확장" },
  { name: "멀티 스튜디오", minXp: 1032, desc: "여러 제작팀이 동시에 성과를 만들어냅니다.", benefit: "브랜드 네온 사인" },
  { name: "대형 기업", minXp: 1350, desc: "도시를 대표하는 대형 스튜디오가 되었습니다.", benefit: "글로벌 캠퍼스 개방" },
  { name: "글로벌 기업", minXp: 1740, desc: "전 세계가 주목하는 글로벌 기업입니다.", benefit: "최고 단계 달성" },
];

const tools = [
  {
    id: "engine",
    name: "개발 랩",
    icon: "DEV",
    desc: "개발 장비를 확충해 업무 지원 기여도 +1",
    baseCost: 35,
    click: 1,
    growthXp: 5,
  },
  {
    id: "aiTool",
    name: "자동화 서버실",
    icon: "AI",
    desc: "반복 업무를 자동화해 전체 기여도 +15%",
    baseCost: 85,
    multiplier: 0.15,
    growthXp: 7,
  },
  {
    id: "tablet",
    name: "크리에이티브 스튜디오",
    icon: "ART",
    desc: "전용 제작실로 일러스트레이터 효율 +2",
    baseCost: 120,
    target: "artist",
    dps: 2,
    growthXp: 9,
  },
  {
    id: "testKit",
    name: "QA 센터",
    icon: "QA",
    desc: "검증 환경을 구축해 QA 효율 +3",
    baseCost: 160,
    target: "qa",
    dps: 3,
    growthXp: 11,
  },
];

const equipmentSlots = [
  { id: "eyewear", name: "안경" },
  { id: "chair", name: "의자" },
  { id: "keyboard", name: "키보드" },
  { id: "deskItem", name: "사무용품" },
  { id: "notebook", name: "노트" },
];

const equipmentPool = [
  { id: "glasses", slot: "eyewear", name: "집중 안경", icon: "안", image: "", power: [1, 4], skill: [1, 3] },
  { id: "chair", slot: "chair", name: "인체공학 의자", icon: "의", image: "", power: [2, 5], skill: [1, 4] },
  { id: "keyboard", slot: "keyboard", name: "기계식 키보드", icon: "키", image: "", power: [1, 6], skill: [2, 5] },
  { id: "mug", slot: "deskItem", name: "야근 머그컵", icon: "컵", image: "", power: [3, 7], skill: [1, 3] },
  { id: "notebook", slot: "notebook", name: "아이디어 노트", icon: "노", image: "", power: [2, 4], skill: [2, 6] },
];

const equipmentGrades = [
  { name: "일반", chance: 0.55, multiplier: 1, color: "#6f6251" },
  { name: "희귀", chance: 0.3, multiplier: 1.45, color: "#238b65" },
  { name: "영웅", chance: 0.12, multiplier: 2.1, color: "#7c3aed" },
  { name: "전설", chance: 0.03, multiplier: 3.2, color: "#b85c22" },
];

const equipmentUpgradeConfigs = [
  { level: 1, label: "1단계", maxGrade: 1, nextCost: 20, duration: 0, desc: "일반/희귀 장비 등장" },
  { level: 2, label: "2단계", maxGrade: 2, nextCost: 45, duration: 180, desc: "영웅 장비 등장" },
  { level: 3, label: "3단계", maxGrade: 2, nextCost: 90, duration: 420, desc: "희귀 이상 확률 상승" },
  { level: 4, label: "4단계", maxGrade: 3, nextCost: 160, duration: 900, desc: "전설 장비 등장" },
  { level: 5, label: "5단계", maxGrade: 3, nextCost: 0, duration: 0, desc: "최대 연구 단계" },
];

const enemyNames = ["작은 버그", "촉박한 마감", "스코프 증가", "서버 장애", "대형 프로젝트"];

const defaultState = {
  gold: 0,
  idea: 0,
  chapter: 1,
  subStage: 1,
  battleMode: "normal",
  stage: 1,
  enemyHp: 10,
  enemyMaxHp: 10,
  enemyX: ENEMY_SPAWN_X,
  enemies: [],
  clickPower: 1,
  playerLevel: 1,
  clearCount: 0,
  companyXp: 0,
  elapsed: 0,
  recruits: {},
  squad: [null, null, null, null],
  squadConfigured: false,
  tools: {},
  growthLevels: {
    process: 0,
    critical: 0,
    skill: 0,
    speed: 0,
    hp: 0,
  },
  equipment: {
    equipped: {},
    pending: null,
    drawCount: 0,
    gradeLevel: 1,
    upgradeRemaining: 0,
    upgradingTo: null,
    speedTickets: 3,
  },
};

let state;
let refs;
let isSpawningNext = false;
let lastRosterKey = "";
let basicAttackCooldown = 0.35;
let skillAttackCooldown = SKILL_ATTACK_RATE;
let saveCooldown = 0;
let lastTick = Date.now();
let gameTimer = null;
let enemySeq = 0;
let currentBgmKey = "title";
let hasStartedGame = false;
let titleBgmUnlockArmed = false;
let audioSettings = { ...defaultAudioSettings };
let activeTab = "battle";
let lastCompanyVisualKey = "";
let autoDrawTimer = null;
let equipmentPanelExpanded = false;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}

function initGame() {
  refs = {
    allyLayer: document.querySelector("#allyLayer"),
    startScreen: document.querySelector("#startScreen"),
    gameShell: document.querySelector("#gameShell"),
    startButton: document.querySelector("#startButton"),
    titleMuteButton: document.querySelector("#titleMuteButton"),
    titleVolumeSlider: document.querySelector("#titleVolumeSlider"),
    titleVolumeValue: document.querySelector("#titleVolumeValue"),
    headerTitleButton: document.querySelector("#headerTitleButton"),
    battlefield: document.querySelector("#battlefield"),
    companyScene: document.querySelector("#companyScene"),
    companyLocationText: document.querySelector("#companyLocationText"),
    companyLevelChip: document.querySelector("#companyLevelChip"),
    companySceneName: document.querySelector("#companySceneName"),
    companySceneDesc: document.querySelector("#companySceneDesc"),
    companyCampus: document.querySelector("#companyCampus"),
    companyBuilding: document.querySelector("#companyBuilding"),
    companyFloors: document.querySelector("#companyFloors"),
    employeeCrowd: document.querySelector("#employeeCrowd"),
    companySceneProgressText: document.querySelector("#companySceneProgressText"),
    companySceneProgressFill: document.querySelector("#companySceneProgressFill"),
    companyValueText: document.querySelector("#companyValueText"),
    companyEmployeeText: document.querySelector("#companyEmployeeText"),
    companyFacilityText: document.querySelector("#companyFacilityText"),
    companyStatusStrip: document.querySelector("#companyStatusStrip"),
    battleStatusItems: [...document.querySelectorAll(".battle-status-item")],
    squadFormation: document.querySelector("#squadFormation"),
    squadRoster: document.querySelector("#squadRoster"),
    effectLayer: document.querySelector("#effectLayer"),
    goldText: document.querySelector("#goldText"),
    ideaText: document.querySelector("#ideaText"),
    stageText: document.querySelector("#stageText"),
    dpsText: document.querySelector("#dpsText"),
    enemyLayer: document.querySelector("#enemyLayer"),
    battleLog: document.querySelector("#battleLog"),
    teamCountText: document.querySelector("#teamCountText"),
    clickPowerText: document.querySelector("#clickPowerText"),
    clearCountText: document.querySelector("#clearCountText"),
    playTimeText: document.querySelector("#playTimeText"),
    attackTimerText: document.querySelector("#attackTimerText"),
    saveStateText: document.querySelector("#saveStateText"),
    recruitList: document.querySelector("#recruitList"),
    toolList: document.querySelector("#toolList"),
    manualWorkButton: document.querySelector("#manualWorkButton"),
    upgradePlayerButton: document.querySelector("#upgradePlayerButton"),
    growthProcessValue: document.querySelector("#growthProcessValue"),
    growthCriticalValue: document.querySelector("#growthCriticalValue"),
    growthSkillValue: document.querySelector("#growthSkillValue"),
    growthSpeedValue: document.querySelector("#growthSpeedValue"),
    growthHpValue: document.querySelector("#growthHpValue"),
    nextStageButton: document.querySelector("#nextStageButton"),
    equipmentDrawButton: document.querySelector("#equipmentDrawButton"),
    equipmentDrawCost: document.querySelector("#equipmentDrawCost"),
    autoDrawButton: document.querySelector("#autoDrawButton"),
    equippedItemPanel: document.querySelector("#equippedItemPanel"),
    equippedGradeBlocks: document.querySelector("#equippedGradeBlocks"),
    equippedItemList: document.querySelector("#equippedItemList"),
    equippedItemStats: document.querySelector("#equippedItemStats"),
    equipmentUpgradePanel: document.querySelector("#equipmentUpgradePanel"),
    equipmentGradeText: document.querySelector("#equipmentGradeText"),
    equipmentUpgradeTimer: document.querySelector("#equipmentUpgradeTimer"),
    equipmentUpgradeButton: document.querySelector("#equipmentUpgradeButton"),
    speedTicketButton: document.querySelector("#speedTicketButton"),
    speedTicketText: document.querySelector("#speedTicketText"),
    equipmentChoice: document.querySelector("#equipmentChoice"),
    equipmentIcon: document.querySelector("#equipmentIcon"),
    equipmentName: document.querySelector("#equipmentName"),
    equipmentBonus: document.querySelector("#equipmentBonus"),
    equipItemButton: document.querySelector("#equipItemButton"),
    discardItemButton: document.querySelector("#discardItemButton"),
    saveButton: document.querySelector("#saveButton"),
    resetButton: document.querySelector("#resetButton"),
    returnTitleButton: document.querySelector("#returnTitleButton"),
    muteButton: document.querySelector("#muteButton"),
    volumeSlider: document.querySelector("#volumeSlider"),
    volumeValue: document.querySelector("#volumeValue"),
    audioMuteButtons: [...document.querySelectorAll("[data-audio-mute]")],
    audioVolumeSliders: [...document.querySelectorAll("[data-audio-volume]")],
    audioVolumeValues: [...document.querySelectorAll("[data-audio-value]")],
    bgmAudio: document.querySelector("#bgmAudio"),
  };

  state = loadState();
  audioSettings = loadAudioSettings();
  if (!state.enemies.length) {
    spawnWave();
  }

  bindEvents();
  applyAudioSettings();
  renderAll();
  playBgm("title", { silentFail: true });
  armTitleBgmUnlock();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    const recruitButton = event.target.closest("[data-buy-recruit]");
    const toolButton = event.target.closest("[data-buy-tool]");
    const growthButton = event.target.closest("[data-upgrade-growth]");

    if (tab) switchTab(tab);
    if (recruitButton) buyRecruit(recruitButton.dataset.buyRecruit);
    if (toolButton) buyTool(toolButton.dataset.buyTool);
    if (growthButton) upgradeGrowth(growthButton.dataset.upgradeGrowth);
  });

  refs.manualWorkButton.addEventListener("click", () => {
    attackUnit(getPlayerUnit(getManualPower()), { manual: true });
  });
  refs.upgradePlayerButton.addEventListener("click", upgradePlayer);
  refs.nextStageButton.addEventListener("click", () => {
    if (state.battleMode !== "boss") advanceBattleLayer();
    spawnWave();
    renderAll();
  });
  refs.equipmentDrawButton.addEventListener("click", drawEquipment);
  refs.autoDrawButton.addEventListener("click", toggleAutoDraw);
  refs.equippedItemPanel.addEventListener("click", toggleEquipmentPanel);
  refs.equipItemButton.addEventListener("click", equipPendingEquipment);
  refs.discardItemButton.addEventListener("click", discardPendingEquipment);
  refs.equipmentUpgradeButton.addEventListener("click", startEquipmentUpgrade);
  refs.speedTicketButton.addEventListener("click", useSpeedTicket);
  refs.saveButton.addEventListener("click", () => saveState("수동 저장 완료"));
  refs.resetButton.addEventListener("click", resetGame);
  refs.returnTitleButton.addEventListener("click", returnToTitle);
  refs.headerTitleButton.addEventListener("click", returnToTitle);
  refs.startButton.addEventListener("click", startGame);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-audio-mute]")) toggleMute();
  });
  document.addEventListener("input", handleAudioInput);
  document.addEventListener("change", handleAudioInput);
  document.addEventListener("change", handleSquadChange);
}

function startGame() {
  hasStartedGame = true;
  refs.startScreen.classList.add("is-hidden");
  refs.gameShell.classList.remove("is-hidden");
  playBgm(getBattleBgmKey());
  renderAll();
  startLoop();
}

function returnToTitle() {
  hasStartedGame = false;
  stopLoop();
  refs.gameShell.classList.add("is-hidden");
  refs.startScreen.classList.remove("is-hidden");
  playBgm("title");
  armTitleBgmUnlock();
}

function playBgm(trackKey, options = {}) {
  if (!refs.bgmAudio) return;

  const nextSrc = BGM_TRACKS[trackKey] || BGM_TRACKS.title;
  const nextUrl = new URL(nextSrc, window.location.href).href;
  if (currentBgmKey !== trackKey || refs.bgmAudio.src !== nextUrl) {
    refs.bgmAudio.src = nextSrc;
    refs.bgmAudio.load();
    currentBgmKey = trackKey;
  }

  applyAudioSettings();
  const playPromise = refs.bgmAudio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      if (!options.silentFail) log("BGM 재생이 브라우저에서 차단되었습니다.");
    });
  }
}

function loadAudioSettings() {
  try {
    const saved = window.localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!saved) return { ...defaultAudioSettings };

    const parsed = JSON.parse(saved);
    return normalizeAudioSettings(parsed);
  } catch {
    return { ...defaultAudioSettings };
  }
}

function normalizeAudioSettings(settings) {
  const volume = Number(settings.volume);
  return {
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : defaultAudioSettings.volume,
    muted: Boolean(settings.muted),
  };
}

function saveAudioSettings() {
  try {
    window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings));
  } catch {
    log("오디오 설정 저장에 실패했습니다.");
  }
}

function applyAudioSettings() {
  const volumePercent = Math.round(audioSettings.volume * 100);
  const isMuted = audioSettings.muted || audioSettings.volume <= 0;

  if (refs.bgmAudio) {
    refs.bgmAudio.volume = audioSettings.volume;
    refs.bgmAudio.muted = isMuted;
  }

  refs.audioVolumeSliders.forEach((slider) => {
    slider.value = String(volumePercent);
    slider.setAttribute("aria-valuetext", `${volumePercent}%`);
  });
  refs.audioVolumeValues.forEach((value) => {
    value.textContent = `${volumePercent}%`;
  });
  refs.audioMuteButtons.forEach((button) => {
    button.textContent = isMuted ? "음소거 해제" : "음소거";
    button.classList.toggle("is-muted", isMuted);
    button.setAttribute("aria-pressed", String(isMuted));
  });
}

function toggleMute() {
  const shouldUnmute = audioSettings.muted || audioSettings.volume <= 0;
  audioSettings.muted = !shouldUnmute;
  if (shouldUnmute && audioSettings.volume <= 0) {
    audioSettings.volume = defaultAudioSettings.volume;
  }
  applyAudioSettings();
  saveAudioSettings();
  if (!audioSettings.muted) playBgm(currentBgmKey || "title", { silentFail: true });
}

function handleAudioInput(event) {
  const slider = event.target.closest("[data-audio-volume]");
  if (!slider) return;

  const nextVolume = Math.min(100, Math.max(0, Number(slider.value) || 0)) / 100;
  audioSettings.volume = nextVolume;
  audioSettings.muted = nextVolume <= 0;
  applyAudioSettings();
  saveAudioSettings();
  if (!audioSettings.muted) playBgm(currentBgmKey || "title", { silentFail: true });
}

function handleSquadChange(event) {
  const select = event.target.closest("[data-squad-slot]");
  if (!select) return;

  const slotIndex = Number(select.dataset.squadSlot);
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= state.squad.length) return;

  const nextId = select.value || null;
  if (nextId) {
    const owned = getRecruitCount(nextId);
    const deployedElsewhere = state.squad.reduce(
      (count, id, index) => count + (index !== slotIndex && id === nextId ? 1 : 0),
      0
    );
    if (!recruits.some((recruit) => recruit.id === nextId) || deployedElsewhere >= owned) {
      log("보유한 동료 수보다 많이 배치할 수 없습니다.");
      renderSquadManagement();
      return;
    }
  }

  state.squad[slotIndex] = nextId;
  state.squadConfigured = true;
  lastRosterKey = "";
  const recruit = recruits.find((item) => item.id === nextId);
  log(recruit ? `${slotIndex + 1}번 위치에 ${recruit.name} 배치 완료` : `${slotIndex + 1}번 위치를 비웠습니다.`);
  renderAll();
}

function getBattleBgmKey() {
  return state.battleMode === "boss" ? "boss" : "field";
}

function toggleEquipmentPanel() {
  equipmentPanelExpanded = !equipmentPanelExpanded;
  renderEquippedItems();
}

function armTitleBgmUnlock() {
  if (titleBgmUnlockArmed) return;

  titleBgmUnlockArmed = true;
  const unlock = () => {
    titleBgmUnlockArmed = false;
    if (!hasStartedGame) playBgm("title", { silentFail: true });
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

function startLoop() {
  if (gameTimer) window.clearInterval(gameTimer);
  lastTick = Date.now();
  gameTimer = window.setInterval(() => {
    const now = Date.now();
    const delta = Math.min(0.2, (now - lastTick) / 1000);
    lastTick = now;
    tick(delta);
  }, TICK_RATE);
}

function stopLoop() {
  if (!gameTimer) return;
  window.clearInterval(gameTimer);
  gameTimer = null;
}

function tick(delta) {
  try {
    state.elapsed += delta;
    saveCooldown += delta;

    moveEnemies(delta);
    updateAutoCombat(delta);
    updateEquipmentUpgrade(delta);

    if (saveCooldown >= 10) {
      saveCooldown = 0;
      saveState("자동 저장 완료");
    }

    renderBattle();
  } catch (error) {
    log(`전투 루프 오류: ${error.message}`);
  }
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return cloneDefaultState();
    return normalizeState({ ...cloneDefaultState(), ...JSON.parse(saved) });
  } catch {
    return cloneDefaultState();
  }
}

function normalizeState(nextState) {
  return {
    ...cloneDefaultState(),
    ...nextState,
    gold: Number(nextState.gold) || 0,
    idea: Number(nextState.idea) || 0,
    chapter: Math.max(1, Number(nextState.chapter) || Number(nextState.stage) || 1),
    subStage: Math.min(
      NORMAL_STAGES_PER_CHAPTER,
      Math.max(1, Number(nextState.subStage) || deriveSubStageFromLegacy(nextState.stage))
    ),
    battleMode: nextState.battleMode === "boss" ? "boss" : "normal",
    stage: Math.max(1, Number(nextState.chapter) || Number(nextState.stage) || 1),
    enemyHp: Math.max(0, Number(nextState.enemyHp) || defaultState.enemyHp),
    enemyMaxHp: Math.max(1, Number(nextState.enemyMaxHp) || defaultState.enemyMaxHp),
    enemyX: Number(nextState.enemyX) || ENEMY_SPAWN_X,
    enemies: normalizeEnemies(nextState.enemies),
    clickPower: Math.max(1, Number(nextState.clickPower) || 1),
    playerLevel: Math.max(1, Number(nextState.playerLevel) || 1),
    clearCount: Math.max(0, Number(nextState.clearCount) || 0),
    companyXp: Math.max(0, Number(nextState.companyXp) || deriveCompanyXp(nextState)),
    elapsed: Math.max(0, Number(nextState.elapsed) || 0),
    recruits: nextState.recruits && typeof nextState.recruits === "object" ? nextState.recruits : {},
    squad: normalizeSquad(nextState.squad, nextState.recruits, !nextState.squadConfigured),
    squadConfigured: Boolean(nextState.squadConfigured),
    tools: nextState.tools && typeof nextState.tools === "object" ? nextState.tools : {},
    growthLevels:
      nextState.growthLevels && typeof nextState.growthLevels === "object"
        ? {
            process: Math.max(0, Number(nextState.growthLevels.process) || 0),
            critical: Math.max(0, Number(nextState.growthLevels.critical) || 0),
            skill: Math.max(0, Number(nextState.growthLevels.skill) || 0),
            speed: Math.max(0, Number(nextState.growthLevels.speed) || 0),
            hp: Math.max(0, Number(nextState.growthLevels.hp) || 0),
          }
        : cloneDefaultState().growthLevels,
    equipment: normalizeEquipment(nextState.equipment),
  };
}

function normalizeSquad(savedSquad, ownedRecruits = {}, autoFill = false) {
  const normalized = [null, null, null, null];
  const used = {};
  const ownedRoster = ownedRecruits && typeof ownedRecruits === "object" ? ownedRecruits : {};

  if (Array.isArray(savedSquad)) {
    savedSquad.slice(0, normalized.length).forEach((id, index) => {
      const owned = Math.max(0, Number(ownedRoster[id]) || 0);
      if (!recruits.some((recruit) => recruit.id === id) || (used[id] || 0) >= owned) return;
      normalized[index] = id;
      used[id] = (used[id] || 0) + 1;
    });
  }

  if (autoFill) {
    recruits.forEach((recruit) => {
      let remaining = Math.max(0, Number(ownedRoster[recruit.id]) || 0) - (used[recruit.id] || 0);
      while (remaining > 0) {
        const emptyIndex = normalized.indexOf(null);
        if (emptyIndex < 0) return;
        normalized[emptyIndex] = recruit.id;
        used[recruit.id] = (used[recruit.id] || 0) + 1;
        remaining -= 1;
      }
    });
  }

  return normalized;
}

function normalizeEquipment(equipment) {
  const safeEquipment = equipment && typeof equipment === "object" ? equipment : {};
  return {
    equipped: normalizeEquippedItems(safeEquipment.equipped),
    pending: normalizeEquipmentItem(safeEquipment.pending),
    drawCount: Math.max(0, Number(safeEquipment.drawCount) || 0),
    gradeLevel: Math.min(getMaxEquipmentUpgradeLevel(), Math.max(1, Number(safeEquipment.gradeLevel) || 1)),
    upgradeRemaining: Math.max(0, Number(safeEquipment.upgradeRemaining) || 0),
    upgradingTo: safeEquipment.upgradingTo ? Number(safeEquipment.upgradingTo) : null,
    speedTickets: Math.max(0, Number(safeEquipment.speedTickets) || 0),
  };
}

function normalizeEquippedItems(equipped) {
  const normalized = {};
  if (!equipped || typeof equipped !== "object") return normalized;

  if ("powerBonus" in equipped || "skillBonus" in equipped || "clickBonus" in equipped) {
    const legacyItem = normalizeEquipmentItem(equipped);
    if (legacyItem) normalized[legacyItem.slot] = legacyItem;
    return normalized;
  }

  equipmentSlots.forEach((slot) => {
    const item = normalizeEquipmentItem(equipped[slot.id]);
    if (item) normalized[slot.id] = item;
  });
  return normalized;
}

function normalizeEquipmentItem(item) {
  if (!item || typeof item !== "object") return null;

  const slot = getEquipmentSlotId(item.slot || inferEquipmentSlot(item.id));
  return {
    id: String(item.id || "unknown"),
    slot,
    name: String(item.name || "이름 없는 장비"),
    icon: String(item.icon || "?"),
    image: String(item.image || ""),
    grade: String(item.grade || "일반"),
    gradeColor: String(item.gradeColor || "#6f6251"),
    powerBonus: Math.max(0, Number(item.powerBonus) || 0),
    skillBonus: Math.max(0, Number(item.skillBonus ?? item.clickBonus) || 0),
  };
}

function inferEquipmentSlot(id) {
  const base = equipmentPool.find((item) => item.id === id || String(id || "").startsWith(`${item.id}-`));
  return base ? base.slot : equipmentSlots[0].id;
}

function getEquipmentSlotId(slotId) {
  return equipmentSlots.some((slot) => slot.id === slotId) ? slotId : equipmentSlots[0].id;
}

function saveState(message) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    message = "저장소 접근 불가";
  }
  refs.saveStateText.textContent = message;
}

function resetGame() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    refs.saveStateText.textContent = "저장소 접근 불가";
  }
  state = cloneDefaultState();
  lastRosterKey = "";
  lastCompanyVisualKey = "";
  spawnWave();
  renderAll();
  saveState("초기화 완료");
}

function normalizeEnemies(enemies) {
  if (!Array.isArray(enemies)) return [];
  return enemies
    .map((enemy, index) => ({
      id: enemy.id || `saved-${index}`,
      name: enemy.name || getEnemyName(),
      hp: Math.max(1, Number(enemy.hp) || 1),
      maxHp: Math.max(1, Number(enemy.maxHp) || 1),
      x: Number(enemy.x) || ENEMY_SPAWN_X,
      y: Number(enemy.y) || getEnemyLaneY(index),
      lane: Number(enemy.lane) || index,
      isBoss: Boolean(enemy.isBoss),
    }))
    .filter((enemy) => enemy.hp > 0);
}

function spawnWave() {
  state.stage = state.chapter;
  state.enemies = state.battleMode === "boss" ? createBossWave() : createNormalWave();
  state.enemyMaxHp = state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0);
  state.enemyHp = state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
  state.enemyX = ENEMY_SPAWN_X;
  isSpawningNext = false;
  basicAttackCooldown = 0.35;
  skillAttackCooldown = SKILL_ATTACK_RATE;
  if (hasStartedGame) playBgm(getBattleBgmKey());
  log(`${getProgressLabel()} ${state.battleMode === "boss" ? "보스" : "업무"}가 오른쪽에서 접근합니다.`);
}

function createNormalWave() {
  const count = getWaveEnemyCount();
  const hp = getEnemyHp();
  return Array.from({ length: count }, (_, index) => ({
    id: `enemy-${Date.now()}-${enemySeq++}`,
    name: getEnemyName(),
    hp,
    maxHp: hp,
    x: ENEMY_SPAWN_X + index * 4,
    y: getEnemyLaneY(index),
    lane: index,
    isBoss: false,
  }));
}

function createBossWave() {
  const hp = getBossHp();
  return [
    {
      id: `boss-${Date.now()}-${enemySeq++}`,
      name: `${state.chapter}스테이지 보스`,
      hp,
      maxHp: hp,
      x: ENEMY_SPAWN_X,
      y: 72,
      lane: 0,
      isBoss: true,
    },
  ];
}

function getWaveEnemyCount() {
  return Math.min(ENEMY_MAX_COUNT, 2 + Math.floor((state.subStage - 1) / 2) + Math.floor((state.chapter - 1) / 3));
}

function getEnemyHp() {
  const stageBase = 6 + state.chapter * 2.2 + state.subStage * 1.4;
  const growthBonus = getDifficultyGrowthPower() * (0.18 + state.chapter * 0.012);
  return Math.floor(stageBase + growthBonus);
}

function getBossHp() {
  const bossScale = 3.1 + state.chapter * 0.18;
  return Math.floor(getEnemyHp() * bossScale);
}

function getDifficultyGrowthPower() {
  const recruitPower = recruits.reduce((sum, recruit) => sum + getRecruitCount(recruit.id) * getRecruitPower(recruit), 0);
  const equipmentPower = getEquippedItems().reduce((sum, item) => sum + item.powerBonus + item.skillBonus, 0);
  const toolPower = tools.reduce((sum, tool) => sum + getToolLevel(tool.id) * ((tool.click || 0) + (tool.dps || 0)), 0);
  const upgradePower = Math.max(0, state.playerLevel - 1) * 1.3 + Math.max(0, state.clickPower - 1) * 0.6;
  return Math.max(0, upgradePower + recruitPower + equipmentPower + toolPower);
}

function getEnemyLaneY(index) {
  const lanes = [34, 62, 90, 118, 48];
  return lanes[index % lanes.length];
}

function moveEnemies(delta) {
  if (isSpawningNext || !state.enemies.length) return;

  const speed = Math.min(5.2, 2.2 + state.stage * 0.06);
  state.enemies.forEach((enemy) => {
    enemy.x = Math.max(ENEMY_CONTACT_X, enemy.x - speed * delta);

    if (enemy.x <= ENEMY_CONTACT_X) {
      if (enemy.isBoss) {
        failBossBattle();
        return;
      }

      enemy.x = ENEMY_SPAWN_X + enemy.lane * 3;
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.ceil(enemy.maxHp * 0.1));
      log("업무가 팀 앞까지 밀려와 일정 압박이 커졌습니다.");
    }
  });

  syncEnemySummary();
}

function updateAutoCombat(delta) {
  if (isSpawningNext || !state.enemies.length) return;

  const speedAdjustedDelta = delta * getAttackSpeedMultiplier();
  basicAttackCooldown -= speedAdjustedDelta;
  skillAttackCooldown -= speedAdjustedDelta;

  if (basicAttackCooldown <= 0) {
    basicAttackCooldown += BASIC_ATTACK_RATE;
    performAttackRound(false);
  }

  if (skillAttackCooldown <= 0) {
    skillAttackCooldown += SKILL_ATTACK_RATE;
    performAttackRound(true);
    log("팀 스킬 공격!");
  }
}

function performAttackRound(skill) {
  getUnits().forEach((unit, index) => {
    window.setTimeout(() => attackUnit(unit, { skill }), index * 120);
  });
}

function attackUnit(unit, options = {}) {
  const target = getTargetEnemy();
  if (isSpawningNext || !target) return;

  const skill = Boolean(options.skill);
  const manual = Boolean(options.manual);
  const from = getUnitPosition(unit.id);

  if (skill && unit.skill) {
    castSkill(unit, from);
    return;
  }

  const damage = unit.power;

  if (unit.attackType === "slash") {
    playSlash(unit, target, skill);
    window.setTimeout(() => damageEnemy(target.id, damage, manual), 140);
  } else {
    playProjectile(unit, from, target, skill);
    window.setTimeout(() => damageEnemy(target.id, damage, manual), 240);
  }
}

function castSkill(unit, from) {
  const targets = getSkillTargets(unit.skill);
  if (!targets.length) return;

  pulseUnit(unit.id, "is-skill", 520);
  playSkillEffect(unit, targets);

  targets.forEach((target, index) => {
    const skillPower = unit.id === "player" ? getPlayerSkillPower() : unit.power;
    const damage = Math.ceil(skillPower * unit.skill.multiplier + state.playerLevel * 0.6);
    window.setTimeout(() => damageEnemy(target.id, damage, false), 120 + index * 70);
  });

  log(`${unit.shortName} 스킬: ${unit.skill.name}`);
}

function getSkillTargets(skill) {
  const target = getTargetEnemy();
  if (!target) return [];

  if (skill.type === "all") return [...state.enemies];

  if (skill.type === "aoe") {
    return state.enemies.filter((enemy) => Math.abs(enemy.x - target.x) <= skill.radius);
  }

  if (skill.type === "chain" || skill.type === "cleave") {
    return [...state.enemies].sort((a, b) => a.x - b.x || a.y - b.y).slice(0, skill.targets);
  }

  return [target];
}

function playProjectile(unit, from, target, skill) {
  const shot = document.createElement("span");
  shot.className = `projectile is-${unit.attackType}${skill ? " is-skill" : ""}`;
  shot.style.setProperty("--from-x", `${from.x}%`);
  shot.style.setProperty("--from-y", `${from.y}px`);
  shot.style.setProperty("--to-x", `${target.x}%`);
  shot.style.setProperty("--shot-color", unit.color);
  refs.effectLayer.appendChild(shot);
  pulseUnit(unit.id, "is-attacking", 320);
  window.setTimeout(() => shot.remove(), 480);
}

function playSlash(unit, target, skill) {
  const ally = refs.allyLayer.querySelector(`[data-unit-id="${unit.id}"]`);
  if (ally) {
    ally.style.setProperty("--slash-x", `${Math.max(36, target.x - 9)}%`);
    ally.classList.add("is-slashing");
    window.setTimeout(() => ally.classList.remove("is-slashing"), 300);
  }

  const slash = document.createElement("span");
  slash.className = `slash-effect${skill ? " is-skill" : ""}`;
  slash.style.setProperty("--hit-x", `${target.x}%`);
  refs.effectLayer.appendChild(slash);
  window.setTimeout(() => slash.remove(), 360);
}

function playSkillEffect(unit, targets) {
  const centerX = targets.reduce((sum, target) => sum + target.x, 0) / targets.length;
  const centerY = targets.reduce((sum, target) => sum + target.y, 0) / targets.length + 64;
  const effect = document.createElement("span");
  effect.className = `skill-zone is-${unit.skill.type}`;
  effect.textContent = unit.skill.type === "all" ? "TEST" : unit.skill.type === "chain" ? "LINK" : "";
  effect.style.setProperty("--skill-x", `${centerX}%`);
  effect.style.setProperty("--skill-y", `${centerY}px`);
  effect.style.setProperty("--skill-color", unit.color);
  refs.effectLayer.appendChild(effect);
  window.setTimeout(() => effect.remove(), 620);

  targets.forEach((target) => {
    const marker = document.createElement("span");
    marker.className = "skill-hit-marker";
    marker.style.setProperty("--hit-x", `${target.x}%`);
    marker.style.setProperty("--hit-y", `${target.y + 82}px`);
    marker.style.setProperty("--skill-color", unit.color);
    refs.effectLayer.appendChild(marker);
    window.setTimeout(() => marker.remove(), 520);
  });
}

function damageEnemy(enemyId, amount, manual) {
  if (isSpawningNext) return;

  const target = state.enemies.find((enemy) => enemy.id === enemyId) || getTargetEnemy();
  if (!target) return;

  const critical = Math.random() < getCriticalChance();
  const multiplier = getGlobalMultiplier() * (critical ? CRITICAL_MULTIPLIER : 1);
  const finalAmount = Math.max(1, Math.round(amount * multiplier));
  target.hp = Math.max(0, target.hp - finalAmount);
  showDamage(finalAmount, target, { critical });
  pulseEnemy(target.id);

  if (target.hp <= 0) {
    defeatEnemy(target.id, manual);
  } else if (manual) {
    log(`직접 처리로 ${finalAmount} 기여도를 넣었습니다.`);
  }
  syncEnemySummary();
}

function defeatEnemy(enemyId, manual) {
  state.enemies = state.enemies.filter((enemy) => enemy.id !== enemyId);
  const goldGain = Math.floor(3 + state.chapter * 1.4 + state.subStage * 0.6);
  const ideaGain = manual ? 1 : 0;
  state.gold += goldGain;
  state.idea += ideaGain;
  state.clearCount += 1;
  addCompanyXp(1);

  if (!state.enemies.length) completeWave(manual);
}

function completeWave(manual) {
  if (isSpawningNext) return;

  isSpawningNext = true;
  const clearedBoss = state.battleMode === "boss";
  const bonusIdea = clearedBoss ? 8 + state.chapter * 2 : manual ? 1 : 2;
  state.idea += bonusIdea;
  addCompanyXp(clearedBoss ? 6 : 2);
  log(clearedBoss ? `${state.chapter}스테이지 보스 클리어! 아이디어 +${bonusIdea}` : `${getProgressLabel()} 클리어!`);

  window.setTimeout(() => {
    advanceBattleLayer();
    spawnWave();
    renderAll();
  }, 520);
}

function failBossBattle() {
  if (isSpawningNext) return;

  isSpawningNext = true;
  state.battleMode = "normal";
  state.subStage = NORMAL_STAGES_PER_CHAPTER;
  state.enemies = [];
  syncEnemySummary();
  log(`${state.chapter}스테이지 보스 퇴치 실패. ${state.chapter}-${state.subStage}로 복귀합니다.`);

  window.setTimeout(() => {
    spawnWave();
    renderAll();
  }, 700);
}

function advanceBattleLayer() {
  if (state.battleMode === "boss") {
    state.chapter += 1;
    state.subStage = 1;
    state.battleMode = "normal";
  } else if (state.subStage >= NORMAL_STAGES_PER_CHAPTER) {
    state.battleMode = "boss";
  } else {
    state.subStage += 1;
  }
  state.stage = state.chapter;
}

function getTargetEnemy() {
  return [...state.enemies].sort((a, b) => a.x - b.x || a.y - b.y)[0] || null;
}

function pulseEnemy(enemyId) {
  const enemy = refs.enemyLayer.querySelector(`[data-enemy-id="${enemyId}"]`);
  if (!enemy) return;
  enemy.classList.add("is-hit");
  window.setTimeout(() => enemy.classList.remove("is-hit"), 120);
}

function syncEnemySummary() {
  state.enemyHp = state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
  state.enemyMaxHp = state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0) || 1;
  const target = getTargetEnemy();
  state.enemyX = target ? target.x : ENEMY_SPAWN_X;
}

function showDamage(amount, target, options = {}) {
  const critical = Boolean(options.critical);
  const damage = document.createElement("span");
  damage.className = `damage-number${critical ? " is-critical" : ""}`;
  damage.textContent = critical ? `CRIT ${amount}` : `-${amount}`;
  damage.style.setProperty("--hit-x", `${target.x}%`);
  damage.style.setProperty("--hit-y", `${target.y + 92}px`);
  refs.effectLayer.appendChild(damage);
  if (critical) showCriticalBurst(target);
  window.setTimeout(() => damage.remove(), critical ? 980 : 760);
}

function showCriticalBurst(target) {
  const burst = document.createElement("span");
  burst.className = "critical-burst";
  burst.style.setProperty("--hit-x", `${target.x}%`);
  burst.style.setProperty("--hit-y", `${target.y + 92}px`);
  refs.effectLayer.appendChild(burst);
  window.setTimeout(() => burst.remove(), 620);

  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement("span");
    particle.className = "critical-particle";
    particle.style.setProperty("--hit-x", `${target.x}%`);
    particle.style.setProperty("--hit-y", `${target.y + 92}px`);
    particle.style.setProperty("--particle-angle", `${index * 30 + Math.random() * 18}deg`);
    particle.style.setProperty("--particle-distance", `${26 + Math.random() * 30}px`);
    refs.effectLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 720);
  }
}

function pulseUnit(unitId, className, duration) {
  const ally = refs.allyLayer.querySelector(`[data-unit-id="${unitId}"]`);
  if (!ally) return;
  ally.classList.add(className);
  window.setTimeout(() => ally.classList.remove(className), duration);
}

function getPlayerUnit(power = getPlayerPower()) {
  return {
    id: "player",
    name: "대표",
    shortName: "대표",
    mark: "C",
    color: "#059669",
    spriteSheet: "Anim/Player_1/Motion.png",
    count: 1,
    power,
    attackType: "code",
    skill: { type: "aoe", name: "핫픽스 배포", radius: 12, multiplier: 1.35 },
  };
}

function getUnits() {
  const units = [getPlayerUnit()];
  state.squad.forEach((recruitId, slotIndex) => {
    const recruit = recruits.find((item) => item.id === recruitId);
    if (!recruit) return;

    units.push({
      ...recruit,
      id: `squad-${slotIndex}-${recruit.id}`,
      recruitId: recruit.id,
      count: 1,
      power: getRecruitPower(recruit),
    });
  });
  return units;
}

function getUnitPosition(unitId) {
  const index = Math.max(0, getUnits().findIndex((unit) => unit.id === unitId));
  return getAllyPosition(index);
}

function getRecruitCount(id) {
  return state.recruits[id] || 0;
}

function getToolLevel(id) {
  return state.tools[id] || 0;
}

function getRecruitPower(recruit) {
  const toolBonus = tools
    .filter((tool) => tool.target === recruit.id)
    .reduce((bonus, tool) => bonus + getToolLevel(tool.id) * tool.dps, 0);
  return recruit.dps + toolBonus;
}

function getGlobalMultiplier() {
  return tools.reduce((sum, tool) => sum + (tool.multiplier || 0) * getToolLevel(tool.id), 1);
}

function getTotalDps() {
  const squadPower = getUnits().reduce((sum, unit) => sum + unit.power, 0);
  return Math.max(1, Math.round(squadPower * getGlobalMultiplier()));
}

function getTeamCount() {
  return getUnits().length;
}

function getEmployeeCount() {
  return 1 + recruits.reduce((sum, recruit) => sum + getRecruitCount(recruit.id), 0);
}

function getEnemyName() {
  return enemyNames[Math.min(enemyNames.length - 1, state.chapter - 1)];
}

function getProgressLabel() {
  return state.battleMode === "boss" ? `${state.chapter}-BOSS` : `${state.chapter}-${state.subStage}`;
}

function getCompanyLevelIndex(xp = state.companyXp) {
  for (let index = companyLevels.length - 1; index >= 0; index -= 1) {
    if (xp >= companyLevels[index].minXp) return index;
  }
  return 0;
}

function getCompanyProgress() {
  const levelIndex = getCompanyLevelIndex();
  const current = companyLevels[levelIndex];
  const next = companyLevels[levelIndex + 1] || null;
  if (!next) {
    return { levelIndex, current, next, percent: 100, currentXp: state.companyXp, requiredXp: current.minXp };
  }

  const earned = state.companyXp - current.minXp;
  const required = next.minXp - current.minXp;
  return {
    levelIndex,
    current,
    next,
    percent: Math.max(0, Math.min(100, Math.round((earned / required) * 100))),
    currentXp: earned,
    requiredXp: required,
  };
}

function getFacilityInvestmentCount() {
  return tools.reduce((total, tool) => total + getToolLevel(tool.id), 0);
}

function deriveCompanyXp(nextState) {
  const recruitCount = Object.values(nextState.recruits || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const facilityCount = Object.values(nextState.tools || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return Math.max(
    0,
    Math.floor(Number(nextState.clearCount) || 0) +
      recruitCount * 4 +
      facilityCount * 6 +
      Math.max(0, (Number(nextState.chapter) || 1) - 1) * 10
  );
}

function addCompanyXp(amount) {
  state.companyXp = Math.max(0, state.companyXp + Math.max(0, Number(amount) || 0));
}

function getBattleBackground() {
  const bgIndex = ((state.chapter - 1) % 3) + 1;
  return `Resource/BackGround/BG_${bgIndex}.png`;
}

function deriveSubStageFromLegacy(stage) {
  const legacyStage = Math.max(1, Number(stage) || 1);
  return ((legacyStage - 1) % NORMAL_STAGES_PER_CHAPTER) + 1;
}

function costFor(baseCost, count) {
  return Math.floor(baseCost * Math.pow(1.32, count));
}

function buyRecruit(id) {
  const recruit = recruits.find((item) => item.id === id);
  const count = getRecruitCount(id);
  const cost = costFor(recruit.baseCost, count);
  if (state.gold < cost) return;

  state.gold -= cost;
  state.recruits[id] = count + 1;
  if (!state.squadConfigured) {
    state.squad = normalizeSquad(state.squad, state.recruits, true);
    lastRosterKey = "";
  }
  addCompanyXp(4);
  basicAttackCooldown = Math.min(basicAttackCooldown, 0.2);
  const rankLabel = getRecruitRankLabel(recruit, count + 1);
  log(`${rankLabel} 영입 완료. 회사 성장 경험치 +4`);
  renderAll();
}

function buyTool(id) {
  const tool = tools.find((item) => item.id === id);
  const level = getToolLevel(id);
  const cost = costFor(tool.baseCost, level);
  if (state.idea < cost) return;

  state.idea -= cost;
  state.tools[id] = level + 1;
  addCompanyXp(tool.growthXp + level * 2);
  if (tool.click) state.clickPower += tool.click;
  log(`${tool.name} 확장 완료. 회사 성장 경험치 +${tool.growthXp + level * 2}`);
  renderAll();
}

function getEquipmentDrawCost() {
  return EQUIPMENT_DRAW_COST;
}

function drawEquipment() {
  if (state.equipment.pending) return;

  const cost = getEquipmentDrawCost();
  if (state.gold < cost) {
    log(`장비 뽑기에는 자금 ${cost}이 필요합니다.`);
    return;
  }

  state.gold -= cost;
  state.equipment.drawCount += 1;
  state.equipment.pending = createEquipmentItem();
  log(`${state.equipment.pending.grade} ${state.equipment.pending.name}을 뽑았습니다.`);
  renderAll();
}

function toggleAutoDraw() {
  if (isAutoDrawing()) {
    stopAutoDraw("자동 뽑기를 중지했습니다.");
    return;
  }

  if (state.equipment.pending) {
    log("먼저 뽑힌 장비를 장착하거나 버려주세요.");
    return;
  }

  startAutoDraw();
}

function startAutoDraw() {
  if (isAutoDrawing()) return;

  log("공격력과 스킬 공격력이 모두 증가하는 장비가 나올 때까지 자동 뽑기를 시작합니다.");
  autoDrawTimer = window.setTimeout(runAutoDrawStep, 120);
  renderEquipment();
}

function stopAutoDraw(message) {
  if (autoDrawTimer) {
    window.clearTimeout(autoDrawTimer);
    autoDrawTimer = null;
  }
  if (message) log(message);
  renderEquipment();
}

function isAutoDrawing() {
  return Boolean(autoDrawTimer);
}

function runAutoDrawStep() {
  autoDrawTimer = null;

  if (state.equipment.pending) {
    stopAutoDraw();
    return;
  }

  const cost = getEquipmentDrawCost();
  if (state.gold < cost) {
    stopAutoDraw(`자동 뽑기를 중지했습니다. 자금 ${cost}이 필요합니다.`);
    return;
  }

  state.gold -= cost;
  state.equipment.drawCount += 1;

  const item = createEquipmentItem();
  const equipped = getEquippedItem(item.slot);
  if (hasPositiveEquipmentGain(item, equipped)) {
    state.equipment.pending = item;
    log(`${item.grade} ${item.name}에서 공격력과 스킬 공격력 상승을 발견했습니다.`);
    renderAll();
    return;
  }

  state.idea += getEquipmentDiscardRefund(item);
  log(`${item.grade} ${item.name}은 두 능력치가 모두 증가하지 않아 자동으로 버렸습니다.`);
  autoDrawTimer = window.setTimeout(runAutoDrawStep, 260);
  renderAll();
}

function createEquipmentItem() {
  const base = equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
  const grade = pickEquipmentGrade();
  const powerBonus = rollEquipmentValue(base.power, grade.multiplier);
  const skillBonus = rollEquipmentValue(base.skill, grade.multiplier);

  return {
    id: `${base.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slot: base.slot,
    name: base.name,
    icon: base.icon,
    image: base.image,
    grade: grade.name,
    gradeColor: grade.color,
    powerBonus,
    skillBonus,
  };
}

function pickEquipmentGrade() {
  const gradeLevel = getEquipmentGradeLevel();
  const config = getEquipmentUpgradeConfig(gradeLevel);
  const candidates = equipmentGrades
    .slice(0, config.maxGrade + 1)
    .map((grade, index) => ({
      ...grade,
      chance: getAdjustedGradeChance(grade.chance, index, gradeLevel),
    }));
  const chanceSum = candidates.reduce((sum, grade) => sum + grade.chance, 0);
  const roll = Math.random();
  let total = 0;
  for (const grade of candidates) {
    total += grade.chance / chanceSum;
    if (roll <= total) return grade;
  }
  return candidates[0];
}

function getAdjustedGradeChance(baseChance, gradeIndex, gradeLevel) {
  if (gradeLevel < 3) return baseChance;
  const bonus = gradeIndex === 0 ? -0.18 : gradeIndex * 0.08;
  return Math.max(0.05, baseChance + bonus);
}

function rollEquipmentValue(range, multiplier) {
  const [min, max] = range;
  const value = min + Math.floor(Math.random() * (max - min + 1));
  return Math.max(0, Math.ceil(value * multiplier));
}

function equipPendingEquipment() {
  if (!state.equipment.pending) return;

  state.equipment.equipped[state.equipment.pending.slot] = state.equipment.pending;
  state.equipment.pending = null;
  log("대표 장비를 장착했습니다.");
  renderAll();
}

function discardPendingEquipment() {
  if (!state.equipment.pending) return;

  const refund = getEquipmentDiscardRefund(state.equipment.pending);
  state.idea += refund;
  state.equipment.pending = null;
  log(`장비를 버리고 아이디어 +${refund}을 얻었습니다.`);
  renderAll();
}

function hasPositiveEquipmentGain(item, equipped = getEquippedItem(item.slot)) {
  const currentPower = equipped ? equipped.powerBonus : 0;
  const currentSkill = equipped ? equipped.skillBonus : 0;
  return item.powerBonus > currentPower && item.skillBonus > currentSkill;
}

function getEquipmentDiscardRefund(item) {
  return Math.max(1, Math.floor(getEquipmentScore(item) / 2));
}

function getMaxEquipmentUpgradeLevel() {
  return equipmentUpgradeConfigs[equipmentUpgradeConfigs.length - 1].level;
}

function getEquipmentGradeLevel() {
  return Math.min(getMaxEquipmentUpgradeLevel(), Math.max(1, Number(state.equipment.gradeLevel) || 1));
}

function getEquipmentUpgradeConfig(level = getEquipmentGradeLevel()) {
  return equipmentUpgradeConfigs.find((config) => config.level === level) || equipmentUpgradeConfigs[0];
}

function getNextEquipmentUpgradeConfig() {
  return equipmentUpgradeConfigs.find((config) => config.level === getEquipmentGradeLevel() + 1) || null;
}

function isEquipmentUpgrading() {
  return Boolean(state.equipment.upgradingTo) && state.equipment.upgradeRemaining > 0;
}

function startEquipmentUpgrade() {
  if (isEquipmentUpgrading()) return;

  const nextConfig = getNextEquipmentUpgradeConfig();
  if (!nextConfig) {
    log("장비 연구가 최대 단계입니다.");
    return;
  }

  if (state.idea < nextConfig.nextCost) {
    log(`장비 연구에는 아이디어 ${nextConfig.nextCost}이 필요합니다.`);
    return;
  }

  state.idea -= nextConfig.nextCost;
  state.equipment.upgradingTo = nextConfig.level;
  state.equipment.upgradeRemaining = nextConfig.duration;
  log(`장비 연구 ${nextConfig.label} 진행을 시작했습니다.`);
  renderAll();
}

function updateEquipmentUpgrade(delta) {
  if (!isEquipmentUpgrading()) return;

  state.equipment.upgradeRemaining = Math.max(0, state.equipment.upgradeRemaining - delta);
  if (state.equipment.upgradeRemaining > 0) return;

  completeEquipmentUpgrade();
}

function completeEquipmentUpgrade() {
  if (!state.equipment.upgradingTo) return;

  state.equipment.gradeLevel = Math.max(getEquipmentGradeLevel(), state.equipment.upgradingTo);
  state.equipment.upgradingTo = null;
  state.equipment.upgradeRemaining = 0;
  log(`장비 연구가 ${getEquipmentUpgradeConfig().label}로 상승했습니다.`);
  renderAll();
}

function useSpeedTicket() {
  if (!isEquipmentUpgrading()) {
    log("진행 중인 장비 연구가 없습니다.");
    return;
  }

  if (state.equipment.speedTickets <= 0) {
    log("사용할 가속티켓이 없습니다.");
    return;
  }

  state.equipment.speedTickets -= 1;
  state.equipment.upgradeRemaining = Math.max(0, state.equipment.upgradeRemaining - SPEED_TICKET_SECONDS);
  if (state.equipment.upgradeRemaining <= 0) {
    completeEquipmentUpgrade();
  } else {
    log("가속티켓을 사용해 연구 시간을 10분 단축했습니다.");
    renderBattle();
  }
}

function getEquippedItem(slotId) {
  if (!state.equipment || !state.equipment.equipped) return null;
  if (!slotId) return null;
  return state.equipment.equipped[slotId] || null;
}

function getEquippedItems() {
  if (!state.equipment || !state.equipment.equipped) return [];
  return equipmentSlots.map((slot) => state.equipment.equipped[slot.id]).filter(Boolean);
}

function getPendingEquipment() {
  return state.equipment && state.equipment.pending ? state.equipment.pending : null;
}

function getEquipmentScore(item) {
  if (!item) return 0;
  return item.powerBonus + item.skillBonus;
}

function getPlayerPower() {
  return state.playerLevel + (state.growthLevels.process || 0) + getEquippedItems().reduce((sum, item) => sum + item.powerBonus, 0);
}

function getPlayerSkillPower() {
  return state.playerLevel + (state.growthLevels.skill || 0) * 0.2 + getEquippedItems().reduce((sum, item) => sum + item.skillBonus, 0);
}

function getManualPower() {
  return state.clickPower + (state.growthLevels.process || 0);
}

function upgradePlayer() {
  const cost = Math.floor(18 * Math.pow(1.4, state.playerLevel - 1));
  if (state.gold < cost) return;

  state.gold -= cost;
  state.playerLevel += 1;
  state.clickPower += 1;
  log("대표 역량이 강화되었습니다.");
  renderAll();
}

function getGrowthValue(type) {
  const level = state.growthLevels[type] || 0;
  switch (type) {
    case "process":
      return 1 + level;
    case "critical":
      return `${Math.round((CRITICAL_CHANCE + 0.01 * level) * 100)}%`;
    case "skill":
      return 1 + 0.2 * level;
    case "speed":
      return 1 + 0.05 * level;
    case "hp":
      return 100 + 20 * level;
    default:
      return 0;
  }
}

function formatGrowthValue(type, value) {
  if (type === "critical") return value;
  if (type === "skill" || type === "speed") return value.toFixed(1);
  return value;
}

function getGrowthCost(type) {
  const base = growthConfigs[type]?.baseCost || 20;
  const level = state.growthLevels[type] || 0;
  return Math.floor(base * Math.pow(1.25, level));
}

function upgradeGrowth(type) {
  if (!growthConfigs[type]) return;
  const cost = getGrowthCost(type);
  if (state.gold < cost) return;
  state.gold -= cost;
  state.growthLevels[type] = (state.growthLevels[type] || 0) + 1;
  log(`${growthConfigs[type].label} 강화 완료!`);
  renderAll();
}

function getCriticalChance() {
  return Math.min(0.6, CRITICAL_CHANCE + (state.growthLevels.critical || 0) * 0.01);
}

function getAttackSpeedMultiplier() {
  return 1 + (state.growthLevels.speed || 0) * 0.05;
}

function switchTab(tab) {
  activeTab = tab.dataset.tab;
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("is-active", button === tab));
  document
    .querySelectorAll(".tab-panel")
    .forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === activeTab));
  updatePrimaryScene();
}

function renderAll() {
  renderAllies();
  renderShop();
  renderEnemies();
  renderBattle();
}

function renderBattle() {
  const playerCost = Math.floor(18 * Math.pow(1.4, state.playerLevel - 1));

  refs.goldText.textContent = Math.floor(state.gold);
  refs.ideaText.textContent = Math.floor(state.idea);
  refs.stageText.textContent = getProgressLabel();
  refs.battlefield.style.setProperty("--battle-bg", `url("${getBattleBackground()}")`);
  renderCompany();
  updatePrimaryScene();
  setText(refs.dpsText, `초당 기여도 ${getTotalDps()}`);
  renderEnemies();
  setText(refs.teamCountText, `${getTeamCount()}명`);
  setText(refs.clickPowerText, getManualPower());
  setText(refs.clearCountText, `${state.clearCount}건`);
  setText(refs.growthProcessValue, formatGrowthValue("process", getGrowthValue("process")));
  setText(refs.growthCriticalValue, formatGrowthValue("critical", getGrowthValue("critical")));
  setText(refs.growthSkillValue, formatGrowthValue("skill", getGrowthValue("skill")));
  setText(refs.growthSpeedValue, formatGrowthValue("speed", getGrowthValue("speed")));
  setText(refs.growthHpValue, formatGrowthValue("hp", getGrowthValue("hp")));
  refs.upgradePlayerButton.textContent = `대표 역량 강화 (${playerCost} 자금)`;
  refs.upgradePlayerButton.disabled = state.gold < playerCost;
  document.querySelectorAll("[data-upgrade-growth]").forEach((button) => {
    const type = button.dataset.upgradeGrowth;
    const cost = getGrowthCost(type);
    button.textContent = `강화 (${cost} 자금)`;
    button.disabled = state.gold < cost;
  });
  refs.nextStageButton.textContent = state.battleMode === "boss" ? "보스 재도전" : "다음 단계";
  renderEquipment();
}

function renderEquipment() {
  const pending = getPendingEquipment();
  const equipped = pending ? getEquippedItem(pending.slot) : null;
  const cost = getEquipmentDrawCost();

  refs.equipmentDrawCost.textContent = `${cost} 자금`;
  refs.equipmentDrawButton.disabled = Boolean(pending) || isAutoDrawing();
  refs.equipmentDrawButton.classList.toggle("is-unaffordable", state.gold < cost && !pending);
  refs.equipmentDrawButton.classList.toggle("has-pending", Boolean(pending));
  refs.autoDrawButton.textContent = isAutoDrawing() ? "자동 중지" : "자동 뽑기";
  refs.autoDrawButton.disabled = Boolean(pending);
  refs.autoDrawButton.classList.toggle("is-running", isAutoDrawing());
  renderEquippedItems();
  renderEquipmentUpgrade();

  refs.equipmentChoice.classList.toggle("is-hidden", !pending);
  if (!pending) return;

  refs.equipmentIcon.textContent = pending.icon;
  refs.equipmentIcon.style.setProperty("--equipment-color", pending.gradeColor);
  refs.equipmentName.textContent = `${pending.grade} ${pending.name}`;
  refs.equipmentName.style.color = pending.gradeColor;
  refs.equipmentBonus.innerHTML = formatEquipmentBonus(pending, equipped);
}

function renderEquippedItems() {
  const equippedItems = getEquippedItems();
  const totalPower = equippedItems.reduce((sum, item) => sum + item.powerBonus, 0);
  const totalSkill = equippedItems.reduce((sum, item) => sum + item.skillBonus, 0);

  refs.equippedItemPanel.classList.toggle("is-empty", equippedItems.length === 0);
  refs.equippedItemPanel.classList.toggle("is-collapsed", !equipmentPanelExpanded);
  refs.equippedItemPanel.setAttribute("aria-expanded", String(equipmentPanelExpanded));
  refs.equippedItemStats.textContent = `공격력 +${totalPower} / 스킬 공격력 +${totalSkill}`;
  refs.equippedGradeBlocks.innerHTML = equipmentSlots
    .map((slot) => {
      const item = getEquippedItem(slot.id);
      const color = item ? item.gradeColor : "rgba(74, 43, 23, 0.28)";
      const label = item ? item.grade : "비어있음";
      return `<span class="equipped-grade-block" title="${slot.name}: ${label}" style="--equipment-color: ${color};"></span>`;
    })
    .join("");
  refs.equippedItemList.innerHTML = equipmentSlots
    .map((slot) => {
      const item = getEquippedItem(slot.id);
      if (!item) {
        return `
          <div class="equipped-tile is-empty">
            <span class="equipped-tile-image">${slot.name.slice(0, 1)}</span>
            <span class="equipped-tile-grade">비어있음</span>
            <strong>${slot.name}</strong>
          </div>
        `;
      }

      return `
        <div class="equipped-tile" style="--equipment-color: ${item.gradeColor}; --equipment-image: ${item.image ? `url('${item.image}')` : "none"};">
          <span class="equipped-tile-image">${item.image ? "" : item.icon}</span>
          <span class="equipped-tile-grade">${item.grade}</span>
          <strong>${item.name}</strong>
        </div>
      `;
    })
    .join("");
}

function renderEquipmentUpgrade() {
  const currentConfig = getEquipmentUpgradeConfig();
  const nextConfig = getNextEquipmentUpgradeConfig();
  const upgrading = isEquipmentUpgrading();

  refs.equipmentGradeText.textContent = `${currentConfig.label} · ${currentConfig.desc}`;
  refs.equipmentUpgradePanel.classList.toggle("is-upgrading", upgrading);

  if (upgrading) {
    refs.equipmentUpgradeTimer.textContent = `${getEquipmentUpgradeConfig(state.equipment.upgradingTo).label} 완료까지 ${formatTime(state.equipment.upgradeRemaining)}`;
  } else if (nextConfig) {
    refs.equipmentUpgradeTimer.textContent = `${nextConfig.label} 연구: 아이디어 ${nextConfig.nextCost} · ${formatTime(nextConfig.duration)}`;
  } else {
    refs.equipmentUpgradeTimer.textContent = "최대 연구 단계입니다.";
  }

  refs.equipmentUpgradeButton.textContent = upgrading ? "연구 진행 중" : nextConfig ? "등급 업그레이드" : "최대 단계";
  refs.equipmentUpgradeButton.disabled = upgrading || !nextConfig || state.idea < nextConfig.nextCost;
  refs.speedTicketButton.disabled = !upgrading || state.equipment.speedTickets <= 0;
  refs.speedTicketText.textContent = `보유 ${state.equipment.speedTickets}장 · 1장당 10분`;
}

function formatEquipmentBonus(item, equipped) {
  const slot = equipmentSlots.find((equipmentSlot) => equipmentSlot.id === item.slot);
  const currentPower = equipped ? equipped.powerBonus : 0;
  const currentSkill = equipped ? equipped.skillBonus : 0;
  const powerDiff = item.powerBonus - currentPower;
  const skillDiff = item.skillBonus - currentSkill;
  return `${slot ? slot.name : "장비"} · 공격력 <span class="stat-positive">+${item.powerBonus}</span> (${formatDiff(powerDiff)}) / 스킬 공격력 <span class="stat-positive">+${item.skillBonus}</span> (${formatDiff(skillDiff)})`;
}

function formatDiff(value) {
  if (value > 0) return `<span class="stat-positive">+${value}</span>`;
  if (value < 0) return `<span class="stat-negative">${value}</span>`;
  return `<span class="stat-neutral">0</span>`;
}

function updatePrimaryScene() {
  const isCompanyTab = activeTab === "tools";
  refs.battlefield.classList.toggle("is-hidden", isCompanyTab);
  refs.companyScene.classList.toggle("is-hidden", !isCompanyTab);
  refs.battleStatusItems.forEach((element) => element.classList.toggle("is-hidden", isCompanyTab));
  refs.companyStatusStrip.classList.toggle("is-hidden", !isCompanyTab);

  if (isCompanyTab) {
    const companyLevel = companyLevels[getCompanyLevelIndex()];
    setText(refs.companyLocationText, `회사 규모: ${companyLevel.name}`);
  } else {
    setText(refs.companyLocationText, "위치: 사무실 1층");
  }
}

function renderCompany() {
  const progress = getCompanyProgress();
  const levelNumber = progress.levelIndex + 1;
  const facilityCount = getFacilityInvestmentCount();
  const visualTier = Math.min(6, Math.floor(progress.levelIndex / 2) + 1);
  const visualKey = `${progress.levelIndex}:${getEmployeeCount()}:${facilityCount}`;

  setText(refs.companyLevelChip, `COMPANY Lv.${levelNumber}`);
  setText(refs.companySceneName, progress.current.name);
  setText(refs.companySceneDesc, progress.current.desc);
  setText(refs.companyEmployeeText, `${getEmployeeCount()}명`);
  setText(refs.companyFacilityText, `${facilityCount}회`);

  const companyValue = Math.floor(
    state.gold + state.idea * 5 + state.companyXp * 12 + getEmployeeCount() * 120 + facilityCount * 80
  );
  setText(refs.companyValueText, `${companyValue.toLocaleString("ko-KR")} 가치`);

  if (progress.next) {
    setText(refs.companySceneProgressText, `다음 성장까지 ${progress.requiredXp - progress.currentXp} EXP`);
  } else {
    setText(refs.companySceneProgressText, "최고 성장 단계 달성");
  }

  refs.companySceneProgressFill.style.width = `${progress.percent}%`;
  refs.companySceneProgressFill.parentElement.setAttribute("aria-valuenow", String(progress.percent));

  if (visualKey !== lastCompanyVisualKey) {
    const isFirstRender = !lastCompanyVisualKey;
    lastCompanyVisualKey = visualKey;
    refs.companyCampus.dataset.companyTier = String(visualTier);
    refs.companyBuilding.style.setProperty("--building-width", `${160 + visualTier * 20}px`);
    refs.companyBuilding.style.setProperty("--building-height", `${96 + visualTier * 6}px`);
    renderCompanyFloors(visualTier, progress.levelIndex);
    renderCompanyEmployees();

    if (!isFirstRender) {
      refs.companyBuilding.classList.remove("is-leveling-up");
      window.requestAnimationFrame(() => refs.companyBuilding.classList.add("is-leveling-up"));
      window.setTimeout(() => refs.companyBuilding.classList.remove("is-leveling-up"), 720);
    }
  }

}

function renderCompanyFloors(visualTier, levelIndex) {
  const floorCount = visualTier + 1;
  const windowCount = Math.min(4, 1 + Math.ceil(visualTier / 2));
  refs.companyFloors.style.setProperty("--floor-count", floorCount);
  refs.companyFloors.style.setProperty("--window-count", windowCount);
  refs.companyFloors.innerHTML = Array.from({ length: floorCount }, (_, floorIndex) => {
    const windows = Array.from({ length: windowCount }, (_, windowIndex) => {
      const lit = (floorIndex + windowIndex + levelIndex) % 3 !== 0;
      return `<span class="office-window${lit ? " is-lit" : ""}"></span>`;
    }).join("");
    return `<div class="building-floor">${windows}</div>`;
  }).join("");
}

function renderCompanyEmployees() {
  const colors = ["#315f78", "#b05b45", "#6a6fa6", "#3c7c58", "#c4893f", "#805b86"];
  const visibleEmployees = Math.min(12, getEmployeeCount());
  refs.employeeCrowd.innerHTML = Array.from({ length: visibleEmployees }, (_, index) => {
    return `<span class="scene-employee" style="--employee-color: ${colors[index % colors.length]}"></span>`;
  }).join("");
  refs.employeeCrowd.setAttribute("aria-label", `출근 중인 직원 ${getEmployeeCount()}명`);
}

function renderEnemies() {
  refs.enemyLayer.innerHTML = state.enemies
    .map((enemy) => {
      const hpPercent = Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100));
      return `
        <div class="enemy${enemy.isBoss ? " is-boss" : ""}" data-enemy-id="${enemy.id}" style="--enemy-x: ${enemy.x}%; --enemy-y: ${enemy.y}px;">
          <img src="assets/enemy.svg" alt="버그 몬스터" class="enemy-sprite" />
          <div class="enemy-card">
            <strong>${enemy.name}</strong>
            <div class="hp-bar" aria-label="상대 체력">
              <span style="width: ${hpPercent}%"></span>
            </div>
            <small>${Math.ceil(enemy.hp)} / ${enemy.maxHp}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAllies() {
  const units = getUnits();
  const rosterKey = units.map((unit) => `${unit.id}:${unit.count}:${unit.power}`).join("|");
  if (rosterKey === lastRosterKey) return;

  lastRosterKey = rosterKey;
  refs.allyLayer.innerHTML = units
    .map((unit, index) => {
      const position = getAllyPosition(index);
      const countText = unit.count > 1 ? ` x${unit.count}` : "";
      const spriteMarkup = unit.sprites
        ? `<span class="ally-state-sprite" role="img" aria-label="${unit.name}" style="--idle-url: url('${unit.sprites.idle}'); --attack-url: url('${unit.sprites.attack}'); --skill-url: url('${unit.sprites.skill}')"></span>`
        : unit.spriteSheet
        ? `<span class="ally-sprite-sheet" role="img" aria-label="${unit.name}" style="--sprite-url: url('${unit.spriteSheet}')"></span>`
        : unit.sprite
        ? `<img src="${unit.sprite}" alt="${unit.name}" class="ally-sprite-image" />`
        : `<span class="ally-sprite">${unit.mark}</span>`;
      return `
        <div class="ally" data-unit-id="${unit.id}" style="--ally-x: ${position.x}%; --ally-y: ${position.y}px; --ally-color: ${unit.color};">
          ${spriteMarkup}
          <span class="ally-role">${rankLabel}${countText}</span>
        </div>
      `;
    })
    .join("");
}

function getAllyPosition(index) {
  const positions = [
    { x: 8, y: 82 },
    { x: 34, y: 34 },
    { x: 34, y: 134 },
    { x: 21, y: 34 },
    { x: 21, y: 134 },
  ];
  return positions[index] || { x: 16 + index * 5, y: 42 + (index % 3) * 46 };
}

function renderShop() {
  refs.recruitList.innerHTML = recruitCategories
    .map((category) => {
      const categoryItems = recruits.filter((recruit) => recruit.category === category);
      const itemsHtml = categoryItems.length
        ? categoryItems
            .map((recruit) => {
              const count = getRecruitCount(recruit.id);
              const cost = costFor(recruit.baseCost, count);
              const label = getRecruitRankLabel(recruit, count);
              return `
                <div class="shop-item">
                  <div>
                    <strong>${label} Lv.${count}</strong>
                    <span class="shop-meta">${recruit.desc} / 초당 +${recruit.dps}</span>
                  </div>
                  <button type="button" data-buy-recruit="${recruit.id}" ${state.gold < cost ? "disabled" : ""}>${cost} 자금</button>
                </div>
              `;
            })
            .join("")
        : `
            <div class="recruit-placeholder">
              <span>현재 영입 가능한 ${category} 항목이 없습니다.</span>
            </div>
          `;

      return `
        <div class="recruit-category">
          <div class="recruit-category__heading">${category}</div>
          <div class="recruit-category__list">${itemsHtml}</div>
        </div>
      `;
    })
    .join("");

  refs.toolList.innerHTML = tools
    .map((tool) => {
      const level = getToolLevel(tool.id);
      const cost = costFor(tool.baseCost, level);
      const growthXp = tool.growthXp + level * 2;
      return `
        <div class="facility-card">
          <span class="facility-icon">${tool.icon}</span>
          <div class="facility-copy">
            <strong>${tool.name} Lv.${level}</strong>
            <span>${tool.desc}</span>
          </div>
          <button type="button" data-buy-tool="${tool.id}" ${state.idea < cost ? "disabled" : ""}>
            ${cost} 아이디어 · 성장 +${growthXp}
          </button>
        </div>
      `;
    })
    .join("");

  renderSquadManagement();
}

function renderSquadManagement() {
  const positionNames = ["전열 A", "전열 B", "지원 A", "지원 B"];
  const deployedCounts = state.squad.reduce((counts, id) => {
    if (id) counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {});

  const leaderMarkup = `
    <div class="squad-leader">
      <span class="squad-avatar" style="--squad-color: #059669;">C</span>
      <div>
        <strong>대표</strong>
        <small>리더 · 고정 배치</small>
      </div>
    </div>
  `;

  const slotMarkup = state.squad
    .map((recruitId, slotIndex) => {
      const assigned = recruits.find((recruit) => recruit.id === recruitId);
      const options = recruits
        .map((recruit) => {
          const owned = getRecruitCount(recruit.id);
          const deployedElsewhere = state.squad.reduce(
            (count, id, index) => count + (index !== slotIndex && id === recruit.id ? 1 : 0),
            0
          );
          const unavailable = recruit.id !== recruitId && deployedElsewhere >= owned;
          return `<option value="${recruit.id}" ${recruit.id === recruitId ? "selected" : ""} ${
            unavailable ? "disabled" : ""
          }>${recruit.name} · 보유 ${owned}</option>`;
        })
        .join("");
      const color = assigned ? assigned.color : "#9a8b77";
      const mark = assigned ? assigned.mark : "+";

      return `
        <label class="squad-slot${assigned ? " is-filled" : ""}">
          <span class="squad-position">${positionNames[slotIndex]}</span>
          <span class="squad-slot-body">
            <span class="squad-avatar" style="--squad-color: ${color};">${mark}</span>
            <span>
              <strong>${assigned ? assigned.name : "빈 위치"}</strong>
              <small>${slotIndex + 1}번 배치 슬롯</small>
            </span>
          </span>
          <select data-squad-slot="${slotIndex}" aria-label="${positionNames[slotIndex]} 동료 선택">
            <option value="" ${assigned ? "" : "selected"}>비워두기</option>
            ${options}
          </select>
        </label>
      `;
    })
    .join("");

  refs.squadFormation.innerHTML = leaderMarkup + slotMarkup;
  refs.squadRoster.innerHTML = recruits
    .map((recruit) => {
      const owned = getRecruitCount(recruit.id);
      const deployed = deployedCounts[recruit.id] || 0;
      return `
        <div class="squad-roster-item${owned ? "" : " is-unowned"}">
          <span class="squad-avatar" style="--squad-color: ${recruit.color};">${recruit.mark}</span>
          <div>
            <strong>${recruit.name}</strong>
            <small>보유 ${owned} · 배치 ${deployed}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function log(message) {
  if (refs && refs.battleLog) refs.battleLog.textContent = message;
}

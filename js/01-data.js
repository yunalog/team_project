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
const NORMAL_MONSTER_IMAGES = [
  "Resource/Monster/Normal_Monster/Field_Monster1.png",
  "Resource/Monster/Normal_Monster/Field_Monster2.png",
  "Resource/Monster/Normal_Monster/Field_Monster3.png",
  "Resource/Monster/Normal_Monster/Field_Monster4.png",
  "Resource/Monster/Normal_Monster/Field_Monster5.png",
  "Resource/Monster/Normal_Monster/Field_Monster6.png",
];
const BOSS_MONSTER_IMAGES = [
  "Resource/Monster/Boss_Monster/Stage1_Boss.png",
  "Resource/Monster/Boss_Monster/Stage2_Boss.png",
  "Resource/Monster/Boss_Monster/Stage3_Boss.png",
  "Resource/Monster/Boss_Monster/Stage4_Boss.png",
];
const BGM_TRACKS = {
  title: "Resource/Sound/BGM_Main_Theme.mp3",
  field: "Resource/Sound/BGM_Field.mp3",
  boss: "Resource/Sound/BGM_Boss.mp3",
  tycoon: "Resource/Sound/BGM_Tycoon.mp3",
};
const defaultAudioSettings = {
  volume: 0.45,
  muted: false,
};
const SQUAD_MEMBER_LIMIT = 3; // 대표 1명 + 동료 3명 = 업무 스쿼드 최대 4명

const recruits = [
  {
    id: "planner",
    name: "기획자",
    shortName: "기획",
    mark: "P",
    color: "#f59e0b",
    desc: "요구사항을 정리하고 팀 전투력을 강화합니다.",
    category: "기획직군",
    baseCost: 25,
    dps: 1,
    attackType: "plan",
    baseStats: { attackPower: 1, skillPower: 1, attackInterval: 2, criticalChance: 0 },
    skill: {
      type: "teamBuff",
      name: "전략 회의",
      cooldown: 10,
      duration: 5,
      attackPower: 0.2,
      skillDamage: 0.2,
      desc: "5초 동안 전체 동료 공격력과 스킬 피해량 20% 증가",
    },
    sprites: {
      idle: "Anim/Player_CP/CP_Idle.png",
      attack: "Anim/Player_CP/CP_Atk.png",
      skill: "Anim/Player_CP/CP_Skill.png",
    },
  },
  {
    id: "developer",
    name: "개발자",
    shortName: "개발",
    mark: "D",
    color: "#2563eb",
    desc: "높은 기본 공격력으로 핵심 기능을 빠르게 구현합니다.",
    category: "개발직군",
    baseCost: 55,
    dps: 5,
    attackType: "code",
    baseStats: { attackPower: 5, skillPower: 1, attackInterval: 1.5, criticalChance: 0 },
    skill: {
      type: "selfBuff",
      name: "집중 코딩",
      cooldown: 7,
      duration: 4,
      attackSpeed: 0.3,
      desc: "4초 동안 자신의 공격속도 30% 증가",
    },
    sprites: {
      idle: "Anim/Player_DG/DG_Idle.png",
      attack: "Anim/Player_DG/DG_ATK.png",
      skill: "Anim/Player_DG/DG_Skill.png",
    },
  },
  {
    id: "artist",
    name: "일러스트레이터",
    shortName: "아트",
    mark: "A",
    color: "#ec4899",
    desc: "스킬 피해량이 높고 광역 공격에 강합니다.",
    category: "아트직군",
    baseCost: 90,
    dps: 1,
    attackType: "slash",
    baseStats: { attackPower: 1, skillPower: 10, attackInterval: 2, criticalChance: 0 },
    skill: {
      type: "skillAoeDamage",
      name: "컬러 스플래시",
      cooldown: 5,
      radius: 18,
      multiplier: 1,
      desc: "스킬 피해량에 비례한 광역 데미지",
    },
    sprites: {
      idle: "Anim/Player_ART/ART_Idle.png",
      attack: "Anim/Player_ART/ART_Atk.png",
      skill: "Anim/Player_ART/ART_Skill.png",
    },
  },
  {
    id: "business",
    name: "사업 운영자",
    shortName: "사업",
    mark: "B",
    color: "#f97316",
    desc: "라이브 운영 노하우로 전체 동료를 강화합니다.",
    category: "사업/운영직군",
    baseCost: 80,
    dps: 1,
    attackType: "plan",
    baseStats: { attackPower: 1, skillPower: 1, attackInterval: 1.5, criticalChance: 0 },
    skill: {
      type: "teamBuff",
      name: "라이브 운영 지원",
      cooldown: 10,
      duration: 5,
      attackPower: 0.05,
      skillDamage: 0.05,
      attackSpeed: 0.1,
      criticalChance: 0.1,
      desc: "5초 동안 전체 동료 공격력 5%, 스킬 피해량 5%, 공격속도 10%, 치명타 확률 10% 증가",
    },
    sprites: {
      idle: "Anim/Player_BG/BG_Idle.png",
      attack: "Anim/Player_BG/BG_Atk.png",
      skill: "Anim/Player_BG/BG_Skill.png",
    },
  },
  {
    id: "qa",
    name: "QA",
    shortName: "QA",
    mark: "Q",
    color: "#7c3aed",
    desc: "검증으로 적이 받는 피해를 증가시킵니다.",
    category: "QA직군",
    baseCost: 140,
    dps: 1,
    attackType: "qa",
    baseStats: { attackPower: 1, skillPower: 1, attackInterval: 1.5, criticalChance: 0 },
    skill: {
      type: "enemyDebuff",
      name: "취약점 리포트",
      cooldown: 10,
      duration: 5,
      damageTaken: 0.1,
      desc: "5초 동안 모든 적이 아군에게 받는 피해 10% 증가",
    },
    sprites: {
      idle: "Anim/Player_QA/QA_Idle.png",
      attack: "Anim/Player_QA/QA_Atk.png",
      skill: "Anim/Player_QA/QA_Skill.png",
    },
  },
  {
    id: "sound",
    name: "사운드 디자이너",
    shortName: "사운드",
    mark: "S",
    color: "#0891b2",
    desc: "스킬 피해량을 기반으로 전체 아군을 회복합니다.",
    category: "사운드직군",
    baseCost: 170,
    dps: 1,
    attackType: "plan",
    baseStats: { attackPower: 1, skillPower: 3, attackInterval: 1.5, criticalChance: 0 },
    skill: {
      type: "teamHeal",
      name: "힐링 사운드",
      cooldown: 8,
      multiplier: 1,
      desc: "전체 아군에게 스킬 피해량에 비례하는 광역 힐",
    },
  },
  {
    id: "director",
    name: "연출가",
    shortName: "연출",
    mark: "M",
    color: "#db2777",
    desc: "기본 공격으로 여러 적을 동시에 타격합니다.",
    category: "연출직군",
    baseCost: 210,
    dps: 3,
    attackType: "slash",
    baseStats: { attackPower: 3, skillPower: 1, attackInterval: 2, criticalChance: 0 },
    basicTargets: 3,
    skill: {
      type: "selfBuff",
      name: "클라이맥스 연출",
      cooldown: 9,
      duration: 5,
      attackSpeed: 0.15,
      basicTargets: "all",
      desc: "5초 동안 공격속도 15% 증가, 기본공격이 모든 적을 타격",
    },
  },
  {
    id: "dataAnalyst",
    name: "데이터 분석가",
    shortName: "데이터",
    mark: "DA",
    color: "#16a34a",
    desc: "분석 결과로 본인을 제외한 동료 스킬 쿨타임을 초기화합니다.",
    category: "데이터 분석직군",
    baseCost: 260,
    dps: 1,
    attackType: "qa",
    baseStats: { attackPower: 1, skillPower: 1, attackInterval: 1.5, criticalChance: 0 },
    skill: {
      type: "resetAllyCooldowns",
      name: "쿨타임 분석",
      cooldown: 15,
      desc: "본인을 제외한 아군 동료 전체 스킬 쿨타임 초기화",
    },
  },
];

const recruitCategories = [
  "개발직군",
  "아트직군",
  "기획직군",
  "사업/운영직군",
  "QA직군",
  "사운드직군",
  "연출직군",
  "데이터 분석직군",
];

const recruitRankNames = {
  developer: [
    "코딩 뉴비",
    "주니어 개발자",
    "시니어 개발자",
    "테크 리드",
    "코드 마법사",
    "전설의 개발 CTO",
  ],
  artist: [
    "낙서장인",
    "컨셉 아티스트",
    "비주얼 메이커",
    "연출 마스터",
    "아트 디렉터",
    "전설의 신의 손",
  ],
  planner: [
    "기획 인턴",
    "주니어 기획자",
    "시스템 설계자",
    "메인 설계자",
    "디렉터",
    "전설의 갓 디렉터",
  ],
  business: [
    "민원 해결사",
    "이벤트 기획자",
    "운영 전문가",
    "라이브 PM",
    "사업 총괄자",
    "전설의 매출의 신",
  ],
  qa: [
    "버그 탐지기",
    "버그 사냥꾼",
    "QA 전문가",
    "디버깅 장인",
    "품질 수호자",
    "전설의 버그 슬레이어",
  ],
  sound: ["사운드 1", "사운드 2", "사운드 3", "사운드 4", "사운드 5", "사운드 6"],
  director: ["연출 1", "연출 2", "연출 3", "연출 4", "연출 5", "연출 6"],
  dataAnalyst: [
    "데이터 분석 1",
    "데이터 분석 2",
    "데이터 분석 3",
    "데이터 분석 4",
    "데이터 분석 5",
    "데이터 분석 6",
  ],
};

function getRecruitRankLabel(recruit, count) {
  const rankNames = recruitRankNames[recruit.id];
  if (!rankNames) return recruit.name;
  const tier = Math.min(5, Math.floor(count / 10));
  return rankNames[tier];
}


const squadSynergies = [
  {
    id: "coreDevTeam",
    name: "핵심 개발팀",
    requiredCategories: ["개발직군", "QA직군", "기획직군"],
    effects: { attackPower: 0.3, criticalChance: 0.2, normalDamage: 0.15 },
    effectText: "공격력 +30% · 치명타 확률 +20% · 일반 몬스터 피해 +15%",
  },
  {
    id: "visualProductionTeam",
    name: "비주얼 제작팀",
    requiredCategories: ["아트직군", "연출직군", "사운드직군"],
    effects: { skillDamage: 0.2, skillCooldownReduction: 0.1 },
    effectText: "스킬 피해량 +20% · 스킬 쿨타임 -10%",
  },
  {
    id: "liveService",
    name: "라이브 서비스",
    requiredCategories: ["사업/운영직군", "데이터 분석직군", "기획직군"],
    effects: { goldGain: 0.5 },
    effectText: "자금 획득률 +50%",
  },
  {
    id: "indieDevTeam",
    name: "인디 개발팀",
    requiredCategories: ["개발직군", "아트직군", "사운드직군"],
    effects: { attackSpeed: 0.3, skillCooldownReduction: 0.1 },
    effectText: "공격속도 +30% · 스킬 쿨타임 -10%",
  },
  {
    id: "hitMaker",
    name: "흥행 제조기",
    requiredCategories: ["사업/운영직군", "아트직군", "데이터 분석직군"],
    effects: { goldGain: 0.5 },
    effectText: "자금 획득률 +50%",
  },
  {
    id: "hotfixMaster",
    name: "핫픽스 마스터",
    requiredCategories: ["QA직군", "연출직군", "개발직군"],
    effects: { criticalChance: 0.1, bossDamage: 0.2, skillCooldownReduction: 0.1 },
    effectText: "치명타 확률 +10% · 보스 피해량 +20% · 스킬 쿨타임 -10%",
  },
];

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

const companyImageBasePath = "Resource/BackGround/Tycoon_Resource_1/Company_Img";

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
  { name: "신화", chance: 0.012, multiplier: 4.6, color: "#db2777" },
  { name: "고대", chance: 0.006, multiplier: 6.2, color: "#0891b2" },
  { name: "초월", chance: 0.003, multiplier: 8.5, color: "#4f46e5" },
  { name: "유일", chance: 0.001, multiplier: 12, color: "#facc15" },
];

const equipmentUpgradeConfigs = [
  { level: 1, label: "1단계", maxGrade: 1, nextCost: 20, duration: 0, desc: "일반/희귀 장비 등장" },
  { level: 2, label: "2단계", maxGrade: 2, nextCost: 45, duration: 180, desc: "영웅 장비 등장" },
  { level: 3, label: "3단계", maxGrade: 2, nextCost: 90, duration: 420, desc: "희귀 이상 확률 상승" },
  { level: 4, label: "4단계", maxGrade: 3, nextCost: 160, duration: 900, desc: "전설 장비 등장" },
  { level: 5, label: "5단계", maxGrade: 4, nextCost: 280, duration: 1800, desc: "신화 장비 등장" },
  { level: 6, label: "6단계", maxGrade: 4, nextCost: 450, duration: 3600, desc: "신화 확률 상승" },
  { level: 7, label: "7단계", maxGrade: 5, nextCost: 700, duration: 7200, desc: "고대 장비 등장" },
  { level: 8, label: "8단계", maxGrade: 6, nextCost: 1100, duration: 14400, desc: "초월 장비 등장" },
  { level: 9, label: "9단계", maxGrade: 7, nextCost: 0, duration: 0, desc: "유일 장비 등장" },
];

const enemyNames = ["작은 버그", "촉박한 마감", "스코프 증가", "서버 장애", "대형 프로젝트"];

const growthConfigs = {
  process: { label: "작업처리능력", baseCost: 18 },
  critical: { label: "실수 감소", baseCost: 20 },
  skill: { label: "새로운 아이디어", baseCost: 22 },
  speed: { label: "작업 속도", baseCost: 16 },
  hp: { label: "야근 버티기", baseCost: 24 },
};

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
  squad: Array(SQUAD_MEMBER_LIMIT).fill(null),
  squadConfigured: false,
  tools: {},
  growthLevels: {
    process: 0,
    critical: 0,
    skill: 0,
    speed: 0,
    hp: 0,
  },
  recruitBoosts: {},
  recruitPromotions: {},
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
let unitCombatTimers = {};
let combatEffects = { buffs: [], enemyDebuffs: [], teamHp: 100, teamMaxHp: 100 };
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
let activeRecruitDetailId = null;
let activeRecruitPromotionId = null;

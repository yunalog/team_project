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

  // 자동판매는 장비를 보관하지 않고 폐기만 하며 아이디어 환급을 지급하지 않습니다.
  log(`${item.grade} ${item.name}은 두 능력치가 모두 증가하지 않아 자동으로 버렸습니다.`);
  autoDrawTimer = window.setTimeout(runAutoDrawStep, 260);
  // 자동 뽑기 중에는 회사 탭의 스쿼드 선택 DOM을 다시 만들지 않습니다.
  renderBattle();
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
    grade: grade.name,
    gradeColor: grade.color,
    image: getEquipmentImageSrc(base.id, grade.name),
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

  const highGradeBoost = 1 + Math.max(0, gradeLevel - 2) * 0.18 + gradeIndex * 0.08;
  const lowGradePenalty = gradeIndex === 0 ? Math.max(0.38, 1 - (gradeLevel - 2) * 0.08) : 1;
  return Math.max(0.001, baseChance * highGradeBoost * lowGradePenalty);
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

function getPlayerUpgradeCost(level = state.playerLevel) {
  const completedLevels = Math.max(0, (Number(level) || 1) - 1);
  const earlyLevels = Math.min(completedLevels, 12);
  const lateLevels = Math.max(0, completedLevels - 12);
  return Math.max(1, Math.floor(18 * Math.pow(1.2, earlyLevels) * Math.pow(1.09, lateLevels) * PLAYER_UPGRADE_COST_RATE));
}

function getPlayerPower() {
  const levelBonus = Math.max(0, state.playerLevel - 1) * 0.22 * PLAYER_UPGRADE_STAT_RATE;
  const equipmentBonus = getEquippedItems().reduce((sum, item) => sum + item.powerBonus, 0);
  return roundStat(1 + levelBonus + equipmentBonus);
}

function getPlayerSkillPower() {
  const levelBonus = Math.max(0, state.playerLevel - 1) * 0.26 * PLAYER_UPGRADE_STAT_RATE;
  const equipmentBonus = getEquippedItems().reduce((sum, item) => sum + item.skillBonus, 0);
  return roundStat(1 + levelBonus + equipmentBonus);
}

function getManualPower() {
  const representativeBonus = Math.max(0, state.clickPower - 1) * 0.2 * PLAYER_UPGRADE_STAT_RATE;
  const processBonus = Math.max(0, (state.growthLevels?.process || 0)) * 0.5;
  return roundStat(1 + representativeBonus + processBonus);
}

function upgradePlayer() {
  const cost = getPlayerUpgradeCost();
  if (!canAffordGold(cost)) {
    log(`대표 역량 강화에는 자금 ${cost}이 필요합니다.`);
    renderBattle();
    return;
  }

  state.gold -= cost;
  state.playerLevel += 1;
  state.clickPower += 1;
  log("대표 역량이 조금 상승했습니다.");
  renderAll();
}

function canAffordGold(cost) {
  return Math.max(0, Number(state.gold) || 0) + Number.EPSILON >= Math.max(0, Number(cost) || 0);
}

function getGrowthValue(type) {
  const level = state.growthLevels?.[type] || 0;
  switch (type) {
    case "process":
      return 1 + level;
    case "critical":
      return `${(CRITICAL_CHANCE * 100 + 0.1 * level).toFixed(1)}%`;
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
  if (type === "skill" || type === "speed") return Number(value).toFixed(1);
  return value;
}

function getGrowthCost(type) {
  const base = growthConfigs[type]?.baseCost || 20;
  const level = state.growthLevels?.[type] || 0;
  return Math.floor(base * Math.pow(1.25, level));
}

function upgradeGrowth(type) {
  if (!growthConfigs[type]) return;
  const cost = getGrowthCost(type);
  if (state.gold < cost) return;
  state.gold -= cost;
  state.growthLevels[type] = (state.growthLevels[type] || 0) + 1;
  if (type === "process") state.clickPower += 1;
  log(`${growthConfigs[type].label} 강화 완료!`);
  renderAll();
}

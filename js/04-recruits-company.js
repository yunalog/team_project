function getRecruitCount(id) {
  return state.recruits[id] || 0;
}

function getRecruitBoostLevel(id) {
  return state.recruitBoosts?.[id] || 0;
}

function getRecruitBuyCost(recruit, count = getRecruitCount(recruit.id)) {
  return 1;
}

function getRecruitEnhancementCost(id) {
  return 1;
}

function getRecruitPromotionCount(id) {
  return state.recruitPromotions?.[id] || 0;
}

function getRecruitPromotionCost(recruit) {
  return 1;
}

function shouldShowRecruitPromotionButton(recruit, count = getRecruitCount(recruit.id)) {
  const milestoneIndex = [10, 20, 30, 40, 50].indexOf(count);
  if (milestoneIndex < 0) return false;
  return (state.recruitPromotions?.[recruit.id] || 0) <= milestoneIndex;
}

function getToolLevel(id) {
  return state.tools[id] || 0;
}

function getRecruitPower(recruit) {
  const toolBonus = tools
    .filter((tool) => tool.target === recruit.id)
    .reduce((bonus, tool) => bonus + getToolLevel(tool.id) * tool.dps, 0);
  return recruit.dps + toolBonus + getRecruitBoostLevel(recruit.id);
}

function renderRecruitDetailModal() {
  if (!refs.recruitDetailModal) return;

  if (!activeRecruitDetailId) {
    refs.recruitDetailModal.classList.add("is-hidden");
    return;
  }

  const recruit = recruits.find((item) => item.id === activeRecruitDetailId);
  if (!recruit) {
    closeRecruitDetail();
    return;
  }

  const boostLevel = getRecruitBoostLevel(recruit.id);
  const enhancementCost = getRecruitEnhancementCost(recruit.id);
  const currentCount = getRecruitCount(recruit.id);
  const skillText = recruit.skill?.type === "aoe"
    ? `${recruit.skill.name} · ${recruit.skill.radius}칸 범위 공격 / 배율 ${recruit.skill.multiplier.toFixed(2)}배`
    : recruit.skill?.type === "all"
    ? `${recruit.skill.name} · 전체 대상 공격 / 배율 ${recruit.skill.multiplier.toFixed(2)}배`
    : recruit.skill?.targets
    ? `${recruit.skill.name} · ${recruit.skill.targets}명 타깃 / 배율 ${recruit.skill.multiplier.toFixed(2)}배`
    : `${recruit.skill.name} · 단일 대상 / 배율 ${recruit.skill.multiplier.toFixed(2)}배`;

  refs.recruitDetailModal.classList.remove("is-hidden");
  refs.recruitDetailBadge.textContent = recruit.mark;
  refs.recruitDetailBadge.style.setProperty("--recruit-badge-color", recruit.color);
  refs.recruitDetailTitle.textContent = recruit.name;
  refs.recruitDetailCategory.textContent = `${recruit.category} · 보유 ${currentCount}명`;
  refs.recruitDetailDesc.textContent = recruit.desc;
  refs.recruitDetailLevel.textContent = `Lv.${currentCount}`;
  refs.recruitDetailDps.textContent = `${recruit.dps + boostLevel} / 초`;
  refs.recruitDetailBoost.textContent = `${boostLevel}단계`;
  refs.recruitDetailSkillName.textContent = recruit.skill?.name || "스킬 정보";
  refs.recruitDetailSkillText.textContent = skillText;
  refs.recruitDetailEnhanceButton.textContent = `추가 강화 (${enhancementCost} 자금)`;
  refs.recruitDetailEnhanceButton.disabled = state.gold < enhancementCost;
}

function openRecruitDetail(id) {
  const recruit = recruits.find((item) => item.id === id);
  if (!recruit) return;

  activeRecruitDetailId = recruit.id;
  renderRecruitDetailModal();
}

function closeRecruitDetail() {
  activeRecruitDetailId = null;
  renderRecruitDetailModal();
}

function renderRecruitPromotionModal() {
  if (!refs.recruitPromotionModal) return;

  if (!activeRecruitPromotionId) {
    refs.recruitPromotionModal.classList.add("is-hidden");
    return;
  }

  const recruit = recruits.find((item) => item.id === activeRecruitPromotionId);
  if (!recruit) {
    closeRecruitPromotion();
    return;
  }

  refs.recruitPromotionModal.classList.remove("is-hidden");
  refs.recruitPromotionAvatar.innerHTML = recruit.sprites?.idle
    ? `<img src="${recruit.sprites.idle}" alt="${recruit.name}" />`
    : `<span>${recruit.mark}</span>`;
  refs.recruitPromotionTitle.textContent = `${recruit.name} 승급`;
  refs.recruitPromotionDesc.textContent = `${recruit.category} 직군이 진화합니다. 승급 비용은 ${getRecruitPromotionCost(recruit)} 자금입니다.`;
  refs.recruitPromotionConfirmButton.disabled = state.gold < getRecruitPromotionCost(recruit);
}

function openRecruitPromotion(id) {
  const recruit = recruits.find((item) => item.id === id);
  if (!recruit) return;

  activeRecruitPromotionId = recruit.id;
  renderRecruitPromotionModal();
}

function closeRecruitPromotion() {
  activeRecruitPromotionId = null;
  renderRecruitPromotionModal();
}

function confirmRecruitPromotion() {
  if (!activeRecruitPromotionId) return;

  const recruit = recruits.find((item) => item.id === activeRecruitPromotionId);
  if (!recruit) return;

  const cost = getRecruitPromotionCost(recruit);
  if (state.gold < cost) {
    log(`${recruit.name} 승급에는 자금 ${cost}가 필요합니다.`);
    return;
  }

  state.gold -= cost;
  state.recruitPromotions[recruit.id] = (state.recruitPromotions[recruit.id] || 0) + 1;
  addCompanyXp(6);
  refs.recruitPromotionConfirmButton.disabled = true;
  log(`${recruit.name} 승급 완료! 진화 연출이 시작됩니다.`);

  window.setTimeout(() => {
    closeRecruitPromotion();
    renderAll();
  }, 1100);
}

function enhanceRecruitDetail() {
  if (!activeRecruitDetailId) return;

  const recruit = recruits.find((item) => item.id === activeRecruitDetailId);
  if (!recruit) return;

  const cost = getRecruitEnhancementCost(recruit.id);
  if (state.gold < cost) return;

  state.gold -= cost;
  state.recruitBoosts[recruit.id] = (state.recruitBoosts[recruit.id] || 0) + 1;
  addCompanyXp(2);
  log(`${recruit.name} 전문성이 강화되었습니다. 회사 성장 경험치 +2`);
  renderAll();
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

function getCompanyImageSrc(levelNumber) {
  const safeLevel = Math.max(1, Math.min(companyLevels.length, Number(levelNumber) || 1));
  return `${companyImageBasePath}/Tycoon_Lv${safeLevel}.png`;
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
  return `Resource/BackGround/Stage_Background/BG_${bgIndex}.png`;
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
  const cost = getRecruitBuyCost(recruit, count);
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

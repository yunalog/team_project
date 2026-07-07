
function getSquadRecruitEntries() {
  return (state.squad || [])
    .map((recruitId) => recruits.find((recruit) => recruit.id === recruitId))
    .filter(Boolean);
}

function getCategoryKey(category) {
  return String(category || "").replace(/\s+/g, "");
}

function getActiveSquadSynergy() {
  const squadMembers = getSquadRecruitEntries();
  if (squadMembers.length !== SQUAD_MEMBER_LIMIT) return null;

  const currentCategories = squadMembers.map((recruit) => getCategoryKey(recruit.category)).sort();
  return (
    squadSynergies.find((synergy) => {
      const requiredCategories = synergy.requiredCategories.map(getCategoryKey).sort();
      return (
        requiredCategories.length === currentCategories.length &&
        requiredCategories.every((category, index) => category === currentCategories[index])
      );
    }) || null
  );
}

function getSquadSynergyBonuses() {
  const synergy = getActiveSquadSynergy();
  return synergy ? synergy.effects : {};
}

function getSquadSynergyValue(key) {
  return Number(getSquadSynergyBonuses()[key]) || 0;
}

function getSquadAttackPowerMultiplier() {
  return 1 + getSquadSynergyValue("attackPower");
}

function getSquadSkillDamageMultiplier() {
  return 1 + getSquadSynergyValue("skillDamage");
}

function getSquadGoldGainMultiplier() {
  return 1 + getSquadSynergyValue("goldGain");
}

function getCompanyBrandBonuses(levelIndex = getCompanyLevelIndex()) {
  return companyLevels[levelIndex]?.brandBonus || {};
}

function getCompanyBrandBonusValue(key) {
  return Number(getCompanyBrandBonuses()[key]) || 0;
}

function getCompanyBrandBonusText() {
  const goldPercent = Math.round(getCompanyBrandBonusValue("goldGain") * 100);
  const ideaPercent = Math.round(getCompanyBrandBonusValue("ideaGain") * 100);
  return `자금 +${goldPercent}%\n아이디어 +${ideaPercent}%`;
}

function getCompanyRewardAmount(baseAmount, resource, additionalMultiplier = 1) {
  const amount = Math.max(0, Number(baseAmount) || 0);
  if (amount <= 0) return 0;

  const adjustedAmount = Math.floor(amount * Math.max(1, Number(additionalMultiplier) || 1));
  const bonusRate = getCompanyBrandBonusValue(`${resource}Gain`) + (resource === "idea" ? IDEA_GAIN_BONUS_RATE : 0);
  if (!state.companyRewardRemainders) state.companyRewardRemainders = { gold: 0, idea: 0 };

  const carriedBonus = Math.max(0, Number(state.companyRewardRemainders[resource]) || 0);
  const accumulatedBonus = adjustedAmount * bonusRate + carriedBonus;
  const bonusAmount = Math.floor(accumulatedBonus + 0.0000001);
  state.companyRewardRemainders[resource] = accumulatedBonus - bonusAmount;
  return adjustedAmount + bonusAmount;
}

function getSquadAttackInterval() {
  return BASIC_ATTACK_RATE / (1 + getSquadSynergyValue("attackSpeed"));
}

function getSquadSkillInterval() {
  const reduction = Math.min(0.8, getSquadSynergyValue("skillCooldownReduction"));
  return SKILL_ATTACK_RATE * (1 - reduction);
}

function getRecruitCount(id) {
  return state.recruits[id] || 0;
}

function getRecruitBoostLevel(id) {
  return state.recruitBoosts?.[id] || 0;
}

function isRecruitUnlocked() {
  return state.chapter >= RECRUIT_UNLOCK_CHAPTER;
}

function getRecruitBuyCost(recruit, count = getRecruitCount(recruit.id)) {
  const baseCost = Math.max(1, Number(recruit?.baseCost) || 25);
  const firstHireCost = Math.round(baseCost * 5);
  if (count <= 0) return Math.max(1, Math.round(firstHireCost * RECRUIT_HIRE_COST_RATE));

  const earlyLevels = Math.min(count, 10);
  const lateLevels = Math.max(0, count - 10);
  const earlyCost = firstHireCost * Math.pow(1.18, earlyLevels);
  const softenedLateCost = earlyCost * Math.pow(1.08, lateLevels);
  return Math.max(1, Math.round((softenedLateCost + lateLevels * baseCost * 0.6) * RECRUIT_HIRE_COST_RATE));
}

function getRecruitEnhancementCost(id) {
  const recruit = recruits.find((item) => item.id === id);
  const baseCost = Math.max(1, Number(recruit?.baseCost) || 25);
  const boostLevel = getRecruitBoostLevel(id);
  const earlyLevels = Math.min(boostLevel, 8);
  const lateLevels = Math.max(0, boostLevel - 8);
  return Math.max(1, Math.round(baseCost * 2.2 * Math.pow(1.24, earlyLevels) * Math.pow(1.1, lateLevels) * RECRUIT_LEVEL_UP_COST_RATE));
}

function getRecruitPromotionCount(id) {
  return state.recruitPromotions?.[id] || 0;
}

function getRecruitPromotionCost(recruit) {
  const baseCost = Math.max(1, Number(recruit?.baseCost) || 25);
  const promotionCount = getRecruitPromotionCount(recruit?.id);
  return Math.round(baseCost * 10 * Math.pow(1.2, promotionCount));
}

function shouldShowRecruitPromotionButton(recruit, count = getRecruitCount(recruit.id)) {
  const milestoneIndex = [10, 20, 30, 40, 50].indexOf(count);
  if (milestoneIndex < 0) return false;
  return (state.recruitPromotions?.[recruit.id] || 0) <= milestoneIndex;
}

function getToolLevel(id) {
  return state.tools[id] || 0;
}

function getRecruitLevel(id) {
  return Math.max(0, getRecruitCount(id));
}

function getRecruitPromotionTierByCount(count) {
  return Math.max(0, Math.floor((Number(count) || 0) / 10));
}

function getRecruitPromotionTier(recruit) {
  const achievedTier = Math.min(5, getRecruitPromotionTierByCount(getRecruitLevel(recruit.id)));
  const promotedTier = Math.min(5, getRecruitPromotionCount(recruit.id));
  return Math.min(achievedTier, promotedTier);
}

function hasRecruitSkillPowerStat(recruit) {
  return recruit.id === "artist" || recruit.id === "sound";
}

function getRecruitBattleStats(recruit) {
  const level = Math.max(1, getRecruitLevel(recruit.id));
  const promotionTier = getRecruitPromotionTier(recruit);
  const base = recruit.baseStats || {
    attackPower: recruit.dps || 1,
    attackInterval: BASIC_ATTACK_RATE,
    criticalChance: 0,
  };
  const levelBonus = Math.max(0, level - 1);
  const toolBonus = tools
    .filter((tool) => tool.target === recruit.id)
    .reduce((bonus, tool) => bonus + getToolLevel(tool.id) * tool.dps, 0);
  const boostBonus = getRecruitBoostLevel(recruit.id) * RECRUIT_LEVEL_UP_STAT_RATE;
  const attackPower = base.attackPower + levelBonus * 0.07 + promotionTier * 0.85 + toolBonus + boostBonus * 0.65;
  const skillPower = hasRecruitSkillPowerStat(recruit)
    ? (base.skillPower || base.attackPower || 1) + levelBonus * 0.09 + promotionTier * 1.05 + boostBonus * 0.45
    : 0;
  const attackInterval = Math.max(
    0.35,
    (base.attackInterval || BASIC_ATTACK_RATE) * (1 - Math.min(0.22, promotionTier * 0.012 + levelBonus * 0.0007))
  );
  const criticalChance = Math.min(0.55, (base.criticalChance || 0) + levelBonus * 0.0007 + promotionTier * 0.008);
  return {
    attackPower: roundStat(attackPower),
    skillPower: roundStat(skillPower),
    attackInterval: roundStat(attackInterval, 100),
    criticalChance: roundStat(criticalChance, 10000),
    basicTargets: recruit.basicTargets || 1,
  };
}

function getRecruitPower(recruit) {
  return getRecruitBattleStats(recruit).attackPower;
}

function formatRecruitStatLine(recruit) {
  const stats = getRecruitBattleStats(recruit);
  const parts = [
    `공격 ${stats.attackPower.toFixed(1)}`,
    `속도 ${stats.attackInterval.toFixed(2)}초`,
    `치명 ${(stats.criticalChance * 100).toFixed(1)}%`,
  ];
  if (hasRecruitSkillPowerStat(recruit)) {
    parts.splice(1, 0, `스킬 ${stats.skillPower.toFixed(1)}`);
  }
  return parts.join(" · ");
}

function getRecruitSkillText(recruit) {
  const skill = recruit.skill || {};
  return skill.desc || skill.name || "스킬 정보 없음";
}


function getRecruitSpriteSrc(recruit) {
  return recruit?.sprites?.idle || recruit?.sprite || "";
}

function getRecruitAvatarMarkup(recruit, className = "recruit-card-avatar") {
  const sprite = getRecruitSpriteSrc(recruit);
  if (sprite) {
    return `<span class="${className} has-character" role="img" aria-label="${recruit.name}" style="--recruit-image: url('${sprite}'); --recruit-color: ${recruit.color};"></span>`;
  }
  return `<span class="${className}" style="--recruit-color: ${recruit.color};">${recruit.mark}</span>`;
}

function formatRecruitStatRows(recruit) {
  const stats = getRecruitBattleStats(recruit);
  const rows = [
    ["기본 공격력", stats.attackPower.toFixed(1)],
    ["공격속도", `${stats.attackInterval.toFixed(2)}초`],
    ["치명타확률", `${(stats.criticalChance * 100).toFixed(1)}%`],
  ];
  if (hasRecruitSkillPowerStat(recruit)) rows.push(["스킬피해량", stats.skillPower.toFixed(1)]);
  return rows
    .map(([label, value]) => `<span><b>${label}</b><strong>${value}</strong></span>`)
    .join("");
}

function selectRecruitForGrowth(id) {
  const recruit = recruits.find((item) => item.id === id);
  if (!recruit) return;
  activeRecruitPanelId = recruit.id;
  renderShop();
}

function getSelectedRecruitForGrowth() {
  return recruits.find((recruit) => recruit.id === activeRecruitPanelId) || recruits[0] || null;
}

function renderRecruitGrowthPanel() {
  if (!refs.recruitGrowthPanel) return;
  if (!isRecruitUnlocked()) {
    refs.recruitGrowthPanel.innerHTML = `
      <div class="recruit-focus-empty">
        <strong>${RECRUIT_UNLOCK_CHAPTER}스테이지에서 해금</strong>
        <p>초반에는 대표 성장과 장비 뽑기로 전투 흐름을 익히고, 2스테이지부터 팀을 확장합니다.</p>
      </div>
    `;
    return;
  }

  const recruit = getSelectedRecruitForGrowth();
  if (!recruit) {
    refs.recruitGrowthPanel.innerHTML = `
      <div class="recruit-focus-empty">
        <strong>직군을 선택하세요</strong>
        <p>왼쪽 영입 카드에서 직군을 클릭하면 상세 성장 정보가 표시됩니다.</p>
      </div>
    `;
    return;
  }

  if (!activeRecruitPanelId) activeRecruitPanelId = recruit.id;
  const count = getRecruitCount(recruit.id);
  const rankLabel = getRecruitRankLabel(recruit, count);
  const cost = getRecruitBuyCost(recruit, count);
  const promotionReady = shouldShowRecruitPromotionButton(recruit, count);
  const promotionCost = getRecruitPromotionCost(recruit);
  const actionDataset = promotionReady ? `data-recruit-promote="${recruit.id}"` : `data-buy-recruit="${recruit.id}"`;
  const actionClass = promotionReady ? "shop-promote-button recruit-focus-action" : "recruit-focus-action";
  const actionDisabled = promotionReady ? state.gold < promotionCost : state.gold < cost;
  const actionCost = promotionReady ? promotionCost : cost;
  const buttonText = promotionReady ? `승급 💵 ${promotionCost}` : count <= 0 ? `동료 획득 💵 ${cost}` : `레벨업 💵 ${cost}`;

  refs.recruitGrowthPanel.innerHTML = `
    <div class="recruit-focus-card" style="--recruit-color: ${recruit.color};">
      <div class="recruit-focus-portrait">
        ${getRecruitAvatarMarkup(recruit, "recruit-focus-avatar")}
      </div>
      <div class="recruit-focus-copy">
        <span class="recruit-focus-role">${recruit.category}</span>
        <strong>${rankLabel} Lv.${count}</strong>
        <p>${recruit.desc}</p>
        <div class="recruit-focus-skill">
          <b>${recruit.skill?.name || "스킬"}</b>
          <span>${getRecruitSkillText(recruit)}</span>
        </div>
      </div>
      <button class="${actionClass}${actionDisabled ? " is-unaffordable" : ""}" type="button" ${actionDataset} data-action-cost="${actionCost}" aria-disabled="${String(actionDisabled)}" ${actionDisabled ? "disabled" : ""}>${buttonText}</button>
    </div>
  `;
}

function refreshRecruitGrowthActionState() {
  if (!refs.recruitGrowthPanel) return;
  const recruit = getSelectedRecruitForGrowth();
  const button = refs.recruitGrowthPanel.querySelector(".recruit-focus-action");
  if (!recruit || !button) return;

  const count = getRecruitCount(recruit.id);
  const promotionReady = shouldShowRecruitPromotionButton(recruit, count);
  const cost = promotionReady ? getRecruitPromotionCost(recruit) : getRecruitBuyCost(recruit, count);
  const isUnaffordable = state.gold < cost;

  button.disabled = isUnaffordable;
  button.classList.toggle("is-unaffordable", isUnaffordable);
  button.setAttribute("aria-disabled", String(isUnaffordable));
  button.dataset.actionCost = String(cost);
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
  const skillText = getRecruitSkillText(recruit);

  refs.recruitDetailModal.classList.remove("is-hidden");
  refs.recruitDetailBadge.textContent = recruit.mark;
  refs.recruitDetailBadge.style.setProperty("--recruit-badge-color", recruit.color);
  refs.recruitDetailTitle.textContent = recruit.name;
  refs.recruitDetailCategory.textContent = `${recruit.category} · 보유 ${currentCount}명`;
  refs.recruitDetailDesc.textContent = recruit.desc;
  refs.recruitDetailLevel.textContent = `Lv.${currentCount}`;
  refs.recruitDetailDps.textContent = formatRecruitStatLine(recruit);
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

function getRecruitPromotionPreview(recruit) {
  const rankNames = recruitRankNames[recruit.id] || [recruit.name];
  const count = getRecruitCount(recruit.id);
  const currentPromotionTier = Math.min(5, Number(state.recruitPromotions?.[recruit.id]) || 0);
  const nextPromotionTier = Math.min(5, currentPromotionTier + 1);
  const achievedTier = Math.min(5, getRecruitPromotionTierByCount(count));
  const currentTier = Math.min(achievedTier, currentPromotionTier);
  const targetTier = Math.min(achievedTier, nextPromotionTier);

  return {
    beforeRank: rankNames[currentTier] || recruit.name,
    afterRank: rankNames[targetTier] || rankNames[currentTier] || recruit.name,
    targetTier,
  };
}

function renderRecruitPromotionModal() {
  if (!refs.recruitPromotionModal) return;

  if (!activeRecruitPromotionId) {
    refs.recruitPromotionModal.classList.add("is-hidden");
    refs.recruitPromotionModal.classList.remove("is-ready", "is-evolving", "is-complete");
    return;
  }

  const recruit = recruits.find((item) => item.id === activeRecruitPromotionId);
  if (!recruit) {
    closeRecruitPromotion();
    return;
  }

  const isComplete = Boolean(activeRecruitPromotionResult?.complete);
  const preview = activeRecruitPromotionResult || getRecruitPromotionPreview(recruit);
  const promotionCost = getRecruitPromotionCost(recruit);

  refs.recruitPromotionModal.classList.remove("is-hidden");
  refs.recruitPromotionModal.classList.toggle("is-ready", !isComplete);
  refs.recruitPromotionModal.classList.toggle("is-evolving", isComplete);
  refs.recruitPromotionModal.classList.toggle("is-complete", isComplete);

  refs.recruitPromotionAvatar.innerHTML = recruit.sprites?.idle
    ? `<span class="recruit-evolution-aura" aria-hidden="true"></span><img src="${recruit.sprites.idle}" alt="${recruit.name}" />`
    : `<span class="recruit-evolution-aura" aria-hidden="true"></span><span>${recruit.mark}</span>`;

  refs.recruitPromotionTitle.textContent = isComplete ? "승급 완료!" : `${recruit.name} 승급`;
  refs.recruitPromotionDesc.innerHTML = isComplete
    ? `<strong class="recruit-evolution-message">'${preview.beforeRank}'이 '${preview.afterRank}'로 승급했습니다!</strong>`
    : `${recruit.category} 직군이 진화합니다.<br />승급 후 <b>${preview.beforeRank}</b>에서 <b>${preview.afterRank}</b>로 변경됩니다.<br />승급 비용은 ${promotionCost} 자금입니다.`;

  refs.recruitPromotionConfirmButton.textContent = isComplete ? "확인" : "승급 진행";
  refs.recruitPromotionConfirmButton.disabled = !isComplete && state.gold < promotionCost;
}

function openRecruitPromotion(id) {
  const recruit = recruits.find((item) => item.id === id);
  if (!recruit) return;

  activeRecruitPromotionId = recruit.id;
  activeRecruitPromotionResult = null;
  renderRecruitPromotionModal();
}

function closeRecruitPromotion() {
  activeRecruitPromotionId = null;
  activeRecruitPromotionResult = null;
  renderRecruitPromotionModal();
  renderAll();
}

function confirmRecruitPromotion() {
  if (!activeRecruitPromotionId) return;

  if (activeRecruitPromotionResult?.complete) {
    closeRecruitPromotion();
    return;
  }

  const recruit = recruits.find((item) => item.id === activeRecruitPromotionId);
  if (!recruit) return;

  const cost = getRecruitPromotionCost(recruit);
  if (state.gold < cost) {
    log(`${recruit.name} 승급에는 자금 ${cost}가 필요합니다.`);
    renderRecruitPromotionModal();
    return;
  }

  const preview = getRecruitPromotionPreview(recruit);

  state.gold -= cost;
  activeRecruitPanelId = recruit.id;
  state.recruitPromotions[recruit.id] = (state.recruitPromotions[recruit.id] || 0) + 1;
  addCompanyXp(6);

  activeRecruitPromotionResult = {
    ...preview,
    complete: true,
  };

  log(`${preview.beforeRank}이 ${preview.afterRank}로 승급했습니다!`);
  renderAll();
}

function enhanceRecruitDetail() {
  if (!activeRecruitDetailId) return;

  const recruit = recruits.find((item) => item.id === activeRecruitDetailId);
  if (!recruit) return;

  const cost = getRecruitEnhancementCost(recruit.id);
  if (state.gold < cost) return;

  state.gold -= cost;
  state.recruitBoosts[recruit.id] = (state.recruitBoosts[recruit.id] || 0) + 1;
  log(`${recruit.name} 전문성이 강화되었습니다.`);
  renderAll();
}

function getGlobalMultiplier() {
  return tools.reduce((sum, tool) => sum + (tool.multiplier || 0) * getToolLevel(tool.id), 1);
}

function getTotalDps() {
  const squadPower = getUnits().reduce((sum, unit) => {
    const interval = typeof getUnitAttackInterval === "function" ? getUnitAttackInterval(unit) : BASIC_ATTACK_RATE;
    return sum + unit.power / Math.max(0.35, interval);
  }, 0);
  return Math.max(1, Math.round(squadPower * getGlobalMultiplier()));
}

function getTeamCount() {
  return getUnits().length;
}

function getEmployeeCount() {
  const acquiredRoleCount = recruits.filter((recruit) => getRecruitCount(recruit.id) > 0).length;
  return 1 + acquiredRoleCount;
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
  const recruitBoostCount = Object.values(nextState.recruitBoosts || {}).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  const recruitPromotionCount = Object.values(nextState.recruitPromotions || {}).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  return Math.max(0, recruitCount * 4 + facilityCount * 6 + recruitBoostCount * 2 + recruitPromotionCount * 6);
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
  if (!isRecruitUnlocked()) {
    log(`동료 영입은 ${RECRUIT_UNLOCK_CHAPTER}스테이지 진입 후 해금됩니다.`);
    return;
  }

  const recruit = recruits.find((item) => item.id === id);
  const count = getRecruitCount(id);
  const cost = getRecruitBuyCost(recruit, count);
  if (state.gold < cost) return;

  state.gold -= cost;
  state.recruits[id] = count + 1;
  activeRecruitPanelId = id;
  addCompanyXp(4);
  basicAttackCooldown = Math.min(basicAttackCooldown, 0.2);
  const rankLabel = getRecruitRankLabel(recruit, count + 1);
  log(`${rankLabel} 영입 완료. 회사 EXP +4`);
  renderAll();
}

function buyTool(id) {
  if (typeof isRecruitCompanyUnlocked === "function" && !isRecruitCompanyUnlocked()) {
    log("회사 성장은 2스테이지부터 사용할 수 있습니다.");
    return;
  }

  const tool = tools.find((item) => item.id === id);
  const level = getToolLevel(id);
  const cost = costFor(tool.baseCost, level);
  if (state.idea < cost) return;

  state.idea -= cost;
  state.tools[id] = level + 1;
  addCompanyXp(tool.growthXp + level * 2);
  if (tool.click) state.clickPower += tool.click;
  log(`${tool.name} 확장 완료. 회사 EXP +${tool.growthXp + level * 2}`);
  renderAll();
}

function getEquipmentDrawCost() {
  return EQUIPMENT_DRAW_COST;
}

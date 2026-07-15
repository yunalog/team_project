function spawnWave() {
  const options = arguments[0] || {};
  state.stage = state.chapter;
  state.enemies = state.battleMode === "boss" ? createBossWave() : createNormalWave();
  state.enemyMaxHp = state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0);
  state.enemyHp = state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
  state.enemyX = ENEMY_SPAWN_X;
  isSpawningNext = false;
  basicAttackCooldown = 0.35;
  skillAttackCooldown = getSquadSkillInterval();
  unitCombatTimers = {};
  combatEffects.enemyDebuffs = [];
  monsterCastingUntil = {};
  skillAttackCooldown = SKILL_ATTACK_RATE;
  monsterAttackCooldown = Math.min(1.05, MONSTER_ATTACK_RATE);
  syncUnitHealth();
  if (state.battleMode === "boss" || options.fullyRecover === true) {
    fullyRecoverUnits();
  }
  if (hasStartedGame) playBgm(getActiveBgmKey());
  log(`${getProgressLabel()} ${state.battleMode === "boss" ? "보스" : "업무"}가 오른쪽에서 접근합니다.`);
}

function fullyRecoverUnits() {
  getUnits().forEach((unit) => {
    state.unitHp[unit.id] = getUnitMaxHp(unit);
  });
}

function createNormalWave() {
  const count = getWaveEnemyCount();
  const hp = getEnemyHp();
  return Array.from({ length: count }, (_, index) => {
    const enemy = {
      id: `enemy-${Date.now()}-${enemySeq++}`,
      name: getEnemyName(),
      hp,
      maxHp: hp,
      x: ENEMY_SPAWN_X + index * 4,
      y: getEnemyLaneY(index),
      lane: index,
      isBoss: false,
      hasEngaged: false,
    };
    const monsterIndex = getNormalMonsterIndex(enemy);
    return {
      ...enemy,
      monsterIndex,
      attackType: getMonsterAttackType({ ...enemy, monsterIndex }),
      image: getMonsterImage({ ...enemy, monsterIndex }),
      skillImage: getMonsterSkillImage({ ...enemy, monsterIndex }),
      effectImage: getMonsterEffectImage({ ...enemy, monsterIndex }),
    };
  });
}

function createBossWave() {
  const hp = getBossHp();
  const bossIndex = getBossMonsterIndex();
  const bossSeed = { isBoss: true, bossIndex, lane: 0 };
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
      hasEngaged: false,
      bossIndex,
      image: getMonsterImage(bossSeed),
      skillImage: getMonsterSkillImage(bossSeed),
      effectImage: getMonsterEffectImage(bossSeed),
      attackType: getMonsterAttackType(bossSeed),
    },
  ];
}

function getNormalMonsterIndex(enemy) {
  return (state.chapter + state.subStage + Number(enemy.lane || 0) - 2) % NORMAL_MONSTER_IMAGES.length;
}

function getBossMonsterIndex(enemy = {}) {
  if (Number.isInteger(enemy.bossIndex)) {
    return ((enemy.bossIndex % BOSS_MONSTER_IMAGES.length) + BOSS_MONSTER_IMAGES.length) % BOSS_MONSTER_IMAGES.length;
  }

  return (state.chapter - 1) % BOSS_MONSTER_IMAGES.length;
}

function getMonsterImage(enemy) {
  if (enemy.isBoss) {
    return BOSS_MONSTER_IMAGES[getBossMonsterIndex(enemy)];
  }

  const index = Number.isInteger(enemy.monsterIndex) ? enemy.monsterIndex : getNormalMonsterIndex(enemy);
  return NORMAL_MONSTER_IMAGES[index];
}

function getMonsterSkillImage(enemy) {
  if (enemy.isBoss) {
    return BOSS_MONSTER_SKILL_IMAGES[getBossMonsterIndex(enemy)];
  }

  const index = Number.isInteger(enemy.monsterIndex) ? enemy.monsterIndex : getNormalMonsterIndex(enemy);
  return NORMAL_MONSTER_SKILL_IMAGES[index];
}

function getMonsterEffectImage(enemy) {
  if (enemy.isBoss) {
    return BOSS_MONSTER_EFFECT_IMAGES[getBossMonsterIndex(enemy)];
  }

  const index = Number.isInteger(enemy.monsterIndex) ? enemy.monsterIndex : getNormalMonsterIndex(enemy);
  return NORMAL_MONSTER_EFFECT_IMAGES[index];
}

function getMonsterAttackType(enemy) {
  if (enemy.isBoss) return BOSS_MONSTER_ATTACK_TYPES[getBossMonsterIndex(enemy)] || "melee";
  const index = Number.isInteger(enemy.monsterIndex) ? enemy.monsterIndex : getNormalMonsterIndex(enemy);
  return NORMAL_MONSTER_ATTACK_TYPES[index] || "melee";
}

function getMonsterAttackRange(enemy) {
  return getMonsterAttackType(enemy) === "ranged" ? MONSTER_RANGED_ATTACK_RANGE : MONSTER_ATTACK_RANGE;
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
    const stopX = getMonsterAttackType(enemy) === "ranged" ? getMonsterAttackRange(enemy) : ENEMY_CONTACT_X;
    enemy.x = Math.max(stopX, enemy.x - speed * delta);
  });

  syncEnemySummary();
}

function updateUnitHealth(delta = 0) {
  const units = getUnits();
  syncUnitHealth(units);
}

function syncUnitHealth(units = getUnits()) {
  if (!state.unitHp || typeof state.unitHp !== "object") state.unitHp = {};
  if (!state.unitMaxHp || typeof state.unitMaxHp !== "object") state.unitMaxHp = {};

  const activeIds = new Set(units.map((unit) => unit.id));
  Object.keys(state.unitHp).forEach((unitId) => {
    if (!activeIds.has(unitId)) delete state.unitHp[unitId];
  });
  Object.keys(state.unitMaxHp).forEach((unitId) => {
    if (!activeIds.has(unitId)) delete state.unitMaxHp[unitId];
  });

  units.forEach((unit) => {
    const maxHp = getUnitMaxHp(unit);
    const savedHp = Number(state.unitHp[unit.id]);
    state.unitMaxHp[unit.id] = maxHp;
    state.unitHp[unit.id] = Number.isFinite(savedHp) ? Math.min(maxHp, Math.max(0, savedHp)) : maxHp;
  });
}

function syncManualWorkCharge() {
  const currentChapter = Math.max(1, Number(state.chapter) || 1);
  if (state.manualWorkChapter === currentChapter) return false;

  state.manualWorkChapter = currentChapter;
  state.manualWorkUses = 0;
  return true;
}

function getManualWorkRemaining() {
  syncManualWorkCharge();
  return Math.max(0, MANUAL_WORK_MAX_COUNT - Math.min(MANUAL_WORK_MAX_COUNT, Math.max(0, Number(state.manualWorkUses) || 0)));
}

function useManualWork() {
  syncManualWorkCharge();

  if (isSpawningNext || !getTargetEnemy()) {
    log("처리할 업무가 아직 도착하지 않았습니다.");
    return;
  }

  if (getManualWorkRemaining() <= 0) {
    log(`${state.chapter}스테이지 직접처리 횟수를 모두 사용했습니다.`);
    renderBattle();
    return;
  }

  const unit = getPlayerUnit(getManualPower());
  if (!isUnitAlive(unit.id)) {
    log("대표가 회복될 때까지 직접처리를 사용할 수 없습니다.");
    return;
  }

  state.manualWorkUses = Math.min(MANUAL_WORK_MAX_COUNT, Math.max(0, Number(state.manualWorkUses) || 0) + 1);
  attackUnit(unit, { manual: true });
  renderBattle();
}

function triggerManualWorkRechargeEffect() {
  if (!refs.manualWorkButton) return;

  refs.manualWorkButton.classList.remove("is-recharged");
  window.requestAnimationFrame(() => refs.manualWorkButton.classList.add("is-recharged"));
  window.setTimeout(() => refs.manualWorkButton.classList.remove("is-recharged"), 1100);
}

function updateMonsterAttacks(delta) {
  if (isSpawningNext || !state.enemies.length) return;

  const attackers = state.enemies
    .filter((enemy) => enemy.hasEngaged || enemy.x <= getMonsterAttackRange(enemy))
    .sort((a, b) => a.x - b.x || a.y - b.y);
  if (!attackers.length) {
    monsterAttackCooldown = Math.min(monsterAttackCooldown, MONSTER_ATTACK_RATE);
    return;
  }

  monsterAttackCooldown -= delta;
  if (monsterAttackCooldown > 0) return;

  attackers.forEach((attacker, index) => {
    window.setTimeout(() => performMonsterAttack(attacker, attackers.length), index * 160);
  });

  const slowestRate = attackers.some((enemy) => enemy.isBoss) ? MONSTER_ATTACK_RATE + 0.55 : MONSTER_ATTACK_RATE;
  monsterAttackCooldown += slowestRate;
}

function performMonsterAttack(attacker, attackerCount = 1) {
  if (isSpawningNext || !state.enemies.some((enemy) => enemy.id === attacker.id)) return;

  const target = getMonsterAttackTarget();
  if (!target) {
    handlePartyDown();
    return;
  }

  const extraPressure = Math.max(0, attackerCount - 1);
  const damage = getMonsterAttackDamage(attacker, target, extraPressure);
  const attackDelay = playMonsterSkillEffect(attacker, target);
  scheduleMonsterAttackDamage(attacker, target, damage, attackDelay);
}

function scheduleMonsterAttackDamage(attacker, target, damage, attackDelay) {
  const hitCount = getMonsterAttackHitCount(attacker);
  if (hitCount <= 1) {
    window.setTimeout(() => applyMonsterAttackDamage(attacker, target, damage), attackDelay);
    return;
  }

  const hitDamages = splitDamageIntoHits(damage, hitCount);
  const firstHitDelay = Math.max(120, attackDelay - 80);
  const hitInterval = attacker.isBoss ? 120 : 95;
  hitDamages.forEach((hitDamage, index) => {
    window.setTimeout(() => applyMonsterAttackDamage(attacker, target, hitDamage), firstHitDelay + index * hitInterval);
  });
}

function getMonsterAttackHitCount(attacker) {
  if (!attacker.isBoss || getMonsterAttackType(attacker) !== "melee") return 1;

  const bossIndex = getBossMonsterIndex(attacker);
  if (bossIndex === 0) return 4;
  if (bossIndex === 1) return 3;
  return 1;
}

function splitDamageIntoHits(totalDamage, hitCount) {
  const safeTotal = Math.max(1, Math.round(totalDamage));
  const safeHitCount = Math.max(1, hitCount);
  const baseDamage = Math.floor(safeTotal / safeHitCount);
  let remainder = safeTotal % safeHitCount;

  return Array.from({ length: safeHitCount }, () => {
    const bonus = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - 1);
    return Math.max(1, baseDamage + bonus);
  });
}

function applyMonsterAttackDamage(attacker, target, damage) {
  if (isSpawningNext || !isUnitAlive(target.id)) return;

  state.unitHp[target.id] = Math.max(0, getUnitHp(target.id) - damage);
  showUnitDamage(damage, target, attacker);
  pulseUnit(target.id, "is-damaged", 220);
  if (state.unitHp[target.id] <= 0) {
    log(`${target.shortName}이 잠시 전투에서 이탈했습니다.`);
    if (!getLivingUnits().length) handlePartyDown();
  } else {
    log(`${attacker.isBoss ? "보스" : "몬스터"}가 ${target.shortName}에게 ${damage} 피해를 줬습니다.`);
  }
}

function playMonsterSkillEffect(enemy, target) {
  const skillSpriteUrl = enemy.skillImage || getMonsterSkillImage(enemy);
  const effectSpriteUrl = enemy.effectImage || getMonsterEffectImage(enemy);
  if (!skillSpriteUrl && !effectSpriteUrl) return 260;

  const attackType = getMonsterAttackType(enemy);
  const ranged = attackType === "ranged";
  const targetPosition = target ? getUnitPosition(target.id) : null;
  const meleePosition = getMonsterMeleeAttackPosition(enemy, targetPosition);
  const castX = ranged ? enemy.x : meleePosition.x;
  const castY = ranged ? enemy.y + (enemy.isBoss ? 73 : 49) : meleePosition.y;
  const castDuration = ranged ? 660 : 620;

  monsterCastingUntil[enemy.id] = {
    until: Date.now() + castDuration + 120,
    type: ranged ? "ranged" : "melee",
  };

  const enemyElement = refs.enemyLayer.querySelector(`[data-enemy-id="${enemy.id}"]`);
  if (enemyElement) {
    enemyElement.classList.add("is-skill-casting");
    window.setTimeout(() => enemyElement.classList.remove("is-skill-casting"), castDuration + 120);
  }

  if (skillSpriteUrl) {
    const cast = document.createElement("span");
    cast.className = `monster-cast-sprite${enemy.isBoss ? " is-boss" : ""} ${ranged ? "is-ranged" : "is-melee"}`;
    cast.style.setProperty("--monster-cast-url", `url("${skillSpriteUrl}")`);
    cast.style.setProperty("--monster-cast-x", `${castX}%`);
    cast.style.setProperty("--monster-cast-y", `${castY}px`);
    cast.style.setProperty("--monster-cast-size", enemy.isBoss ? "146px" : "98px");
    cast.style.setProperty("--monster-cast-hp-width", enemy.isBoss ? "150px" : "100px");

    if (!ranged) {
      const hpBar = document.createElement("span");
      hpBar.className = "monster-cast-hp-bar";
      hpBar.setAttribute("aria-hidden", "true");

      const hpFill = document.createElement("span");
      hpFill.style.width = `${Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100))}%`;
      hpBar.appendChild(hpFill);
      cast.appendChild(hpBar);
    }

    refs.effectLayer.appendChild(cast);
    window.setTimeout(() => cast.remove(), castDuration + 80);
  }

  if (effectSpriteUrl) {
    const effectSize = enemy.isBoss ? (ranged ? "156px" : "176px") : ranged ? "88px" : "98px";
    const effectPosition = getMonsterSkillEffectPosition(enemy, ranged, targetPosition, meleePosition);
    const effect = document.createElement("span");
    effect.className = `monster-skill-effect${enemy.isBoss ? " is-boss" : ""} ${
      ranged ? "is-projectile" : "is-melee"
    }`;
    effect.style.setProperty("--monster-skill-url", `url("${effectSpriteUrl}")`);
    effect.style.setProperty("--monster-skill-from-x", `${enemy.x}%`);
    effect.style.setProperty("--monster-skill-from-y", `${enemy.y + (enemy.isBoss ? 70 : 56)}px`);
    effect.style.setProperty("--monster-skill-to-x", `${targetPosition ? targetPosition.x : Math.max(18, enemy.x - 22)}%`);
    effect.style.setProperty("--monster-skill-to-y", `${targetPosition ? targetPosition.y + 70 : enemy.y + 56}px`);
    effect.style.setProperty("--monster-skill-x", `${effectPosition.x}%`);
    effect.style.setProperty("--monster-skill-y", `${effectPosition.y}px`);
    effect.style.setProperty("--monster-skill-size", effectSize);
    refs.effectLayer.appendChild(effect);
    window.setTimeout(() => effect.remove(), ranged ? 760 : 660);
  }

  return ranged ? 520 : 300;
}

function getMonsterSkillEffectPosition(enemy, ranged, targetPosition, meleePosition) {
  if (ranged) {
    return { x: enemy.x, y: enemy.y + (enemy.isBoss ? 68 : 54) };
  }

  const isStage2Boss = enemy.isBoss && getBossMonsterIndex(enemy) === 1;
  if (isStage2Boss && targetPosition) {
    return { x: targetPosition.x, y: targetPosition.y + 62 };
  }

  return { x: meleePosition.hitX, y: meleePosition.hitY };
}

function getMonsterMeleeAttackPosition(enemy, targetPosition) {
  const fallbackX = Math.max(18, enemy.x - 16);
  const fallbackY = enemy.y + (enemy.isBoss ? 73 : 49);
  if (!targetPosition) {
    return { x: fallbackX, y: fallbackY, hitX: fallbackX - 3, hitY: fallbackY + 6 };
  }

  const bodyOffset = enemy.isBoss ? 13 : 9;
  const y = targetPosition.y + (enemy.isBoss ? 72 : 52);
  return {
    x: Math.min(82, targetPosition.x + bodyOffset),
    y,
    hitX: Math.min(82, targetPosition.x + Math.max(4, bodyOffset - 3)),
    hitY: y + (enemy.isBoss ? 4 : 2),
  };
}

function getMonsterAttackTarget() {
  const livingUnits = getLivingUnits();
  if (!livingUnits.length) return null;
  return livingUnits
    .map((unit) => ({ unit, position: getUnitPosition(unit.id) }))
    .sort((a, b) => b.position.x - a.position.x || a.position.y - b.position.y)[0].unit;
}

function getMonsterAttackDamage(enemy, unit, extraPressure = 0) {
  const maxHp = getUnitMaxHp(unit);
  const base = enemy.isBoss ? 4 + state.chapter * 0.55 : 1.5 + state.chapter * 0.22 + state.subStage * 0.14;
  const capRatio = enemy.isBoss ? 0.085 : 0.045;
  return Math.max(1, Math.min(Math.ceil(maxHp * capRatio), Math.ceil(base + extraPressure * 0.65)));
}

function getUnitMaxHp(unit) {
  const hpGrowth = getGrowthValue("hp");
  if (unit.id === "player") return Math.floor(115 + state.playerLevel * 8 + hpGrowth * 6);

  const recruitCount = unit.recruitId ? getRecruitCount(unit.recruitId) : 1;
  const boost = unit.recruitId ? getRecruitBoostLevel(unit.recruitId) : 0;
  return Math.floor(72 + recruitCount * 3 + boost * 5 + hpGrowth * 3 + Math.max(0, unit.power - 1) * 1.2);
}

function getUnitHp(unitId) {
  return Math.max(0, Number(state.unitHp?.[unitId]) || 0);
}

function isUnitAlive(unitId) {
  return getUnitHp(unitId) > 0;
}

function getLivingUnits() {
  const units = getUnits();
  syncUnitHealth(units);
  return units.filter((unit) => isUnitAlive(unit.id));
}

function handlePartyDown() {
  if (isSpawningNext) return;

  if (state.battleMode === "boss") {
    failBossBattle();
    return;
  }

  syncUnitHealth();
  getUnits().forEach((unit) => {
    state.unitHp[unit.id] = Math.ceil(getUnitMaxHp(unit) * 0.48);
  });
  state.enemies.forEach((enemy) => {
    enemy.x = Math.min(ENEMY_SPAWN_X + enemy.lane * 3, enemy.x + 18);
  });
  monsterAttackCooldown = MONSTER_ATTACK_RATE + 1.4;
  log("팀이 잠깐 재정비했습니다. 모두 체력을 일부 회복하고 몬스터를 밀어냅니다.");
  syncEnemySummary();
}
function updateAutoCombat(delta) {
  if (isSpawningNext || !state.enemies.length) return;

  updateCombatEffects(delta);
  const units = getUnits();
  syncUnitCombatTimers(units);
  let nextBasic = Infinity;
  let nextSkill = Infinity;

  units.forEach((unit, index) => {
    const timer = unitCombatTimers[unit.id];
    timer.attack = Math.max(0, timer.attack - delta);
    timer.skill = Math.max(0, timer.skill - delta);

    if (timer.attack <= 0) {
      timer.attack += getUnitAttackInterval(unit);
      window.setTimeout(() => attackUnit(unit, { skill: false }), index * 90);
    }

    if (unit.skill && timer.skill <= 0) {
      timer.skill += getUnitSkillCooldown(unit);
      window.setTimeout(() => attackUnit(unit, { skill: true }), index * 120);
    }

    nextBasic = Math.min(nextBasic, timer.attack);
    nextSkill = unit.skill ? Math.min(nextSkill, timer.skill) : nextSkill;
  });

  basicAttackCooldown = Number.isFinite(nextBasic) ? nextBasic : 0;
  skillAttackCooldown = Number.isFinite(nextSkill) ? nextSkill : 0;
}

function updateCombatEffects(delta) {
  combatEffects.buffs = (combatEffects.buffs || []).filter((effect) => {
    effect.remaining -= delta;
    return effect.remaining > 0;
  });
  combatEffects.enemyDebuffs = (combatEffects.enemyDebuffs || []).filter((effect) => {
    effect.remaining -= delta;
    return effect.remaining > 0;
  });
}

function syncUnitCombatTimers(units) {
  const activeIds = new Set(units.map((unit) => unit.id));
  Object.keys(unitCombatTimers).forEach((id) => {
    if (!activeIds.has(id)) delete unitCombatTimers[id];
  });
  units.forEach((unit) => {
    if (!unitCombatTimers[unit.id]) {
      unitCombatTimers[unit.id] = {
        attack: Math.min(0.35, getUnitAttackInterval(unit)),
        skill: getUnitSkillCooldown(unit),
      };
    }
  });
}

function performAttackRound(skill) {
  getLivingUnits().forEach((unit, index) => {
    window.setTimeout(() => attackUnit(unit, { skill }), index * 120);
  });
}

function attackUnit(unit, options = {}) {
  const target = getTargetEnemy();
  if (isSpawningNext || !target || !isUnitAlive(unit.id)) return;

  const skill = Boolean(options.skill);
  const manual = Boolean(options.manual);
  const from = getUnitPosition(unit.id);

  if (skill && unit.skill) {
    castSkill(unit, from);
    return;
  }

  const targets = getBasicAttackTargets(unit);
  targets.forEach((enemy, index) => {
    if (unit.attackType === "slash") {
      playSlash(unit, enemy, false);
      window.setTimeout(() => damageEnemy(enemy.id, unit.power, manual, unit), 120 + index * 35);
    } else {
      playProjectile(unit, from, enemy, false);
      window.setTimeout(() => damageEnemy(enemy.id, unit.power, manual, unit), 210 + index * 35);
    }
  });
}

function castSkill(unit, from) {
  if (isSpawningNext) return;

  pulseUnit(unit.id, "is-skill", 520);
  const skill = unit.skill || {};

  if (skill.type === "selfBuff") {
    combatEffects.buffs.push({
      targetId: unit.id,
      remaining: skill.duration || 0,
      attackSpeed: skill.attackSpeed || 0,
      attackPower: skill.attackPower || 0,
      skillDamage: skill.skillDamage || 0,
      criticalChance: skill.criticalChance || 0,
      basicTargets: skill.basicTargets || null,
    });
    playSkillEffect(unit, getSkillTargets({ type: "self", targets: 1 }));
    log(`${unit.shortName} 스킬: ${skill.name}`);
    return;
  }

  if (skill.type === "teamBuff") {
    combatEffects.buffs.push({
      targetId: "all",
      remaining: skill.duration || 0,
      attackSpeed: skill.attackSpeed || 0,
      attackPower: skill.attackPower || 0,
      skillDamage: skill.skillDamage || 0,
      criticalChance: skill.criticalChance || 0,
    });
    playSkillEffect(unit, getSkillTargets({ type: "all" }));
    log(`${unit.shortName} 스킬: ${skill.name}`);
    return;
  }

  if (skill.type === "enemyDebuff") {
    combatEffects.enemyDebuffs.push({
      remaining: skill.duration || 0,
      damageTaken: skill.damageTaken || 0,
    });
    playSkillEffect(unit, [...state.enemies]);
    log(`${unit.shortName} 스킬: ${skill.name}`);
    return;
  }

  if (skill.type === "teamHeal") {
    const heal = Math.max(1, Math.round(unit.skillPower * (skill.multiplier || 1)));
    combatEffects.teamHp = Math.min(combatEffects.teamMaxHp || 100, (combatEffects.teamHp || 100) + heal);
    playSkillEffect(unit, getSkillTargets({ type: "all" }));
    log(`${unit.shortName} 스킬: ${skill.name} · 아군 회복 +${heal}`);
    return;
  }

  if (skill.type === "resetAllyCooldowns") {
    Object.entries(unitCombatTimers).forEach(([unitId, timer]) => {
      if (unitId !== unit.id && unitId !== "player") timer.skill = 0;
    });
    playSkillEffect(unit, getSkillTargets({ type: "all" }));
    log(`${unit.shortName} 스킬: ${skill.name}`);
    return;
  }

  const targets = getSkillTargets(skill);
  if (!targets.length) return;
  playSkillEffect(unit, targets);

  targets.forEach((target, index) => {
    const damage = Math.ceil(unit.skillPower * (skill.multiplier || 1) * getUnitSkillDamageMultiplier(unit));
    window.setTimeout(() => damageEnemy(target.id, damage, false, unit), 120 + index * 70);
  });

  log(`${unit.shortName} 스킬: ${skill.name}`);
}

function getSkillTargets(skill) {
  const target = getTargetEnemy();
  if (!target) return [];

  if (skill.type === "all") return [...state.enemies];

  if (skill.type === "aoe" || skill.type === "skillAoeDamage") {
    return state.enemies.filter((enemy) => Math.abs(enemy.x - target.x) <= (skill.radius || 12));
  }

  if (skill.type === "chain" || skill.type === "cleave") {
    return [...state.enemies].sort((a, b) => a.x - b.x || a.y - b.y).slice(0, skill.targets);
  }

  return [target];
}

function playProjectile(unit, from, target, skill) {
  playAttackEffect(unit, target, { skill, from, motion: "projectile" });
  pulseUnit(unit.id, "is-attacking", 320);
}

function playSlash(unit, target, skill) {
  const stance = getMeleeStancePosition(target);
  const ally = refs.allyLayer.querySelector(`[data-unit-id="${unit.id}"]`);
  if (ally) {
    ally.style.setProperty("--slash-x", `${stance.x}%`);
    ally.style.setProperty("--slash-y", `${stance.y}px`);
    ally.classList.add("is-slashing");
    window.setTimeout(() => ally.classList.remove("is-slashing"), 300);
  }

  playAttackEffect(unit, target, { skill, motion: "melee" });
}

function playSkillEffect(unit, targets) {
  const melee = unit.attackType === "slash" || unit.skill?.type === "cleave";
  if (melee && targets.length) {
    const stance = getMeleeStancePosition(targets[0], { skill: true });
    const ally = refs.allyLayer.querySelector(`[data-unit-id="${unit.id}"]`);
    if (ally) {
      ally.style.setProperty("--slash-x", `${stance.x}%`);
      ally.style.setProperty("--slash-y", `${stance.y}px`);
      ally.classList.add("is-slashing");
      window.setTimeout(() => ally.classList.remove("is-slashing"), 420);
    }
  }

  targets.forEach((target, index) => {
    const from = getUnitPosition(unit.id);
    const motion = melee ? "melee" : "projectile";
    window.setTimeout(() => playAttackEffect(unit, target, { skill: true, from, motion }), index * 55);
  });
}

function playAttackEffect(unit, target, options = {}) {
  const skill = Boolean(options.skill);
  const melee = options.motion === "melee" || unit.attackType === "slash";
  const spriteUrl = getEffectSpriteUrl(unit, skill);
  if (!spriteUrl) return;

  const from = options.from || getUnitPosition(unit.id);
  const hitPosition = getEffectHitPosition(unit, target, { skill, melee });
  const effect = document.createElement("span");
  effect.className = `attack-sprite-effect${skill ? " is-skill" : " is-normal"} ${
    melee ? "is-melee" : "is-projectile"
  } is-${getEffectKey(unit)}`;
  effect.style.setProperty("--effect-url", `url("${spriteUrl}")`);
  effect.style.setProperty("--effect-from-x", `${melee ? hitPosition.x : from.x}%`);
  effect.style.setProperty("--effect-from-y", `${melee ? hitPosition.y : from.y + 64}px`);
  effect.style.setProperty("--effect-to-x", `${hitPosition.x}%`);
  effect.style.setProperty("--effect-to-y", `${hitPosition.y}px`);
  effect.style.setProperty("--effect-size", getEffectSize(target, { skill, melee }));
  refs.effectLayer.appendChild(effect);
  window.setTimeout(() => effect.remove(), getEffectDuration({ skill, melee }));
}

function getEffectHitPosition(unit, target, options = {}) {
  const melee = Boolean(options.melee);
  const skill = Boolean(options.skill);
  if (melee) {
    const stance = getMeleeStancePosition(target, { skill });
    return {
      x: Math.min(target.x - (target.isBoss ? 5 : 4), stance.x + (skill ? 7 : 6)),
      y: stance.y + (skill ? 58 : 50),
    };
  }

  const spriteCenterY = target.y + (target.isBoss ? 58 : 46);
  return {
    x: target.x,
    y: spriteCenterY + (skill ? 6 : 0),
  };
}

function getMeleeStancePosition(target, options = {}) {
  const skill = Boolean(options.skill);
  const distance = target.isBoss ? (skill ? 22 : 19) : skill ? 18 : 15;
  return {
    x: Math.max(18, target.x - distance),
    y: Math.max(22, target.y + (target.isBoss ? 4 : 0)),
  };
}

function getEffectSize(target, options = {}) {
  if (options.skill) return target.isBoss ? "152px" : "124px";
  if (options.melee) return target.isBoss ? "122px" : "98px";
  return target.isBoss ? "104px" : "82px";
}

function getEffectDuration(options = {}) {
  if (options.skill && !options.melee) return 660;
  if (options.skill) return 580;
  if (options.melee) return 440;
  return 520;
}

function getEffectSpriteUrl(unit, skill = false) {
  const key = getEffectKey(unit);
  const spriteSet = EFFECT_SPRITES[key] || EFFECT_SPRITES.player;
  return spriteSet[skill ? "skill" : "normal"];
}

function getEffectKey(unit) {
  if (unit.id === "player") return "player";
  if (unit.recruitId === "planner") return "planner";
  if (unit.recruitId === "business") return "business";
  if (unit.recruitId === "artist") return "artist";
  if (unit.recruitId === "qa") return "qa";
  return "player";
}

function damageEnemy(enemyId, amount, manual, sourceUnit = null) {
  if (isSpawningNext) return;

  const target = state.enemies.find((enemy) => enemy.id === enemyId) || getTargetEnemy();
  if (!target) return;

  const growthCriticalBonus = Math.min(0.3, (state.growthLevels?.critical || 0) * 0.001);
  const criticalBonus = getSquadSynergyValue("criticalChance") + getUnitBuffValue(sourceUnit?.id, "criticalChance");
  const unitCritical = sourceUnit ? sourceUnit.criticalChance : CRITICAL_CHANCE;
  const critical = Math.random() < Math.min(0.8, unitCritical + growthCriticalBonus + criticalBonus);
  const enemyTypeBonus = target.isBoss ? getSquadSynergyValue("bossDamage") : getSquadSynergyValue("normalDamage");
  const debuffBonus = getEnemyDebuffValue("damageTaken");
  const multiplier = getGlobalMultiplier() * (1 + enemyTypeBonus + debuffBonus) * (critical ? CRITICAL_MULTIPLIER : 1);
  const finalAmount = Math.max(1, roundStat(amount * multiplier));
  target.hp = Math.max(0, target.hp - finalAmount);
  engageAllMonsters();
  monsterAttackCooldown = Math.min(monsterAttackCooldown, getMonsterAttackType(target) === "ranged" ? 0.35 : 0.75);
  showDamage(finalAmount, target, { critical });
  pulseEnemy(target.id);

  if (target.hp <= 0) {
    defeatEnemy(target.id, manual);
  } else if (manual) {
    log(`직접 처리로 ${finalAmount} 기여도를 넣었습니다.`);
  }
  syncEnemySummary();
}

function engageAllMonsters() {
  state.enemies.forEach((enemy) => {
    enemy.hasEngaged = true;
  });
}

function isMonsterCasting(enemyId) {
  const castingState = monsterCastingUntil[enemyId];
  if (!castingState) return false;

  const castingUntil = typeof castingState === "number" ? castingState : castingState.until;
  if (Date.now() <= castingUntil) return true;

  delete monsterCastingUntil[enemyId];
  return false;
}

function getMonsterCastingType(enemyId) {
  if (!isMonsterCasting(enemyId)) return "";

  const castingState = monsterCastingUntil[enemyId];
  return typeof castingState === "object" ? castingState.type || "" : "";
}

function defeatEnemy(enemyId, manual) {
  delete monsterCastingUntil[enemyId];
  state.enemies = state.enemies.filter((enemy) => enemy.id !== enemyId);
  const baseGoldGain = 3 + state.chapter * 1.4 + state.subStage * 0.6;
  const goldGain = getCompanyRewardAmount(baseGoldGain, "gold", getSquadGoldGainMultiplier());
  const ideaGain = manual ? getCompanyRewardAmount(1, "idea") : 0;
  state.gold += goldGain;
  state.idea += ideaGain;
  state.clearCount += 1;

  // 자금 획득 직후 강화/뽑기 버튼의 활성화 상태가 바로 반영되도록 즉시 갱신합니다.
  if (typeof renderBattle === "function") renderBattle();

  if (!state.enemies.length) completeWave(manual);
}

function completeWave(manual) {
  if (isSpawningNext) return;

  isSpawningNext = true;
  const clearedBoss = state.battleMode === "boss";
  const baseBonusIdea = clearedBoss ? 8 + state.chapter * 2 : manual ? 1 : 2;
  const bonusIdea = getCompanyRewardAmount(baseBonusIdea, "idea");
  state.idea += bonusIdea;
  if (clearedBoss) {
    state.equipment = state.equipment || {};
    state.equipment.speedTickets = Math.min(SPEED_TICKET_MAX_COUNT, Math.max(0, Number(state.equipment.speedTickets) || 0) + 1);
  }
  log(clearedBoss ? `${state.chapter}스테이지 보스 클리어! 아이디어 +${bonusIdea}, 가속티켓 +1` : `${getProgressLabel()} 클리어!`);

  window.setTimeout(() => {
    advanceBattleLayer();
    spawnWave({ fullyRecover: clearedBoss });
    renderAll();
    // 새 스테이지 진입 시 해금 팝업을 확인합니다.
    if (typeof checkRecruitCompanyUnlockPopup === "function") checkRecruitCompanyUnlockPopup();
    if (typeof checkRecruitCompanyUnlockPopup === "function") checkRecruitCompanyUnlockPopup();
    if (typeof checkOfflineRewardUnlockPopup === "function") checkOfflineRewardUnlockPopup();
  }, 520);
}

function failBossBattle() {
  if (isSpawningNext) return;

  isSpawningNext = true;
  state.battleMode = "normal";
  state.subStage = NORMAL_STAGES_PER_CHAPTER;
  state.enemies = [];
  getUnits().forEach((unit) => {
    state.unitHp[unit.id] = Math.ceil(getUnitMaxHp(unit) * 0.48);
  });
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
    state.manualWorkChapter = state.chapter;
    state.manualWorkUses = 0;
    triggerManualWorkRechargeEffect();
  } else if (state.subStage >= NORMAL_STAGES_PER_CHAPTER) {
    state.battleMode = "boss";
  } else {
    state.subStage += 1;
  }
  state.stage = state.chapter;
  if (typeof checkRecruitCompanyUnlockPopup === "function") checkRecruitCompanyUnlockPopup();
  if (typeof checkOfflineRewardUnlockPopup === "function") checkOfflineRewardUnlockPopup();
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
  const burstX = Math.round((Math.random() - 0.5) * (critical ? 46 : 34));
  const apexY = Math.round(critical ? 52 + Math.random() * 24 : 34 + Math.random() * 20);
  const fallY = Math.round(critical ? 28 + Math.random() * 16 : 20 + Math.random() * 14);
  const tilt = Math.round((Math.random() - 0.5) * (critical ? 18 : 12));
  const damage = document.createElement("span");
  damage.className = `damage-number${critical ? " is-critical" : ""}`;
  damage.textContent = critical ? `CRIT ${amount}` : `-${amount}`;
  damage.style.setProperty("--hit-x", `${target.x}%`);
  damage.style.setProperty("--hit-y", `${target.y + 92}px`);
  damage.style.setProperty("--damage-x-pop", `${Math.round(burstX * 0.35)}px`);
  damage.style.setProperty("--damage-x-apex", `${burstX}px`);
  damage.style.setProperty("--damage-x-drop", `${Math.round(burstX * 1.14)}px`);
  damage.style.setProperty("--damage-x-end", `${Math.round(burstX * 1.24)}px`);
  damage.style.setProperty("--damage-y-pop", `${Math.round(apexY * -0.7)}px`);
  damage.style.setProperty("--damage-y-apex", `${apexY * -1}px`);
  damage.style.setProperty("--damage-y-drop", `${Math.round(fallY * 0.12)}px`);
  damage.style.setProperty("--damage-y-end", `${fallY}px`);
  damage.style.setProperty("--damage-tilt-start", `${Math.round(tilt * -0.5)}deg`);
  damage.style.setProperty("--damage-tilt-pop", `${tilt}deg`);
  damage.style.setProperty("--damage-tilt-apex", `${Math.round(tilt * 0.35)}deg`);
  damage.style.setProperty("--damage-tilt-drop", `${Math.round(tilt * -0.24)}deg`);
  damage.style.setProperty("--damage-tilt-end", `${Math.round(tilt * -0.55)}deg`);
  refs.effectLayer.appendChild(damage);
  if (critical) showCriticalBurst(target);
  window.setTimeout(() => damage.remove(), critical ? 1120 : 920);
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

function showUnitDamage(amount, unit, enemy) {
  const position = getUnitPosition(unit.id);
  const damage = document.createElement("span");
  damage.className = "damage-number is-unit-damage";
  damage.textContent = `-${amount}`;
  damage.style.setProperty("--hit-x", `${position.x}%`);
  damage.style.setProperty("--hit-y", `${position.y + 92}px`);
  damage.style.setProperty("--damage-x-pop", `${enemy.isBoss ? -10 : -6}px`);
  damage.style.setProperty("--damage-x-apex", `${enemy.isBoss ? -22 : -14}px`);
  damage.style.setProperty("--damage-x-drop", `${enemy.isBoss ? -16 : -10}px`);
  damage.style.setProperty("--damage-x-end", `${enemy.isBoss ? -26 : -18}px`);
  damage.style.setProperty("--damage-y-pop", "-22px");
  damage.style.setProperty("--damage-y-apex", "-38px");
  damage.style.setProperty("--damage-y-drop", "4px");
  damage.style.setProperty("--damage-y-end", "18px");
  damage.style.setProperty("--damage-tilt-start", "-4deg");
  damage.style.setProperty("--damage-tilt-pop", "7deg");
  damage.style.setProperty("--damage-tilt-apex", "-3deg");
  damage.style.setProperty("--damage-tilt-drop", "2deg");
  damage.style.setProperty("--damage-tilt-end", "-5deg");
  refs.effectLayer.appendChild(damage);
  window.setTimeout(() => damage.remove(), 920);
}

function showUnitHeal(amount, unit) {
  if (!refs.effectLayer) return;

  const position = getUnitPosition(unit.id);
  const heal = document.createElement("span");
  heal.className = "damage-number is-unit-heal";
  heal.textContent = `+${formatStatValue(amount)}`;
  heal.style.setProperty("--hit-x", `${position.x}%`);
  heal.style.setProperty("--hit-y", `${position.y + 112}px`);
  heal.style.setProperty("--damage-x-pop", "0px");
  heal.style.setProperty("--damage-x-apex", "0px");
  heal.style.setProperty("--damage-x-drop", "0px");
  heal.style.setProperty("--damage-x-end", "0px");
  heal.style.setProperty("--damage-y-pop", "-20px");
  heal.style.setProperty("--damage-y-apex", "-44px");
  heal.style.setProperty("--damage-y-drop", "-18px");
  heal.style.setProperty("--damage-y-end", "-8px");
  heal.style.setProperty("--damage-tilt-start", "0deg");
  heal.style.setProperty("--damage-tilt-pop", "-3deg");
  heal.style.setProperty("--damage-tilt-apex", "2deg");
  heal.style.setProperty("--damage-tilt-drop", "0deg");
  heal.style.setProperty("--damage-tilt-end", "0deg");
  refs.effectLayer.appendChild(heal);
  window.setTimeout(() => heal.remove(), 980);
}

function pulseUnit(unitId, className, duration) {
  const ally = refs.allyLayer.querySelector(`[data-unit-id="${unitId}"]`);
  if (!ally) return;
  ally.classList.add(className);
  window.setTimeout(() => ally.classList.remove(className), duration);
}

function getPlayerUnit(power = getPlayerPower()) {
  const baseStats = {
    attackPower: Math.max(1, power),
    skillPower: Math.max(1, getPlayerSkillPower()),
    attackInterval: 1.6,
    criticalChance: CRITICAL_CHANCE,
  };
  const unit = {
    id: "player",
    name: "대표",
    shortName: "대표",
    mark: "C",
    color: "#059669",
    spriteSheet: "Anim/Player_1/Motion.png",
    count: 1,
    attackType: "code",
    skill: { type: "skillAoeDamage", name: "핫픽스 배포", cooldown: 8, radius: 12, multiplier: 1.35 },
    ...baseStats,
  };
  return applyUnitDerivedStats(unit);
}

function getUnits() {
  const units = [getPlayerUnit()];
  state.squad.forEach((recruitId, slotIndex) => {
    const recruit = recruits.find((item) => item.id === recruitId);
    if (!recruit) return;

    const stats = getRecruitBattleStats(recruit);
    units.push(applyUnitDerivedStats({
      ...recruit,
      id: `squad-${slotIndex}-${recruit.id}`,
      recruitId: recruit.id,
      count: 1,
      ...stats,
    }));
  });
  return units;
}

function applyUnitDerivedStats(unit) {
  const attackPowerBuff = getUnitBuffValue(unit.id, "attackPower");
  const skillDamageBuff = getUnitBuffValue(unit.id, "skillDamage");
  const attackPower = unit.attackPower || unit.power || 1;
  const skillPower = unit.skillPower || attackPower;
  return {
    ...unit,
    power: Math.max(1, roundStat(attackPower * getSquadAttackPowerMultiplier() * (1 + attackPowerBuff))),
    skillPower: Math.max(1, roundStat(skillPower * getSquadSkillDamageMultiplier() * (1 + skillDamageBuff))),
  };
}

function getBasicAttackTargets(unit) {
  const target = getTargetEnemy();
  if (!target) return [];
  const buffTargetsAll = getUnitBuffValue(unit.id, "basicTargetsAll") > 0;
  if (unit.basicTargets === "all" || buffTargetsAll) return [...state.enemies];
  const count = Math.max(1, Number(unit.basicTargets) || 1);
  return [...state.enemies].sort((a, b) => a.x - b.x || a.y - b.y).slice(0, count);
}

function getUnitAttackInterval(unit) {
  const speedBonus = getSquadSynergyValue("attackSpeed") + getUnitBuffValue(unit.id, "attackSpeed");
  return Math.max(0.35, (unit.attackInterval || BASIC_ATTACK_RATE) / (1 + speedBonus));
}

function getUnitSkillCooldown(unit) {
  const baseCooldown = unit.skill?.cooldown || SKILL_ATTACK_RATE;
  const reduction = Math.min(0.8, getSquadSynergyValue("skillCooldownReduction"));
  return Math.max(0.5, baseCooldown * (1 - reduction));
}

function getUnitSkillDamageMultiplier(unit) {
  return 1 + getUnitBuffValue(unit.id, "skillDamage");
}

function getUnitBuffValue(unitId, key) {
  if (!unitId) return 0;
  return (combatEffects.buffs || []).reduce((sum, effect) => {
    const applies = effect.targetId === "all" || effect.targetId === unitId;
    if (!applies) return sum;
    if (key === "basicTargetsAll") return sum + (effect.basicTargets === "all" ? 1 : 0);
    return sum + (Number(effect[key]) || 0);
  }, 0);
}

function getEnemyDebuffValue(key) {
  return (combatEffects.enemyDebuffs || []).reduce((sum, effect) => sum + (Number(effect[key]) || 0), 0);
}

function getUnitPosition(unitId) {
  const units = getUnits();
  const index = Math.max(0, units.findIndex((unit) => unit.id === unitId));
  return getAllyPosition(index, units.length);
}

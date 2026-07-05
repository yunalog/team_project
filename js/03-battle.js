function spawnWave() {
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
  skillAttackCooldown = SKILL_ATTACK_RATE;
  monsterAttackCooldown = MONSTER_ATTACK_RATE;
  syncUnitHealth();
  recoverUnitsForNewWave();
  if (hasStartedGame) playBgm(getActiveBgmKey());
  log(`${getProgressLabel()} ${state.battleMode === "boss" ? "보스" : "업무"}가 오른쪽에서 접근합니다.`);
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
    };
    return {
      ...enemy,
      image: getMonsterImage(enemy),
    };
  });
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
      image: getMonsterImage({ isBoss: true }),
    },
  ];
}

function getMonsterImage(enemy) {
  if (enemy.isBoss) {
    return BOSS_MONSTER_IMAGES[(state.chapter - 1) % BOSS_MONSTER_IMAGES.length];
  }

  const index = (state.chapter + state.subStage + Number(enemy.lane || 0) - 2) % NORMAL_MONSTER_IMAGES.length;
  return NORMAL_MONSTER_IMAGES[index];
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
  });

  syncEnemySummary();
}

function updateUnitHealth(delta = 0) {
  const units = getUnits();
  syncUnitHealth(units);

  const pressured = state.enemies.some((enemy) => enemy.x <= MONSTER_ATTACK_RANGE);
  if (pressured || isSpawningNext) return;

  units.forEach((unit) => {
    const maxHp = getUnitMaxHp(unit);
    const currentHp = getUnitHp(unit.id);
    if (currentHp <= 0 || currentHp >= maxHp) return;
    state.unitHp[unit.id] = Math.min(maxHp, currentHp + UNIT_HP_RECOVERY_RATE * delta);
  });
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

function recoverUnitsForNewWave() {
  getUnits().forEach((unit) => {
    const maxHp = getUnitMaxHp(unit);
    const currentHp = getUnitHp(unit.id);
    const recoveryFloor = Math.ceil(maxHp * 0.56);
    const recoveryGain = Math.ceil(maxHp * 0.18);
    state.unitHp[unit.id] = currentHp <= 0 ? recoveryFloor : Math.min(maxHp, currentHp + recoveryGain);
  });
}

function updateMonsterAttacks(delta) {
  if (isSpawningNext || !state.enemies.length) return;

  const attackers = state.enemies
    .filter((enemy) => enemy.x <= MONSTER_ATTACK_RANGE)
    .sort((a, b) => a.x - b.x || a.y - b.y);
  if (!attackers.length) {
    monsterAttackCooldown = Math.min(monsterAttackCooldown, MONSTER_ATTACK_RATE);
    return;
  }

  monsterAttackCooldown -= delta;
  if (monsterAttackCooldown > 0) return;

  const attacker = attackers[0];
  const target = getMonsterAttackTarget();
  if (!target) {
    handlePartyDown();
    return;
  }

  const extraPressure = Math.max(0, attackers.length - 1);
  const damage = getMonsterAttackDamage(attacker, target, extraPressure);
  state.unitHp[target.id] = Math.max(0, getUnitHp(target.id) - damage);
  showUnitDamage(damage, target, attacker);
  pulseUnit(target.id, "is-damaged", 220);

  monsterAttackCooldown += attacker.isBoss ? MONSTER_ATTACK_RATE + 0.55 : MONSTER_ATTACK_RATE;

  if (state.unitHp[target.id] <= 0) {
    log(`${target.shortName}이 잠시 전투에서 이탈했습니다.`);
    if (!getLivingUnits().length) handlePartyDown();
  } else {
    log(`${attacker.isBoss ? "보스" : "몬스터"}가 ${target.shortName}에게 ${damage} 피해를 줬습니다.`);
  }
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
  const damage = unit.power;

  if (unit.attackType === "slash") {
    playSlash(unit, target, skill);
    window.setTimeout(() => damageEnemy(target.id, damage, manual), 140);
  } else {
    playProjectile(unit, from, target, skill);
    window.setTimeout(() => damageEnemy(target.id, damage, manual), 420);
  }
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

function damageEnemy(enemyId, amount, manual) {
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
  const goldGain = Math.floor((3 + state.chapter * 1.4 + state.subStage * 0.6) * getSquadGoldGainMultiplier());
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
    power: Math.max(1, Math.round(attackPower * getSquadAttackPowerMultiplier() * (1 + attackPowerBuff))),
    skillPower: Math.max(1, Math.round(skillPower * getSquadSkillDamageMultiplier() * (1 + skillDamageBuff))),
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

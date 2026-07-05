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
  const index = Math.max(0, getUnits().findIndex((unit) => unit.id === unitId));
  return getAllyPosition(index);
}

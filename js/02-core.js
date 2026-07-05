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
    companyBrandBonusText: document.querySelector("#companyBrandBonusText"),
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
    recruitDetailModal: document.querySelector("#recruitDetailModal"),
    recruitDetailBadge: document.querySelector("#recruitDetailBadge"),
    recruitPromotionModal: document.querySelector("#recruitPromotionModal"),
    recruitPromotionAvatar: document.querySelector("#recruitPromotionAvatar"),
    recruitPromotionTitle: document.querySelector("#recruitPromotionTitle"),
    recruitPromotionDesc: document.querySelector("#recruitPromotionDesc"),
    recruitPromotionConfirmButton: document.querySelector("#recruitPromotionConfirmButton"),
    recruitDetailTitle: document.querySelector("#recruitDetailTitle"),
    recruitDetailCategory: document.querySelector("#recruitDetailCategory"),
    recruitDetailDesc: document.querySelector("#recruitDetailDesc"),
    recruitDetailLevel: document.querySelector("#recruitDetailLevel"),
    recruitDetailDps: document.querySelector("#recruitDetailDps"),
    recruitDetailBoost: document.querySelector("#recruitDetailBoost"),
    recruitDetailSkillName: document.querySelector("#recruitDetailSkillName"),
    recruitDetailSkillText: document.querySelector("#recruitDetailSkillText"),
    recruitDetailEnhanceButton: document.querySelector("#recruitDetailEnhanceButton"),
    growthProcessValue: document.querySelector("#growthProcessValue"),
    growthCriticalValue: document.querySelector("#growthCriticalValue"),
    growthSkillValue: document.querySelector("#growthSkillValue"),
    growthSpeedValue: document.querySelector("#growthSpeedValue"),
    growthHpValue: document.querySelector("#growthHpValue"),
    toolList: document.querySelector("#toolList"),
    manualWorkButton: document.querySelector("#manualWorkButton"),
    upgradePlayerButton: document.querySelector("#upgradePlayerButton"),
    nextStageButton: document.querySelector("#nextStageButton"),
    equipmentDrawButton: document.querySelector("#equipmentDrawButton"),
    equipmentDrawCost: document.querySelector("#equipmentDrawCost"),
    autoDrawButton: document.querySelector("#autoDrawButton"),
    equippedItemPanel: document.querySelector("#equippedItemPanel"),
    equipmentPanelToggleButton: document.querySelector("#equipmentPanelToggleButton"),
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
    const recruitPromotionButton = event.target.closest("[data-recruit-promote]");
    const recruitDetailButton = event.target.closest("[data-recruit-detail]");
    const recruitModalDismiss = event.target.closest("[data-close-recruit-modal]");
    const recruitPromotionDismiss = event.target.closest("[data-close-recruit-promotion]");
    const toolButton = event.target.closest("[data-buy-tool]");
    const growthButton = event.target.closest("[data-upgrade-growth]");

    if (tab) switchTab(tab);
    if (recruitButton) buyRecruit(recruitButton.dataset.buyRecruit);
    if (recruitPromotionButton) openRecruitPromotion(recruitPromotionButton.dataset.recruitPromote);
    if (recruitDetailButton) openRecruitDetail(recruitDetailButton.dataset.recruitDetail);
    if (recruitModalDismiss) closeRecruitDetail();
    if (recruitPromotionDismiss) closeRecruitPromotion();
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
  refs.equipmentPanelToggleButton.addEventListener("click", toggleEquipmentPanel);
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
  if (refs.recruitDetailEnhanceButton) refs.recruitDetailEnhanceButton.addEventListener("click", enhanceRecruitDetail);
  if (refs.recruitPromotionConfirmButton) refs.recruitPromotionConfirmButton.addEventListener("click", confirmRecruitPromotion);
  document.addEventListener("input", handleAudioInput);
  document.addEventListener("change", handleAudioInput);
  document.addEventListener("change", handleSquadChange);
}

function startGame() {
  hasStartedGame = true;
  refs.startScreen.classList.add("is-hidden");
  refs.gameShell.classList.remove("is-hidden");
  playBgm(getActiveBgmKey());
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
  if (!select || activeTab !== "tools") return;

  const slotIndex = Number(select.dataset.squadSlot);
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= state.squad.length) return;

  const nextId = select.value || null;
  if (nextId) {
    const isRecruited = getRecruitCount(nextId) > 0;
    const isDeployedElsewhere = state.squad.some((id, index) => index !== slotIndex && id === nextId);
    if (!recruits.some((recruit) => recruit.id === nextId) || !isRecruited || isDeployedElsewhere) {
      log("영입하지 않은 동료이거나 이미 다른 자리에 배치된 동료입니다.");
      renderSquadManagement();
      return;
    }
  }

  state.squad[slotIndex] = nextId;
  state.squadConfigured = true;
  lastRosterKey = "";
  const recruit = recruits.find((item) => item.id === nextId);
  const positionNumber = slotIndex + 2;
  log(recruit ? `${positionNumber}번 자리에 ${recruit.name} 배치 완료` : `${positionNumber}번 자리를 비웠습니다.`);
  renderAll();
}

function getBattleBgmKey() {
  return state.battleMode === "boss" ? "boss" : "field";
}

function getActiveBgmKey() {
  if (!hasStartedGame) return "title";
  return activeTab === "tools" ? "tycoon" : getBattleBgmKey();
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

    updateUnitHealth(delta);
    moveEnemies(delta);
    updateMonsterAttacks(delta);
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
    unitHp: nextState.unitHp && typeof nextState.unitHp === "object" ? nextState.unitHp : {},
    unitMaxHp: nextState.unitMaxHp && typeof nextState.unitMaxHp === "object" ? nextState.unitMaxHp : {},
    clickPower: Math.max(1, Number(nextState.clickPower) || 1),
    playerLevel: Math.max(1, Number(nextState.playerLevel) || 1),
    clearCount: Math.max(0, Number(nextState.clearCount) || 0),
    companyXp: Math.max(0, Number(nextState.companyXp) || deriveCompanyXp(nextState)),
    companyRewardRemainders: {
      gold: Math.max(0, Math.min(0.999999, Number(nextState.companyRewardRemainders?.gold) || 0)),
      idea: Math.max(0, Math.min(0.999999, Number(nextState.companyRewardRemainders?.idea) || 0)),
    },
    elapsed: Math.max(0, Number(nextState.elapsed) || 0),
    recruits: nextState.recruits && typeof nextState.recruits === "object" ? nextState.recruits : {},
    squad:
      nextState.squadConfigured &&
      Array.isArray(nextState.squad) &&
      nextState.squad.length === defaultState.squad.length
      ? normalizeSquad(nextState.squad, nextState.recruits)
      : [...defaultState.squad],
    squadConfigured:
      Boolean(nextState.squadConfigured) &&
      Array.isArray(nextState.squad) &&
      nextState.squad.length === defaultState.squad.length,
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
    recruitBoosts: normalizeRecruitBoosts(nextState.recruitBoosts),
    recruitPromotions: normalizeRecruitPromotions(nextState.recruitPromotions),
    equipment: normalizeEquipment(nextState.equipment),
  };
}

function normalizeRecruitBoosts(boosts) {
  if (!boosts || typeof boosts !== "object") return {};

  return Object.entries(boosts).reduce((accumulator, [recruitId, value]) => {
    const level = Number(value);
    if (recruits.some((recruit) => recruit.id === recruitId) && Number.isFinite(level) && level > 0) {
      accumulator[recruitId] = Math.max(0, Math.floor(level));
    }
    return accumulator;
  }, {});
}

function normalizeRecruitPromotions(promotions) {
  if (!promotions || typeof promotions !== "object") return {};

  return Object.entries(promotions).reduce((accumulator, [recruitId, value]) => {
    const level = Number(value);
    if (recruits.some((recruit) => recruit.id === recruitId) && Number.isFinite(level) && level > 0) {
      accumulator[recruitId] = Math.max(0, Math.floor(level));
    }
    return accumulator;
  }, {});
}

function normalizeSquad(savedSquad, ownedRecruits = {}, autoFill = false) {
  const normalized = Array(SQUAD_MEMBER_LIMIT).fill(null);
  const used = {};
  const ownedRoster = ownedRecruits && typeof ownedRecruits === "object" ? ownedRecruits : {};

  if (Array.isArray(savedSquad)) {
    savedSquad.slice(0, normalized.length).forEach((id, index) => {
      const level = Math.max(0, Number(ownedRoster[id]) || 0);
      if (!recruits.some((recruit) => recruit.id === id) || level <= 0 || used.has(id)) return;
      normalized[index] = id;
      used.add(id);
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
      image: enemy.image || getMonsterImage({ ...enemy, lane: Number(enemy.lane) || index, isBoss: Boolean(enemy.isBoss) }),
    }))
    .filter((enemy) => enemy.hp > 0);
}

function initGame() {
  refs = {
    allyLayer: document.querySelector("#allyLayer"),
    startScreen: document.querySelector("#startScreen"),
    gameShell: document.querySelector("#gameShell"),
    startButton: document.querySelector("#startButton"),
    titleMuteButton: document.querySelector("#titleMuteButton"),
    titleVolumeSlider: document.querySelector("#titleVolumeSlider"),
    titleVolumeValue: document.querySelector("#titleVolumeValue"),
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
    offlinePlanText: document.querySelector("#offlinePlanText"),
    offlineUnlockModal: document.querySelector("#offlineUnlockModal"),
    recruitCompanyUnlockModal: document.querySelector("#recruitCompanyUnlockModal"),
    offlineClaimModal: document.querySelector("#offlineClaimModal"),
    offlineClaimPlan: document.querySelector("#offlineClaimPlan"),
    offlineClaimTime: document.querySelector("#offlineClaimTime"),
    offlineClaimGold: document.querySelector("#offlineClaimGold"),
    offlineClaimCloseButton: document.querySelector("#offlineClaimCloseButton"),
    recruitList: document.querySelector("#recruitList"),
    recruitGrowthPanel: document.querySelector("#recruitGrowthPanel"),
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
    manualWorkLimitText: document.querySelector("#manualWorkLimitText"),
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
    worldTutorialModal: document.querySelector("#worldTutorialModal"),
    worldTutorialConfirmButton: document.querySelector("#worldTutorialConfirmButton"),
    guidedTutorial: document.querySelector("#guidedTutorial"),
    guidedTutorialSpotlight: document.querySelector("#guidedTutorialSpotlight"),
    guidedTutorialBubble: document.querySelector("#guidedTutorialBubble"),
    guidedTutorialCounter: document.querySelector("#guidedTutorialCounter"),
    guidedTutorialTitle: document.querySelector("#guidedTutorialTitle"),
    guidedTutorialText: document.querySelector("#guidedTutorialText"),
    guidedTutorialNextButton: document.querySelector("#guidedTutorialNextButton"),
    guidedTutorialSkipButton: document.querySelector("#guidedTutorialSkipButton"),
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
    const recruitSelectCard = event.target.closest("[data-select-recruit]");
    const recruitPromotionButton = event.target.closest("[data-recruit-promote]");
    const recruitDetailButton = event.target.closest("[data-recruit-detail]");
    const recruitModalDismiss = event.target.closest("[data-close-recruit-modal]");
    const recruitPromotionDismiss = event.target.closest("[data-close-recruit-promotion]");
    const toolButton = event.target.closest("[data-buy-tool]");
    const growthButton = event.target.closest("[data-upgrade-growth]");
    const offlinePlanButton = event.target.closest("[data-offline-plan]");
    const offlineUnlockPlanButton = event.target.closest("[data-offline-unlock-plan]");
    const recruitCompanyUnlockClose = event.target.closest("[data-close-recruit-company-unlock]");
    const offlineClaimClose = event.target.closest("[data-close-offline-claim]");
    const guidedTutorialNext = event.target.closest("#guidedTutorialNextButton");
    const guidedTutorialSkip = event.target.closest("#guidedTutorialSkipButton");
    const worldTutorialConfirm = event.target.closest("#worldTutorialConfirmButton");

    if (tab) switchTab(tab);
    if (recruitSelectCard && !event.target.closest("button, select, a")) selectRecruitForGrowth(recruitSelectCard.dataset.selectRecruit);
    if (recruitButton) buyRecruit(recruitButton.dataset.buyRecruit);
    if (recruitPromotionButton) openRecruitPromotion(recruitPromotionButton.dataset.recruitPromote);
    if (recruitDetailButton) openRecruitDetail(recruitDetailButton.dataset.recruitDetail);
    if (recruitModalDismiss) closeRecruitDetail();
    if (recruitPromotionDismiss) closeRecruitPromotion();
    if (toolButton) buyTool(toolButton.dataset.buyTool);
    if (growthButton) upgradeGrowth(growthButton.dataset.upgradeGrowth);
    if (offlinePlanButton) changeOfflineRewardPlan(Number(offlinePlanButton.dataset.offlinePlan));
    if (offlineUnlockPlanButton) chooseInitialOfflineRewardPlan(Number(offlineUnlockPlanButton.dataset.offlineUnlockPlan));
    if (recruitCompanyUnlockClose) closeRecruitCompanyUnlockPopup();
    if (offlineClaimClose) closeOfflineRewardClaimPopup();
    if (worldTutorialConfirm) startGuidedTutorial();
    if (guidedTutorialNext) nextGuidedTutorialStep();
    if (guidedTutorialSkip) completeActiveTutorial();
  });

  refs.manualWorkButton.addEventListener("click", () => {
    useManualWork();
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
  refs.saveButton.addEventListener("click", () => saveState("?섎룞 ????꾨즺"));
  refs.resetButton.addEventListener("click", resetGame);
  refs.returnTitleButton.addEventListener("click", returnToTitle);
  refs.startButton.addEventListener("click", startGame);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-audio-mute]")) toggleMute();
  });
  if (refs.recruitDetailEnhanceButton) refs.recruitDetailEnhanceButton.addEventListener("click", enhanceRecruitDetail);
  if (refs.recruitPromotionConfirmButton) refs.recruitPromotionConfirmButton.addEventListener("click", confirmRecruitPromotion);
  document.addEventListener("input", handleAudioInput);
  document.addEventListener("change", handleAudioInput);
  document.addEventListener("change", handleSquadChange);
  window.addEventListener("resize", positionGuidedTutorial);
  window.addEventListener("scroll", positionGuidedTutorial, true);
}


async function startGame() {
  hasStartedGame = true;

  if (window.FirebaseGame) {
    try {
      const user = await FirebaseGame.loginWithGoogle();
      if (user) {
        const savedState = await FirebaseGame.loadUserGameState();

        if (savedState) {
          state = normalizeState({
            ...cloneDefaultState(),
            ...savedState,
          });
        }

        const currentChapter = Math.max(1, Number(state.chapter) || Number(state.stage) || 1);
        const canReceiveOfflineReward = currentChapter >= 3 && Boolean(state.offlineRewardUnlocked);

        if (canReceiveOfflineReward) {
          const rewardResult = FirebaseGame.applyOfflineReward(state, getTotalDps());
          await FirebaseGame.saveUserGameState(state, { updateLastActive: false });

          if (rewardResult.applied) {
            window.setTimeout(() => {
              showOfflineRewardClaimPopup(rewardResult);
            }, 120);
          }
        } else {
          // 3-1 이전이거나 아직 해금 보상 시간을 선택하지 않은 상태에서는
          // 비접속 보상을 지급하지 않고 기준 시간만 현재로 맞춥니다.
          state.lastActiveAtMs = Date.now();
          await FirebaseGame.saveUserGameState(state, { updateLastActive: false });
        }
      }
    } catch (error) {
      console.error("Firebase 로그인/불러오기 실패:", error);
      if (refs.saveStateText) refs.saveStateText.textContent = "Firebase 연결 실패 · 로컬 저장으로 진행";
    }
  }

  refs.startScreen.classList.add("is-hidden");
  refs.gameShell.classList.remove("is-hidden");
  playBgm(getActiveBgmKey());
  renderAll();
  if (!state.startTutorialCompleted) {
    openWorldTutorial();
  } else {
    checkRecruitCompanyUnlockPopup();
    checkOfflineRewardUnlockPopup();
  }
  startLoop();
}

function formatDurationHHMMSS(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function showOfflineRewardClaimPopup(result) {
  console.log("custom offline claim modal v2", result);
  if (!refs.offlineClaimModal) return;

  const plan = result?.plan || window.FirebaseGame?.OFFLINE_REWARD_PLANS?.[state.offlineRewardPlan];
  const rewardGold = Math.max(0, Math.floor(Number(result?.rewardGold || 0)));

  if (refs.offlineClaimPlan) refs.offlineClaimPlan.textContent = plan?.label || "비접속 보상";
  if (refs.offlineClaimTime) refs.offlineClaimTime.textContent = formatDurationHHMMSS(result?.rewardSeconds || 0);
  if (refs.offlineClaimGold) refs.offlineClaimGold.textContent = rewardGold.toLocaleString("ko-KR");

  refs.offlineClaimModal.classList.add("is-visible");
  refs.offlineClaimModal.setAttribute("aria-hidden", "false");
}

function closeOfflineRewardClaimPopup() {
  if (!refs.offlineClaimModal) return;
  refs.offlineClaimModal.classList.remove("is-visible");
  refs.offlineClaimModal.setAttribute("aria-hidden", "true");
}

async function changeOfflineRewardPlan(hours) {
  const plan = window.FirebaseGame?.OFFLINE_REWARD_PLANS?.[hours];
  if (!plan) return;

  state.offlineRewardPlan = Number(hours);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 로컬 저장 실패는 Firebase 저장을 계속 시도합니다.
  }

  if (window.FirebaseGame && FirebaseGame.getCurrentUser()) {
    try {
      await FirebaseGame.setOfflineRewardPlan(state, hours);
      await FirebaseGame.saveUserGameState(state, { updateLastActive: true });
      if (refs.saveStateText) refs.saveStateText.textContent = `비접속 보상 ${plan.label} 저장 완료`;
    } catch (error) {
      console.error("비접속 보상 설정 Firebase 저장 실패:", error);
      if (refs.saveStateText) refs.saveStateText.textContent = `비접속 보상 ${plan.label} 로컬 저장 완료`;
    }
  } else if (refs.saveStateText) {
    refs.saveStateText.textContent = `비접속 보상 ${plan.label} 로컬 저장 완료`;
  }

  renderAll();
}


const START_TUTORIAL_STEPS = [
  {
    selector: ".resource-chip--gold",
    title: "자금",
    text: "업무를 처리하면 획득하는 기본 재화입니다. 동료 획득, 레벨업, 승급, 대표 역량 강화 등에 사용됩니다.",
    placement: "bottom",
  },
  {
    selector: ".resource-chip--idea",
    title: "아이디어",
    text: "직접 처리나 업무 완료 보상으로 얻는 성장 재화입니다. 장비 연구나 일부 성장 요소에 활용됩니다.",
    placement: "bottom",
  },
  {
    selector: "#teamCountText",
    title: "팀 규모",
    text: "현재 전투에 참여하는 대표와 동료 수를 보여줍니다. 동료를 영입하고 스쿼드에 배치하면 팀 규모가 커집니다.",
    placement: "top",
  },
  {
    selector: "#clickPowerText",
    title: "클릭 기여도",
    text: "직접 처리 버튼을 눌렀을 때 들어가는 수동 기여도입니다. 대표 역량과 성장 강화로 올릴 수 있습니다.",
    placement: "top",
  },
  {
    selector: "#clearCountText",
    title: "처리한 업무",
    text: "지금까지 완료한 업무 수입니다. 업무를 많이 처리할수록 회사가 성장할 기반이 쌓입니다.",
    placement: "top",
  },
  {
    selector: "#upgradePlayerButton",
    title: "대표 역량 강화",
    text: "자금을 사용해 대표의 기본 능력을 강화합니다. 초반에는 대표 역량을 올리면 업무 처리 속도가 안정적으로 빨라집니다.",
    placement: "right",
  },
  {
    selector: "#equippedItemPanel",
    title: "장착 장비",
    text: "뽑기로 얻은 장비를 장착하면 대표의 공격력과 스킬 공격력이 증가합니다. 목록 보기 버튼으로 장착 현황을 확인할 수 있습니다.",
    placement: "right",
  },
  {
    selector: ".draw-machine-panel",
    title: "뽑기 / 자동 뽑기",
    text: "자금을 사용해 장비를 뽑습니다. 자동 뽑기는 더 좋은 장비가 나올 때까지 반복 시도하는 기능입니다.",
    placement: "left",
  },
];

const RECRUIT_COMPANY_TUTORIAL_STEPS = [
  {
    tab: "recruit",
    selector: ".recruit-board__left",
    title: "동료 영입 목록",
    text: "여기에서 개발, 아트, 기획, 사운드, 연출, 데이터 분석 등 다양한 직군 카드를 확인할 수 있습니다. 카드를 누르면 오른쪽에 성장 정보가 표시됩니다.",
    placement: "right",
  },
  {
    tab: "recruit",
    selector: ".recruit-class-card",
    title: "직군 카드",
    text: "각 카드는 직군 이름, 현재 승급명, 캐릭터 이미지, 핵심 능력치를 보여줍니다. 원하는 직군을 선택해 성장시킬 수 있습니다.",
    placement: "right",
  },
  {
    tab: "recruit",
    selector: ".recruit-board__right",
    title: "직군 성장",
    text: "선택한 동료의 설명, 스킬, 현재 레벨을 확인하고 동료 획득·레벨업·승급을 진행하는 영역입니다.",
    placement: "left",
  },
  {
    tab: "recruit",
    selector: ".recruit-focus-action",
    fallbackSelector: ".recruit-board__right",
    title: "동료 획득 / 레벨업 / 승급",
    text: "동료가 없을 때는 동료 획득, 보유 중일 때는 레벨업을 진행합니다. Lv.10, 20, 30, 40, 50에 도달하면 승급 버튼으로 더 높은 직급명을 열 수 있습니다.",
    placement: "left",
  },
  {
    tab: "tools",
    selector: ".company-scene-heading",
    title: "회사 성장 현황",
    text: "회사 탭으로 이동하면 위쪽 화면이 회사 현황으로 바뀝니다. 회사 레벨과 현재 규모, 다음 성장까지 필요한 EXP를 확인할 수 있습니다.",
    placement: "bottom",
  },
  {
    tab: "tools",
    selector: "#toolList",
    title: "회사 시설 확장",
    text: "아이디어를 사용해 시설에 투자하면 회사 EXP가 오르고 회사 가치가 성장합니다. 회사가 성장할수록 보너스와 분위기가 좋아집니다.",
    placement: "top",
  },
  {
    tab: "tools",
    selector: ".squad-management",
    title: "업무 스쿼드 구성",
    text: "영입한 동료를 대표와 함께 업무 스쿼드에 배치하는 영역입니다. 동료 3명까지 추가해 총 4명 팀을 구성할 수 있습니다.",
    placement: "top",
  },
  {
    tab: "tools",
    selector: "#squadFormation",
    title: "배치 위치",
    text: "각 자리의 선택 목록에서 보유 동료를 골라 배치합니다. 배치된 동료는 전투 화면에 등장하고 자동으로 업무를 처리합니다.",
    placement: "left",
  },
  {
    tab: "tools",
    selector: "#squadRoster",
    title: "보유 동료 / 시너지",
    text: "보유한 동료와 배치 상태를 확인할 수 있습니다. 특정 직군 조합을 맞추면 스쿼드 시너지 보너스가 발동합니다.",
    placement: "left",
  },
];

function openWorldTutorial() {
  if (!refs.worldTutorialModal) {
    startGuidedTutorial();
    return;
  }
  refs.worldTutorialModal.classList.remove("is-hidden");
  refs.worldTutorialModal.setAttribute("aria-hidden", "false");
}

function closeWorldTutorial() {
  if (!refs.worldTutorialModal) return;
  refs.worldTutorialModal.classList.add("is-hidden");
  refs.worldTutorialModal.setAttribute("aria-hidden", "true");
}

function openGuidedTutorial(steps, mode = "start") {
  activeTutorialMode = mode;
  activeTutorialSteps = Array.isArray(steps) ? steps : [];
  activeTutorialStepIndex = 0;

  if (refs.guidedTutorial) {
    refs.guidedTutorial.classList.remove("is-hidden");
    refs.guidedTutorial.setAttribute("aria-hidden", "false");
  }

  window.setTimeout(() => showGuidedTutorialStep(0), 90);
}

function startGuidedTutorial() {
  closeWorldTutorial();
  const battleTab = document.querySelector('[data-tab="battle"]');
  if (battleTab && activeTab !== "battle") switchTab(battleTab);
  openGuidedTutorial(START_TUTORIAL_STEPS, "start");
}

function startRecruitCompanyTutorial() {
  if (!isRecruitCompanyUnlocked() || state.recruitCompanyTutorialCompleted) {
    checkOfflineRewardUnlockPopup();
    return;
  }

  const recruitTab = document.querySelector('[data-tab="recruit"]');
  if (recruitTab && activeTab !== "recruit") switchTab(recruitTab);
  renderAll();
  openGuidedTutorial(RECRUIT_COMPANY_TUTORIAL_STEPS, "recruitCompany");
}

function getActiveTutorialSteps() {
  return activeTutorialSteps?.length ? activeTutorialSteps : START_TUTORIAL_STEPS;
}

function prepareTutorialStep(step) {
  if (!step?.tab || activeTab === step.tab) return;
  const tab = document.querySelector(`[data-tab="${step.tab}"]`);
  if (tab) {
    switchTab(tab);
    renderAll();
  }
}

function getTutorialTarget(step) {
  if (!step?.selector) return null;
  const found = document.querySelector(step.selector) || (step.fallbackSelector ? document.querySelector(step.fallbackSelector) : null);
  if (!found) return null;
  return (
    found.closest(
      ".stat-grid > div, .resource-chip, .equipped-item-panel, .draw-machine-panel, .recruit-board__left, .recruit-board__right, .recruit-class-card, .recruit-focus-card, .recruit-focus-action, .company-scene-heading, .company-status-strip, .facility-list, .facility-card, .squad-management, .squad-layout, .squad-formation, .squad-roster, button"
    ) || found
  );
}

function clearTutorialHighlight() {
  if (activeTutorialTarget) activeTutorialTarget.classList.remove("is-tutorial-highlight");
  activeTutorialTarget = null;
}

function showGuidedTutorialStep(index) {
  if (!refs.guidedTutorial) return;
  const steps = getActiveTutorialSteps();
  const step = steps[index];
  if (!step) {
    completeActiveTutorial();
    return;
  }

  prepareTutorialStep(step);
  clearTutorialHighlight();
  activeTutorialStepIndex = index;
  activeTutorialTarget = getTutorialTarget(step);

  if (activeTutorialTarget) {
    activeTutorialTarget.classList.add("is-tutorial-highlight");
    if (typeof activeTutorialTarget.scrollIntoView === "function") {
      activeTutorialTarget.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    }
  }

  if (refs.guidedTutorialCounter) refs.guidedTutorialCounter.textContent = `${index + 1} / ${steps.length}`;
  if (refs.guidedTutorialTitle) refs.guidedTutorialTitle.textContent = step.title;
  if (refs.guidedTutorialText) refs.guidedTutorialText.textContent = step.text;
  if (refs.guidedTutorialNextButton) refs.guidedTutorialNextButton.textContent = index >= steps.length - 1 ? "튜토리얼 완료" : "다음";

  window.setTimeout(positionGuidedTutorial, 140);
}

function positionGuidedTutorial() {
  if (!refs.guidedTutorial || refs.guidedTutorial.classList.contains("is-hidden")) return;
  const steps = getActiveTutorialSteps();
  const step = steps[activeTutorialStepIndex];
  if (!step || !activeTutorialTarget || !refs.guidedTutorialBubble) return;

  const rect = activeTutorialTarget.getBoundingClientRect();
  const padding = 10;
  const spotlightPadding = 8;
  const bubble = refs.guidedTutorialBubble;
  const bubbleWidth = Math.min(310, window.innerWidth - 28);
  bubble.style.width = `${bubbleWidth}px`;
  bubble.style.maxWidth = `${bubbleWidth}px`;
  bubble.style.maxHeight = `${Math.max(140, window.innerHeight - 28)}px`;

  if (refs.guidedTutorialSpotlight) {
    refs.guidedTutorialSpotlight.style.left = `${Math.max(8, rect.left - spotlightPadding)}px`;
    refs.guidedTutorialSpotlight.style.top = `${Math.max(8, rect.top - spotlightPadding)}px`;
    refs.guidedTutorialSpotlight.style.width = `${Math.min(window.innerWidth - 16, rect.width + spotlightPadding * 2)}px`;
    refs.guidedTutorialSpotlight.style.height = `${Math.min(window.innerHeight - 16, rect.height + spotlightPadding * 2)}px`;
  }

  const bubbleHeight = bubble.offsetHeight || 168;
  let left = rect.left + rect.width / 2 - bubbleWidth / 2;
  let top = rect.bottom + 16;

  if (step.placement === "top") {
    top = rect.top - bubbleHeight - 16;
  } else if (step.placement === "left") {
    left = rect.left - bubbleWidth - 16;
    top = rect.top + rect.height / 2 - bubbleHeight / 2;
  } else if (step.placement === "right") {
    left = rect.right + 16;
    top = rect.top + rect.height / 2 - bubbleHeight / 2;
  }

  left = Math.max(padding, Math.min(window.innerWidth - bubbleWidth - padding, left));
  top = Math.max(padding, Math.min(window.innerHeight - bubbleHeight - padding, top));
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function hideGuidedTutorial() {
  closeWorldTutorial();
  clearTutorialHighlight();
  if (refs.guidedTutorial) {
    refs.guidedTutorial.classList.add("is-hidden");
    refs.guidedTutorial.setAttribute("aria-hidden", "true");
  }
}

function nextGuidedTutorialStep() {
  showGuidedTutorialStep(activeTutorialStepIndex + 1);
}

function completeActiveTutorial() {
  if (activeTutorialMode === "recruitCompany") {
    completeRecruitCompanyTutorial();
    return;
  }
  completeStartTutorial();
}

function completeStartTutorial() {
  hideGuidedTutorial();
  state.startTutorialCompleted = true;
  saveState("초반 튜토리얼 완료");
  checkRecruitCompanyUnlockPopup();
  checkOfflineRewardUnlockPopup();
}

function completeRecruitCompanyTutorial() {
  hideGuidedTutorial();
  state.recruitCompanyTutorialCompleted = true;
  saveState("동료 영입 / 회사 튜토리얼 완료");
  checkOfflineRewardUnlockPopup();
}

function isRecruitCompanyUnlocked() {
  const currentChapter = Math.max(1, Number(state?.chapter) || Number(state?.stage) || 1);
  return currentChapter >= 2;
}

function checkRecruitCompanyUnlockPopup() {
  if (!refs.recruitCompanyUnlockModal || !state) return;

  const isUnlockedStage = isRecruitCompanyUnlocked();
  const alreadyShown = Boolean(state.recruitCompanyUnlockShown);

  if (!isUnlockedStage || alreadyShown) {
    refs.recruitCompanyUnlockModal.classList.remove("is-visible");
    refs.recruitCompanyUnlockModal.setAttribute("aria-hidden", "true");
    return;
  }

  refs.recruitCompanyUnlockModal.classList.add("is-visible");
  refs.recruitCompanyUnlockModal.setAttribute("aria-hidden", "false");
}

function closeRecruitCompanyUnlockPopup() {
  if (!refs.recruitCompanyUnlockModal) return;

  state.recruitCompanyUnlockShown = true;
  refs.recruitCompanyUnlockModal.classList.remove("is-visible");
  refs.recruitCompanyUnlockModal.setAttribute("aria-hidden", "true");
  renderAll();
  saveState("동료 영입 / 회사 시스템 안내 확인 완료");
  window.setTimeout(startRecruitCompanyTutorial, 100);
}

function checkOfflineRewardUnlockPopup() {
  if (!refs.offlineUnlockModal || !state) return;

  // 비접속 보상은 3-1부터 해금됩니다.
  // 이 게임의 진행 표기는 chapter-subStage 구조이므로 1-3이 아니라 chapter 3 이상을 기준으로 봅니다.
  const currentChapter = Math.max(1, Number(state.chapter) || Number(state.stage) || 1);
  const isUnlockedStage = currentChapter >= 3;
  const alreadySelected = Boolean(state.offlineRewardUnlocked);

  if (!isUnlockedStage || alreadySelected) {
    refs.offlineUnlockModal.classList.remove("is-visible");
    refs.offlineUnlockModal.setAttribute("aria-hidden", "true");
    return;
  }

  refs.offlineUnlockModal.classList.add("is-visible");
  refs.offlineUnlockModal.setAttribute("aria-hidden", "false");
}

async function chooseInitialOfflineRewardPlan(hours) {
  const plan = window.FirebaseGame?.OFFLINE_REWARD_PLANS?.[hours];
  if (!plan) return;

  state.offlineRewardPlan = Number(hours);
  state.offlineRewardUnlocked = true;
  state.lastActiveAtMs = Date.now();

  if (refs.offlineUnlockModal) {
    refs.offlineUnlockModal.classList.remove("is-visible");
    refs.offlineUnlockModal.setAttribute("aria-hidden", "true");
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 로컬 저장 실패는 Firebase 저장을 계속 시도합니다.
  }

  if (window.FirebaseGame && FirebaseGame.getCurrentUser()) {
    try {
      await FirebaseGame.setOfflineRewardPlan(state, hours);
      await FirebaseGame.saveUserGameState(state, { updateLastActive: true });
      if (refs.saveStateText) refs.saveStateText.textContent = `비접속 보상 ${plan.label} 선택 완료`;
    } catch (error) {
      console.error("비접속 보상 첫 선택 Firebase 저장 실패:", error);
      if (refs.saveStateText) refs.saveStateText.textContent = `비접속 보상 ${plan.label} 로컬 선택 완료`;
    }
  } else if (refs.saveStateText) {
    refs.saveStateText.textContent = `비접속 보상 ${plan.label} 로컬 선택 완료`;
  }

  renderAll();
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
      if (!options.silentFail) log("BGM ?ъ깮??釉뚮씪?곗??먯꽌 李⑤떒?섏뿀?듬땲??");
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
    log("?ㅻ뵒???ㅼ젙 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.");
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
      log("?곸엯?섏? ?딆? ?숇즺?닿굅???대? ?ㅻⅨ ?먮━??諛곗튂???숇즺?낅땲??");
      renderSquadManagement();
      return;
    }
  }

  state.squad[slotIndex] = nextId;
  state.squadConfigured = true;
  lastRosterKey = "";
  const recruit = recruits.find((item) => item.id === nextId);
  const positionNumber = slotIndex + 2;
  log(recruit ? `${positionNumber}踰??먮━??${recruit.name} 諛곗튂 ?꾨즺` : `${positionNumber}踰??먮━瑜?鍮꾩썱?듬땲??`);
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
      saveState("?먮룞 ????꾨즺");
    }

    renderBattle();
  } catch (error) {
    log(`?꾪닾 猷⑦봽 ?ㅻ쪟: ${error.message}`);
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
    manualWorkUses: Math.min(MANUAL_WORK_MAX_COUNT, Math.max(0, Number(nextState.manualWorkUses) || 0)),
    manualWorkChapter: Math.max(1, Number(nextState.manualWorkChapter) || Number(nextState.chapter) || Number(nextState.stage) || 1),
    playerLevel: Math.max(1, Number(nextState.playerLevel) || 1),
    clearCount: Math.max(0, Number(nextState.clearCount) || 0),
    companyXp: Math.max(0, Number(nextState.companyXp) || deriveCompanyXp(nextState)),
    companyRewardRemainders: {
      gold: Math.max(0, Math.min(0.999999, Number(nextState.companyRewardRemainders?.gold) || 0)),
      idea: Math.max(0, Math.min(0.999999, Number(nextState.companyRewardRemainders?.idea) || 0)),
    },
    elapsed: Math.max(0, Number(nextState.elapsed) || 0),
    offlineRewardPlan: [4, 8, 12].includes(Number(nextState.offlineRewardPlan))
      ? Number(nextState.offlineRewardPlan)
      : 8,
    offlineRewardUnlocked: Boolean(nextState.offlineRewardUnlocked),
    recruitCompanyUnlockShown: Boolean(nextState.recruitCompanyUnlockShown),
    recruitCompanyTutorialCompleted: Boolean(nextState.recruitCompanyTutorialCompleted),
    startTutorialCompleted: Boolean(nextState.startTutorialCompleted),
    lastActiveAtMs: Number(nextState.lastActiveAtMs) || Date.now(),
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
    speedTickets: Math.min(SPEED_TICKET_MAX_COUNT, Math.max(0, Number(safeEquipment.speedTickets) || 0)),
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
  const grade = String(item.grade || equipmentGrades[0].name);
  const base = equipmentPool.find((equipment) => equipment.id === item.id || String(item.id || "").startsWith(`${equipment.id}-`));
  return {
    id: String(item.id || "unknown"),
    slot,
    name: String(item.name || "?대쫫 ?녿뒗 ?λ퉬"),
    icon: String(item.icon || "?"),
    image: String(item.image || (base ? getEquipmentImageSrc(base.id, grade) : "")),
    grade,
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
  state.lastActiveAtMs = Date.now();

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    message = "??μ냼 ?묎렐 遺덇?";
  }

  if (refs.saveStateText) refs.saveStateText.textContent = message;

  if (window.FirebaseGame && FirebaseGame.getCurrentUser()) {
    FirebaseGame.saveUserGameState(state, { updateLastActive: false }).catch((error) => {
      console.error("Firebase 저장 실패:", error);
    });
  }
}

function resetGame() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    refs.saveStateText.textContent = "??μ냼 ?묎렐 遺덇?";
  }
  state = cloneDefaultState();
  lastRosterKey = "";
  lastCompanyVisualKey = "";
  spawnWave();
  renderAll();
  saveState("珥덇린???꾨즺");
}

function normalizeEnemies(enemies) {
  if (!Array.isArray(enemies)) return [];
  return enemies
    .map((enemy, index) => {
      const lane = Number(enemy.lane) || index;
      const normalizedEnemy = { ...enemy, lane, isBoss: Boolean(enemy.isBoss) };
      const monsterIndex = normalizedEnemy.isBoss ? null : getNormalMonsterIndex(normalizedEnemy);
      const bossIndex = normalizedEnemy.isBoss ? getBossMonsterIndex(normalizedEnemy) : null;
      const withIndex = { ...normalizedEnemy, monsterIndex, bossIndex };
      return {
        id: enemy.id || `saved-${index}`,
        name: enemy.name || getEnemyName(),
        hp: Math.max(1, Number(enemy.hp) || 1),
        maxHp: Math.max(1, Number(enemy.maxHp) || 1),
        x: Number(enemy.x) || ENEMY_SPAWN_X,
        y: Number(enemy.y) || getEnemyLaneY(index),
        lane,
        isBoss: Boolean(enemy.isBoss),
        hasEngaged: Boolean(enemy.hasEngaged),
        monsterIndex,
        bossIndex,
        attackType: getMonsterAttackType(withIndex),
        image: getMonsterImage(withIndex),
        skillImage: getMonsterSkillImage(withIndex),
        effectImage: getMonsterEffectImage(withIndex),
      };
    })
    .filter((enemy) => enemy.hp > 0);
}

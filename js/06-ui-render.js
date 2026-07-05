function switchTab(tab) {
  activeTab = tab.dataset.tab;
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("is-active", button === tab));
  document
    .querySelectorAll(".tab-panel")
    .forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === activeTab));
  updatePrimaryScene();
  if (hasStartedGame) playBgm(getActiveBgmKey(), { silentFail: true });
}

function renderAll() {
  renderAllies();
  renderShop();
  renderRecruitDetailModal();
  renderRecruitPromotionModal();
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
  setText(refs.playTimeText, formatTime(state.elapsed));
  setText(refs.attackTimerText, `${Math.max(0, Math.min(basicAttackCooldown, skillAttackCooldown)).toFixed(1)}초`);
  setText(refs.growthProcessValue, formatGrowthValue("process", getGrowthValue("process")));
  setText(refs.growthCriticalValue, formatGrowthValue("critical", getGrowthValue("critical")));
  setText(refs.growthSkillValue, formatGrowthValue("skill", getGrowthValue("skill")));
  setText(refs.growthSpeedValue, formatGrowthValue("speed", getGrowthValue("speed")));
  setText(refs.growthHpValue, formatGrowthValue("hp", getGrowthValue("hp")));
  document.querySelectorAll("[data-upgrade-growth]").forEach((button) => {
    const type = button.dataset.upgradeGrowth;
    const cost = getGrowthCost(type);
    button.textContent = `강화 (${cost} 자금)`;
    button.disabled = state.gold < cost;
  });
  refs.upgradePlayerButton.textContent = `대표 역량 강화 (${playerCost} 자금)`;
  refs.upgradePlayerButton.disabled = state.gold < playerCost;
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
  refs.equipmentPanelToggleButton.textContent = equipmentPanelExpanded ? "최소화" : "목록 보기";
  refs.equipmentPanelToggleButton.setAttribute("aria-expanded", String(equipmentPanelExpanded));
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
  const visualTier = Math.min(companyLevels.length, levelNumber);
  const squadVisualKey = state.squad.map((recruitId) => recruitId || "empty").join(",");
  const visualKey = `${progress.levelIndex}:${getEmployeeCount()}:${facilityCount}:${squadVisualKey}`;

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
    refs.companyBuilding.setAttribute("src", getCompanyImageSrc(levelNumber));
    refs.companyBuilding.setAttribute("alt", `${progress.current.name} 외관`);
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
  const employees = [
    {
      name: "대표",
      sprite: "Anim/Player_1/Motion.png",
      isLeader: true,
    },
    ...state.squad
      .map((recruitId) => recruits.find((recruit) => recruit.id === recruitId))
      .filter(Boolean)
      .map((recruit) => ({
        name: getRecruitRankLabel(recruit, getRecruitCount(recruit.id)),
        sprite: recruit.sprites.idle,
        isLeader: false,
      })),
  ];

  refs.employeeCrowd.innerHTML = employees
    .map(
      (employee) => `
        <span
          class="scene-employee${employee.isLeader ? " is-leader" : ""}"
          role="img"
          aria-label="${employee.name}"
          style="--employee-image: url('${employee.sprite}')"
        ></span>
      `
    )
    .join("");
  refs.employeeCrowd.setAttribute("aria-label", `현재 업무 스쿼드 ${employees.length}명`);
}

function renderEnemies() {
  refs.enemyLayer.innerHTML = state.enemies
    .map((enemy) => {
      const hpPercent = Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100));
      const imageSrc = enemy.image || getMonsterImage(enemy);
      return `
        <div class="enemy${enemy.isBoss ? " is-boss" : ""}" data-enemy-id="${enemy.id}" style="--enemy-x: ${enemy.x}%; --enemy-y: ${enemy.y}px;">
          <div class="enemy-hp-bar" aria-label="상대 체력">
            <span style="width: ${hpPercent}%"></span>
          </div>
          <img src="${imageSrc}" alt="${enemy.isBoss ? "보스 몬스터" : "일반 몬스터"}" class="enemy-sprite" />
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
      const position = getAllyPosition(index, units.length);
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
          <span class="ally-role">${unit.shortName}${countText}</span>
        </div>
      `;
    })
    .join("");
}

function getAllyPosition(index, unitCount = 1) {
  const layouts = {
    1: [{ x: 22, y: 76 }],
    2: [
      { x: 14, y: 76 },
      { x: 31, y: 76 },
    ],
    3: [
      { x: 14, y: 122 },
      { x: 31, y: 122 },
      { x: 22, y: 34 },
    ],
    4: [
      { x: 14, y: 122 },
      { x: 31, y: 122 },
      { x: 14, y: 34 },
      { x: 31, y: 34 },
    ],
  };
  const positions = layouts[Math.min(4, Math.max(1, unitCount))];
  return positions[index] || positions[positions.length - 1];
}

function renderShop() {
  refs.recruitList.innerHTML = recruitCategories
    .map((category) => {
      const categoryItems = recruits.filter((recruit) => recruit.category === category);
      const itemsHtml = categoryItems.length
        ? categoryItems
            .map((recruit) => {
              const count = getRecruitCount(recruit.id);
              const cost = getRecruitBuyCost(recruit, count);
              const label = getRecruitRankLabel(recruit, count);
              const promotionReady = shouldShowRecruitPromotionButton(recruit, count);
              const promotionCost = getRecruitPromotionCost(recruit);
              const actionLabel = promotionReady ? "승급" : `${cost} 자금`;
              const actionDataset = promotionReady ? `data-recruit-promote="${recruit.id}"` : `data-buy-recruit="${recruit.id}"`;
              const actionClass = promotionReady ? "shop-promote-button" : "";
              const actionDisabled = promotionReady ? state.gold < promotionCost : state.gold < cost;
              return `
                <div class="shop-item">
                  <div class="shop-item__content">
                    <strong>${label} Lv.${count}</strong>
                    <span class="shop-meta">${recruit.desc} / 초당 +${recruit.dps}</span>
                  </div>
                  <div class="shop-item__actions">
                    <button class="shop-detail-button" type="button" data-recruit-detail="${recruit.id}">상세보기</button>
                    <button class="${actionClass}" type="button" ${actionDataset} ${actionDisabled ? "disabled" : ""}>${actionLabel}</button>
                  </div>
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
  const positionNames = ["2번 자리", "3번 자리", "4번 자리"];
  const deployedIds = new Set(state.squad.filter(Boolean));

  const leaderMarkup = `
    <div class="squad-slot squad-slot--leader is-filled">
      <span class="squad-position">1번 자리</span>
      <span class="squad-slot-body">
        ${getSquadCharacterAvatarMarkup(null, true)}
        <span>
          <strong>대표</strong>
          <small>리더 · 고정 배치</small>
        </span>
      </span>
      <span class="squad-slot-fixed">고정 배치</span>
    </div>
  `;

  const slotMarkup = state.squad
    .map((recruitId, slotIndex) => {
      const assigned = recruits.find((recruit) => recruit.id === recruitId);
      const assignedLevel = assigned ? getRecruitCount(assigned.id) : 0;
      const assignedRank = assigned ? getRecruitRankLabel(assigned, assignedLevel) : "";
      const options = recruits
        .filter((recruit) => getRecruitCount(recruit.id) > 0)
        .map((recruit) => {
          const level = getRecruitCount(recruit.id);
          const rankLabel = getRecruitRankLabel(recruit, level);
          const isDeployedElsewhere = recruit.id !== recruitId && deployedIds.has(recruit.id);
          return `<option value="${recruit.id}" ${recruit.id === recruitId ? "selected" : ""} ${
            isDeployedElsewhere ? "disabled" : ""
          }>${rankLabel} · Lv.${level}</option>`;
        })
        .join("");
      const color = assigned ? assigned.color : "#9a8b77";

      return `
        <label class="squad-slot${assigned ? " is-filled" : ""}">
          <span class="squad-position">${positionNames[slotIndex]}</span>
          <span class="squad-slot-body">
            ${
              assigned
                ? getSquadCharacterAvatarMarkup(assigned)
                : `<span class="squad-avatar is-empty" style="--squad-color: ${color};" aria-hidden="true">+</span>`
            }
            <span>
              <strong>${assignedRank || "빈 자리"}</strong>
              <small>${assigned ? `${assigned.category} · Lv.${assignedLevel}` : "동료를 선택하세요"}</small>
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
      const level = getRecruitCount(recruit.id);
      const rankLabel = getRecruitRankLabel(recruit, level);
      const isDeployed = deployedIds.has(recruit.id);
      return `
        <div class="squad-roster-item${level > 0 ? "" : " is-unowned"}">
          ${getSquadCharacterAvatarMarkup(recruit)}
          <div>
            <strong>${rankLabel}</strong>
            <small>Lv.${level} · ${level === 0 ? "합류 전" : isDeployed ? "배치 중" : "대기 중"}</small>
          </div>
        </div>
      `;
    })
    .join("");
}

function getSquadCharacterAvatarMarkup(recruit, isLeader = false) {
  const level = recruit ? getRecruitCount(recruit.id) : 0;
  const name = isLeader ? "대표" : getRecruitRankLabel(recruit, level);
  const color = isLeader ? "#059669" : recruit.color;
  const sprite = isLeader ? "Anim/Player_1/Motion.png" : recruit.sprites?.idle;

  if (!sprite) {
    const mark = isLeader ? "C" : recruit.mark;
    return `<span class="squad-avatar" style="--squad-color: ${color};">${mark}</span>`;
  }

  return `
    <span
      class="squad-avatar has-character${isLeader ? " is-leader" : ""}"
      role="img"
      aria-label="${name}"
      style="--squad-color: ${color}; --squad-image: url('${sprite}')"
    ></span>
  `;
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


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}

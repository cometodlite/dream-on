const SAVE_KEY = "dream_on_proto_save_v1";

const state = {
  player: null,
  enemy: null,
  stageId: null,
  logs: []
};

const els = {
  playerCard: document.getElementById("playerCard"),
  statList: document.getElementById("statList"),
  statPointsRow: document.getElementById("statPointsRow"),
  alignmentCard: document.getElementById("alignmentCard"),
  mainScreen: document.getElementById("mainScreen"),
  logBox: document.getElementById("logBox"),
  screenTitle: document.getElementById("screenTitle"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn")
};

function capValue(value, soft, hard) {
  if (value <= soft) return value;
  const reduced = soft + (value - soft) * 0.5;
  return Math.min(reduced, hard);
}

function getClassById(id) {
  return GAME_DATA.classes.find(c => c.id === id);
}

function getMonster(id) {
  return structuredClone(GAME_DATA.monsters[id]);
}

function getLevelExp(level) {
  return GAME_DATA.expTable[level] ?? GAME_DATA.expTable[GAME_DATA.expTable.length - 1] + (level - GAME_DATA.expTable.length + 1) * 600;
}

function createPlayer(classId) {
  const cls = getClassById(classId);
  return {
    name: cls.name + " 견습자",
    classId,
    level: 1,
    exp: 0,
    gold: 120,
    dreamShard: 0,
    hp: cls.base.hp,
    mp: cls.base.mp,
    maxHp: cls.base.hp,
    maxMp: cls.base.mp,
    statPoints: 0,
    alignment: { lucid: 0, nightfall: 0 },
    stats: {
      str: cls.base.str,
      agi: cls.base.agi,
      vit: cls.base.vit,
      int: cls.base.int,
      wis: cls.base.wis,
      luc: cls.base.luc
    },
    inventory: [
      { id: "potion", qty: 2 },
      { id: "ether", qty: 1 }
    ],
    battleBuff: { atk: 0 }
  };
}

function computeDerived(player) {
  const s = player.stats;
  const atk = s.str * 2 + Math.floor(player.level * 1.5) + player.battleBuff.atk;
  const matk = s.int * 2 + player.level;
  const def = s.vit;
  const maxHp = getClassById(player.classId).base.hp + s.vit * 18 + player.level * 12;
  const maxMp = getClassById(player.classId).base.mp + s.wis * 10 + player.level * 5;
  const rawCrit = s.luc * 0.8;
  const rawEvade = s.agi * 1.2;
  const critRate = capValue(rawCrit, GAME_DATA.caps.critRate.soft, GAME_DATA.caps.critRate.hard);
  const evasion = capValue(rawEvade, GAME_DATA.caps.evasion.soft, GAME_DATA.caps.evasion.hard);
  return { atk, matk, def, maxHp, maxMp, critRate, evasion };
}

function syncPlayerVitals() {
  if (!state.player) return;
  const d = computeDerived(state.player);
  state.player.maxHp = d.maxHp;
  state.player.maxMp = d.maxMp;
  state.player.hp = Math.min(state.player.hp, d.maxHp);
  state.player.mp = Math.min(state.player.mp, d.maxMp);
}

function addLog(message) {
  state.logs.unshift(`${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} · ${message}`);
  state.logs = state.logs.slice(0, 60);
  renderLogs();
}

function renderLogs() {
  els.logBox.innerHTML = state.logs.map(msg => `<div class="log-entry">${msg}</div>`).join("");
}

function renderPlayer() {
  if (!state.player) {
    els.playerCard.innerHTML = `<p class="muted">아직 각성하지 않은 상태야.</p>`;
    els.statList.innerHTML = "";
    els.statPointsRow.textContent = "";
    els.alignmentCard.innerHTML = `<p class="muted">루시드와 나이트폴의 균형은 아직 비어 있다.</p>`;
    return;
  }

  syncPlayerVitals();
  const p = state.player;
  const d = computeDerived(p);
  const needExp = getLevelExp(p.level);
  const expRatio = Math.min(100, (p.exp / needExp) * 100);

  els.playerCard.innerHTML = `
    <div class="badge">Lv.${p.level}</div>
    <div class="badge">${getClassById(p.classId).name}</div>
    <div class="kv"><span>HP</span><strong>${p.hp} / ${d.maxHp}</strong></div>
    <div class="progress hpbar"><span style="width:${(p.hp / d.maxHp) * 100}%"></span></div>
    <div class="kv"><span>MP</span><strong>${p.mp} / ${d.maxMp}</strong></div>
    <div class="progress mpbar"><span style="width:${(p.mp / d.maxMp) * 100}%"></span></div>
    <div class="kv"><span>EXP</span><strong>${p.exp} / ${needExp}</strong></div>
    <div class="progress expbar"><span style="width:${expRatio}%"></span></div>
    <div class="kv"><span>공격력</span><strong>${d.atk}</strong></div>
    <div class="kv"><span>마법공격</span><strong>${d.matk}</strong></div>
    <div class="kv"><span>방어력</span><strong>${d.def}</strong></div>
    <div class="kv"><span>치명타 확률</span><strong>${d.critRate.toFixed(1)}%</strong></div>
    <div class="kv"><span>회피율</span><strong>${d.evasion.toFixed(1)}%</strong></div>
    <div class="kv"><span>골드</span><strong class="highlight">${p.gold}</strong></div>
    <div class="kv"><span>꿈 파편</span><strong class="highlight">${p.dreamShard}</strong></div>
  `;

  const stats = ["str", "agi", "vit", "int", "wis", "luc"];
  els.statPointsRow.textContent = `남은 스탯 포인트: ${p.statPoints}`;
  els.statList.innerHTML = stats.map(key => {
    const meta = GAME_DATA.statGrowth[key];
    return `
      <div class="stat-row">
        <strong>${meta.label}</strong>
        <div>
          <div>${p.stats[key]} <span class="small">(${meta.desc})</span></div>
        </div>
        <button ${p.statPoints <= 0 ? "disabled" : ""} onclick="addStat('${key}')">+1</button>
      </div>
    `;
  }).join("");

  els.alignmentCard.innerHTML = `
    <div class="kv"><span>Lucid</span><strong>${p.alignment.lucid}</strong></div>
    <div class="progress"><span style="width:${Math.min(100, p.alignment.lucid)}%"></span></div>
    <div class="kv"><span>Nightfall</span><strong>${p.alignment.nightfall}</strong></div>
    <div class="progress"><span style="width:${Math.min(100, p.alignment.nightfall)}%"></span></div>
    <p class="small">정화 선택은 Lucid, 흡수 선택은 Nightfall에 누적된다.</p>
  `;
}

function renderTitle() {
  els.screenTitle.textContent = "타이틀";
  els.mainScreen.innerHTML = `
    <div class="title-screen centered card">
      <div class="hero-title">DREAM ON</div>
      <p class="hero-sub">
        꿈이 현실을 침식하는 세계. 플레이어는 여명 성채의 견습 각성자로서,
        안개의 숲과 침묵 수도원, 그리고 꿈의 균열을 탐사하게 된다.
        이 프로토타입은 Github Pages에 그대로 배포 가능한 정적 웹 버전이다.
      </p>
      <div class="action-row" style="margin-top:20px; width:min(420px,100%);">
        <button class="primary" onclick="renderClassSelect()">새 게임 시작</button>
        <button onclick="tryLoadGame()">저장 불러오기</button>
        <button class="secondary" onclick="renderAbout()">구성 보기</button>
      </div>
    </div>
  `;
}

function renderAbout() {
  els.screenTitle.textContent = "구성 보기";
  els.mainScreen.innerHTML = `
    <div class="card">
      <h3>현재 포함된 요소</h3>
      <ul>
        <li>직업 3종, 지역 3개, 몬스터 6종</li>
        <li>레벨업, 스탯 분배, 로컬 저장</li>
        <li>정화 / 흡수 성향 선택</li>
        <li>퍼센트형 스탯 소프트캡/하드캡 반영</li>
        <li>온라인 확장 대비 README 포함</li>
      </ul>
      <button onclick="renderTitle()">뒤로</button>
    </div>
  `;
}

function renderClassSelect() {
  els.screenTitle.textContent = "직업 선택";
  els.mainScreen.innerHTML = `
    <div class="class-grid">
      ${GAME_DATA.classes.map(cls => `
        <div class="class-card">
          <h3>${cls.name}</h3>
          <p>${cls.description}</p>
          <div class="kv"><span>기본 HP</span><strong>${cls.base.hp}</strong></div>
          <div class="kv"><span>기본 MP</span><strong>${cls.base.mp}</strong></div>
          <div class="kv"><span>핵심 능력치</span><strong>STR ${cls.base.str} / INT ${cls.base.int} / WIS ${cls.base.wis}</strong></div>
          <button class="primary" onclick="startGame('${cls.id}')">이 클래스로 시작</button>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTown() {
  els.screenTitle.textContent = "여명 성채";
  const p = state.player;
  const inventory = p.inventory.map(item => {
    const meta = GAME_DATA.shop.find(s => s.id === item.id);
    return `<div class="badge">${meta?.name || item.id} x${item.qty}</div>`;
  }).join("") || `<span class="small">소지품 없음</span>`;

  els.mainScreen.innerHTML = `
    <div class="card">
      <h3>여명 성채</h3>
      <p>견습 각성자들이 첫 파견을 준비하는 중심 거점. 꿈의 균열에 들어가기 전, 장비와 의지를 다듬는 곳이다.</p>
      <div class="town-actions">
        <button class="primary" onclick="renderStages()">사냥터로 이동</button>
        <button onclick="restAtInn()">여관에서 휴식 (20G)</button>
        <button onclick="renderShop()">상점 이용</button>
      </div>
    </div>
    <div class="card compact">
      <h3>인벤토리</h3>
      <div>${inventory}</div>
    </div>
  `;
}

function renderShop() {
  els.screenTitle.textContent = "상점";
  els.mainScreen.innerHTML = `
    <div class="shop-grid">
      ${GAME_DATA.shop.map(item => `
        <div class="shop-item">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="kv"><span>가격</span><strong>${item.cost}G</strong></div>
          <button onclick="buyItem('${item.id}')">구매</button>
        </div>
      `).join("")}
    </div>
    <div style="margin-top:12px;"><button onclick="renderTown()">마을로 돌아가기</button></div>
  `;
}

function renderStages() {
  els.screenTitle.textContent = "사냥터 선택";
  els.mainScreen.innerHTML = `
    <div class="stage-grid">
      ${GAME_DATA.stages.map(stage => `
        <div class="stage-card">
          <h3>${stage.name}</h3>
          <div class="badge">권장 레벨 ${stage.recommended}</div>
          <p>${stage.description}</p>
          <button class="primary" onclick="enterStage('${stage.id}')">탐사 시작</button>
        </div>
      `).join("")}
    </div>
    <div style="margin-top:12px;"><button onclick="renderTown()">마을로 돌아가기</button></div>
  `;
}

function renderBattle() {
  const p = state.player;
  const e = state.enemy;
  const d = computeDerived(p);
  els.screenTitle.textContent = `${GAME_DATA.stages.find(s => s.id === state.stageId).name} 전투`;
  els.mainScreen.innerHTML = `
    <div class="battle-layout">
      <div class="monster-card">
        <h3>${p.name}</h3>
        <div class="kv"><span>HP</span><strong>${p.hp} / ${d.maxHp}</strong></div>
        <div class="progress hpbar"><span style="width:${(p.hp / d.maxHp) * 100}%"></span></div>
        <div class="kv"><span>MP</span><strong>${p.mp} / ${d.maxMp}</strong></div>
        <div class="progress mpbar"><span style="width:${(p.mp / d.maxMp) * 100}%"></span></div>
        <div class="kv"><span>공격력</span><strong>${d.atk}</strong></div>
        <div class="kv"><span>치확</span><strong>${d.critRate.toFixed(1)}%</strong></div>
      </div>
      <div class="monster-card">
        <h3>${e.name}${e.boss ? ' <span class="highlight">[BOSS]</span>' : ''}</h3>
        <div class="kv"><span>Lv</span><strong>${e.level}</strong></div>
        <div class="kv"><span>HP</span><strong>${e.hp} / ${e.maxHp}</strong></div>
        <div class="progress hpbar"><span style="width:${(e.hp / e.maxHp) * 100}%"></span></div>
        <div class="kv"><span>공격력</span><strong>${e.atk}</strong></div>
        <div class="kv"><span>방어력</span><strong>${e.def}</strong></div>
      </div>
    </div>
    <div class="card" style="margin-top:14px;">
      <div class="battle-actions">
        <button class="primary" onclick="playerAttack()">기본 공격</button>
        <button onclick="useSkill()">꿈 파쇄 (MP 15)</button>
        <button onclick="useItemPrompt()">소모품 사용</button>
        <button class="secondary" onclick="escapeBattle()">후퇴</button>
      </div>
    </div>
  `;
}

function renderReward(monster, rewards) {
  els.screenTitle.textContent = "전투 승리";
  els.mainScreen.innerHTML = `
    <div class="reward-card">
      <h3>${monster.name} 격파</h3>
      <div class="kv"><span>획득 경험치</span><strong>${rewards.exp}</strong></div>
      <div class="kv"><span>획득 골드</span><strong>${rewards.gold}</strong></div>
      <div class="kv"><span>획득 꿈 파편</span><strong>${rewards.shard}</strong></div>
      <p>파편을 어떻게 다룰지 선택해.</p>
      <div class="reward-actions">
        <button class="primary" onclick="applyRewardChoice('lucid', ${rewards.exp}, ${rewards.gold}, ${rewards.shard})">정화한다 (Lucid +10)</button>
        <button class="secondary" onclick="applyRewardChoice('nightfall', ${rewards.exp}, ${rewards.gold}, ${rewards.shard})">흡수한다 (Nightfall +10)</button>
      </div>
    </div>
  `;
}

function startGame(classId) {
  state.player = createPlayer(classId);
  state.enemy = null;
  state.stageId = null;
  addLog(`${getClassById(classId).name}로 각성했다.`);
  saveGame();
  renderAll();
  renderTown();
}

function startLoadedGame(save) {
  state.player = save.player;
  state.logs = save.logs || [];
  syncPlayerVitals();
  renderAll();
  renderTown();
  addLog(`저장 데이터를 불러왔다.`);
}

function renderAll() {
  renderPlayer();
  renderLogs();
}

function addStat(key) {
  if (!state.player || state.player.statPoints <= 0) return;
  state.player.stats[key] += 1;
  state.player.statPoints -= 1;
  syncPlayerVitals();
  addLog(`${GAME_DATA.statGrowth[key].label} 스탯이 1 증가했다.`);
  saveGame();
  renderPlayer();
}
window.addStat = addStat;

function enterStage(stageId) {
  state.stageId = stageId;
  const stage = GAME_DATA.stages.find(s => s.id === stageId);
  const pick = stage.monsters[Math.floor(Math.random() * stage.monsters.length)];
  const enemy = getMonster(pick);
  enemy.maxHp = enemy.hp;
  state.enemy = enemy;
  addLog(`${stage.name}에서 ${enemy.name}와 조우했다.`);
  renderBattle();
}
window.enterStage = enterStage;

function calcDamage(attackerAtk, defenderDef, critChance = 0) {
  let dmg = Math.max(1, attackerAtk - defenderDef + Math.floor(Math.random() * 5));
  if (Math.random() * 100 < critChance) dmg = Math.floor(dmg * 1.6);
  return dmg;
}

function enemyTurn() {
  if (!state.enemy || !state.player) return;
  const p = state.player;
  const d = computeDerived(p);
  if (Math.random() * 100 < d.evasion) {
    addLog(`적의 공격을 회피했다.`);
    return;
  }
  const dmg = calcDamage(state.enemy.atk, d.def, 0);
  p.hp = Math.max(0, p.hp - dmg);
  addLog(`${state.enemy.name}의 공격! ${dmg} 피해.`);
  if (p.hp <= 0) {
    p.hp = Math.max(1, Math.floor(d.maxHp * 0.25));
    p.mp = Math.max(0, p.mp - 10);
    addLog(`의식을 잃기 직전 여명 성채로 후퇴했다.`);
    state.enemy = null;
    saveGame();
    renderAll();
    renderTown();
    return;
  }
}

function playerAttack() {
  if (!state.enemy || !state.player) return;
  const p = state.player;
  const d = computeDerived(p);
  const dmg = calcDamage(d.atk, state.enemy.def, d.critRate);
  state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
  addLog(`${state.enemy.name}에게 ${dmg} 피해를 입혔다.`);
  if (state.enemy.hp <= 0) return handleVictory();
  enemyTurn();
  saveGame();
  renderAll();
  if (state.enemy) renderBattle();
}
window.playerAttack = playerAttack;

function useSkill() {
  if (!state.enemy || !state.player) return;
  const p = state.player;
  const d = computeDerived(p);
  if (p.mp < 15) {
    addLog(`MP가 부족하다.`);
    return;
  }
  p.mp -= 15;
  const dmg = calcDamage(d.matk + 8, state.enemy.def, Math.min(100, d.critRate + 10));
  state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
  addLog(`꿈 파쇄 발동! ${dmg} 피해.`);
  if (state.enemy.hp <= 0) return handleVictory();
  enemyTurn();
  saveGame();
  renderAll();
  if (state.enemy) renderBattle();
}
window.useSkill = useSkill;

function handleVictory() {
  const m = state.enemy;
  state.enemy = null;
  const rewards = { exp: m.exp, gold: m.gold, shard: m.shard };
  addLog(`${m.name}을(를) 쓰러뜨렸다.`);
  renderReward(m, rewards);
}

function applyRewardChoice(type, exp, gold, shard) {
  const p = state.player;
  p.exp += exp;
  p.gold += gold;
  p.dreamShard += shard;
  p.alignment[type] += 10;

  let leveled = 0;
  while (p.exp >= getLevelExp(p.level)) {
    p.exp -= getLevelExp(p.level);
    p.level += 1;
    p.statPoints += 4;
    leveled += 1;
  }
  syncPlayerVitals();
  p.hp = Math.min(p.maxHp, p.hp + 20);
  p.mp = Math.min(p.maxMp, p.mp + 10);
  if (type === "lucid") addLog(`파편을 정화했다. Lucid가 증가했다.`);
  else addLog(`파편을 흡수했다. Nightfall이 증가했다.`);
  addLog(`보상 획득: EXP ${exp}, 골드 ${gold}, 꿈 파편 ${shard}.`);
  if (leveled > 0) addLog(`레벨 업! 현재 레벨 ${p.level}, 스탯 포인트 +${leveled * 4}.`);
  saveGame();
  renderAll();
  renderTown();
}
window.applyRewardChoice = applyRewardChoice;

function restAtInn() {
  const p = state.player;
  if (!p) return;
  if (p.gold < 20) {
    addLog(`골드가 부족하다.`);
    return;
  }
  p.gold -= 20;
  const d = computeDerived(p);
  p.hp = d.maxHp;
  p.mp = d.maxMp;
  p.battleBuff.atk = 0;
  addLog(`여관에서 휴식했다. HP/MP가 회복되었다.`);
  saveGame();
  renderAll();
  renderTown();
}
window.restAtInn = restAtInn;

function findInventoryItem(id) {
  return state.player.inventory.find(item => item.id === id);
}

function buyItem(id) {
  const item = GAME_DATA.shop.find(s => s.id === id);
  const p = state.player;
  if (!item || !p) return;
  if (p.gold < item.cost) {
    addLog(`골드가 부족해 ${item.name}을(를) 살 수 없다.`);
    return;
  }
  p.gold -= item.cost;
  const inv = findInventoryItem(id);
  if (inv) inv.qty += 1;
  else p.inventory.push({ id, qty: 1 });
  addLog(`${item.name}을(를) 구매했다.`);
  saveGame();
  renderAll();
  renderShop();
}
window.buyItem = buyItem;

function consumeItem(id) {
  const inv = findInventoryItem(id);
  if (!inv || inv.qty <= 0) return false;
  inv.qty -= 1;
  if (inv.qty === 0) state.player.inventory = state.player.inventory.filter(i => i.qty > 0);
  return true;
}

function useItemPrompt() {
  const p = state.player;
  const available = p.inventory.filter(i => i.qty > 0);
  if (!available.length) {
    addLog(`사용 가능한 소모품이 없다.`);
    return;
  }
  const menu = available.map((i, idx) => {
    const meta = GAME_DATA.shop.find(s => s.id === i.id);
    return `${idx + 1}. ${meta.name} x${i.qty}`;
  }).join("\n");
  const input = prompt(`사용할 아이템 번호를 입력해.\n${menu}`);
  const chosen = available[Number(input) - 1];
  if (!chosen) return;
  const meta = GAME_DATA.shop.find(s => s.id === chosen.id);
  if (!consumeItem(chosen.id)) return;
  if (meta.effect === "hp") state.player.hp = Math.min(state.player.maxHp, state.player.hp + meta.value);
  if (meta.effect === "mp") state.player.mp = Math.min(state.player.maxMp, state.player.mp + meta.value);
  if (meta.effect === "atkBuff") state.player.battleBuff.atk += meta.value;
  addLog(`${meta.name} 사용.`);
  enemyTurn();
  saveGame();
  renderAll();
  if (state.enemy) renderBattle();
}
window.useItemPrompt = useItemPrompt;

function escapeBattle() {
  if (!state.enemy) return;
  addLog(`${state.enemy.name}에게서 후퇴했다.`);
  state.enemy = null;
  saveGame();
  renderAll();
  renderTown();
}
window.escapeBattle = escapeBattle;

function saveGame() {
  const payload = { player: state.player, logs: state.logs };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

function tryLoadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    addLog(`저장된 데이터가 없다.`);
    return renderTitle();
  }
  try {
    const save = JSON.parse(raw);
    startLoadedGame(save);
  } catch {
    addLog(`저장 데이터가 손상되었다.`);
    renderTitle();
  }
}
window.tryLoadGame = tryLoadGame;

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state.player = null;
  state.enemy = null;
  state.stageId = null;
  state.logs = [];
  renderAll();
  renderTitle();
}

els.saveBtn.addEventListener("click", () => {
  if (!state.player) return addLog(`아직 저장할 캐릭터가 없다.`);
  saveGame();
  addLog(`게임을 저장했다.`);
});

els.resetBtn.addEventListener("click", () => {
  if (confirm("저장 데이터를 초기화할까?")) resetGame();
});

renderAll();
renderTitle();

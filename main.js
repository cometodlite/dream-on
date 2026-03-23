const STORAGE_KEY = 'dream_on_text_web_rpg_save_v1';
const $ = (id) => document.getElementById(id);

const state = {
  player: null,
  scene: 'title',
  location: '여명 성채',
  log: []
};

function addLog(text) {
  state.log.unshift(`[${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}] ${text}`);
  state.log = state.log.slice(0, 30);
}

function levelRequirement(level) {
  return 30 + level * level * 12;
}

function getDerivedStats(player) {
  const base = structuredClone(player.stats);
  const bonuses = { STR: 0, AGI: 0, VIT: 0, INT: 0, WIS: 0, LUC: 0 };
  Object.values(player.equipment).forEach((itemId) => {
    if (!itemId) return;
    const item = GAME_DATA.items[itemId];
    if (!item || !item.bonus) return;
    for (const [k, v] of Object.entries(item.bonus)) bonuses[k] += v;
  });
  const total = Object.fromEntries(Object.keys(base).map((k) => [k, base[k] + bonuses[k]]));
  return {
    total,
    maxHp: player.baseHp + total.VIT * 18,
    maxMp: player.baseMp + total.WIS * 10,
    atk: total.STR * 2 + total.INT,
    matk: total.INT * 2 + total.WIS,
    crit: Math.min(50, total.LUC * 0.5),
    dodge: Math.min(45, total.AGI * 0.7)
  };
}

function createPlayer(jobId) {
  const job = GAME_DATA.jobs[jobId];
  state.player = {
    name: job.name + ' 계승자',
    jobId,
    level: 1,
    exp: 0,
    gold: 40,
    dreamShard: 0,
    lucid: 50,
    nightfall: 0,
    statPoints: 0,
    baseHp: job.hp,
    baseMp: job.mp,
    hp: job.hp,
    mp: job.mp,
    stats: structuredClone(job.stats),
    inventory: { potion: 2, ether: 1 },
    equipment: { weapon: null, accessory: null },
    questProgress: { forest1: 0, abbey1: 0 },
    questClaimed: { forest1: false, abbey1: false },
    battleWins: { forest: 0, abbey: 0 }
  };
  state.location = '여명 성채';
  state.scene = 'town';
  addLog(`${job.name}로 각성했다. ${job.skill}을 사용할 수 있다.`);
  render();
}

function healToFull() {
  const d = getDerivedStats(state.player);
  state.player.hp = d.maxHp;
  state.player.mp = d.maxMp;
}

function gainRewards(exp, gold, shard) {
  const p = state.player;
  p.exp += exp;
  p.gold += gold;
  p.dreamShard += shard;
  while (p.exp >= levelRequirement(p.level)) {
    p.exp -= levelRequirement(p.level);
    p.level += 1;
    p.statPoints += 4;
    addLog(`레벨 ${p.level} 달성. 스탯 포인트 4 획득.`);
    const d = getDerivedStats(p);
    p.hp = d.maxHp;
    p.mp = d.maxMp;
  }
}

function updateQuest(area) {
  const p = state.player;
  if (area === 'forest') {
    p.questProgress.forest1 = Math.min(3, p.questProgress.forest1 + 1);
    p.battleWins.forest += 1;
  }
  if (area === 'abbey') {
    p.questProgress.abbey1 = Math.min(2, p.questProgress.abbey1 + 1);
    p.battleWins.abbey += 1;
  }
}

function doBattle(monsterId, area) {
  const p = state.player;
  const m = structuredClone(GAME_DATA.monsters[monsterId]);
  const d = getDerivedStats(p);
  let playerHp = p.hp;
  let playerMp = p.mp;
  let monsterHp = m.hp;
  addLog(`${m.name}과(와) 조우했다.`);

  while (playerHp > 0 && monsterHp > 0) {
    const attackPower = p.jobId === 'warlock' ? d.matk : d.atk;
    let damage = Math.max(4, attackPower + Math.floor(Math.random() * 6) - 1);
    if (Math.random() * 100 < d.crit) damage = Math.floor(damage * 1.5);
    monsterHp -= damage;
    addLog(`너의 공격! ${m.name}에게 ${damage} 피해.`);
    if (monsterHp <= 0) break;

    const dodge = Math.random() * 100 < d.dodge;
    if (dodge) {
      addLog(`${m.name}의 공격을 회피했다.`);
      continue;
    }
    const enemyDamage = Math.max(3, m.attack + Math.floor(Math.random() * 5) - Math.floor(d.total.VIT / 3));
    playerHp -= enemyDamage;
    addLog(`${m.name}의 공격! ${enemyDamage} 피해를 입었다.`);
  }

  p.hp = Math.max(1, playerHp);
  p.mp = playerMp;

  if (playerHp <= 0) {
    p.hp = Math.max(1, Math.floor(getDerivedStats(p).maxHp * 0.35));
    p.mp = Math.max(0, Math.floor(getDerivedStats(p).maxMp * 0.35));
    p.gold = Math.max(0, p.gold - 10);
    p.nightfall = Math.min(100, p.nightfall + 8);
    p.lucid = Math.max(0, p.lucid - 5);
    state.location = '여명 성채';
    state.scene = 'town';
    addLog(`패배했다. 여명 성채로 후퇴했다. 골드 10 잃음.`);
    render();
    return;
  }

  addLog(`${m.name}을(를) 쓰러뜨렸다. EXP ${m.exp}, 골드 ${m.gold}, 꿈 파편 ${m.shard} 획득.`);
  gainRewards(m.exp, m.gold, m.shard);
  updateQuest(area);

  if (p.jobId === 'priest') {
    p.lucid = Math.min(100, p.lucid + 4);
    p.nightfall = Math.max(0, p.nightfall - 1);
  } else if (p.jobId === 'warlock') {
    p.nightfall = Math.min(100, p.nightfall + 4);
    p.lucid = Math.max(0, p.lucid - 1);
  } else {
    p.lucid = Math.min(100, p.lucid + 2);
  }

  if (m.boss) {
    addLog('보스를 쓰러뜨렸다. 정화와 흡수 사이의 갈림길이 열렸다.');
    state.scene = 'bossChoice';
  }
  render();
}

function claimQuest(id) {
  const q = GAME_DATA.quests.find((x) => x.id === id);
  const p = state.player;
  if (!q || p.questClaimed[id] || p.questProgress[id] < q.target) return;
  p.questClaimed[id] = true;
  gainRewards(q.rewardExp, q.rewardGold, 0);
  addLog(`퀘스트 완료: ${q.name}. 보상 획득.`);
  render();
}

function buyItem(id) {
  const p = state.player;
  const item = GAME_DATA.items[id];
  if (!item || p.gold < item.price) return;
  p.gold -= item.price;
  if (item.type === 'weapon') p.equipment.weapon = id;
  else if (item.type === 'accessory') p.equipment.accessory = id;
  else p.inventory[id] = (p.inventory[id] || 0) + 1;
  addLog(`${item.name} 구매 완료.`);
  render();
}

function useItem(id) {
  const p = state.player;
  if (!p.inventory[id]) return;
  const item = GAME_DATA.items[id];
  const d = getDerivedStats(p);
  if (item.heal) p.hp = Math.min(d.maxHp, p.hp + item.heal);
  if (item.mana) p.mp = Math.min(d.maxMp, p.mp + item.mana);
  p.inventory[id] -= 1;
  if (p.inventory[id] <= 0) delete p.inventory[id];
  addLog(`${item.name} 사용.`);
  render();
}

function allocateStat(stat) {
  const p = state.player;
  if (!p || p.statPoints <= 0) return;
  p.stats[stat] += 1;
  p.statPoints -= 1;
  const d = getDerivedStats(p);
  p.hp = Math.min(d.maxHp, p.hp + 10);
  p.mp = Math.min(d.maxMp, p.mp + 5);
  render();
}

function saveGame() {
  if (!state.player) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ player: state.player, scene: state.scene, location: state.location, log: state.log }));
  addLog('저장 완료.');
  render();
}

function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const save = JSON.parse(raw);
  state.player = save.player;
  state.scene = save.scene || 'town';
  state.location = save.location || '여명 성채';
  state.log = save.log || [];
  addLog('저장 데이터를 불러왔다.');
  render();
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  state.player = null;
  state.scene = 'title';
  state.location = '여명 성채';
  state.log = [];
  render();
}

function renderStatus() {
  const box = $('status');
  const controls = $('statControls');
  if (!state.player) {
    box.innerHTML = '<p class="muted">아직 각성하지 않았다.</p>';
    controls.innerHTML = '';
    return;
  }
  const p = state.player;
  const d = getDerivedStats(p);
  box.innerHTML = `
    <div class="card">
      <div><strong>${GAME_DATA.jobs[p.jobId].name}</strong> / Lv.${p.level}</div>
      <div class="resource-row"><span>HP</span><span>${p.hp} / ${d.maxHp}</span></div>
      <div class="resource-row"><span>MP</span><span>${p.mp} / ${d.maxMp}</span></div>
      <div class="resource-row"><span>EXP</span><span>${p.exp} / ${levelRequirement(p.level)}</span></div>
      <div class="resource-row"><span class="gold">골드</span><span class="gold">${p.gold}</span></div>
      <div class="resource-row"><span>꿈 파편</span><span>${p.dreamShard}</span></div>
      <div class="resource-row"><span class="lucid">Lucid</span><span class="lucid">${p.lucid}</span></div>
      <div class="resource-row"><span class="nightfall">Nightfall</span><span class="nightfall">${p.nightfall}</span></div>
      <div class="resource-row"><span>가용 포인트</span><span>${p.statPoints}</span></div>
    </div>
    <div class="card">
      ${Object.entries(d.total).map(([k,v]) => `<div class="stat-row"><span>${k}</span><span>${v}</span></div>`).join('')}
    </div>
  `;
  controls.innerHTML = Object.keys(p.stats).map((s) => `
    <div class="stat-row">
      <span>${s}</span>
      <button class="small" onclick="allocateStat('${s}')">+1</button>
    </div>`).join('');
}

function renderQuests() {
  const p = state.player;
  if (!p) { $('questBox').innerHTML = '<p class="muted">퀘스트 없음</p>'; return; }
  $('questBox').innerHTML = GAME_DATA.quests.map((q) => {
    const done = p.questProgress[q.id] >= q.target;
    const claimed = p.questClaimed[q.id];
    return `<div class="card quest-row"><div>
      <div><strong>${q.name}</strong></div>
      <div class="muted">${q.goal}</div>
      <div>${p.questProgress[q.id]} / ${q.target}</div>
    </div><div>${done && !claimed ? `<button class="small" onclick="claimQuest('${q.id}')">보상 수령</button>` : claimed ? '완료' : '진행 중'}</div></div>`;
  }).join('');
}

function renderEquipment() {
  const p = state.player;
  if (!p) { $('equipmentBox').innerHTML = '<p class="muted">장비 없음</p>'; return; }
  $('equipmentBox').innerHTML = `<div class="card">
    <div class="equip-row"><span>무기</span><span>${p.equipment.weapon ? GAME_DATA.items[p.equipment.weapon].name : '없음'}</span></div>
    <div class="equip-row"><span>장신구</span><span>${p.equipment.accessory ? GAME_DATA.items[p.equipment.accessory].name : '없음'}</span></div>
  </div>`;
}

function renderInventory() {
  const p = state.player;
  if (!p) { $('inventoryBox').innerHTML = '<p class="muted">인벤토리 없음</p>'; return; }
  const entries = Object.entries(p.inventory);
  $('inventoryBox').innerHTML = entries.length ? entries.map(([id, qty]) => `
    <div class="card item-row"><div>${GAME_DATA.items[id].name} x${qty}</div><div><button class="small" onclick="useItem('${id}')">사용</button></div></div>
  `).join('') : '<p class="muted">비어 있음</p>';
}

function setStory(title, text, actions) {
  $('sceneTitle').textContent = title;
  $('story').textContent = text;
  $('actions').innerHTML = actions.map((a) => `<button onclick="${a.fn}">${a.label}</button>`).join('');
}

function renderScene() {
  if (!state.player) {
    setStory('각성의 문턱', '당신은 희미한 달빛 아래, 이름 없는 꿈의 회랑에 서 있다. 어떤 힘으로 깨어날 것인가?', [
      { label: '몽검사 선택', fn: `createPlayer('sword')` },
      { label: '성흔사제 선택', fn: `createPlayer('priest')` },
      { label: '악몽술사 선택', fn: `createPlayer('warlock')` }
    ]);
    return;
  }

  if (state.scene === 'town') {
    setStory('여명 성채', '푸른 달빛이 내려앉은 성채는 조용하지만 불안하다. 성문 밖에는 안개의 숲이, 북쪽에는 침묵 수도원이 기다린다.', [
      { label: '휴식', fn: 'healToFull(); addLog("휴식을 취해 회복했다."); render();' },
      { label: '안개의 숲 탐험', fn: `state.scene='forest'; state.location='안개의 숲'; render();` },
      { label: '침묵 수도원 진입', fn: `state.scene='abbey'; state.location='침묵 수도원'; render();` },
      { label: '상점 열기', fn: `state.scene='shop'; render();` },
      { label: '보스 추적', fn: `state.scene='boss'; render();` }
    ]);
  } else if (state.scene === 'forest') {
    setStory('안개의 숲', '검은 나무 줄기 사이로 보랏빛 안개가 흐른다. 발밑에서는 발광 이끼가 희미하게 빛난다.', [
      { label: '안개쥐와 전투', fn: `doBattle('mistRat','forest')` },
      { label: '몽충과 전투', fn: `doBattle('dreamBug','forest')` },
      { label: '뒤틀린 까마귀와 전투', fn: `doBattle('twistedCrow','forest')` },
      { label: '성채로 복귀', fn: `state.scene='town'; state.location='여명 성채'; render();` }
    ]);
  } else if (state.scene === 'abbey') {
    setStory('침묵 수도원', '깨진 스테인드글라스 사이로 차가운 빛이 쏟아진다. 성가는 사라졌고, 기도만 남아 메아리친다.', [
      { label: '공허한 병사와 전투', fn: `doBattle('hollowSoldier','abbey')` },
      { label: '기도하는 인형과 전투', fn: `doBattle('prayerDoll','abbey')` },
      { label: '성채로 복귀', fn: `state.scene='town'; state.location='여명 성채'; render();` }
    ]);
  } else if (state.scene === 'shop') {
    setStory('성채 상점', '성채의 상인은 꿈의 파편과 잔광을 모아 장비를 다듬는다.', [
      { label: `회복약 구매 (18G)`, fn: `buyItem('potion')` },
      { label: `명상 약병 구매 (24G)`, fn: `buyItem('ether')` },
      { label: `은빛 단검 구매 (50G)`, fn: `buyItem('shortBlade')` },
      { label: `성흔 부적 구매 (55G)`, fn: `buyItem('prayerCharm')` },
      { label: `황혼의 서 구매 (60G)`, fn: `buyItem('duskTome')` },
      { label: '성채로 돌아가기', fn: `state.scene='town'; render();` }
    ]);
  } else if (state.scene === 'boss') {
    setStory('울음의 자취', '숲 깊은 곳에서 길고 낮은 울음이 들린다. 공포와 연민이 동시에 밀려든다.', [
      { label: '울음을 먹는 늑대 추적', fn: `doBattle('bossWolf','forest')` },
      { label: '돌아가기', fn: `state.scene='town'; render();` }
    ]);
  } else if (state.scene === 'bossChoice') {
    setStory('갈림길', '쓰러진 늑대의 몸에서 꿈의 잔광과 검은 균열이 함께 흘러나온다. 정화할 것인가, 흡수할 것인가.', [
      { label: '정화한다', fn: `state.player.lucid=Math.min(100,state.player.lucid+12); state.player.nightfall=Math.max(0,state.player.nightfall-4); addLog('정화를 선택했다. 맑은 파편이 손에 남았다.'); state.scene='town'; render();` },
      { label: '흡수한다', fn: `state.player.nightfall=Math.min(100,state.player.nightfall+12); state.player.dreamShard+=3; addLog('흡수를 선택했다. 검은 잔광이 가슴에 스며들었다.'); state.scene='town'; render();` }
    ]);
  }
}

function renderLog() {
  $('log').textContent = state.log.join('\n');
}

function render() {
  renderStatus();
  renderQuests();
  renderEquipment();
  renderInventory();
  renderScene();
  renderLog();
}

document.addEventListener('DOMContentLoaded', () => {
  $('saveBtn').addEventListener('click', saveGame);
  $('loadBtn').addEventListener('click', loadGame);
  $('resetBtn').addEventListener('click', resetGame);
  render();
});

window.createPlayer = createPlayer;
window.allocateStat = allocateStat;
window.claimQuest = claimQuest;
window.buyItem = buyItem;
window.useItem = useItem;
window.state = state;
window.render = render;
window.healToFull = healToFull;
window.addLog = addLog;
window.doBattle = doBattle;

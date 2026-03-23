const gameState = {
  player: {
    hp: 100,
    maxHp: 100,
    atk: 15,
    def: 5,
    crit: 0.2,
    evade: 0.1,
    lucid: 0,
    nightfall: 0
  },
  currentMonster: null,
  inBattle: false
};

const monsterData = {
  name: "몽충",
  hp: 60,
  maxHp: 60,
  atk: 10,
  def: 3,
  evade: 0.05
};

function log(text) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML += "<p>" + text + "</p>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

function calcDamage(atk, def) {
  return Math.max(1, (atk - def) * (0.9 + Math.random() * 0.2));
}

function startTestBattle() {
  startBattle(monsterData);
}

function startBattle(monster) {
  gameState.inBattle = true;
  gameState.currentMonster = JSON.parse(JSON.stringify(monster));

  log("⚔️ 전투 시작!");
  renderBattleUI();
}

function renderBattleUI() {
  const m = gameState.currentMonster;

  document.getElementById("battle").innerHTML = `
    <h3>${m.name}</h3>
    <p>HP: ${m.hp} / ${m.maxHp}</p>

    <button onclick="playerAttack()">공격</button>
    <button onclick="useSkill(1)">연속 베기</button>
    <button onclick="useSkill(2)">정신 집중</button>
    <button onclick="useSkill(3)">악몽 해방</button>
  `;
}

function playerAttack() {
  const p = gameState.player;
  const m = gameState.currentMonster;

  let dmg = calcDamage(p.atk, m.def);

  if (Math.random() < p.crit) {
    dmg *= 1.5;
    log("💥 크리티컬!");
  }

  if (Math.random() < m.evade) {
    log("❌ 몬스터 회피!");
    dmg = 0;
  }

  m.hp -= Math.floor(dmg);
  log("🗡️ " + Math.floor(dmg) + " 피해");

  if (m.hp <= 0) return winBattle();

  monsterTurn();
}

function useSkill(type) {
  const p = gameState.player;
  const m = gameState.currentMonster;

  if (type === 1) {
    log("⚔️ 연속 베기!");
    m.hp -= Math.floor(calcDamage(p.atk, m.def) * 1.5);
  }

  if (type === 2) {
    log("🧠 Lucid 증가");
    p.lucid += 10;
  }

  if (type === 3) {
    log("🌙 Nightfall 증가 + 공격");
    p.nightfall += 10;
    m.hp -= Math.floor(calcDamage(p.atk * 1.3, m.def));
  }

  if (m.hp <= 0) return winBattle();

  monsterTurn();
}

function monsterTurn() {
  const p = gameState.player;
  const m = gameState.currentMonster;

  let dmg = calcDamage(m.atk, p.def);

  if (Math.random() < p.evade) {
    log("💨 회피!");
    dmg = 0;
  }

  p.hp -= Math.floor(dmg);
  log("👹 " + Math.floor(dmg) + " 피해 받음");

  if (p.hp <= 0) return loseBattle();

  renderBattleUI();
}

function winBattle() {
  log("🏆 승리!");
  gameState.inBattle = false;
}

function loseBattle() {
  log("💀 패배...");
  gameState.inBattle = false;
}

const gameState = {
  player: {
    hp: 100,
    maxHp: 100,
    atk: 15,
    def: 5,
    crit: 0.2,
    evade: 0.1,
    lucid: 0,
    nightfall: 0,
    exp: 0,
    gold: 0
  },
  monster: null
};

const monsterTemplate = {
  name: "몽충",
  hp: 60,
  maxHp: 60,
  atk: 10,
  def: 3,
  evade: 0.05
};

function log(t) {
  const l = document.getElementById("log");
  l.innerHTML += "<p>" + t + "</p>";
  l.scrollTop = l.scrollHeight;
}

function updateStats() {
  const p = gameState.player;
  document.getElementById("stats").innerHTML =
    `HP: ${p.hp}/${p.maxHp} | Lucid: ${p.lucid} | Nightfall: ${p.nightfall} | EXP: ${p.exp} | GOLD: ${p.gold}`;
}

function calcDamage(a, d) {
  return Math.max(1, (a - d) * (0.9 + Math.random()*0.2));
}

function startBattle() {
  gameState.monster = JSON.parse(JSON.stringify(monsterTemplate));
  log("⚔️ 전투 시작!");
  renderBattle();
  updateStats();
}

function renderBattle() {
  const m = gameState.monster;
  document.getElementById("battle").innerHTML = `
    <h3>${m.name}</h3>
    <p>HP: ${m.hp}/${m.maxHp}</p>
    <button onclick="attack()">공격</button>
    <button onclick="skill1()">연속베기</button>
    <button onclick="skill2()">정신집중</button>
    <button onclick="skill3()">악몽해방</button>
  `;
}

function attack() {
  const p = gameState.player;
  const m = gameState.monster;

  let dmg = calcDamage(p.atk, m.def);

  if (Math.random() < p.crit) {
    dmg *= 1.5;
    log("💥 크리티컬!");
  }

  if (Math.random() < m.evade) {
    log("❌ 몬스터 회피!");
    dmg = 0;
  }

  dmg = Math.floor(dmg);
  m.hp -= dmg;
  log("🗡️ " + dmg + " 피해");

  if (m.hp <= 0) return win();

  enemyTurn();
}

function skill1() {
  const p = gameState.player;
  const m = gameState.monster;

  let dmg = calcDamage(p.atk*0.8, m.def) + calcDamage(p.atk*0.8, m.def);
  m.hp -= Math.floor(dmg);
  log("⚔️ 연속 베기!");

  if (m.hp <= 0) return win();

  enemyTurn();
}

function skill2() {
  gameState.player.lucid += 5;
  log("🧠 Lucid 증가");

  enemyTurn();
}

function skill3() {
  const p = gameState.player;
  const m = gameState.monster;

  let dmg = calcDamage(p.atk*(1+p.nightfall/100), m.def);
  m.hp -= Math.floor(dmg);
  p.nightfall += 5;

  log("🌙 악몽 해방!");

  if (m.hp <= 0) return win();

  enemyTurn();
}

function enemyTurn() {
  const p = gameState.player;
  const m = gameState.monster;

  let dmg = calcDamage(m.atk, p.def);

  if (Math.random() < p.evade) {
    log("💨 회피!");
    dmg = 0;
  }

  p.hp -= Math.floor(dmg);
  log("👹 " + Math.floor(dmg) + " 피해 받음");

  if (p.hp <= 0) return lose();

  renderBattle();
  updateStats();
}

function win() {
  const p = gameState.player;
  log("🏆 승리!");

  p.exp += 10;
  p.gold += 5;

  // 선택 시스템
  log("👉 선택: 정화 / 흡수");

  document.getElementById("battle").innerHTML = `
    <button onclick="purify()">정화</button>
    <button onclick="absorb()">흡수</button>
  `;

  updateStats();
}

function purify() {
  gameState.player.lucid += 10;
  log("✨ 정화 선택 (Lucid 증가)");
  endBattle();
}

function absorb() {
  gameState.player.nightfall += 10;
  gameState.player.gold += 10;
  log("🌑 흡수 선택 (Nightfall + 추가 보상)");
  endBattle();
}

function endBattle() {
  log("전투 종료");
  document.getElementById("battle").innerHTML = "";
  updateStats();
}

function lose() {
  log("💀 패배...");
  gameState.player.hp = gameState.player.maxHp;
  endBattle();
}

window.GAME_DATA = {
  classes: [
    {
      id: "dreamblade",
      name: "몽검사",
      description: "꿈의 파편을 검에 응집해 정면 돌파하는 전사형 클래스.",
      base: { str: 8, agi: 6, vit: 7, int: 3, wis: 3, luc: 3, hp: 130, mp: 35 }
    },
    {
      id: "dreadmage",
      name: "악몽술사",
      description: "침잠과 공포를 다루며 악몽을 힘으로 바꾸는 마도형 클래스.",
      base: { str: 3, agi: 4, vit: 4, int: 9, wis: 7, luc: 3, hp: 90, mp: 80 }
    },
    {
      id: "starseer",
      name: "성흔사제",
      description: "정화와 회복, 결계를 사용해 전황을 안정화하는 지원형 클래스.",
      base: { str: 4, agi: 4, vit: 5, int: 7, wis: 9, luc: 3, hp: 100, mp: 90 }
    }
  ],
  statGrowth: {
    str: { label: "STR", desc: "물리 공격 +2", apply: s => ({ atk: s * 2 }) },
    agi: { label: "AGI", desc: "회피·속도 증가", apply: s => ({ evasion: s * 1.2, speed: s * 0.8 }) },
    vit: { label: "VIT", desc: "HP +18, 방어 +1", apply: s => ({ hp: s * 18, def: s }) },
    int: { label: "INT", desc: "마법 공격 +2", apply: s => ({ matk: s * 2 }) },
    wis: { label: "WIS", desc: "MP +10, 회복력 증가", apply: s => ({ mp: s * 10, regen: s * 0.5 }) },
    luc: { label: "LUC", desc: "치확·드랍 증가", apply: s => ({ critRate: s * 0.8, dropRate: s * 1.2 }) }
  },
  caps: {
    statusResist: { soft: 40, hard: 75 },
    bossStatusResist: { soft: 30, hard: 50 },
    evasion: { soft: 20, hard: 45 },
    critRate: { soft: 25, hard: 50 },
    attackSpeed: { soft: 20, hard: 50 },
    cooldownReduction: { soft: 15, hard: 35 },
    damageReduction: { soft: 20, hard: 50 },
    dropRate: { soft: 30, hard: 100 },
    goldRate: { soft: 50, hard: 200 }
  },
  stages: [
    {
      id: "mist_forest",
      name: "안개의 숲",
      recommended: 1,
      description: "여명 성채 근처에 펼쳐진 뒤틀린 숲. 악몽이 가장 먼저 스며드는 장소.",
      monsters: ["mist_rat", "dusk_crow"]
    },
    {
      id: "silent_monastery",
      name: "침묵 수도원",
      recommended: 3,
      description: "기록이 지워진 기도문만 남은 폐허. 침묵과 공포가 쌓여 있다.",
      monsters: ["bound_monk", "night_choir"]
    },
    {
      id: "dream_crack",
      name: "꿈의 균열",
      recommended: 5,
      description: "꿈과 악몽이 직접 맞닿는 공간. 정화냐 흡수냐가 생존을 가른다.",
      monsters: ["shard_hound", "weeping_wolf"]
    }
  ],
  monsters: {
    mist_rat: { name: "안개쥐", level: 1, hp: 45, atk: 8, def: 2, exp: 20, gold: 12, shard: 1, boss: false },
    dusk_crow: { name: "뒤틀린 까마귀", level: 2, hp: 58, atk: 10, def: 3, exp: 28, gold: 17, shard: 1, boss: false },
    bound_monk: { name: "속박된 수도사", level: 3, hp: 85, atk: 13, def: 5, exp: 45, gold: 26, shard: 2, boss: false },
    night_choir: { name: "나이트 콰이어", level: 4, hp: 104, atk: 16, def: 6, exp: 60, gold: 35, shard: 2, boss: false },
    shard_hound: { name: "파편 사냥개", level: 5, hp: 140, atk: 20, def: 8, exp: 85, gold: 52, shard: 3, boss: false },
    weeping_wolf: { name: "울음을 먹는 늑대", level: 6, hp: 220, atk: 26, def: 10, exp: 140, gold: 90, shard: 6, boss: true }
  },
  shop: [
    { id: "potion", name: "희미한 회복 물약", cost: 40, effect: "hp", value: 60, desc: "HP를 60 회복한다." },
    { id: "ether", name: "옅은 에테르", cost: 50, effect: "mp", value: 40, desc: "MP를 40 회복한다." },
    { id: "blade_oil", name: "꿈칼날 오일", cost: 90, effect: "atkBuff", value: 4, desc: "다음 전투에서 공격력 +4." }
  ],
  expTable: [0, 100, 180, 280, 410, 580, 790, 1050, 1370, 1760, 2230]
};

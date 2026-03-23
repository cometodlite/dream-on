window.GAME_DATA = {
  jobs: {
    sword: {
      id: 'sword',
      name: '몽검사',
      description: '균형형 근접 전사. 안정적인 생존력과 전투 지속력이 강점.',
      stats: { STR: 6, AGI: 4, VIT: 6, INT: 2, WIS: 3, LUC: 3 },
      hp: 110,
      mp: 30,
      skill: '달빛 베기'
    },
    priest: {
      id: 'priest',
      name: '성흔사제',
      description: '정화와 회복에 강한 지원형. Lucid 관리가 쉬움.',
      stats: { STR: 2, AGI: 3, VIT: 4, INT: 5, WIS: 7, LUC: 3 },
      hp: 90,
      mp: 50,
      skill: '정화의 성광'
    },
    warlock: {
      id: 'warlock',
      name: '악몽술사',
      description: '위험하지만 강력한 공격형. Nightfall 수치 조절이 중요.',
      stats: { STR: 2, AGI: 4, VIT: 3, INT: 8, WIS: 4, LUC: 3 },
      hp: 80,
      mp: 65,
      skill: '심연 파열'
    }
  },
  monsters: {
    mistRat: { name: '안개쥐', level: 1, hp: 34, attack: 7, exp: 12, gold: 5, shard: 1 },
    dreamBug: { name: '몽충', level: 1, hp: 28, attack: 6, exp: 11, gold: 4, shard: 1 },
    twistedCrow: { name: '뒤틀린 까마귀', level: 2, hp: 42, attack: 9, exp: 18, gold: 8, shard: 2 },
    hollowSoldier: { name: '공허한 병사', level: 3, hp: 56, attack: 12, exp: 25, gold: 12, shard: 3 },
    prayerDoll: { name: '기도하는 인형', level: 4, hp: 70, attack: 15, exp: 35, gold: 16, shard: 4 },
    bossWolf: { name: '울음을 먹는 늑대', level: 5, hp: 120, attack: 18, exp: 70, gold: 30, shard: 8, boss: true }
  },
  items: {
    potion: { name: '회복약', type: 'consumable', price: 18, heal: 35 },
    ether: { name: '명상 약병', type: 'consumable', price: 24, mana: 20 },
    shortBlade: { name: '은빛 단검', type: 'weapon', price: 50, bonus: { STR: 2, AGI: 1 } },
    prayerCharm: { name: '성흔 부적', type: 'accessory', price: 55, bonus: { WIS: 2, INT: 1 } },
    duskTome: { name: '황혼의 서', type: 'weapon', price: 60, bonus: { INT: 3 } }
  },
  quests: [
    { id: 'forest1', name: '안개의 숲 정찰', goal: '안개의 숲에서 전투 3회 승리', target: 3, rewardGold: 30, rewardExp: 25 },
    { id: 'abbey1', name: '수도원의 속삭임', goal: '침묵 수도원에서 전투 2회 승리', target: 2, rewardGold: 50, rewardExp: 45 }
  ]
};

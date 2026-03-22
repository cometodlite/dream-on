export const monsters = {
  mothbug: {
    id: 'mothbug',
    name: '몽충',
    level: 1,
    hp: 42,
    atk: 7,
    def: 2,
    exp: 10,
    gold: 4,
    shards: 1,
    color: 0xb07cff,
    skillLabel: '군집 독침'
  },
  mistRat: {
    id: 'mistRat',
    name: '안개쥐',
    level: 1,
    hp: 50,
    atk: 8,
    def: 3,
    exp: 12,
    gold: 5,
    shards: 1,
    color: 0x96a7cf,
    skillLabel: '안개 베어물기'
  },
  crow: {
    id: 'crow',
    name: '뒤틀린 까마귀',
    level: 2,
    hp: 58,
    atk: 10,
    def: 3,
    exp: 16,
    gold: 8,
    shards: 2,
    color: 0x4e5678,
    skillLabel: '흑깃 낙하'
  },
  wolfBoss: {
    id: 'wolfBoss',
    name: '울음을 먹는 늑대',
    level: 3,
    hp: 120,
    atk: 15,
    def: 5,
    exp: 36,
    gold: 22,
    shards: 5,
    color: 0xc45580,
    skillLabel: '공허의 울음'
  }
};

export const fieldMonsterOrder = ['mothbug', 'mistRat', 'crow'];

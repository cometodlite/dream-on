import { getBattleRewards } from './dropSystem.js';
import { tryLevelUp } from './statSystem.js';
import { gainAlignment } from '../utils.js';

function clampMin(value, min) {
  return value < min ? min : value;
}

export function createBattleState(playerState, monster) {
  return {
    playerHp: playerState.hp,
    playerMp: playerState.mp,
    monsterHp: monster.hp,
    turn: 1,
    log: [`${monster.name}이(가) 모습을 드러냈다.`],
    finished: false,
    victory: false
  };
}

export function performPlayerAction(action, state, battle, monster) {
  if (battle.finished) return battle;

  let dmg = 0;
  let mpCost = 0;
  let lucidDelta = 0;
  let nightfallDelta = 0;
  let label = '공격';

  switch (action) {
    case 'dreamSkill':
      label = '드림 스킬';
      dmg = clampMin(state.matk + Phaser.Math.Between(8, 13) - monster.def, 8);
      mpCost = 8;
      lucidDelta = 3;
      break;
    case 'purify':
      label = '정화';
      dmg = clampMin(state.matk + Phaser.Math.Between(10, 16) - monster.def, 10);
      mpCost = 10;
      lucidDelta = 6;
      nightfallDelta = -2;
      break;
    case 'nightmare':
      label = '악몽 해방';
      dmg = clampMin(state.matk + state.atk + Phaser.Math.Between(12, 20) - monster.def, 14);
      mpCost = 12;
      lucidDelta = -2;
      nightfallDelta = 7;
      break;
    default:
      dmg = clampMin(state.atk + Phaser.Math.Between(4, 8) - monster.def, 6);
  }

  if (state.mp < mpCost) {
    battle.log.unshift('MP가 부족해 기본 공격으로 전환되었다.');
    dmg = clampMin(state.atk + Phaser.Math.Between(4, 8) - monster.def, 6);
    label = '기본 공격';
    mpCost = 0;
    lucidDelta = 0;
    nightfallDelta = 0;
  }

  state.mp -= mpCost;
  battle.monsterHp = Math.max(0, battle.monsterHp - dmg);
  battle.log.unshift(`${label}으로 ${monster.name}에게 ${dmg} 피해를 입혔다.`);
  gainAlignment(lucidDelta, nightfallDelta, state);

  if (battle.monsterHp <= 0) {
    const rewards = getBattleRewards(monster);
    state.exp += rewards.exp;
    state.gold += rewards.gold;
    state.dreamShards += rewards.shards;
    state.kills += 1;
    state.flags.firstBattleWon = true;
    state.quest = '기사단에 숲의 정화 보고를 전하라';
    const leveled = tryLevelUp(state);
    state.hp = Math.min(state.maxHp, battle.playerHp);
    battle.finished = true;
    battle.victory = true;
    battle.log.unshift(`${monster.name}을(를) 쓰러뜨렸다. EXP ${rewards.exp}, Gold ${rewards.gold}, Dream Shard ${rewards.shards} 획득.`);
    if (leveled) battle.log.unshift(`레벨 업! 현재 레벨 ${state.level}, 스탯 포인트 +4.`);
    return battle;
  }

  const enemyDamage = clampMin(monster.atk + Phaser.Math.Between(2, 6) - state.def, 4);
  battle.playerHp = Math.max(0, battle.playerHp - enemyDamage);
  battle.log.unshift(`${monster.name}의 ${monster.skillLabel}! ${enemyDamage} 피해를 받았다.`);

  if (battle.playerHp <= 0) {
    state.hp = Math.max(1, Math.floor(state.maxHp * 0.4));
    state.mp = Math.max(0, state.mp);
    battle.finished = true;
    battle.victory = false;
    battle.log.unshift('악몽의 침식에 잠시 무너졌다. 여명 성채로 후퇴한다.');
    return battle;
  }

  battle.turn += 1;
  state.hp = battle.playerHp;
  return battle;
}

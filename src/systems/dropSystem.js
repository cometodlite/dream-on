export function getBattleRewards(monster) {
  return {
    exp: monster.exp,
    gold: monster.gold,
    shards: monster.shards
  };
}

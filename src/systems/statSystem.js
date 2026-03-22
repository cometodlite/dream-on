export function requiredExp(level) {
  return 30 + (level * level * 12);
}

export function tryLevelUp(state) {
  const req = requiredExp(state.level);
  if (state.exp < req) return false;
  state.exp -= req;
  state.level += 1;
  state.statPoints += 4;
  state.maxHp += 14;
  state.maxMp += 6;
  state.hp = state.maxHp;
  state.mp = state.maxMp;
  state.atk += 2;
  state.matk += 2;
  state.def += 1;
  return true;
}

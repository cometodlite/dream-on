import { defaultState } from '../gameState.js';

const KEY = 'dream_on_graphic_prototype_save';

export function saveGame(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

export function hydrateState(state, loaded) {
  const base = defaultState();
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, base, loaded || {});
}

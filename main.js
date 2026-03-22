import { gameConfig } from './src/config.js';
import { saveGame, clearSave } from './src/systems/saveSystem.js';
import { sharedState } from './src/gameState.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);

  document.getElementById('saveBtn').addEventListener('click', () => {
    saveGame(sharedState);
    alert('현재 진행 상황을 저장했어.');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('저장 데이터를 초기화할까?')) {
      clearSave();
      location.reload();
    }
  });

  window.__DREAM_ON__ = game;
});

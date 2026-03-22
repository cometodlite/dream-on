import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { JobSelectScene } from './scenes/JobSelectScene.js';
import { TownScene } from './scenes/TownScene.js';
import { FieldScene } from './scenes/FieldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { UIScene } from './scenes/UIScene.js';

export const WIDTH = 1280;
export const HEIGHT = 720;

export const gameConfig = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0b1020',
  scene: [BootScene, TitleScene, JobSelectScene, TownScene, FieldScene, BattleScene, UIScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

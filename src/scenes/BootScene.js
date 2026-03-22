import { loadGame, hydrateState } from '../systems/saveSystem.js';
import { sharedState } from '../gameState.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const g = this.add.graphics();
    g.fillStyle(0x6c8cff, 1).fillRect(0, 0, 32, 32);
    g.generateTexture('player', 32, 32);
    g.clear();
    g.fillStyle(0x87b5ff, 1).fillRect(0, 0, 40, 40);
    g.generateTexture('npc', 40, 40);
    g.clear();
    g.fillStyle(0xa56fff, 1).fillCircle(20, 20, 18);
    g.generateTexture('monsterPurple', 40, 40);
    g.clear();
    g.fillStyle(0xd16090, 1).fillCircle(28, 28, 26);
    g.generateTexture('monsterBoss', 56, 56);
    g.destroy();
  }

  create() {
    const loaded = loadGame();
    if (loaded) hydrateState(sharedState, loaded);
    this.scene.start('TitleScene');
  }
}

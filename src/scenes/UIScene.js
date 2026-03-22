import { WIDTH } from '../config.js';
import { sharedState } from '../gameState.js';
import { requiredExp } from '../systems/statSystem.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.zone = data.zone || 'town';
  }

  create() {
    this.container = this.add.container(0, 0);
    const bg = this.add.graphics();
    bg.fillStyle(0x0e1429, 0.84);
    bg.lineStyle(2, 0x93a6f4, 0.35);
    bg.fillRoundedRect(16, 16, 340, 178, 16);
    bg.strokeRoundedRect(16, 16, 340, 178, 16);
    this.container.add(bg);

    this.titleText = this.add.text(32, 28, '', { fontSize: '22px', color: '#edf2ff', fontStyle: 'bold' });
    this.statText = this.add.text(32, 62, '', { fontSize: '18px', color: '#d9def7', lineSpacing: 7 });
    this.questText = this.add.text(32, 136, '', { fontSize: '16px', color: '#afbbe3', wordWrap: { width: 300 } });
    this.container.add([this.titleText, this.statText, this.questText]);

    this.rightPanel = this.add.container(0, 0);
    const rg = this.add.graphics();
    rg.fillStyle(0x10162d, 0.82);
    rg.lineStyle(2, 0x9b8cff, 0.32);
    rg.fillRoundedRect(WIDTH - 296, 16, 280, 126, 16);
    rg.strokeRoundedRect(WIDTH - 296, 16, 280, 126, 16);
    this.rightPanel.add(rg);
    this.alignText = this.add.text(WIDTH - 278, 32, '', { fontSize: '18px', color: '#edf2ff', lineSpacing: 8 });
    this.rightPanel.add(this.alignText);
  }

  update() {
    const req = requiredExp(sharedState.level);
    const zoneName = this.zone === 'forest' ? '안개의 숲' : '여명 성채';
    this.titleText.setText(`${zoneName} · ${sharedState.playerName}`);
    this.statText.setText(
      `Lv ${sharedState.level}  EXP ${sharedState.exp}/${req}\n` +
      `HP ${sharedState.hp}/${sharedState.maxHp}  MP ${sharedState.mp}/${sharedState.maxMp}\n` +
      `Gold ${sharedState.gold}  Dream Shard ${sharedState.dreamShards}  Stat ${sharedState.statPoints}`
    );
    this.questText.setText(`현재 목표: ${sharedState.quest}`);
    this.alignText.setText(
      `Lucid  ${sharedState.lucid}\n` +
      `Nightfall  ${sharedState.nightfall}\n\n` +
      `직업: ${sharedState.jobId || '미선택'}\n` +
      `토벌 수: ${sharedState.kills}`
    );
  }
}

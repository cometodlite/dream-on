import { WIDTH, HEIGHT } from '../config.js';
import { sharedState } from '../gameState.js';
import { monsters } from '../data/monsterData.js';
import { createBattleState, performPlayerAction } from '../systems/battleSystem.js';
import { saveGame } from '../systems/saveSystem.js';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.monsterId = data.monsterId || 'mothbug';
    this.returnScene = data.returnScene || 'FieldScene';
  }

  create() {
    this.monster = monsters[this.monsterId];
    this.battle = createBattleState(sharedState, this.monster);

    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x0f0b18);
    this.add.circle(1060, 120, 110, 0xc04b7d, 0.18);
    this.add.circle(220, 110, 130, 0x6f8dff, 0.1);
    this.add.text(640, 52, '꿈의 전투', { fontSize: '38px', color: '#f4efff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 90, `${this.monster.name}과 마주했다`, { fontSize: '20px', color: '#d7ccec' }).setOrigin(0.5);

    this.add.rectangle(270, 330, 160, 160, 0x6c8cff, 0.85).setStrokeStyle(2, 0xf4f6ff, 0.4);
    this.add.text(270, 450, sharedState.jobId ? '드림워커' : '잠행자', { fontSize: '24px', color: '#edf2ff' }).setOrigin(0.5);
    this.add.circle(980, 320, this.monsterId === 'wolfBoss' ? 74 : 56, this.monster.color, 0.95).setStrokeStyle(3, 0xffffff, 0.28);
    this.add.text(980, 430, this.monster.name, { fontSize: '24px', color: '#f7efff' }).setOrigin(0.5);

    this.playerBar = this.add.graphics();
    this.monsterBar = this.add.graphics();
    this.logText = this.add.text(70, 500, '', { fontSize: '19px', color: '#d9d7ef', wordWrap: { width: 1140 }, lineSpacing: 8 });

    const buttons = [
      ['1 기본 공격', 'attack', 250],
      ['2 드림 스킬', 'dreamSkill', 470],
      ['3 정화', 'purify', 690],
      ['4 악몽 해방', 'nightmare', 910]
    ];

    this.actionButtons = buttons.map(([label, action, x]) => {
      const text = this.add.text(x, 620, label, {
        fontSize: '24px', backgroundColor: '#222a54', color: '#ffffff', padding: { x: 16, y: 12 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      text.on('pointerup', () => this.runAction(action));
      return text;
    });

    this.input.keyboard.on('keydown-ONE', () => this.runAction('attack'));
    this.input.keyboard.on('keydown-TWO', () => this.runAction('dreamSkill'));
    this.input.keyboard.on('keydown-THREE', () => this.runAction('purify'));
    this.input.keyboard.on('keydown-FOUR', () => this.runAction('nightmare'));

    this.exitHint = this.add.text(640, 680, '', { fontSize: '18px', color: '#aeb3d7' }).setOrigin(0.5);
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.battle.finished) this.leaveBattle();
    });

    this.refresh();
  }

  runAction(action) {
    if (this.battle.finished) return;
    this.battle = performPlayerAction(action, sharedState, this.battle, this.monster);
    this.refresh();
    if (this.battle.finished) {
      saveGame(sharedState);
      this.exitHint.setText('스페이스바를 눌러 전장을 떠난다.');
    }
  }

  refresh() {
    this.playerBar.clear();
    this.monsterBar.clear();

    this.playerBar.fillStyle(0x1d243f, 1).fillRoundedRect(120, 150, 300, 26, 8);
    this.playerBar.fillStyle(0xd8657a, 1).fillRoundedRect(120, 150, 300 * (this.battle.playerHp / sharedState.maxHp), 26, 8);
    this.playerBar.fillStyle(0x1d243f, 1).fillRoundedRect(120, 186, 300, 20, 8);
    this.playerBar.fillStyle(0x70b4ff, 1).fillRoundedRect(120, 186, 300 * (sharedState.mp / sharedState.maxMp), 20, 8);

    this.monsterBar.fillStyle(0x29192b, 1).fillRoundedRect(820, 150, 300, 26, 8);
    this.monsterBar.fillStyle(0xc05595, 1).fillRoundedRect(820, 150, 300 * (this.battle.monsterHp / this.monster.hp), 26, 8);

    if (!this.playerLabel) {
      this.playerLabel = this.add.text(120, 120, '', { fontSize: '20px', color: '#edf2ff' });
      this.monsterLabel = this.add.text(820, 120, '', { fontSize: '20px', color: '#f3e6ff' });
    }
    this.playerLabel.setText(`HP ${this.battle.playerHp}/${sharedState.maxHp}  MP ${sharedState.mp}/${sharedState.maxMp}`);
    this.monsterLabel.setText(`HP ${this.battle.monsterHp}/${this.monster.hp}`);

    this.logText.setText(this.battle.log.slice(0, 7).join('\n'));

    if (this.battle.finished) {
      this.actionButtons.forEach(btn => btn.setAlpha(0.45));
      if (this.battle.victory) {
        this.add.text(640, 140, '승리', { fontSize: '34px', color: '#f2f4ff', fontStyle: 'bold' }).setOrigin(0.5);
      } else {
        this.add.text(640, 140, '후퇴', { fontSize: '34px', color: '#ffcad4', fontStyle: 'bold' }).setOrigin(0.5);
      }
    }
  }

  leaveBattle() {
    this.scene.start(this.returnScene);
  }
}

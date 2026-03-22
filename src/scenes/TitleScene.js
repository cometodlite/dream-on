import { WIDTH, HEIGHT } from '../config.js';
import { makePanel } from '../utils.js';
import { sharedState } from '../gameState.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0f1c');

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0e1330, 0x0e1330, 0x1f2148, 0x090b16, 1);
    bg.fillRect(0, 0, WIDTH, HEIGHT);
    bg.fillStyle(0x9a72ff, 0.12).fillCircle(WIDTH * 0.78, HEIGHT * 0.22, 140);
    bg.fillStyle(0x6aa8ff, 0.1).fillCircle(WIDTH * 0.2, HEIGHT * 0.3, 180);

    this.add.text(WIDTH / 2, 120, 'DREAM ON', {
      fontSize: '58px', fontStyle: 'bold', color: '#edf2ff'
    }).setOrigin(0.5);

    this.add.text(WIDTH / 2, 176,
      '아름다운 꿈과 뒤틀린 악몽이 공존하는 몽환 고딕 다크 판타지',
      { fontSize: '22px', color: '#b8c0eb' }
    ).setOrigin(0.5);

    makePanel(this, WIDTH / 2 - 280, 250, 560, 250, 0x10162f, 0.84, 0x8ba7ff);

    this.add.text(WIDTH / 2, 300, '수면의 균열 이후, 현실과 몽계는 하나의 상처로 이어졌다.', {
      fontSize: '24px', color: '#edf2ff', align: 'center', wordWrap: { width: 500 }
    }).setOrigin(0.5);

    this.add.text(WIDTH / 2, 362,
      '플레이어는 기억을 잃은 드림워커로서 꿈 파편을 모으고,\n악몽을 정화하거나 이용하며 자신이 누구인지 찾아간다.',
      { fontSize: '20px', color: '#b7bedf', align: 'center', wordWrap: { width: 500 }, lineSpacing: 8 }
    ).setOrigin(0.5);

    const startLabel = sharedState.started ? '이어하기' : '새 게임 시작';
    const startButton = this.add.text(WIDTH / 2, 560, startLabel, {
      fontSize: '28px', backgroundColor: '#27346d', color: '#ffffff', padding: { x: 18, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerup', () => {
      if (sharedState.started && sharedState.jobId) {
        this.scene.start('TownScene');
      } else {
        this.scene.start('JobSelectScene');
      }
    });

    this.add.text(WIDTH / 2, 628, 'Github Pages 배포용 Phaser.js 그래픽 프로토타입', {
      fontSize: '18px', color: '#8e98c6'
    }).setOrigin(0.5);
  }
}

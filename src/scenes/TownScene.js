import { WIDTH, HEIGHT } from '../config.js';
import { sharedState } from '../gameState.js';
import { saveGame } from '../systems/saveSystem.js';

export class TownScene extends Phaser.Scene {
  constructor() {
    super('TownScene');
  }

  create() {
    sharedState.location = 'town';
    this.scene.launch('UIScene', { zone: 'town' });
    this.scene.bringToTop('UIScene');

    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101936);
    this.add.circle(1050, 110, 80, 0xcfd9ff, 0.12);
    this.add.rectangle(640, 640, WIDTH, 160, 0x1c2340, 1);

    for (let i = 0; i < 12; i++) {
      this.add.rectangle(80 + i * 110, 640, 70, 70, 0x29365f, 1).setStrokeStyle(2, 0x7a95dc, 0.3);
    }
    this.add.rectangle(300, 260, 190, 140, 0x35477a, 1).setStrokeStyle(2, 0xbfd0ff, 0.35);
    this.add.rectangle(980, 250, 220, 160, 0x2e3f6f, 1).setStrokeStyle(2, 0xbfd0ff, 0.35);
    this.add.rectangle(630, 200, 120, 220, 0x223361, 1).setStrokeStyle(3, 0xb0c3ff, 0.35);
    this.add.text(640, 60, '여명 성채', { fontSize: '34px', color: '#eef2ff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 100, '푸른 랜턴과 성당 창이 빛나는 첫 안정 지대', { fontSize: '18px', color: '#aab4de' }).setOrigin(0.5);

    const npc = this.physics.add.staticImage(850, 430, 'npc');
    const forestGate = this.add.rectangle(1160, 360, 80, 140, 0x60408a, 0.6).setStrokeStyle(3, 0xc08cff, 0.7);
    this.add.text(1160, 450, '안개의 숲', { fontSize: '18px', color: '#f1ecff' }).setOrigin(0.5);

    this.player = this.physics.add.sprite(240, 500, 'player').setCollideWorldBounds(true);
    this.player.setSize(28, 28);

    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    this.npcPrompt = this.add.text(0, 0, '', { fontSize: '18px', color: '#edf2ff', backgroundColor: '#111930', padding: { x: 8, y: 6 } }).setVisible(false);
    this.gatePrompt = this.add.text(0, 0, '', { fontSize: '18px', color: '#edf2ff', backgroundColor: '#111930', padding: { x: 8, y: 6 } }).setVisible(false);

    this.physics.add.overlap(this.player, npc, () => {
      this.npcPrompt.setText('E - 기사단 보조와 대화');
      this.npcPrompt.setPosition(this.player.x - 48, this.player.y - 48).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        sharedState.flags.tutorialTalked = true;
        sharedState.quest = '성채 바깥의 안개의 숲으로 나가 몽충을 토벌하라';
        this.showDialog('기사단 보조', '성채 밖 숲의 안개가 짙어졌어요. 몽충을 정리하고 돌아와 주세요.');
      }
    });


    this.gateZone = this.add.zone(1160, 360, 100, 160);
    this.physics.world.enable(this.gateZone);
    this.gateZone.body.setAllowGravity(false);
    this.gateZone.body.moves = false;
    this.physics.add.overlap(this.player, this.gateZone, () => {
      this.gatePrompt.setText('E - 안개의 숲으로 이동');
      this.gatePrompt.setPosition(this.player.x - 58, this.player.y - 48).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        saveGame(sharedState);
        this.scene.stop('UIScene');
        this.scene.start('FieldScene');
      }
    });

    this.messageBox = null;
  }

  showDialog(name, text) {
    if (this.messageBox) this.messageBox.destroy(true);
    const container = this.add.container(70, 540);
    const bg = this.add.graphics();
    bg.fillStyle(0x11182f, 0.92);
    bg.lineStyle(2, 0x86a4ff, 0.45);
    bg.fillRoundedRect(0, 0, 560, 120, 14);
    bg.strokeRoundedRect(0, 0, 560, 120, 14);
    const title = this.add.text(18, 16, name, { fontSize: '22px', color: '#edf2ff', fontStyle: 'bold' });
    const body = this.add.text(18, 52, text, { fontSize: '18px', color: '#cdd6f8', wordWrap: { width: 520 } });
    container.add([bg, title, body]);
    this.messageBox = container;
    this.time.delayedCall(2600, () => this.messageBox?.destroy(true));
  }

  update() {
    const speed = 190;
    this.player.setVelocity(0);
    this.npcPrompt.setVisible(false);
    this.gatePrompt.setVisible(false);

    if (this.cursors.left.isDown || this.keys.A.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.keys.D.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.keys.S.isDown) this.player.setVelocityY(speed);
  }
}

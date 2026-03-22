import { WIDTH, HEIGHT } from '../config.js';
import { sharedState } from '../gameState.js';
import { fieldMonsterOrder, monsters } from '../data/monsterData.js';
import { saveGame } from '../systems/saveSystem.js';

export class FieldScene extends Phaser.Scene {
  constructor() {
    super('FieldScene');
  }

  create() {
    sharedState.location = 'forest';
    this.scene.launch('UIScene', { zone: 'forest' });
    this.scene.bringToTop('UIScene');

    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x140f24);
    for (let i = 0; i < 20; i++) {
      this.add.rectangle(40 + i * 70, 120 + (i % 3) * 160, 26, 120, 0x22203a, 1);
      this.add.circle(40 + i * 70, 70 + (i % 3) * 160, 42, 0x32254d, 0.55);
    }
    this.add.rectangle(WIDTH / 2, HEIGHT - 50, WIDTH, 100, 0x1a1a2d);
    this.add.text(640, 60, '안개의 숲', { fontSize: '34px', color: '#f2ecff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 100, '검은 나무와 보랏빛 안개가 방향감각을 흐린다', { fontSize: '18px', color: '#cabbe6' }).setOrigin(0.5);
    this.add.rectangle(100, 360, 70, 150, 0x4b5f88, 0.55).setStrokeStyle(2, 0xbfd0ff, 0.5);
    this.add.text(100, 445, '성채 복귀', { fontSize: '18px', color: '#f2f4ff' }).setOrigin(0.5);

    this.player = this.physics.add.sprite(160, 520, 'player').setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    this.monsterGroup = this.physics.add.group();
    fieldMonsterOrder.forEach((id, index) => {
      const monster = monsters[id];
      const sprite = this.physics.add.sprite(460 + index * 210, 260 + (index % 2) * 160, 'monsterPurple');
      sprite.setTint(monster.color);
      sprite.setData('monsterId', id);
      sprite.setScale(1 + index * 0.08);
      this.monsterGroup.add(sprite);
      this.tweens.add({ targets: sprite, y: sprite.y - 10, duration: 900 + index * 150, yoyo: true, repeat: -1 });
    });

    this.gateZone = this.add.zone(100, 360, 90, 160);
    this.physics.world.enable(this.gateZone);
    this.gateZone.body.setAllowGravity(false);
    this.gateZone.body.moves = false;

    this.prompt = this.add.text(0, 0, '', { fontSize: '18px', color: '#f1ecff', backgroundColor: '#151127', padding: { x: 8, y: 6 } }).setVisible(false);
    this.pendingMonster = null;

    this.physics.add.overlap(this.player, this.gateZone, () => {
      this.prompt.setText('E - 여명 성채로 복귀');
      this.prompt.setPosition(this.player.x - 62, this.player.y - 48).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        saveGame(sharedState);
        this.scene.stop('UIScene');
        this.scene.start('TownScene');
      }
    });

    this.physics.add.overlap(this.player, this.monsterGroup, (_, monsterSprite) => {
      this.pendingMonster = monsterSprite.getData('monsterId');
      this.prompt.setText('E - 전투 시작');
      this.prompt.setPosition(this.player.x - 46, this.player.y - 48).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        saveGame(sharedState);
        this.scene.stop('UIScene');
        this.scene.start('BattleScene', { monsterId: this.pendingMonster, returnScene: 'FieldScene' });
      }
    });
  }

  update() {
    const speed = 190;
    this.player.setVelocity(0);
    this.prompt.setVisible(false);
    if (this.cursors.left.isDown || this.keys.A.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.keys.D.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.keys.S.isDown) this.player.setVelocityY(speed);
  }
}

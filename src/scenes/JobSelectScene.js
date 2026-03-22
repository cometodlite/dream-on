import { WIDTH, HEIGHT } from '../config.js';
import { jobTemplates } from '../data/playerData.js';
import { applyJob } from '../gameState.js';
import { makePanel } from '../utils.js';

export class JobSelectScene extends Phaser.Scene {
  constructor() {
    super('JobSelectScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#10142a');
    this.add.text(WIDTH / 2, 70, '직업 선택', { fontSize: '42px', color: '#edf2ff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 112, '꿈과 악몽 사이를 걷는 첫 걸음을 정하라.', { fontSize: '20px', color: '#aeb8e0' }).setOrigin(0.5);

    const jobs = Object.values(jobTemplates);
    jobs.forEach((job, index) => {
      const x = 120 + index * 380;
      makePanel(this, x, 180, 320, 360, 0x131a36, 0.9, job.color);
      this.add.rectangle(x + 160, 245, 96, 96, job.color, 0.85).setStrokeStyle(2, 0xf1f3ff, 0.5);
      this.add.text(x + 160, 320, job.name, { fontSize: '30px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(x + 160, 355, job.title, { fontSize: '18px', color: '#c4cceb' }).setOrigin(0.5);
      this.add.text(x + 24, 395,
        `${job.description}\n\nHP ${job.hp} / MP ${job.mp}\nATK ${job.atk} / MATK ${job.matk} / DEF ${job.def}`,
        { fontSize: '18px', color: '#d9dff7', wordWrap: { width: 272 }, lineSpacing: 8 }
      );

      const btn = this.add.text(x + 160, 500, '선택', {
        fontSize: '24px', backgroundColor: '#24305d', color: '#ffffff', padding: { x: 14, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerup', () => {
        applyJob(job.id);
        this.scene.start('TownScene');
      });
    });
  }
}

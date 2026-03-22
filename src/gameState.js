import { jobTemplates } from './data/playerData.js';

export const defaultState = () => ({
  started: false,
  playerName: '잠행자',
  jobId: null,
  level: 1,
  exp: 0,
  gold: 50,
  dreamShards: 0,
  lucid: 50,
  nightfall: 50,
  statPoints: 4,
  location: 'title',
  hp: 100,
  mp: 40,
  maxHp: 100,
  maxMp: 40,
  atk: 12,
  matk: 10,
  def: 6,
  kills: 0,
  quest: '기사단 게시판에서 첫 의뢰를 확인하라',
  inventory: [],
  flags: {
    tutorialTalked: false,
    firstBattleWon: false
  }
});

export const sharedState = defaultState();

export function applyJob(jobId) {
  const job = jobTemplates[jobId];
  if (!job) return;
  Object.assign(sharedState, {
    started: true,
    jobId,
    location: 'town',
    hp: job.hp,
    mp: job.mp,
    maxHp: job.hp,
    maxMp: job.mp,
    atk: job.atk,
    matk: job.matk,
    def: job.def,
    statPoints: 4,
    quest: '여명 성채를 둘러보고 안개의 숲으로 향하라'
  });
}

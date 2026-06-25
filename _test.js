const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync("index.html", "utf8");
let script = html.match(/<script>([\s\S]*)<\/script>/)[1];

const noop = () => {};
function fakeEl() {
  return { style: {}, classList: { add: noop, remove: noop, contains: () => true }, set textContent(v) {},
    set innerHTML(v) {}, set onclick(f) {}, appendChild: noop, addEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 544 }) };
}
const localStorage = { getItem: () => null, setItem: noop };
const ctxProxy = new Proxy({}, {
  get: (t, p) => {
    if (p === "canvas") return { width: 800, height: 544 };
    if (p === "measureText") return () => ({ width: 8 });
    if (p === "createLinearGradient") return () => ({ addColorStop: noop });
    return function () {};
  }, set: () => true,
});
const document = {
  getElementById: () => { const e = fakeEl(); e.getContext = () => ctxProxy; return e; },
  createElement: () => fakeEl(),
  querySelectorAll: () => [],
  documentElement: { lang: "" },
};

script += `
globalThis.__api = {
  get state(){return state;}, get game(){return game;}, get battle(){return battle;}, get player(){return player;},
  CLASSES, MONSTER_TYPES, FLOORS, BOSS_PATTERNS,
  get LANG(){return LANG;}, setLang:function(v){LANG=v;}, t, monName, clsName, applyStaticText,
  startGame, handleBattleKey, setKeys:function(o){keys=o;}, beginBattleScene, clearFloor, nextFloor, spawnBoss, showClassSelect, endGame,
  loop_once:function(){
    if(state==="overworld"){ updateOverworld(); if(state==="overworld") drawOverworld(); }
    else if(state==="transition"){ updateTransition(); drawTransition(); }
    else if(state==="battle"){ updateBattle(); drawBattle(); }
  } };
`;
const ctx = { document, window: {}, localStorage, addEventListener: noop, requestAnimationFrame: noop, console, Math, Date, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(script, ctx, { timeout: 20000 });
const api = ctx.__api;
const log = [];
function clearMsgs(){ let g=0; while(api.battle && api.battle.phase==="msg" && g++<60) api.handleBattleKey("enter"); }

// i18n 점검: 기본 영어 + 한국어 토글
log.push("default LANG: " + api.LANG + " (expect en)");
api.setLang("en"); const en_mon = api.monName("mushmom"), en_cls = api.clsName(api.CLASSES.warrior), en_ui = api.t("btnStart");
api.setLang("ko"); const ko_mon = api.monName("mushmom"), ko_cls = api.clsName(api.CLASSES.warrior), ko_ui = api.t("btnStart");
api.setLang("en");
log.push("i18n monster: en='" + en_mon + "' ko='" + ko_mon + "' | class: en='" + en_cls + "' ko='" + ko_cls + "' | ui: en='" + en_ui + "' ko='" + ko_ui + "'");
log.push("i18n enemyHit en: " + api.t("enemyHit")("Mushmom", 12, "spore"));
api.setLang("ko"); log.push("i18n enemyHit ko: " + api.t("enemyHit")("머쉬맘", 12, "spore")); api.setLang("en");

// 재시작(Play Again) 경로: 종료 -> 직업선택 -> 재시작이 깨지지 않는지
api.startGame("warrior"); api.endGame(false);
const overState = api.state;
api.showClassSelect();                      // 다시 하기 버튼이 부르는 함수
const afterRetry = api.state;               // title 이어야 (오버레이 정리됨)
api.startGame("mage");                      // 직업 다시 선택
log.push("retry flow: end=" + overState + " -> classSelect=" + afterRetry + " -> restart=" + api.state + " lv=" + api.player.lv);

// 데이터 점검
log.push("classes: " + Object.keys(api.CLASSES).join(",") + " | monsters: " + Object.keys(api.MONSTER_TYPES).length);

// 각 직업 풀 플레이(승리까지) 검증
for (const cls of Object.keys(api.CLASSES)) {
  api.startGame(cls);
  // 클래스 시작 스탯 확인
  const ok = api.player.cls === cls && api.player.maxHp === api.CLASSES[cls].maxHp;
  // 배틀 진입(첫 몬스터)
  api.beginBattleScene(api.game.monsters[0]);
  clearMsgs();
  let guard = 0, usedSkill = false;
  while (api.state === "battle" && guard++ < 600) {
    const b = api.battle;
    if (!b) break;
    if (b.phase === "msg") api.handleBattleKey("enter");
    else if (b.phase === "menu") {
      if (api.player.hp < api.player.maxHp * 0.4) api.player.hp = api.player.maxHp; // 죽지 않게
      // 스킬 한 번 써보고, 이후엔 공격
      if (!usedSkill && api.player.mp >= 4) { b.menuIndex = 1; api.handleBattleKey("enter"); usedSkill = true; }
      else { b.menuIndex = 0; api.handleBattleKey("enter"); }
    } else if (b.phase === "skillmenu") { b.skillIndex = 0; api.handleBattleKey("enter"); }
    api.loop_once();
  }
  log.push(cls + ": startOK=" + ok + " usedSkill=" + usedSkill + " -> state=" + api.state + " lv=" + api.player.lv);
}

// 스킬 메뉴 네비/뒤로 동작
api.startGame("warrior");
api.beginBattleScene(api.game.monsters[0]); clearMsgs();
let b = api.battle; b.menuIndex = 1; api.handleBattleKey("enter"); // 스킬 진입
const inSkill = b.phase === "skillmenu";
api.handleBattleKey("arrowdown"); const navOk = b.skillIndex === 1;
api.handleBattleKey("escape"); const backOk = b.phase === "menu";
log.push("skillmenu: enter=" + inSkill + " nav=" + navOk + " back=" + backOk);

// 독(마법사 포이즌미스트) 적용 확인
api.startGame("mage");
api.beginBattleScene(api.game.monsters[0]); clearMsgs();
b = api.battle; b.enemy.hp = 999;
b.menuIndex = 1; api.handleBattleKey("enter");           // 스킬
b.skillIndex = 1; api.handleBattleKey("enter");          // 포이즌미스트
clearMsgs();
log.push("poison applied to enemy: " + (b.enemy.status.poison > 0));

// 데이터: 층/보스/패턴
log.push("floors: " + api.FLOORS.map(f=>f.short+"("+f.boss+")").join(",") + " | boss patterns: " + Object.keys(api.BOSS_PATTERNS).join(","));

// 보스 흐름 (B1): 유물 5개 → 보스 스폰 → 처치 시 포탈 오픈
api.startGame("archer");
let g = api.game;
g.collected = 4; g.relics[0].got = false;
g.px = g.relics[0].x; g.py = g.relics[0].y; api.setKeys({}); api.loop_once();
const b1boss = g.monsters.find(m => m.key === g.bossKey);
log.push("B1 boss(" + g.bossKey + ") spawned: " + g.bossSpawned + " found=" + !!b1boss);
if (b1boss) {
  api.beginBattleScene(b1boss); clearMsgs(); b = api.battle;
  const cantRun = (()=>{ b.menuIndex=3; api.handleBattleKey("enter"); const r = b.phase==="msg"; clearMsgs(); return r; })();
  let guard = 0;
  while (api.state === "battle" && guard++ < 400) {
    if (!api.battle) break;
    if (api.battle.phase === "msg") api.handleBattleKey("enter");
    else if (api.battle.phase === "menu") { api.player.hp = api.player.maxHp; api.battle.enemy.hp = 1; api.battle.menuIndex = 0; api.handleBattleKey("enter"); }
    else if (api.battle.phase === "skillmenu") { api.battle.skillIndex = 0; api.handleBattleKey("enter"); }
    api.loop_once();
  }
  log.push("B1 boss battle: cantRun=" + cantRun + " defeated=" + g.bossDefeated + " portalOpen=" + g.portal.open);
}

// 층 이동: 포탈 진입 → clearFloor → nextFloor → B2 진입
g.px = g.portal.x; g.py = g.portal.y; api.setKeys({}); api.loop_once();
log.push("on B1 portal -> state=" + api.state + " (expect floorclear)");
api.nextFloor();
g = api.game;
log.push("after nextFloor -> floorIdx=" + g.floorIdx + " short=" + g.short + " bossKey=" + g.bossKey + " monsters=" + g.monsters.length);

// B2 최종 보스(자쿰) 처치 → 최종 승리
g.collected = 4; g.relics[0].got = false;
g.px = g.relics[0].x; g.py = g.relics[0].y; api.setKeys({}); api.loop_once();
const b2boss = g.monsters.find(m => m.key === "zakum");
log.push("B2 boss(zakum) spawned: " + g.bossSpawned + " found=" + !!b2boss);
if (b2boss) {
  api.beginBattleScene(b2boss); clearMsgs(); b = api.battle;
  // 자쿰 패턴 여러 턴 돌려 안정성 확인 (플레이어 안 죽게)
  let turns = 0;
  while (api.state === "battle" && turns++ < 400) {
    if (!api.battle) break;
    if (api.battle.phase === "msg") api.handleBattleKey("enter");
    else if (api.battle.phase === "menu") { api.player.hp = api.player.maxHp; api.battle.enemy.hp = 1; api.battle.menuIndex = 0; api.handleBattleKey("enter"); }
    else if (api.battle.phase === "skillmenu") { api.battle.skillIndex = 0; api.handleBattleKey("enter"); }
    api.loop_once();
  }
  log.push("B2 boss battle done -> state=" + api.state + " bossDefeated=" + g.bossDefeated + " portalOpen=" + g.portal.open);
  // 최종 포탈 → 승리
  if (api.state === "overworld") { g.px = g.portal.x; g.py = g.portal.y; api.loop_once(); log.push("on B2 portal -> state=" + api.state + " (expect over)"); }
}

// 안정성: 필드 랜덤 + 렌더 다수 프레임 (모든 직업)
let crash = null;
try {
  for (const cls of Object.keys(api.CLASSES)) {
    api.startGame(cls);
    let seed = 42 + cls.length;
    const rnd = () => { seed = (seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    for (let f = 0; f < 1500; f++) {
      api.setKeys({ w: rnd()<.5, a: rnd()<.5, s: rnd()<.5, d: rnd()<.5 });
      api.loop_once();
      if (api.state === "battle") { // 배틀 빠져나오기
        let gg=0; while (api.state==="battle" && gg++<300){ const bb=api.battle; if(!bb)break;
          if(bb.phase==="msg") api.handleBattleKey("enter");
          else { if(api.player.hp<20)api.player.hp=api.player.maxHp; bb.menuIndex=0; api.handleBattleKey("enter"); }
          api.loop_once(); }
      }
    }
  }
} catch (e) { crash = e.stack; }
log.push("stability(all classes, 1500f each + battles): " + (crash ? "CRASH " + crash : "OK"));

console.log(log.join("\n"));

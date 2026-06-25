# Verse8 / MSU Space — Paste-Ready Prompt (English)

> Verse8(MSU Space)의 Agent 8은 **채팅창에 영어로 설명**하면 게임을 생성합니다.
> 아래 텍스트를 **그대로 복사해서 붙여넣으세요.** (코드 파일 업로드 X — 프롬프트 입력 방식)
> 권장: 먼저 **A. 원샷 프롬프트**를 붙여넣어 뼈대를 만들고, 결과를 보며
> **B. 단계별 프롬프트**로 보강. 메이플 공식 에셋만 사용해야 합니다(Vibe Camp 규칙).

---

## A. 원샷 마스터 프롬프트 (한 번에 붙여넣기)

```
Build a top-down, turn-based RPG using MapleStory assets. It uses bump-to-battle encounters:
walk around a dungeon, and when you bump into a monster, the screen transitions into a turn-based battle.

OVERWORLD
- Top-down dungeon on a ~25x17 tile map. Walls block movement, floor is walkable, fixed-screen camera.
- Player moves with WASD/arrow keys and collides with walls.
- Place 5 collectible "ancient relics". Collecting all 5 makes the floor's boss appear near the exit portal.
- Monsters wander and chase the player when near. Touching a monster triggers a shutter/fade screen
  transition into a battle. After a battle, give the player brief invulnerability to avoid instant re-collision.

CLASSES (choose at game start via cards showing icon, stats, and skills)
- Warrior: HP 72, MP 14, ATK 11, crit 10%. Skills: Power Strike (MP4, x1.7), Slash Blast (MP7, 2 hits x1.2),
  Divine Smash (MP10, x2.5, 80% accuracy).
- Mage: HP 52, MP 26, ATK 10, crit 10%. Skills: Fireball (MP4, x1.7), Poison Mist (MP7, x1.0 + poison),
  Heal (MP6, +42 HP).
- Archer: HP 60, MP 18, ATK 10, crit 25%. Skills: Double Shot (MP4, 2 hits x1.0),
  Triple Shot (MP8, 3 hits x0.85), Focus (MP4, +5 ATK for the rest of the battle).

BATTLE (encounter-based turn-based)
- Enemy sprite + name + HP bar at top-right; player + name + Lv + HP bar at bottom-left;
  message box at the bottom (advance text with Enter/Space).
- Command menu: Attack / Skill / Potion / Run. "Skill" opens a submenu of the class's skills
  (name, MP cost, description); Esc returns. Navigate with Up/Down, confirm with Enter.
- Turn order: (apply poison) -> player action -> (apply poison) -> enemy action.
- Attack: ATK + random(0..3); critical hit by class chance deals x1.6.
- Potion: +42 HP, 4 held, costs a turn.
- Run: 50% escape chance; not allowed against bosses.
- Poison status: lasts 4 turns; player takes 4/turn, enemy takes 6/turn.
- Enemy attack: ATK + random(0..2). "heavy" monsters have 30% chance of a x1.5 strong hit;
  "poison" monsters can inflict poison.
- Win when enemy HP hits 0 (gain EXP, remove that monster from the field). Lose when player HP hits 0 (game over).
- Level up at EXP threshold: +11 max HP, +2 ATK, +3 max MP, full heal; next EXP requirement x1.5 (start 22).
- Screen shake and flash on hits.

MONSTERS on Floor B1 (12 types, format HP/ATK/EXP):
Blue Snail 14/4/5, Snail 20/5/7, Red Snail 26/7/10, Ribbon Pig 34/8/15, Green Mushroom 30/7/14 (poison),
Orange Mushroom 36/9/17, Bubbling 38/9/18, Slime 42/10/22, Stump 46/10/24, Zombie Mushroom 50/11/28 (poison),
Dark Stump 56/12/34 (heavy), Wild Boar 62/14/42 (heavy).

BOSS of B1 - Mushmom: HP 170, ATK 15, EXP 140. Appears near the portal after all 5 relics are collected.
3-turn pattern: (1) normal attack, (2) Spore Blast x1.6 + poison, (3) Smash x1.3. Cannot run.
Defeating it opens the portal.

FLOOR B2 "Forgotten Depths": entering keeps the player's level/stats, fully heals, and gives 2 potions.
Different map layout and a stronger monster pool that adds: Curse Eye 60/14/46 (poison),
Wild Kargo 74/16/56 (heavy), Dark Yeti 84/18/66 (heavy), Jr. Balrog 96/19/82 (heavy).
Collect 5 relics here to summon the final boss.

FINAL BOSS - Zakum: HP 330, ATK 21, EXP 420. 4-turn pattern: (1) Earth Wrath x1.4,
(2) Dark Flame Breath x1.3 + poison, (3) Arm Swing x1.1, (4) Fusion Blast x1.8. Cannot run.
Defeating it opens the escape portal -> victory screen.

UI / FLOW
- Top HUD: class, Lv, HP bar, MP bar, potion count, relics 0/5, a hint message.
- Start screen -> class select screen -> game. End screen for win/lose with a Retry button.
- Use MapleStory official assets for characters, monsters, backgrounds, BGM, and SFX
  (attack / skill / pickup / level-up / boss appearance). Keep the bright, cute MapleStory tone.

LANGUAGE (important for this global game jam)
- Default language is ENGLISH. Provide Korean as an optional language with a toggle button
  (top-right). All UI text and battle messages must switch between English and Korean.
  Persist the choice. (This game is judged in a global jam, so English-first is required.)

MOBILE
- Make it playable on mobile: a responsive canvas that scales to the screen, plus on-screen
  touch controls — a D-pad to move and navigate menus, an A button (confirm/Enter) and a B button
  (back/Esc). Show these controls on touch devices / small screens. Touch-friendly UI.

AUDIO
- Add original background music with distinct field / battle / boss themes, and sound effects
  for hit, critical, skill, heal, relic pickup, level-up, boss appearance, and win/lose.
  Include a mute toggle in the top bar. Use only MapleStory-provided audio or original sounds.

IP / NAMING (required)
- Do NOT reference any external/unlicensed IP or other game's name in the title, description, or
  in-game text. Describe the mechanic neutrally (bump-to-battle / encounter-based turn-based).
```

---

## B. 단계별 프롬프트 (원샷 후 하나씩 보강)

원샷 결과가 부족한 부분만 골라 순서대로 입력하세요. (한국어 원본은 `MSU_VIBE_PROMPTS.md` STEP 0~9 참고)

1. Class selection screen (Warrior / Mage / Archer) with stats & skills.
2. Top-down tilemap dungeon + WASD movement + wall collision.
3. 5 relics to collect + locked exit portal that opens later.
4. Wander/chase monsters + "bump = screen transition into battle".
5. Turn-based battle screen with Attack/Skill(submenu)/Potion/Run.
6. Battle rules: damage, crit, multi-hit skills, poison, level up.
7. 12 monster types by tier (use the HP/ATK/EXP table above).
8. B1 boss Mushmom (3-turn pattern), portal opens on defeat.
9. Floor B2 + 4 stronger monsters + final boss Zakum (4-turn pattern) -> victory.
10. HUD, start/class/end screens, MapleStory SFX & BGM.
11. Language: English by default + a Korean toggle (top-right). Translate all UI & battle text.
```
Add a language toggle button at the top-right. Default language is English; allow switching to
Korean. Translate all UI labels and battle messages for both. Remember the choice.
```
12. Mobile: responsive canvas + on-screen D-pad and A/B buttons (shown on touch devices).
```
Make the game playable on mobile: scale the canvas responsively and add on-screen touch controls —
a D-pad to move and navigate menus, an A button to confirm and a B button to go back. Show these
on touch devices and small screens.
```
13. Audio: BGM (field/battle/boss) + SFX + mute toggle. No external/copyrighted audio.
```
Add background music with separate field, battle, and boss themes, plus sound effects for hit,
critical, skill, heal, pickup, level-up, boss, and win/lose. Add a mute toggle in the top bar.
```

---

## ⭐ D. 메이플 공식 에셋 적용 (필수 — 도형 → MapleStory 에셋)

> 로컬 `index.html`은 저작권 때문에 **도형 그래픽**을 씁니다. MSU Space에서는 **반드시 메이플 공식
> 에셋**으로 교체해야 합니다. 다행히 몬스터 16종+보스 2종이 전부 실제 메이플 몬스터라 1:1 매핑됩니다.
> 빌드 후 아래를 **그대로 붙여넣어** 도형을 전부 공식 스프라이트로 바꾸세요.

```
Replace ALL placeholder shapes with official MapleStory (MSU) assets from the asset library:

- Player classes (with idle/walk animations):
  Warrior -> a Warrior-type MapleStory character; Mage -> a Magician-type character;
  Archer -> a Bowman/Archer-type character.

- Monsters — use the official MapleStory monster sprites that match these EXACT names:
  Blue Snail, Snail, Red Snail, Ribbon Pig, Green Mushroom, Orange Mushroom, Bubbling, Slime,
  Stump, Zombie Mushroom, Dark Stump, Wild Boar, Curse Eye, Wild Kargo, Yeti, Jr. Balrog.
  Bosses: Mushmom (B1) and Zakum (final).

- Background / tiles: a Henesys-style dungeon tileset (e.g., a cave/dungeon map).
- BGM: MapleStory field / dungeon / boss tracks. SFX: MapleStory attack/skill/pickup/level-up sounds.
- Relic pickup: a shiny MapleStory item or scroll icon. Portal: the MapleStory portal effect.

Use ONLY official MapleStory / MSU assets — no placeholder shapes, no external or copyrighted art.
Keep all gameplay, balance, classes, skills, floors, language toggle, mobile controls, and audio.
```

---

## C. 자주 쓰는 수정(보강) 프롬프트 예시

```
Make the Mushmom boss a bit easier (less HP and damage).
Add a hit/critical sound effect using MapleStory SFX.
Add a brief "Floor Cleared!" screen between B1 and B2.
The skill submenu should also be clickable with the mouse.
Show floating damage numbers when an enemy is hit.
```

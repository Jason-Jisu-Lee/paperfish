# PAPERFISH design (living doc, maintained by Claude)

Idle/incremental for itch.io then Steam. Single-screen deep sea, descending
zones, no bottom. Player is the diver. Opens lighthearted, turns unsettling
later. Active play is rewarded; the game pauses when hidden and never
progresses unattended. Focus right now: the first hour of gameplay, firstF
loop first. MECHANICS.md holds exact numbers.

## visual language
- Warm paper field, sumi ink strokes, hanko seal red as the only accent.
  Fonts: Shippori Mincho (names, titles), Zen Maru Gothic (UI).
- Fish are single-stroke ink drawings that draw themselves on when appearing
  (standard for every appearance). Sprites never rotate; mirror flips only.
- Right HUD: gold, school (buy) and discover (unlock) tabs, dotted leaders.
  Corner icons: music, screen, pause, settings. Pause veil washes the scene.
- Front page: hero fish draw-on, PAPERFISH title, play / settings / quit,
  Steam and Discord marks, vertical caption, red seal.

## core loop (firstF era)
- Buy eggs, fish earn passively by age stage, click-chase fish for streak
  gold, feed kelp on hunger cycles or fish starve and die, fish die of old
  age paying 10% lifetime value. Spawning sustains population once its
  chance upgrades are bought; no prestige gate.
- Click selects and catches a fish (card opens, struggle calms while held).
  Popping bubbles is the active income placeholder (+10).
- Upgrades so far: firstF Income (per-tick), Kelp (food), Spawning
  (chance), Growth (faster adulthood).

## species ladder (plan)
- firstF fully designed first, then generalize. Until fish 4: many fish,
  plants as food. From fish 5: predators that eat prior fish, with
  prey-count thresholds per predator (define at thirdF).
- 12 traced species assets exist (grid is source of truth, all face right).
  Names are placeholders (firstF, secondF).

## later (direction held, not yet built)
- Zone descent via lump-sum gear, per-zone currency with conversion,
  prestige resetting to zone 1.
- Trait picks at growth stages, floating plant upgrades, story layer,
  the unsettling turn, self-hosted fonts for Steam.

## workflow
- Claude maintains DESIGN.md and MECHANICS.md as decisions land, commits
  and pushes at verified milestones. Numbers are specced on paper before
  implementation; mechanics iterate by feel. One full-loop playtest after
  each system.

# PAPERFISH design (living doc, maintained by Claude)

Idle/incremental for itch.io then Steam. Single-screen deep sea, descending
zones, no bottom. Player is the diver. Opens lighthearted, turns unsettling
later. Active play is rewarded; the game pauses when hidden and never
progresses unattended. Focus right now: the soul-prestige core loop.
MECHANICS.md holds exact numbers.

## visual language
- Warm paper field, sumi ink strokes, hanko seal red as the only accent.
  Fonts: Shippori Mincho (names, titles), Zen Maru Gothic (UI).
- Fish are single-stroke ink drawings that draw themselves on when appearing
  (standard for every appearance). Sprites never rotate; mirror flips only.
- Left HUD: gold, then the shop behind a vertical icon rail (fish, income,
  food, life) in fine-line icons; the active category is red-outlined
  (seal strokes on a faint red wash), one flat level, no nesting.
  Rail icons stay even while their categories are empty.
  Corner icons: music, screen, pause, settings. Pause veil washes the scene.
- Fish card: enlarged-step income graph, values with G units, per-5s hover
  readout under the dot, time tracking the x axis (replaces the end marker
  at the edge), seal-red now-dot. Fish pop briefly with a soft chime on
  evolving; no redraw-on.
- Ocean decor: sepia clam (pearl income), snail, water blue bubbles.
  Seagrass and jellyfish removed in the pivot.
- Front page: hero fish draw-on, PAPERFISH title, play / settings / quit,
  Steam and Discord marks, vertical caption, red seal.

## core loop (soul prestige pivot, 2026-08-15)
- The run: buy eggs, fish earn gold by age stage, hunger as today. Early
  runs are gold-starved; fish starving to death is expected and is the
  engine, not a failure state.
- The egg is the only starter purchase (Fish category). An egg hatches by
  a probability table; at start 100% firstF. Egg cost climbs with each
  purchase during a run.
- Every fish death leaves a soul. Amassed Souls counter sits at the top
  of the screen with a Collect Soul button right under it. Collecting
  transfers the amassed number 1:1 into the prestige shop and ends the
  run; souls of still-living fish are forfeit. First run ends in minutes
  with ~2 souls.
- Gold upgrades are temporary, this run only. Soul upgrades are permanent
  and hold most progression.
- The full upgrade catalog exists on paper (below) and reveals
  progressively in the UI.
- Clam pays its first pearl 3 minutes into a run, then every 60-80s
  (20% of current G/min).

## to decide (soul era)
- currency names: leading pairs Gold + Ink vs Gold + Soul (chat 2026-08-15).
- egg cost curve: start price, growth per purchase, resets each run?
- egg probability table per species; how prestige upgrades shift the odds.
- soul yield: flat 1 per death, or scaled by species / age at death?
- collect flow: always available or gated? confirm dialog? what the run-end
  moment looks like (fish dissolve? fade to prestige shop?).
- what survives a reset: species unlocks, stats, objectives, whispers?
- prestige shop: entry point (post-collect screen? front menu?), layout.
- reveal order for in-game purchases (kelp second?) and the objectives
  rework to teach the new loop.
- pearl value in the new economy (still 20% G/min?).

## upgrade catalog (full list on paper, revealed progressively)
in-game, gold, this run only:
- egg (the only starter purchase)
- kelp, then better foods (hunger management)
- income per tick, tick speed
- spawning chance, growth speed, longevity
- egg discount, active-click income
prestige, souls, permanent:
- egg probability shifts (unlock and weight secondF+)
- starting gold, starting kelp
- soul yield per death
- income multipliers, slower hunger
- clam: earlier first pearl, richer pearls
- keep-on-reset perks (e.g. first egg free)
- reveal gates that open more in-game upgrade slots

## species ladder (plan)
- firstF fully designed first, then generalize. Until fish 4: many fish,
  plants as food. From fish 5: predators that eat prior fish, with
  prey-count thresholds per predator (define at thirdF).
- 12 traced species assets exist (grid is source of truth, all face right).
  Names are placeholders (firstF, secondF).

## later (direction held, not yet built)
- Zone descent via lump-sum gear, per-zone currency with conversion,
  layered on top of soul prestige.
- Trait picks at growth stages, floating plant upgrades, story layer,
  the unsettling turn, self-hosted fonts for Steam.

## workflow
- Claude maintains DESIGN.md and MECHANICS.md as decisions land, commits
  and pushes at verified milestones. Numbers are specced on paper before
  implementation; mechanics iterate by feel. One full-loop playtest after
  each system.

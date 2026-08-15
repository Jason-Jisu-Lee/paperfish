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

## core loop (soul prestige, implemented 2026-08-15)
- Currencies: Gold (run) + Soul (prestige). Souls render in water blue
  (#3e546e family); gold stays #7a5800.
- Run start: 1 firstF + 50 gold. The egg is the only live purchase
  (Fish category): 50 G, +10 G per purchase, resets each run. 100%
  firstF for now (probability table later).
- firstF: 1 min life, adult at 0:30 (income 1 G/5s baby, 2 G/5s adult).
  Hunger machinery stays but never fires inside a 1-min life.
- Every fish death pays soulYield souls (1 + Extra Soul level), shown as
  a blue +N pop, bigger than gold pops. Souls counter top middle with
  Collect Soul button under it (dimmed at 0).
- Collect Soul: banks amassed souls 1:1, freezes the world, opens the
  Prestige overlay (souls of living fish forfeit). Prestige shop has one
  upgrade: Extra Soul (+1 soul per death), cost 2 doubling per level
  (placeholder curve). Dive Again starts a fresh run; bank, upgrade
  levels, and first-time whisper flags persist.
- Whispers (only two, both fire once EVER, flags in the persistent save):
  "Soul collected" on the very first fish death, "Fish got bigger" on the
  very first maturing.
- Objectives: none; obj.js keeps the box format for the rework.
- Upgrade catalog is visible for dev: dev-locked entries (dashed, faded,
  red "dev" tag, cost —) fill the income/food/life grids, same dashed
  treatment on their rail icons; only the fish icon is live. Players
  can't buy dev-locked entries.
- Clam pays its first pearl 3 min into a run, then every 60-80s
  (20% of current G/min). Snail and bubbles stay; lanterns, seagrass,
  jellyfish, courtship/spawning, placeholder foods, stat upgrades all
  removed.
- Other species exist as assets only (SPECIES keeps art fields; firstF
  holds the only gameplay data).

## to decide (soul era)
- egg probability table per species; how prestige upgrades shift the odds.
- Extra Soul cost curve (current 2/4/8/16 is a placeholder).
- second in-game purchase to reveal (kelp?) and the reveal mechanism.
- objectives rework to teach the loop; whisper additions.
- collect flow polish: confirm dialog? fish dissolve animation on run end?
- soul yield scaling by species / age (flat for now).
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

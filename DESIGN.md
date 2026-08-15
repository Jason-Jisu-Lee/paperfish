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
- Fish card: enlarged-step income graph, y axis in G per 5s (unit caption
  "G / 5s" above the axis), per-5s hover readout under the dot, time
  tracking the x axis (replaces the end marker at the edge), seal-red
  now-dot. Fish pop briefly with a soft chime on evolving; no redraw-on.
- Egg art: wrapped direction (demos/eggs.html option 2). All eggs use
  tier 1 art (clean band-less egg) until tiers exist; bands + red knot
  arrive with tiers 2-3. Same silhouette in shop icon and world egg.
- Ocean decor: sepia clam (pearl income), water blue bubbles. Seagrass and
  jellyfish removed in the pivot; snail promoted to a Tier 2 creature
  (needs a real SPECIES asset when Tier 2 lands).
- Front page: hero fish draw-on, PAPERFISH title, play / settings / quit,
  Steam and Discord marks, vertical caption, red seal.

## core loop (soul prestige, tier era 2026-08-15)
- Currencies: Gold (run) + Soul (prestige). Souls render in water blue
  (#3e546e family); gold stays #7a5800.
- Run start: 1 firstF + 10 gold (+5 per Starting Gold prestige level).
- Egg: 10 G, +5 G per purchase, cost resets each run. Hatch time is a
  single constant (20s) for every tier. The species is rolled the moment
  the egg is purchased; Tier 1 = 100% firstF for now. Egg button: big
  wrapped-egg icon matching the world egg, no count badge, cost below,
  hover reads "Tier 1 Egg", and an "i" info dot top-left opens a popover
  listing each tier's possible fish with odds (Tier 1 / firstF 100% only
  for now).
- Fish: fixed income for every fish, no maturity income difference:
  1 G / 5s base + in-game Income levels + prestige Base Income levels.
  Growth to adult is visual only (half of life), keeps its pop, chime,
  and one-time "Fish got bigger" whisper. Income graph removed from the
  fish card; the card shows age, income, death value.
- Lifespan: shared per tier. Tier 1 base 10s, +5s per in-game Lifespan
  level (run-only).
- Hunger: every fish, first hunger 10s after birth, again 10s after each
  bite. A fish only becomes hungry if that moment lands before its death
  age, so base-life (10s) fish never hunger; the system wakes with the
  first Lifespan level. Kelp costs 2 G, 2 bites, one bite satisfies 10s
  (2s eating pause). Hungry or starving fish forfeit their souls when
  they die (mid-bite eaters don't); the fish card death row shows
  "none, hungry" while it would forfeit. A held (selected) fish is
  lifted out of time: age, hunger, and income pause while the card is
  open.
- Hunger tutorial (first hunger EVER, flag in save): world freezes, box
  points at the fish: "Fish is hungry. Hungry fish do not generate soul
  when deceased" -> Next -> the food rail icon (hidden until now)
  appears flashing red: "Buy food for your fish" -> clicking the food
  icon ends the tutorial; the player buys kelp themselves.
- Souls: each soulful death pays 1 + Extra Soul level, blue +N pop.
  Counter top middle, Collect Soul under it; collecting banks 1:1,
  freezes the world, opens the Prestige overlay; Dive Again resets the
  run (gold to startGold, egg cost, run upgrades, kelp all reset).
  The open shop persists in the save: refreshing mid-prestige returns
  to the shop, never back to the collected run.
- Prestige shop: one scrollable list, categories divided by rule lines,
  no per-category clicking. Live: Extra Soul (+1 soul), Starting Gold
  (+5), Base Income (+1 G). Dev-tagged, purchasable but no effect yet:
  Tier 2 Chance (+10%, +5% per later level), Tier 3 (+5%, +2.5%),
  Tier 4 (+3%, +1.5%), Tier 5 (+1.5%, +0.75%), Tier 6 (+0.5%, +0.25%).
- In-game upgrades: Income +1 G/5s (income icon), Lifespan +5s (life
  icon, meant to be somewhat expensive), Kelp (food icon, revealed by
  the tutorial). Rail icons for income/life are live from the start.
- Whispers: "Soul collected" (first soulful death ever), "Fish got
  bigger" (first maturing ever). Objectives: none; format kept.
- Clam pays its first pearl 3 min into a run, then every 60-80s
  (20% of current G/min).
- SPECIES entries are pure art assets; all gameplay numbers live in
  core/state.js.

## tier plan (demos/tiers.html, all numbers TBD)
- Tier 1: firstF, Sardine. Tier 2: secondF, Snail. Tier 3: Cod, Trout.
  Tier 4: Flounder, Mackerel. Tier 5: Pike, Seahorse. Tier 6: Ray,
  Jellyfish, Anglerfish.
- Bigger, fancier, rarer climbs tiers; per-tier income, lifespan, odds,
  and exact membership all await the tier brainstorm.

## placeholder dials (picked by Claude, awaiting spec)
- Extra Soul 2·2^lvl, Starting Gold 2·2^lvl, Base Income 3·2^lvl,
  Tier Chance 5·2^lvl souls; in-game Income 25·2^lvl, Lifespan 40·2^lvl
  gold; hatch 20s; hungry window 20s -> starving 10s -> death.

## to decide (soul era)
- per-tier income / lifespan / odds; egg roll implementation.
- all cost curves above; pearl value in the new economy.
- snail asset + behavior as a Tier 2 creature.
- objectives rework; collect-flow polish (confirm? dissolve animation?).

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

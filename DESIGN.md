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
  now-dot. Fish pop briefly on evolving; no redraw-on.
- Fish card is a specimen plate (demos/fishcard.html option 1): art panel
  with the creature drawn large, seal-red tier stamp in the corner
  holding the tier number, name in Shippori, stage and age side by side
  and readable, a life bar that drains, then icon-led stat rows for
  income and death value. Eggs use the same plate with the egg art and a
  hatch countdown.
- Egg art: wrapped direction (demos/eggs.html option 2). All eggs use
  tier 1 art (clean band-less egg) until tiers exist; bands + red knot
  arrive with tiers 2-3. Same silhouette in shop icon and world egg; both render as a solid
  shell (paper-white fill, no shadow: nothing underwater casts one) so eggs read against
  the line-art world (eggvis option 1, picked 2026-08-15).
- Ocean decor: sepia clam (pearl income), water blue bubbles, and a
  scatter-cloud school of ~20-27 tiny fish that flees across the
  background every 20-50s: loose formation, individual wobble,
  accelerating as it crosses, fading in and out at the edges. Seagrass and
  jellyfish removed in the pivot; snail promoted to a Tier 2 creature
  (needs a real SPECIES asset when Tier 2 lands).
- Front page: hero fish draw-on, PAPERFISH title, play / settings / quit,
  Steam and Discord marks, vertical caption, red seal.

## core loop (soul prestige, tier era 2026-08-15)
- Currencies: Gold (run) + Soul (prestige). Souls render in water blue
  (#3e546e family); gold stays #7a5800.
- Run start: 1 firstF + 10 gold (+5 per Starting Gold prestige level,
  raised from 5 base 2026-08-16).
- Egg: hand-tuned cost curve 5, 7, 12, 20, 25, 30, 40, 50, 70, 90, 120,
  150, 200, 250, 300, then x1.3 per purchase rounded to 2 significant
  digits; cost resets each run. Hatch time is
  per tier: Tier 1 hatches in 8s, Tier 2 in 12s (tiers 3-6 placeholder
  20/30/45/60s). The species is rolled the moment
  the egg is purchased; Tier 1 = 100% firstF for now. Egg button: big
  wrapped-egg icon matching the world egg, no count badge, cost below,
  hover reads "Tier 1 Egg", and an "i" info dot top-left opens a popover
  listing each tier's possible fish with odds (Tier 1 / firstF 100% only
  for now).
- Gold feedback: every income tick pops "+N G" above the fish (17px,
  1.5s, near-full opacity) and the gold counter scales and warms for a
  beat, so earning is unmissable.
- Fish: fixed income for every fish, no maturity income difference:
  1 G / 5s base + in-game Income levels + prestige Base Income levels.
  Growth to adult is visual only and happens at a fixed age of 30s, so
  a fish only ever reaches it with Lifespan levels (base life 20s dies
  first). Keeps its pop and one-time "Fish got bigger" whisper. Adulthood doing nothing is BY
  DESIGN (confirmed 2026-08-15).
- Soul counter: the number is dead-center top screen, much larger than
  gold; SOUL sits to its right as a currency label that doesn't shift
  the centering. Income graph removed from the
  fish card; the card shows age, income, death value.
- Lifespan: shared per tier. Tier 1 base 20s, +5s per Tier 1 Lifespan
  PRESTIGE level (persists across runs; costs 2, 5, 10, 20 souls then
  doubling). It only affects Tier 1 fish. The in-game life category is
  gone; its rail icon is hidden until a life upgrade exists again.
  Tier 2 of the prestige shop holds a second Lifespan upgrade: +10s per
  level (costs 15 souls doubling, placeholder). For now it stacks onto
  all fish since only Tier 1 exists; per-tier split awaits the tier
  brainstorm (2026-08-16).
- World egg is 40% smaller than the shop icon (same art). Prestige exit
  button reads "Start".
- Fish Index: a section at the bottom of the prestige screen listing
  every creature by tier; discovered fish in full ink with names,
  undiscovered as grey silhouettes named "?". Only firstF counts as
  discovered for now (real discovery tracking TBD; snail card waits on
  its asset).
- Hunger: every fish, first hunger 20s after birth, again 20s after each
  bite. A fish only becomes hungry if that moment lands before its death
  age, so base-life (20s) fish never hunger; the system wakes with the
  first Lifespan level. Kelp costs 2 G, 2 bites, one bite satisfies 10s
  (2s eating pause). Hungry or starving fish forfeit their souls when
  they die (mid-bite eaters don't); the fish card death row shows
  "none, hungry" while it would forfeit. A held (selected) fish keeps
  aging, hungering, and earning while the card is open (confirmed
  2026-08-15); it just can't swim to food while held.
- Hunger tutorial (first hunger EVER, flag in save): world freezes, box
  points at the fish: "Fish is hungry. Hungry fish do not generate soul
  when deceased" -> Next -> the food rail icon (hidden until now)
  appears flashing red: "Buy food for your fish" -> clicking the food
  icon ends the tutorial; the player buys kelp themselves.
  Explicitly gated: never fires unless a lifespan upgrade has pushed
  life past the 20s hunger point AND the fish has lived past 20s. During any tutorial box an
  ink scrim dims the whole screen; a soft spotlight hole stays on the
  subject (the fish, then the food icon) and glides between steps
  (2026-08-16).
- Souls: each soulful death pays 1 + Extra Soul level the instant the
  fish dies (not when the body finishes sinking), shown as a big
  blue +N pop (21px, ~1.8s, slow rise) so the reward is unmissable.
  Counter top middle, Collect Soul under it (button and its objective
  reveal at 3 souls, raised from 2); collecting banks 1:1,
  freezes the world, opens the Prestige overlay; Dive Again resets the
  run (gold to startGold, egg cost, run upgrades, kelp all reset).
  The open shop persists in the save: refreshing mid-prestige returns
  to the shop, never back to the collected run.
- Prestige is a fullscreen animated screen (the reward heart of the
  game): blue-washed paper takeover, PRESTIGE title, giant glowing
  serif soul count, background soul wisps rising, staggered card
  entrance on open, fixed Dive Again pill at the bottom. Upgrades are
  hover-lift cards: name + cost always visible, one-line gamer-speak
  description reveals on hover in a reserved slot (no reflow), level
  shows as "Lv N" only when above 0 (never ×0). Scrollable, categories
  with wide spacing: BASICS (Starting Gold +5 at 2·2^lvl, Base Income
  +1 G/5s at 3·2^lvl, Starting Kelp +1 kelp each run at flat 5 souls
  capped at Lv 5, Extra Soul +1 at 20·2^lvl) then TIER 2-6 chance
  cards (dev-tagged, purchasable, no effect yet: +10%/+5, +5%/+2.5,
  +3%/+1.5, +1.5%/+0.75, +0.5%/+0.25) at 30·10^(tier-2)·2^lvl souls:
  bases 30, 300, 3k, 30k, 300k, incremental-style exponential across
  tiers.
- Card indicator language: red "dev" tag = not functional yet; grey
  "hidden" tag + dashed border = functional but not yet visible to
  players (reveal gate unmet), dev-only during playtests. Starting
  Kelp is gated behind the first Tier 1 Lifespan prestige level
  (Game.pLife > 0).
- In-game upgrades: Income +1 G/5s (income icon), Kelp (food icon,
  revealed by the tutorial). Income icon is live from the start.
- Whispers, each once ever: "This fish doesn't live very long" on the
  first fish death of all time, "Need more soul..." on the first death
  after the first prestige (so, run two), "Fish got bigger" on the first
  maturing.
- Objective HUD is bare (demos/obj.html option 4): no panel, border, or
  shadow, right aligned under the corner icons, and NEVER titled
  "Objective". Task text with an ink ring beside it; on completion the
  ring stamps into a seal-red hanko with a check drawing across it, the
  text strikes through, and the reward chip flies into the gold or soul
  counter, landing exactly as that counter ticks up.
- Objectives (box top right, data/content.js OBJECTIVES): once EVER,
  stored in Game.objs which persists across dives; a completed
  objective never reappears (changed from run-scoped 2026-08-16).
  Gold rewards pay into the run; a reward flagged soul:true pays into
  the soul counter. Objectives can carry a count (progress shown as
  "1 / 2" in the row); each event ticks it and completion fires at the
  target. Current list:
  1. "Buy two eggs" +5 G, count 2, ticks per egg purchase.
  2. "Collect gold from Paper Lantern" +3 G, completes on the first
     lantern tap.
  3. "Collect Soul" +1 Soul, fires on clicking Collect Soul. The soul
     counter keeps showing the player's souls during the ~2s objective
     animation, the +1 chip flies into it and ticks it up, then the
     whole total banks as the prestige screen opens. Normal collects
     open it immediately.
- Paper Lantern (world/lantern.js): a warm-glowing chochin that fades
  in mid-water (64% across, 26% down the swim area) the moment the
  two-egg objective completes. Each tap pays 3 G with a +3 G pop and a
  bump; after 3 taps it drifts up and fades for good (taps persist in
  the save, once ever like its objective). DOM overlay, gentle bob,
  clicks blocked while paused / tutorial / shop.
- Clam sits bottom-left of the swim area and pays its first pearl 3 min into a run, then every 60-80s
  (20% of current G/min).
- SPECIES entries are pure art assets; all gameplay numbers live in
  core/state.js.

## first run tutorial (PROPOSED 2026-08-16, awaiting approval)
The whole first run is tutorial-driven. Same modal-tutorial mechanic as
the hunger tutorial: the world freezes, a box points at the subject,
and the step ends on Next or on the player doing the thing. Every step
fires once ever (flags in the persistent save), so later runs are silent.
  1. points at the starting fish: "This fish earns gold while it lives."
     [Next]
  2. points at the gold counter as the first income lands: "That gold is
     yours. Eggs cost gold." [Next]
  3. points at the egg button: "Buy an egg." [player must click it]
  4. points at the new egg: "It hatches in 8 seconds." [Next, unfreeze]
  5. on the first death, points at the soul pop: "Fish do not last. Each
     one leaves a soul." [Next]
  6. points at Collect Soul: "Collecting ends the dive and banks your
     souls." [player must click]
  7. on the prestige screen, points at the cards: "Spend souls here.
     These never reset." [player must buy one]
  8. points at Start: "Dive again." [player must click; tutorial done]
The existing hunger tutorial stays where it is, triggered by the first
hunger ever, which now happens only after Tier 1 Lifespan Lv 1.

## environment (demos/reef.html, pick pending)
- Reef backdrop options: ink wash mounds, coral branches, sea fans, or a
  layered mix. Positions randomize every run, drawn behind everything at
  very low alpha.
- Passing school options: tight arrow, scatter cloud, or single-file
  ribbon. Rare, fast, brief, background only, purely decorative.
- Egg integration options: rest on the floor, tether to kelp, ink wash
  shell, or a clutch of three. Current mid-water hover reads unnatural.

## tier plan (demos/tiers.html, all numbers TBD)
- Tier 1: firstF, Sardine. Tier 2: secondF, Snail. Tier 3: Cod, Trout.
  Tier 4: Flounder, Mackerel. Tier 5: Pike, Seahorse. Tier 6: Ray,
  Jellyfish, Anglerfish.
- Bigger, fancier, rarer climbs tiers; per-tier income, lifespan, odds,
  and exact membership all await the tier brainstorm.

## placeholder dials (picked by Claude, awaiting spec)
- Extra Soul 2·2^lvl, Starting Gold 2·2^lvl, Base Income 3·2^lvl,
  Tier Chance 5·2^lvl, Tier 2 Lifespan 15·2^lvl souls; in-game Income
  25·2^lvl, Lifespan 40·2^lvl gold; hatch 20s; hungry window 20s ->
  starving 10s -> death.

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

## audio
- All sound effects removed 2026-08-15 (audio/sfx.js deleted); sound
  returns as a designed pass later. The Sound toggle in settings stays
  wired to the flag for when it does.

## workflow
- Claude maintains DESIGN.md and MECHANICS.md as decisions land, commits
  and pushes at verified milestones. Numbers are specced on paper before
  implementation; mechanics iterate by feel. One full-loop playtest after
  each system.

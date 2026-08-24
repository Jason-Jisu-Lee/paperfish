# PAPERFISH design (living doc, maintained by Claude)

Idle/incremental for itch.io then Steam. Single-screen deep sea, descending
zones, no bottom. Player is the diver. Opens lighthearted, turns unsettling
later. Active play is rewarded; the game pauses when hidden and never
progresses unattended. Focus right now: the soul-prestige core loop.
Exact numbers live in core/state.js.

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
- Fish pop briefly on evolving; no redraw-on.
- Fish card is a specimen plate (picked from demo options): art panel
  with the creature drawn large, seal-red tier stamp in the corner
  holding the tier number, name in Shippori, stage and age side by side
  and readable, a life bar that drains, then icon-led stat rows for
  income and death value. Eggs use the same plate with the egg art and a
  hatch countdown.
- Egg art: wrapped direction (picked from demo options). All eggs use
  tier 1 art (clean band-less egg) until tiers exist; bands + red knot
  arrive with tiers 2-3. Same silhouette in shop icon and world egg; both render as a solid
  shell (paper-white fill, no shadow: nothing underwater casts one) so eggs read against
  the line-art world (eggvis option 1, picked 2026-08-15).
- Ocean decor: sepia clam (pearl income), water blue bubbles, and a
  scatter-cloud school of ~26-35 tiny fish that flees across the
  background every 20-50s: loose formation, individual wobble,
  accelerating as it crosses, fading in and out at the edges. It
  enters from the left or right edge at any height and crosses
  horizontally with a gentle vertical wobble (no vertical or diagonal
  headings, 2026-08-16); speed and size tuned by feel over several passes
  (latest 2026-08-17: 40% smaller, 50% faster). Two depth layers per
  crossing (2026-08-17): ~42% of the fish render smaller, fainter,
  and slowly fall behind the group, a parallax read inside one blob.
  1 in 10 crossings is a giant deep-background school: fish 3.6x
  bigger, near-invisible (about a third of normal alpha), moving at
  ~0.4x speed, drawn behind even the shadow ray, so the ocean
  occasionally feels vast. School fish render as brush dashes, one
  calligraphic tapered stroke each, no tail (picked 2026-08-17 from
  demo options); in-blob motion stays the existing
  wobble, judged to already read like a real school. Seagrass and
  jellyfish removed in the pivot; snail promoted to a Tier 2 creature
  (needs a real SPECIES asset when Tier 2 lands).
- Front page: hero fish draw-on, PAPERFISH title, play / settings,
  Steam and Discord marks (inert placeholders, no links yet), red seal.

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
  undiscovered as grey silhouettes named "???". The dev panel "reveal"
  toggle (Game.devReveal, 2026-08-17) swaps ??? for real species names;
  the same flag will gate future dev-only reveals (hidden upgrades etc.).
  Only firstF counts as discovered for now (real discovery tracking TBD;
  snail card waits on its asset).
- Hunger: every fish, first hunger 20s after birth, again 20s after each
  bite. A fish only becomes hungry if that moment lands before its death
  age, so base-life (20s) fish never hunger; the system wakes with the
  first Lifespan level. Kelp costs 2 G, 2 bites, one bite satisfies 20s
  (2s eating pause). Only starving fish forfeit their souls when they
  die (mid-bite eaters don't; merely hungry pays full); the
  fish card death row shows 0 while it would forfeit. A held (selected) fish keeps
  aging, hungering, and earning while the card is open (confirmed
  2026-08-15); it just can't swim to food while held.
- Intro tutorial: fires once per save the moment the first fish
  finishes swimming in. A fresh save spawns its first fish in the
  middle 20% band of open water so the tutorial layout is consistent.
  The world freezes and the fish is auto-selected with its card open,
  card placed on the fish's screen-center side; the tutorial box sits
  beyond the card on that same side (fish, card, leader line, box in
  one row, ~130px gap, compressing on narrow windows), so nothing
  covers the fish. The whole arrangement re-anchors on window resize.
  Step 1 spotlights the card's life bar: "Fish dies when the life
  timer reaches 0, and grants Soul which is used for Research" -> Next.
  Step 2 spotlights the card's hunger bar: "Fish gets Hungry, and then
  Starving as hunger bar drops. Starving fish do not grant soul. Click
  empty space to feed the fish" -> Sure, and the game resumes. Both
  lines are CEO-dictated copy, verbatim. Feeding stays locked until
  Sure. During any tutorial an ink scrim dims the screen with an exact
  rectangular cutout on the subject, framed by a seal-red hairline; a
  red leader line runs from the frame to the box, and frame, line, and
  box glide between steps. The tutorial button is an ink pill with
  seal hover, matching the game's CTA language. Soul spends are called
  Research; the word upgrade is banned from player copy (the prestige
  tab is Unlocks). The fish card carries life and hunger meters styled
  like the hover tip (leaf and pellet icons, hunger seal red when low).
- Souls: each soulful death pays 1 + Extra Soul level the instant the
  fish dies (not when the body finishes sinking), shown as a big
  blue +N pop (21px, ~1.8s, slow rise) so the reward is unmissable.
  Counter top middle, Collect Soul under it (button reveals at 3
  souls the first time ever, then stays usable at ANY count including
  0, the standard end-run-whenever prestige affordance, 2026-08-17);
  collecting banks 1:1,
  freezes the world, opens the Prestige overlay; Start resets the
  run (gold to startGold, egg cost, run upgrades, kelp all reset).
  The open shop persists in the save: refreshing mid-prestige returns
  to the shop, never back to the collected run.
- Prestige is a fullscreen animated screen (the reward heart of the
  game): blue-washed paper takeover, Prestige title, giant glowing
  serif soul count, background soul wisps rising, staggered card
  entrance on open, fixed Start pill at the bottom. Upgrades are
  hover-lift cards: name + cost always visible, one-line gamer-speak
  description reveals on hover in a reserved slot (no reflow), level
  shows as "Lv N" only when above 0 (never ×0). Scrollable, categories
  with wide spacing: BASICS (Starting Gold +5 at 4·2^lvl, Base Income
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
- Intro tutorial cut (2026-08-16): the run opens with no freeze or
  box. The egg button pulses seal-red from run start until the first
  egg ever (flag eggBought); the objective HUD arriving on the first
  fish death is the opening beat. The hunger tutorial is the only modal tutorial left.
- Prestige intro tour (2026-08-16, flag pIntro): first shop entry only,
  fires 950ms after open. Three spotlight steps over the tabs, one line
  each (Main / Tiers / Fish Index), Next then Got it. Diving mid-tour
  ends it for good.
- Objective HUD is bare and top center (picked 2026-08-16 from demo
  options): no panel, border, or shadow, and NEVER titled
  "Objective". It sits centered below the Collect Soul button's
  reserved slot under the soul counter, so the button appearing later
  never moves it. Row: ink ring, task text, progress count; the reward
  chip sits on its own line underneath. New objectives arrive with a
  slide-in, a fading red ink wash, and a seal-red ring flash. On
  completion the ring stamps into a seal-red hanko with a check, the
  text strikes through, and the chip flies into the gold or soul
  counter, landing exactly as that counter ticks up.
- Objectives (data/content.js OBJECTIVES): once EVER, stored in
  Game.objs which persists across dives; a completed objective never
  reappears. Counts tick by amount via Obj.event(id, n). Current list
  is one objective: "Collect 3 Souls" (+10 G, count 3), arriving the
  moment the first fish ever starts dying (flag obj1, fired before the
  soul is paid so that soul counts; then visible from run start)
  and ticked by each soul paid on death; completing it
  coincides with the Collect Soul button revealing at 3 souls.
  Clicking Collect Soul during the reward animation defers the
  prestige screen ~2s (Obj.busy) so the reward lands in the counter
  and banks with the rest. The egg and Paper Lantern objectives and the
  lantern object itself were cut (2026-08-16).
- Clam sits bottom-left of the open water and pays its first pearl 3 min into a run, then every 60-80s
  (20% of current G/min).
- Two swim rectangles (2026-08-16): fish ROAM nearly the whole screen
  (24px side margins, top 64px, bottom 0.875H above the ground line)
  including behind the translucent upgrade panel, like the shadow ray;
  the panel is click-transparent everywhere except its actual buttons,
  so fish behind it stay selectable (2026-08-17);
  an anti-lurk timer kicks any fish that dawdles behind the panel over
  4s back into open water; a gold-counter zone steers them down out
  of the top-left, and a top-center zone (soul counter + objective,
  30px sides, 70px below so income/soul pops clear the buttons) turns
  fish away at its rim and sinks out any that end up inside
  (2026-08-17). Each visible upgrade card and rail icon is also its
  own small exclusion box (12px pad): a fish inside gets pushed out
  the nearest edge, so fish still roam the panel area and slip
  between buttons but never sit directly behind one, keeping both
  the UI readable and the fish clickable (2026-08-17). SPAWNS (eggs, kelp, clam) stay in the open
  water right of the panel; eggs and kelp also reroll their spot until
  clear of visible UI overlays (gold, soul counter, objective, corner
  icons).
- Idle hover (2026-08-17): on top of cruise/glide/dart, each fish rolls
  two personal timers for a near-still drift (2-5 px/s, idle tail sway,
  ~0.8s ease-in, resumes with a natural tail kick): every 10-30s a 50%
  chance of a 1-3s hover, every 25-50s a 25% chance of a 3-6s one.
  Fleeing, hungry, eating, and held fish skip it; a scare pauses the
  hover and it resumes after.
- SPECIES entries are pure art assets; all gameplay numbers live in
  core/state.js.
- Paper lantern (2026-08-17, world/lantern.js): one at a time, spawns
  15-17s (minus 1s per Lantern Tide level, max 5, 150·2^lvl souls,
  late-game) after the previous one ends. It descends slowly from the
  top of open water, swaying; reaching the bottom fades it out.
  3 charges; each click pays 1 G plus 1 per Lantern Gold level
  (max 10, 3·2^lvl souls). Glow and flame dim as charges spend.
  Curious Fish (4% per level, max 5, 10·2^lvl souls): a tier 1 fish
  entering the trigger radius (0.9x the shadow ray's on-screen
  height, ~250px, cut 40% from the first pass) rolls its chance
  exactly once per lantern; on success it swims over and taps the
  lantern's center with its head, worth one click. The dev reveal
  toggle draws the radius as a dashed ring for tuning. Art is the
  first-ever lantern recovered from m1/firstF_refinement (d744dec)
  after two redesign rounds missed: compact barrel with bowed sides,
  paper-white fill and clear ink border, two straight rib lines,
  small outlined caps, tiny flickering muted-gold flame, whisper of
  glow (0.15 alpha); fill and flame dim as charges spend, and it
  jolts on each tap.
- Auto Egg (flat 20 souls, one level): once owned, an egg is bought
  automatically the moment gold covers the current egg cost.

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

## environment (pick pending; demos retired 2026-08-19)
- Reef backdrop options: ink wash mounds, coral branches, sea fans, or a
  layered mix. Positions randomize every run, drawn behind everything at
  very low alpha.
- Passing school options: tight arrow, scatter cloud, or single-file
  ribbon. Rare, fast, brief, background only, purely decorative.
- Egg integration options: rest on the floor, tether to kelp, ink wash
  shell, or a clutch of three. Current mid-water hover reads unnatural.

## tier plan (2026-08-16)
- Membership follows species order: Tier 1 firstF, secondF (2 fish).
  Tier 2 thirdF-sixthF (4). Tier 3 seventhF-tenthF (4). Tier 4
  eleventhF, twelfthF (2). Tiers 5-6: two undesigned slots each, shown
  in the index as dashed cards with a plain "?" icon.
- Unlocking a tier unlocks ALL fish in that tier at once.
- All 12 names are ordinal placeholders (firstF ... twelfthF).
- secondF earns the same income as firstF (income is global for now).
- Bigger, fancier, rarer climbs tiers; per-tier income, lifespan, odds
  await the tier brainstorm.

## placeholder dials (picked by Claude, awaiting spec)
- Souls: Extra Soul 20·2^lvl, Starting Gold 4·2^lvl, Base Income
  3·2^lvl, Lifespan [2,5,10,20] then 20·2^(lvl-3), Lifespan II
  15·2^lvl, Tier Chance 30·10^(tier-2)·2^lvl, Starting Kelp flat 5.
  In-game gold: Income 5 first, then 25·2^(lvl-1); kelp 2. Hatch 8s; hungry window
  20s -> starving 10s -> death.

## to decide (soul era)
- per-tier income / lifespan / odds; egg roll implementation.
- all cost curves above; pearl value in the new economy.
- snail asset + behavior as a Tier 2 creature.
- objectives rework; collect-flow polish (confirm? dissolve animation?).

## gacha groundwork (2026-08-17)
- Tiers (2026-08-17): Tier 1 is firstF alone; Tier 2 is secondF,
  fourthF, fifthF, thirdF; Tier 3 is eighthF, ninthF, tenthF; Tier 4
  holds species 10-11 (TIER_FISH in state.js).
- Tier 2 fish earn base 2 G/5s (Tier 1 base 1); income upgrades stack
  on top (fishIncome in state.js).
- Souls scale x3 per tier (2026-08-22): base yield 3^(tier-1), so
  1 / 3 / 9 / 27 for Tiers 1-4; Extra Soul adds flat on top
  (soulYieldOf in state.js).
- In-game Fish Tier (2026-08-18, fish tab):
  cascading tier-up roll, the standard gacha rarity ladder. Each egg
  starts at Tier 1 and climbs one tier per success at chance p, rolled
  tier by tier. Species within the landed tier is a uniform pick.
  Cost 25·1.25^lvl G, resets each run.
- Curve (2026-08-20): p = 50% - 30%·0.9^(lvl-1), 0% at
  Lv 0, max 50 levels. Lv 1 = 20%, Lv 2 = 23%, Lv 5 = 30%, Lv 10 =
  38%, Lv 20 = 46%, cap 50%. First buy is the big unlock moment;
  the rest is diminishing polish.
- Egg info modal lists every tier with live hatch odds; unseen species
  show their silhouette with ??? for the name; sub-1% odds display as
  "<1%", never decimals (fmtPct in state.js).
- Fish Index cards show a rarity line under the name: the live chance
  an egg hatches that fish's tier. Index tooltip fixed to per-species
  stats (fishIncome / soulYieldOf).
- Game track: audio/Two Harps from 13s.mp3, trimmed at the file level
  (first 13.000s cut, re-encoded from audio/original). No runtime
  seeking (currentTime seeks can stall or fall back to 0 on servers
  without Range support).
- In-game Lifespan (life tab): +5s fish life per level, 40·2^lvl G,
  resets each run; stacks with prestige Lifespans.
- Hunger (2026-08-21): continuous hunger meter; numbers live in
  MECHANICS.md. Feeding is
  the core early loop: click open water to drop a free pellet, one
  fish eats it. Hover a fish to see its hunger bar (seal red when
  hungry); no numbers shown, ever. Hungry fish seek the nearest food
  (pellet or kelp). Kelp is an advanced tool (unlock 100 souls,
  moving further back later); bigger plant roles planned.
- Life Burn (2026-08-21): prestige one-time buy, 500 souls, Soul
  section. Grants a flame button in the corner nav (leftmost slot, no
  reflow) usable once per dive: every living fish ages one minute.
  Late-game soul harvest lever; early fish just die from it.
- Fish Tier card shows an egg-with-chevron icon instead of its name;
  the hover tip now leads with the upgrade name.
- Seek model (2026-08-21): every fish opportunistically eats food
  within a 130px radius at gentle speed; hungry removes the radius
  (global, immediate); starving adds a big speed boost. Numbers in
  MECHANICS.md.
- Dev mode (2026-08-21): the dev panel's reveal row is now a single
  on/off "dev mode" toggle. On: fish names revealed in the index,
  lantern debug overlay, eat-radius rings drawn, and ALL tutorials
  suppressed (any active tutorial aborts). Tutorials stay in the
  real game.
- Egg ladder (2026-08-21): opens 2, 3, 5, 8, then eases into the
  standard curve; Starting Gold prestige +5 per level, 4 souls
  doubling; run starts at 10 G.
- Bite tightened (2026-08-21): pellet vanishes only when the mouth
  tip actually touches it (10px); casual eat radius 234px.
- Egg buy cooldown (2026-08-21): 0.5s real-time between egg buys;
  the button disables and a translucent wipe drains across it, the
  standard action-cooldown pattern. Auto Egg respects it too (max 2
  eggs per second).
- Tier gates deleted (2026-08-21): the prestige Hatch Chance buys are
  gone entirely; the in-run Fish Tier upgrade is the only tier lever
  and all 4 tiers are open. Tiers tab now holds only the two
  Lifespan upgrades. Fish Index shows no rarity % (it changes in-run
  anyway).
- Unlock cards renamed Unlock Income / Unlock Kelp / Unlock Fish
  Tier / Unlock Lifespan (2026-08-21).
- Hunger tweaks (2026-08-21): hatch fill 80%; the single starting
  fish of a brand-new save still spawns at 60% so feeding teaches
  itself immediately. Casual eat radius up 50% to 195px. Pellets are
  now eaten at the mouth: bite triggers when the mouth tip nears the
  pellet and the eat anim anchors the mouth to it, not mid-body.
- Hover tip shows two labeled meters (2026-08-21): pellet-dot icon +
  ink bar for hunger (seal red when hungry), sprout icon + slate
  blue bar for remaining life.
- Repo hygiene (2026-08-21): serve.py untracked (local dev tool);
  ALL audio committed for now including spares and originals,
  pruning deferred until closer to publishing.
- Unlock layer (2026-08-17): every in-run upgrade except egg buying
  (Income, Kelp, Fish Tier, Lifespan) is invisible until unlocked in
  the prestige shop's new Upgrades tab, 5 souls each; Lifespan's
  unlock is locked until Kelp's is owned. The food rail icon appears
  only once Kelp is unlocked.
- Hunger tutorial simplified: one step pointing at the hungry fish,
  "Hungry fish do not generate Soul", Got it. No kelp pointing, no
  rail reveal (kelp may not be unlocked yet). Elegant consequence:
  base 20s life never hungers, so hunger only exists after Lifespan,
  which requires Kelp first, so food always exists when hunger does.
- Discovery is real: Game.seen persists per species; hatching a
  species marks it, the Fish Index lights it up with its name.
- Prestige Main tab grouped like the Upgrades tab (2026-08-18), rail
  icon headers per section: Fish (Auto Egg), Income (Starting Gold,
  Base Income), Food (Starting Kelp), Soul (Extra Soul), Lantern
  (Lantern Gold, Curious Fish, Lantern Tide).

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
  Names are ordinal placeholders (firstF ... twelfthF, species order).

## later (direction held, not yet built)
- Zone descent via lump-sum gear, per-zone currency with conversion,
  layered on top of soul prestige.
- Trait picks at growth stages, floating plant upgrades, story layer,
  the unsettling turn, self-hosted fonts for Steam.

## audio
- Music system (2026-08-17, world/audio.js): three looping tracks via
  Web Audio, armed on the first user gesture (autoplay policy).
  Front screen plays Canon in D Major; a run plays Canon in D for Two
  Harps; opening the prestige shop ducks the harps (gain 0.8 -> 0.25)
  and low-passes them to 500Hz (the underwater muffle) while
  Equatorial Complex plays on top; diving back restores the harps.
  Crossfades ~0.35s time-constant; faded-out tracks pause after 1.4s.
  The Sound toggle (corner note + settings) drives a master gain,
  pause fades the master out and back (~1s), and the very first
  arm fades in from silence over ~3s so a cold-start buffering gap
  reads as intentional atmosphere. The run track waits 3s after Play
  before fading in and always enters at its 13s mark (skips the
  intro; native loop still wraps to 0). First fish lantern tap ever
  whispers "Good fish" via the saybox. All three tracks re-encoded
  to 128kbps (33MB -> 15MB); untouched originals in audio/original/.
  Spare takes sit in audio/ (8 Bit Synths, Autoharp, Interstellar
  Mix, Morning) for future zones or auditioning.
- Sound effects still absent (sfx removed 2026-08-15); they return as
  a designed pass later.

## workflow
- Claude maintains DESIGN.md as decisions land, commits
  and pushes at verified milestones. Numbers are specced on paper before
  implementation; mechanics iterate by feel. One full-loop playtest after
  each system.

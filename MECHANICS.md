# MECHANICS (current, firstF)

## economy chart

### income (per firstF)
| stage | age       | earns  | per min | stage total |
|-------|-----------|--------|---------|-------------|
| baby  | 0 - 2:30  | 1 / 5s | 12      | 30          |
| adult | 2:30 - 5:00 | 2 / 5s | 24    | 60          |
| death | 5:00      | 10% ltv | -      | +9          |
| life  |           |        |         | **99**      |

income is discrete: each fish generates once per 5s tick and pays its whole
tick amount at once with a single pop (phase value + firstF Income levels,
so +2 per tick after the first upgrade). gold never trickles between ticks.

### shop
| item | cost | effect |
|------|------|--------|
| egg  | 50   | 1 firstF egg, hatches in 20s |
| secondF egg | 1000 | first purchase unlocks the species (no separate unlock price) |
| kelp | 20   | food, 2 bites |
| firstF Income | 100 x2^n | firstF +1 gold per 5s tick, all stages (+30 ltv, +3 death) |
| Spawning    | 1500 x2^n | +5%/level chance to spawn each 2 min. retroactive, all adults. level 1+ adds "spawn chance" and "spawned x N" card rows |
| Growth      | 3000 x2^n | matures 5s sooner/level, floor 20% of base (24 levels for firstF). level 1+ adds "adult at" row for babies |

### hunger sustain
| fact | value |
|------|-------|
| first hunger | 60-70s after birth |
| 1 bite | half recharge: next hunger 30-35s. 2s eat, timer frozen |
| 1 kelp (2 bites) | 60-70s = one full hunger cycle |
| hungry window | 20s (bubble) |
| starving window | 10s (!) then death |
| kelp per lifetime | ~7 bites = ~3.5 kelp = ~70 gold |

### per-fish ledger (fed whole life)
| source | gold |
|--------|------|
| earnings + death | +99 |
| egg | -50 |
| kelp (~7 bites) | -70 |
| **net, bought egg** | **~ -21** |
| **net, spawned egg (free)** | **~ +29** |

### start
| fact | value |
|------|-------|
| start | 70 gold + 1 baby fish + 2 kelp floating (first one mid-water) |
| opening spend | the chain uses all 70: egg 50 + kelp 20 |
| early hunger | starting kelp feeds the first cycle, objective kelp the next, income carries it after |
| click a fish | selects and catches it: fish struggles in place, card opens. struggle calms over ~15s, tail settling. release by clicking empty water or the card x: an early release panics (dart + swirl), a calm release (15s+) swims off quietly |
| paper lanterns | early income. 3 lanterns drift in when their objective starts (after Buy a kelp completes). each takes 3 taps at +5, dims per tap, bounces between edges until spent. 5s after the objective completes a bonus wave of 3 drifts through, then lanterns return solo every 45-90s and exit if ignored. hover says "Paper Lantern", label below the cursor so +5 pops stay visible |
| tutorials | none. all freeze tutorials removed. guidance happens through objectives and diver messages only |
| objectives | quest tracker card top right (breathing room from the corner), fixed width, everything centered: checkbox + text, progress bar with count beneath. no header. completion: green stamp fills the checkbox (bounce in), a line-through in the text color draws itself across the words left to right (~0.35s, every wrapped line), the card gives one soft pulse, a two-note chime plays instantly (audio context prewarmed on first pointerdown), then it fades and the next appears. nothing ever shifts. chain: Buy a fish, Buy a kelp, Collect gold from Paper Lanterns 0/3, Buy firstF Income upgrade, Have a total of 5 firstF (eggs do not count). already-satisfied steps clear instantly via saved flags |

hunger timer starts at birth (eggs do not age). mating chance is 0 until
Mating levels (5%/level), rolled once at birth.

## maturity
- adult at half of life. evolution: ink redraw flourish, 60% to 100% size.
- Growth upgrade: adult 5s sooner per level, floor 20% of base (3000g doubling).

## hunger
- first hunger 60-70s after birth. hungry 20s (thought bubble) -> starving 10s
  (pulsing !) -> death.
- kelp (20g) has 2 bites. a bite is claimed instantly within 70px, takes 2s to
  eat (hunger timer pauses), recharges half: next hunger 30-35s later.
- two fish can eat one kelp at once, one bite each. claimed bites are gone.
- detection: every fish senses all food on the map, no radius limit.
  reaction takes 0-3s after food appears or hunger starts; starving fish
  react instantly.
- hungry fish approaches kelp: slows near it, steers vertically, no wall
  flips. a STARVING fish sprints: dart-band speed (130-250 px/s), strong
  vertical pull (cap 140), straight to the nearest kelp.

## movement
- burst-coast: drag bleeds speed; below its cruise band the fish fires a short
  tail-beat kick back up, then coasts near-still. tail wave only while kicking.
- modes: cruise 65-115 px/s, dart 180-260 (one sustained kick), rare slow glide.
- turns: instant mirror flip + kick. wall margin flips inward (off while seeking).
- vertical: new drift target every 6-14s, scales with speed, capped ~16 deg,
  eased; hard vy cap. sprite never rotates.
- schooling: same species drift toward local group height; babies trail nearest
  adult. seeking food overrides schooling.

## code map
- data/: species.js fish data.
- core/: state.js game state, save, purchases, formulas. sim.js per-frame
  lifecycle economy: hunger, aging, income, spawning triggers, death.
  main.js startGame plus the loop and draw order.
- world/: stage.js canvas world (fish motion, courtship moves, plants,
  eggs, pops, swirls, held fish, resize). ambience.js bubbles, motes,
  silhouette. lantern.js paper lanterns.
- ui/: panel.js hud. detail.js tooltip and fish card. corner.js icons and
  all settings wiring. front.js front page. pause.js pause and min-size.
  obj.js objectives. say.js diver messages. confirm.js confirm dialog.
  dev.js console.
- audio/: sfx.js WebAudio chimes, respects the sound setting.
- fonts/: self-hosted woff2 + fonts.css + OFL licenses.
- assets/: fish svgs plus fish_grid_final.png (master reference copy).
  demos/: reference sketches only (02-ink.html, demo.html), local fonts.
  option demos get deleted the moment their pick lands.

## spawning
- every adult runs 2-minute windows. at each window start it rolls the current
  chance (5% per Spawning level, 0 base). success schedules one birth at a
  random moment inside that window. hard cap: one per window even at 100%.
- retroactive: the chance is read live, so upgrades apply to all living adults
  at their next window.
- a scheduled birth waits until the spawner is not hungry and a partner is
  free (any living fish, no spawn chance needed). hungry fish never start
  conceiving; hunger arriving mid-courtship is fine, starving cannot happen
  inside the ~5s ceremony.
- courtship: the pair drifts together, hovers overlapping for 4-5s, the egg
  appears between them, both scurry off. courting fish ignore clicks, kelp,
  and their spawn windows until done.
- diver messages: bare whisper text, bottom center but raised
  (clamp 72px-160px up) and sized to the screen so itch.io embeds read it.
  fades in and out (~4.6s), one at a time, queued, 15s cooldown per line.
  wired lines, each fires once ever: "Fish is hungry! Let's make sure to have
  enough kelp." (a fish turns hungry while no kelp is on screen),
  "This should feed the fish." (first kelp bought), "When will it hatch?"
  (first egg bought), "The fish got bigger!" (first baby matures to adult,
  skipped for fish loaded from a save already past adult age).
- one settings modal everywhere (front menu and in-game gear): scrim,
  Settings title with x, one row per option: Sound toggle, Display segmented
  control (Windowed / Borderless / Fullscreen; in the browser borderless and
  fullscreen both use the fullscreen api and the picked one stays
  highlighted, the Steam build gives them real separate behavior), Quit row
  with Main Menu button (in-game only), Reset Progress row.
  reset opens a separate confirm dialog: "Reset all progress? This cannot be
  undone." with Cancel / Reset. corner.js owns all settings state and
  rendering. dotted-leader rows are banned everywhere.
- fish card (design pick 5, applies to eggs and every future species): name
  18.5px, then the life graph, then stats as soft chip cards in a 2-column
  grid, each chip a tiny uppercase label over a 15px value. no letter
  tracking. death row keeps its hover hint.
- front page: title is lowercase serif "paperfish" with a small tilted red
  seal square after it (title demo pick 2). menu is play and settings only
  (quit returns with the Steam build), Zen Maru Gothic, large; official Steam and
  Discord brand badges top right; seal + "by 2ndIntelligentWorld" bottom
  right. no fish ambience on the front for now.
- dev console is always visible (backtick hides it if needed).
- hud sits on the LEFT. tabs: fish (first, default) then upgrades, styled
  as pill buttons (13px, hover feedback, filled when active). while the Buy
  a kelp objective is active and the upgrades view is closed, the Upgrades
  tab pulses toward seal red to point the player there. all
  buttons are soft cards in a single column, one per line. upgrade cards:
  name over cost, count in the corner, red seal mark until first purchase.
  fish tab buy buttons show the species icon over cost (never the name),
  count badge top right, hover says "Buy firstF Egg". beneath them: the NEXT
  species as silhouette over its egg cost, hover "Buy secondF Egg", first
  purchase unlocks it; then ONE locked card (padlock, no silhouette, no
  cost) teasing the species after. everything past that is hidden. buying a
  species reveals the next silhouette and shifts the lock down one.
  objectives appear top right without pausing.
- upgrade hover tooltip: effect line, then "Current: total" on its own line.
- fish hover tooltip: name, stage beneath. nothing else. eggs show "egg";
  click an egg to select it and see "hatches in" on its card. an egg with 5s
  or less left shows a pulsing "!".
- gold rate (top left, tight spacing): hover lists income per species with a
  fish icon, count, and +N / min per line.
- money pops (earning, death) draw in the gold color.
- bubbles are pure ambience now: very fast vents every 32-70s, not clickable.
- ui font is Zen Maru Gothic everywhere (title stays Shippori Mincho
  lowercase with the red seal mark). fonts are self-hosted in fonts/
  (latin woff2 subsets + fonts.css + OFL license files, ~86KB total,
  zero external requests). both fonts are SIL Open Font License:
  bundling and commercial redistribution are permitted as-is.
- death tutorial fires mid death animation, after the belly-up flip.
- below 600x420 the game pauses: "Your screen is too small for the fish!",
  resumes when enlarged.

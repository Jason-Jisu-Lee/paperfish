# MECHANICS (current, firstF)

## economy chart

### income (per firstF)
| stage | age       | earns  | per min | stage total |
|-------|-----------|--------|---------|-------------|
| baby  | 0 - 2:30  | 1 / 5s | 12      | 30          |
| adult | 2:30 - 5:00 | 2 / 5s | 24    | 60          |
| death | 5:00      | 10% ltv | -      | +9          |
| life  |           |        |         | **99**      |

### shop
| item | cost | effect |
|------|------|--------|
| egg  | 50   | 1 firstF egg, hatches in 20s |
| kelp | 10   | food, 2 bites |
| firstF Income | 30 x2^n | firstF +1 gold per 5s tick, all stages (+30 ltv, +3 death) |
| Spawning    | 100 x2^n | +5%/level chance to spawn each 2 min. retroactive, all adults. level 1+ adds "spawn chance" and "spawned x N" card rows |
| Growth      | 150 x2^n | matures 5s sooner/level, floor 20% of base (24 levels for firstF). level 1+ adds "adult at" row for babies |

### hunger sustain
| fact | value |
|------|-------|
| first hunger | 60-70s after birth |
| 1 bite | half recharge: next hunger 30-35s. 2s eat, timer frozen |
| 1 kelp (2 bites) | 60-70s = one full hunger cycle |
| hungry window | 20s (bubble) |
| starving window | 10s (!) then death |
| kelp per lifetime | ~7 bites = ~3.5 kelp = ~35 gold |

### per-fish ledger (fed whole life)
| source | gold |
|--------|------|
| earnings + death | +99 |
| egg | -50 |
| kelp (~7 bites) | -35 |
| **net, bought egg** | **~ +14** |
| **net, mated egg (free)** | **~ +64** |

### start
| fact | value |
|------|-------|
| start | 50 gold + 1 baby fish |
| opening choice | bank the 50 or buy a second egg immediately |
| first kelp due | ~65s (12/min income covers the 10g) |
| click a fish | selects and catches it: fish struggles in place, card opens. struggle calms over ~15s, tail settling. release by clicking empty water or the card x: an early release panics (dart + swirl), a calm release (15s+) swims off quietly |
| paper lanterns | early income. 3 lanterns drift in when their objective starts (after Buy a kelp completes). each takes 3 taps at +5, dims per tap, bounces between edges until spent. afterwards lanterns return solo every 45-90s and exit if ignored. hover says "Paper Lantern" |
| tutorials | none. all freeze tutorials removed. guidance happens through objectives and diver messages only |
| objectives | quest tracker card top right: "objective" header, checkbox + text, progress bar with count on its own line. completion fills the pre-reserved checkbox, entry fades out, next appears. nothing ever shifts. chain: Buy a fish, Buy a kelp, Collect gold from Paper Lanterns 0/3, Have a total of 5 firstF |

hunger timer starts at birth (eggs do not age). mating chance is 0 until
Mating levels (5%/level), rolled once at birth.

## maturity
- adult at half of life. evolution: ink redraw flourish, 60% to 100% size.
- Maturity upgrade: adult 10% sooner per level, cap 80% (8 levels, 150g doubling).

## hunger
- first hunger 60-70s after birth. hungry 20s (thought bubble) -> starving 10s
  (pulsing !) -> death.
- kelp (10g) has 2 bites. a bite is claimed instantly within 70px, takes 2s to
  eat (hunger timer pauses), recharges half: next hunger 30-35s later.
- two fish can eat one kelp at once, one bite each. claimed bites are gone.
- detection: every fish senses all food on the map. reaction takes 0-3s after
  food appears or hunger starts; starving fish react instantly.
- hungry fish approaches kelp: slows near it, steers vertically, no wall flips.

## movement
- burst-coast: drag bleeds speed; below its cruise band the fish fires a short
  tail-beat kick back up, then coasts near-still. tail wave only while kicking.
- modes: cruise 65-115 px/s, dart 180-260 (one sustained kick), rare slow glide.
- turns: instant mirror flip + kick. wall margin flips inward (off while seeking).
- vertical: new drift target every 6-14s, scales with speed, capped ~16 deg,
  eased; hard vy cap. sprite never rotates.
- schooling: same species drift toward local group height; babies trail nearest
  adult. seeking food overrides schooling.

## code map (js/)
- species.js data. state.js game state, save, purchases, formulas.
- stage.js canvas world: fish motion, courtship moves, plants, eggs, pops,
  swirls, held fish, resize. sim.js per-frame lifecycle economy: hunger,
  aging, income, spawning triggers, death. main.js startGame plus the loop
  and draw order.
- panel.js hud. detail.js tooltip and fish card. corner.js icons and
  settings. front.js front page. pause.js pause and min-size. dev.js console.
- ambience.js bubbles, motes, silhouette. lantern.js paper lanterns.
  obj.js objectives. say.js diver messages.

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
- diver messages: bare whisper text, bottom center, fades in and out (~4.6s).
  one at a time, queued, 15s cooldown per identical line. coexists freely
  with the persistent objective box. first wired line: "Fish is hungry."
- hud sits on the LEFT. tabs: upgrades (default) and fish. all buttons are
  soft cards in a single column, one per line: name over cost, level in the
  corner, red seal mark until first purchase. the fish tab lists buy buttons
  per unlocked species plus one unlock button showing the next fish's
  silhouette over its price ("unlocks a new fish" on hover). no discover
  section. objectives appear top right without pausing; completion flashes a
  green check.
- upgrade hover tooltip: effect line, then "Current: total" on its own line.
- fish hover tooltip: name, stage beneath. nothing else. eggs show "egg";
  click an egg to select it and see "hatches in" on its card. an egg with 5s
  or less left shows a pulsing "!".
- gold rate (top left, tight spacing): hover lists income per species with a
  fish icon, count, and +N / min per line.
- money pops (earning, death) draw in the gold color.
- bubbles are pure ambience now: very fast, infrequent vents, not clickable.
- ui font is Sniglet (front page stays Shippori Mincho).
- death tutorial fires mid death animation, after the belly-up flip.
- below 600x420 the game pauses: "Your screen is too small for the fish!",
  resumes when enlarged.

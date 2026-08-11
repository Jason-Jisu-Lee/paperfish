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
| egg  | 50   | 1 firstF, instant hatch |
| kelp | 10   | food, 2 bites |
| Fish Income | 30 x2^n | firstF +1/min (also +5 ltv, +0.5 death) |
| Mating      | 100 x2^n | +5% mate chance at birth |
| Maturity    | 150 x2^n | adult 10% sooner, cap 80% |

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
| first kelp due | ~65s (12/min income + clicks cover the 10g) |
| click a fish | streak pay +1, +2 ... +5 cap (next hit within 1.5s). click pops draw bigger and darker than passive pops. a miss (empty water) breaks the streak. combo ring drains around the cursor, x-multiplier shows from x2. fish bolts instantly (240-450 px/s), random direction and distance, more frantic each level, level 3+ jukes mid-flight, leaves a fading ink swirl. starving and dying fish pay nothing |
| hold a fish (400ms) | catches it: fish struggles in place, info card opens. release lets it dart off, no gold. empty click closes the card |
| tutorials | freeze the game with a small confirm tooltip. step 1 at first play, step 2 five seconds later. progress saved |

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

## mating (gated: prestige unlock, then upgrade)
- chance rolled once at birth: 5% per Mating level, 0 base.
- adults only, once per life, pair within 130px (checked 0.8s), 1 egg at meet.

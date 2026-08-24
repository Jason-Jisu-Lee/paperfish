# Mechanics numbers

Claude-owned. Every tunable stat lives here with its current value.
Backend keeps 2 decimals; players only ever see bars, never these numbers.

## Tier chart

Blank cells are undecided; the build falls back to the Tier 1 value
until a number lands here.

| metric | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| species | firstF | secondF, fourthF, fifthF, thirdF | eighthF, ninthF, tenthF | eleventhF, twelfthF |
| base gold / 5s | 1 | 3 | 9 | 27 |
| base soul on death | 1 | 3 | 9 | 27 |
| lifespan | 20.00s | | | |
| hunger meter full | 30.00s | | | |
| egg hatch time | 8.00s | | | |
| adult at | 30.00s | | | |

- gold: base 3^(tier-1) per 5s (fishIncome in state.js); income
  upgrades add flat on top; the 3x base is a placeholder, per-fish
  tuning comes later
- soul: base 3^(tier-1); Extra Soul prestige adds flat +1 per lvl;
  starving death pays 0, hungry-but-not-starving pays full
- lifespan: in-run Lifespan +5s per lvl (40 x 2^lvl G); prestige
  Tier 1 Lifespan +5s per lvl, Tier 2 Lifespan +10s per lvl (all fish)

## Hunger (2026-08-21)

| stat | value |
|---|---|
| fill at hatch | 80% (24.00s) |
| fill for the first fish of a brand-new save | 60% (18.00s), teaches feeding fast |
| hungry threshold | 30% (9.00s left): seeks food, bar turns seal red |
| starving threshold | 5% (1.50s left): urgent seek, exclamation mark |
| empty meter | 10.00s at zero kills the fish, no soul |
| death while starving | no soul (any cause); merely hungry pays full soul |
| forfeit timing | judged the instant life runs out; the 0.4-3.4s death stagger cannot change it |
| pellet | free, click open water, +5.00s, one fish, sinks then fades 12.00s after resting on the floor |
| pellet eat trigger | mouth tip within 14px; eat anim anchors mouth to the pellet |
| feeding unlock | pellet clicks do nothing until the intro tutorial is confirmed (dev mode exempt) |
| kelp bite | +20.00s, 2 bites per kelp, 2 G, 70px body contact |

Early loop: base life 20s + hatch fill 18.00s means an unfed Tier 1 fish
goes hungry at ~9s and dies soulless; feeding is what keeps souls flowing.
By design: fish die of old age long before hunger death until lifespan
grows (a run or two in). The intro tutorial teaches feeding up front,
the moment the first fish finishes swimming in.

## Food seeking (2026-08-21)

| state | radius | speed |
|---|---|---|
| normal | 234px | gentle, 35-90 |
| ≥80% full | 20% radius (46.80px) | gentle, 35-90 |
| hungry (≤30%) | unlimited, immediate | 45-130 |
| starving (≤5%) | unlimited | 180-320, fast vertical |

- any fish eats food it reaches, even when full
- dev mode draws the 234px radius ring around every fish

Pellet chase: pellets dropped at the screen bottom clamp to the floor
line; seek targets a floor pellet at its true rest depth; fish may dip
to 12px above the sand while seeking; a pellet below a fish adds a
26px/s down-drive so fish catch sinkers; within a nose-length of a
pellet fish hold course and swim through it so the mouth crosses the
food.

## Lantern (2026-08-23)

| stat | value |
|---|---|
| taps per lantern | 2 |
| gold per tap | 2 + Lantern Gold lvl |
| spawn gap | 15-17s, minus 1s per Lantern Tide lvl |
| fish tap chance | 4% per Curious Fish lvl, Tier 1 fish only |

## Fish Tier, in-run (2026-08-20)

- climb chance p(lvl) = 50% - 30% x 0.9^(lvl-1), 0% at lvl 0, 50 levels
- Lv 1 = 20%, Lv 2 = 23%, Lv 5 = 30%, Lv 10 = 38%, Lv 20 = 46%, cap 50%
- cost 25 x 1.25^lvl G, resets each run
- all 4 tiers open, no gates; landed-tier odds: T1 (1-p), T2 p(1-p), T3 p^2(1-p), T4 p^3

## Prestige costs (souls)

| upgrade | cost |
|---|---|
| Life Burn | 500 one-time; once per dive, every fish ages +1:00 |
| Unlock Kelp | 100 (slated to move later into late game) |
| Unlock Income / Fish Tier / Lifespan | 5 each |
| Extra Soul | 20 x 2^lvl |
| Starting Gold | +10/+20/+30/+30 gold per lvl to 100 G total, 4 x 2^lvl, max 4 |
| Base Income | 3 x 2^lvl |
| Starting Kelp | 20 flat, max 5 |
| Tier 1 Lifespan | 10 x 2^lvl |
| Tier 2 Lifespan | 15 x 2^lvl |
| Auto Egg | 20 one-time |
| Lantern Gold | 12 x 2^lvl |
| Lantern Tide | 150 x 2^lvl, max 5 |
| Curious Fish | 200 x 2^lvl, max 5 |

## Eggs

- run starts with 10 G base
- cost ladder: 2, 3, 5, 8, 12, 20, 25, 30, 40, 50, 70, 90, 120, 150, 200, 250, 300, then 300 x 1.3^n rounded
- buy cooldown 0.50s real time; button disables and a wipe drains across it

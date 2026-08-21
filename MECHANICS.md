# Mechanics numbers

Claude-owned. Every tunable stat lives here with its current value.
Backend keeps 2 decimals; players only ever see bars, never these numbers.

## Hunger (2026-08-21)

| stat | value |
|---|---|
| meter full, Tier 1 | 30.00s |
| meter full, Tiers 2-4 | 30.00s (untuned, same as T1 for now) |
| fill at hatch | 60% (18.00s) |
| hungry threshold | 30% (9.00s left): seeks food, bar turns seal red |
| starving threshold | 5% (1.50s left): urgent seek, exclamation mark |
| empty meter | 10.00s at zero kills the fish, no soul |
| death while hungry/starving | no soul (any cause) |
| pellet | free, click open water, +5.00s, one fish, sinks then fades ~8s on the floor |
| kelp bite | +20.00s, 2 bites per kelp, 2 G |

Early loop: base life 20s + hatch fill 18.00s means an unfed Tier 1 fish
goes hungry at ~9s and dies soulless; feeding is what keeps souls flowing.
First-ever hungry fish triggers the feed tutorial.

## Fish Tier, in-run (2026-08-20)

- climb chance p(lvl) = 50% - 30% x 0.9^(lvl-1), 0% at lvl 0, 50 levels
- Lv 1 = 20%, Lv 2 = 23%, Lv 5 = 30%, Lv 10 = 38%, Lv 20 = 46%, cap 50%
- cost 25 x 1.25^lvl G, resets each run
- tiers 1-3 open every run; landed-tier odds: T1 (1-p), T2 p(1-p), T3 p^2

## Prestige costs (souls)

| upgrade | cost |
|---|---|
| Hatch Chance gates | T4 30, T5 300, T6 3000 (one-time each) |
| Life Burn | 500 one-time; once per dive, every fish ages +1:00 |
| Kelp unlock | 100 (slated to move later into late game) |
| Income / Fish Tier / Lifespan unlocks | 5 each |
| Extra Soul | 20 x 2^lvl |

## Lifespan

- Tier 1 base 20s
- in-run Lifespan +5s per lvl (40 x 2^lvl G)
- prestige: Tier 1 Lifespan +5s per lvl; Tier 2 Lifespan +10s per lvl (all fish)

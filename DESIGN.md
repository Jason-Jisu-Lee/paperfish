# FISH TANK - design tracker

Economy game where fish are the currency. PC / Steam target. Prototype v0.

## Core
- No abstract money. Wealth = living fish in the tank. Breeding = income.
- Everything is paid in live fish, and paid fish visibly swim away.
- Nothing spent disappears: traders and gates release fish into the
  current depth. The ending ascends through all five depths showing
  everything ever spent, alive.
- Species = three numbers only: breed speed, trade value, per-species cap
  (default 5, varies). No per-fish abilities, ever.

## Active play
- Wild fish: faint silhouettes cross the water every 20-45s, weighted
  toward locked species. Click to lure: costs live fish as chum
  (value x 1.2), chum swims out, the wild one brightens and joins as
  an adult. The main acquisition verb; traders are secondary
  (egg pairs, room).

## Structure
- 5 depths, one gate each. Gate is fed fish over time (count-based).
- Gate opens -> choose carried fish (2/3/4/5), rest released, descend.
- Persist between depths: index, carried fish, capacity, lineage bonus
  (+15% breed speed per depth cleared). No offline earnings.
- Tank capacity 20, expandable to 30 via trader offers.

## Current build (prototype)
- Vanilla JS, no deps, no build step. index.html + js/ per-component
  files + assets/ (all fish as SVG, one style: white outline on black).
- 22 species over 5 depths. assets.html = contact sheet for art review.
- Traders drift by with one offer: species egg pair or +room.
- Eggs from pairing ritual (two adults meet, egg sinks, hatches young).

## Movement pass 2
- Fixed sustained rotation instability during pairing (the "clock
  needle" bug): steering toward a near/moving point via atan2 is
  numerically unstable at near-zero distance. Pairing motion is now a
  closed-form kinematic orbit (position and heading both computed
  directly from t), not steered - eliminates the instability by
  construction. All other steering states got a minimum-distance
  guard (skip steering under ~4.5px) as a general defense.
- Species cap (s.max) is now enforced at the moment a fish would be
  added (egg hatch waits for room, wild lure refuses and refunds
  nothing if already at cap), not just at breeding-ritual start. Old
  bug let counts silently exceed max over a long session, so trader
  offers referencing the inflated count looked broken but were
  technically consistent with actual (buggy) state.
- Wander targets now bias toward diagonal/sideways headings; a rare
  ~12% "diving" pick allows a steep vertical target but forces 1.75x
  speed for that leg, matching real fish (mostly lateral, fast when
  vertical).
- Bubbles reworked: rare localized streams (4-9 bubbles, one spot,
  every 12-24s) replacing constant scattered spawn; live long enough
  to actually reach the surface. Fish-triggered dash bubbles kept.
  Removed near-invisible tiny background fish, replaced with sediment
  puffs (rest near bottom), light shafts (two, near-static, faint),
  and a rare (75-150s) large distant silhouette crossing slowly.

## Movement (rewritten)
- Fish nose always matches actual travel direction exactly (full
  rotation, verified zero error headless), not a small clamped tilt.
  Base speed roughly doubled. Two independent speed layers: slow
  personality drift (10-24s) and frequent mood swings (cruise/brisk/
  dash/rest, 0.4-2.6s, per-event variable ease rate). Dash picks a far
  target and bursts 3 bubbles. Release/leave state is a fast, near
  instant 3.8-5.2x burst out of the tank.
- Ambient: bubbles rise from the bottom continuously plus burst on
  fish dashes; faint tiny background fish drift far behind the main
  tank, pure decoration, max 4 concurrent.

## Open
- Pacing is placeholder (gates ~25-55, breeds 14-120s). Real target: ~1h
  per depth, 5h total.
- Trader offer variety (rates, rare wandering traders, lures?).
- What depth 5 gate ending needs to feel like a real decision.
- Sound. Steam wrapper (Electron/Tauri) later.

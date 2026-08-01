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

## Open
- Pacing is placeholder (gates ~25-55, breeds 14-120s). Real target: ~1h
  per depth, 5h total.
- Trader offer variety (rates, rare wandering traders, lures?).
- What depth 5 gate ending needs to feel like a real decision.
- Sound. Steam wrapper (Electron/Tauri) later.

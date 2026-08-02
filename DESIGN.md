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

## Movement pass 9 - normal legs almost purely horizontal
- Pass 8 only shortened the DIVE hop; normal (non-dive) legs still
  allowed up to 45 degrees off horizontal over the FULL long travel
  distance, which read as "diagonal for an extended period" - the
  dominant remaining source once dive was fixed. normalMaxAngleDeg
  dropped 45 -> 12. Real bug found while verifying: the reroll
  fallback (used when 8, now 20, random tries fail to find a
  compliant point) computed steepness via rnd(0.3, normalMax) - with
  normalMax now tan(12deg)=0.21, that 0.3 floor was HIGHER than the
  cap itself, so every fallback-path pick silently violated the
  limit. Fixed to rnd(0, normalMax). Verified headless with a 500-leg
  angle-distribution sample: 94.0% land at or under ~12.5 degrees,
  average leg angle 8.9 degrees - matches "94% sideways" exactly.

## Movement pass 8 - dive is a short hop, more speed variety
- Dive (steep diagonal target) previously reused the normal wander
  distance range, so a "diving" leg could travel far diagonally for
  several seconds - user wants diagonal movement to always be brief,
  just enough to change vertical position. Dive targets are now
  picked directly in polar form (short distance 70-170px, angle from
  vertical within the dive band), guaranteeing both the steepness AND
  a short hop. Verified headless: sampled dive distances land 77-163px.
- Added per-fish indivMul (0.82-1.22, set once at spawn, personality
  baseline pace) applied on top of every leg's speed. Widened cruise
  range (0.65-1.5, was 0.75-1.3) and brisk frequency/range (36% chance
  at 1.4-2.1x, was 28% at 1.4-1.9x) for more day-to-day speed variety
  without touching the rare dash.

## Movement pass 7 - committed legs, shear bend, config file
- Re-verified all 12 reference-grid species against fresh high-zoom
  crops (assets.html now has the reference PNG pinned at the bottom
  for direct comparison). Found and fixed 4 real bugs: ray had its
  tail-whip and nose on the WRONG sides (backwards, matching the
  earlier "faces right" convention violation class of bug); flounder
  had an invented protruding fin-arm the reference never has (just a
  plain rounder body + simple tail); perch and minnow had their
  proportions effectively swapped (perch should be the plump
  deep-bodied one with a tall fin, minnow the thin one with a modest
  fin - was the other way around).
- Movement rebuilt around committed LEGS instead of independent short
  mood timers: pick a target + a speed (cruise/brisk), travel at that
  speed the whole way, only decelerate in the final 70-95% of the
  distance (arriveSlowStart/End), then decide to rest or start a new
  leg. Rest duration is now genuinely variable - sometimes 2-5s,
  sometimes 10-26s (restLongChance). Dash remains a rare independent
  per-fish timer (75-130s) but can now also sometimes last 2-5s
  instead of always a brief burst (dashLongChance).
- Body bend reintroduced, but as a canvas SHEAR (ctx.transform x-into-y
  skew) instead of a rotation - front and back of the body lean
  opposite directions like a real flexing spine, capped at 30 degrees,
  eased slowly (bendEase), scales with how vertical the CURRENT
  heading is (not the target - avoids the old snap-through-vertical
  issue). Verified headless: max 28 deg observed, zero ctx.rotate()
  calls (uses transform, confirmed via the same rotate-interception
  test as before).
- All movement numbers now live in js/movement-config.js (global
  MOVE object), consumed by fish.js, nothing hardcoded inline anymore.
  movement-chart.html renders it as a live, always-in-sync reference
  table with descriptions - open it directly to see/discuss exact
  values instead of guessing from vague before/after descriptions.
- Process change per explicit user request: do NOT silently invent or
  redesign non-reference fish species going forward. Propose new/
  changed designs as a described list first, get approval, then draw.

## Movement pass 6 - rotation removed entirely
- Pass 5's decoupled/capped/slow-eased pitch still read as jitter to
  the user after a genuine refresh. Rather than keep tuning, cut the
  whole thing: fish rendering now has ZERO rotation calls (verified
  by monkey-patching ctx.rotate and confirming 0 invocations across
  fish.js and wild.js). Only two things move a fish's sprite now:
  the left/right mirror flip (tracks true direction every frame, no
  lag - this is correct and was never the problem) and the small
  vertical bob (position offset, not rotation, unchanged since the
  original build, never complained about).
- shadow.svg (trader) never got the tail-closing-line fix applied to
  every other species 4 rounds ago. Its simple shape plus the open
  tail made it visually pattern-match to "a giant broken bass" even
  though it is a wholly separate asset. Closed it the same way.
- Terminology going forward: "facing" = the mirror flip, always
  correct, always tracks this.dir. "bob" = the small vertical sway,
  cosmetic, unrelated to direction. There is no more "bend", "pitch",
  "lean", or "wobble" - all removed. Do not reintroduce ANY of these
  without an explicit, specific ask - this exact cycle (add subtle
  rotation -> tune -> still reads as jitter -> repeat) burned 3 full
  rounds. If asked for swim animation again, propose it in words
  first and get a yes before writing code.

## Movement pass 5 - visual pitch decoupled from steering direction
- Root cause of "still looking up/down, seizuring every 5 sec": the
  renderer was making the sprite's rotation fully equal the true
  steering angle (this.dir). Wander targets repick every 3-7s, and
  even with a tight target-angle bias, the SHORTEST interpolation
  path between two near-horizontal-but-opposite-side headings still
  sweeps through ~90 deg at the midpoint - inherent to continuous
  rotation between arbitrary angles, not fixable by biasing the
  target alone. The "turn faster during big reversals" boost from
  pass 3 made this MORE visible (fast disconnect between rotation and
  actual translation speed = reads as broken/jittery, worse than the
  slow version).
- Fix: render pitch is now its own field (this.renderPitch), eased
  SLOWLY (dt*1.1, ~1s time constant) toward a small capped target
  derived from sin(dir) - normal cap ~4 deg (0.07 rad, mid of the
  "2-5 degree" ask), diving cap ~17 deg (0.3 rad). Left/right facing
  (the mirror flip) still tracks true direction every frame with zero
  lag - that part of the pass-3-ago fix was correct and stays. Only
  the vertical PITCH component is now decoupled from literally
  representing the steering angle.
- Also bounded dash's far-target selection to under ~70 deg from
  horizontal (previously unconstrained - dash could theoretically aim
  anywhere including near-vertical, only the destination distance was
  checked, not the angle).
- Verified headless: max render pitch 16.8 deg, max pitch change rate
  ~14-18 deg/sec (slow, not a snap), regardless of how fast the
  underlying logical dir needs to turn for actual steering.

## Movement pass 4
- Dash ("spazz") was firing every ~8s per fish (rolled inside the
  fast ~1-2s mood cycle at 15% chance) - way too often. Pulled it out
  into its own independent per-fish timer, 75-130s between dashes,
  interrupting whatever mood was active then handing back control.
  Verified headless: 1 dash in a 140s window per fish.
  visible when it does: the wobble frequency scaled directly off
  uncapped speed, so a dash (or dash+diving, though those can't
  stack) could push it to 20+ Hz, reading as a blur/buzz. Speed value
  used for wobble math now clamped to 110 before computing freq/amp,
  capping the tail-beat around 1.4Hz max.
- shadow.svg (trader silhouette) was authored nose-left/tail-right,
  backwards from the "nose faces right" convention every other asset
  uses. Trader always moves left-to-right with no flip logic, so it
  visibly swam tail-first. Mirrored the path coordinates to match.
- Reminder: file edits don't propagate to an already-open browser tab.
  Several "still broken" reports across rounds have turned out to be
  a stale tab. Always explicitly say "refresh the tab" after a fix.

## Movement pass 3
- Wild fish only ever offer species you don't have yet (removed the
  "extras" path that let you re-catch an already-owned species like
  the starter bass - breeding is how you grow what you have, wild is
  purely discovery now).
- Wild-crossing fish had a real bug: y-position used a sine VALUE
  multiplied by dt as an increment (accumulating drift, not a clean
  oscillation) and had zero rotation, reading as "moving like a car".
  Fixed to a clean bounded sin offset plus a proper yaw wobble
  (tail-beat look) shared with the main Fish class's renderer.
- Added a face-consistent yaw wobble (small oscillating rotation on
  top of true heading, amplitude/frequency scaled by current speed)
  to both Fish and WILD rendering - the "swim like a fish, head
  sweeps side to side" look. Verified the sign math the same way as
  the original tilt fix (rotate-then-scale order in the transform
  stack); a naive same-sign wobble flips visually wrong on left-facing
  fish, needs negating for the mirrored case specifically (unlike the
  base heading angle, which does NOT need negating - two different
  fixes, easy to conflate, don't).
- Wander steepness threshold tightened hard: normal targets must be
  within ~35% of horizontal, only ~6% of picks deliberately go steep
  (diving/surfacing), and those force 1.75x speed. Big reversals
  (>~90deg heading change) get a 2.4x turn-speed boost so passing
  through vertical during a flip reads as quick, not a slow visible
  sweep.
- Pairing motion changed from a full 16x10 elliptical orbit (which
  swept through ~160 degrees of heading per cycle, visibly "circling")
  to a small 15x3 mostly-horizontal sway - heading stays close to
  horizontal except brief instants at the sway's turnaround.
- Base speed bumped again (was 28-54, now 34-70).
- Trader's silhouette swapped from real species art (shark/oarfish/
  gulper - has dorsal fins/spikes that read wrong as a flat low-alpha
  silhouette) to a dedicated plain shape, assets/shadow.svg - smooth
  body, simple open tail, no fin. Loaded via a small EXTRA_ASSETS list
  in assets.js parallel to SPECIES, not itself a catchable species.
- Removed: light shafts (execution wasn't landing, cut entirely) and
  sediment puffs (best guess for "random unexplained dots" - newest,
  least-clearly-caused addition; marine snow kept since it's original/
  foundational and wasn't clearly the thing being flagged - flag it
  by name if it's actually that).

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

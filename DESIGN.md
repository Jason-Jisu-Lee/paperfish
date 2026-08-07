# PAPERFISH - design (tentative, everything adjustable)

Idle/incremental hybrid. Single-screen deep sea, descending through
zones. Player is the diver, down there to explore and help fish grow.
Core promise: constant sense of progression, mechanics introduced
progressively, always something to do. Medium pace. Opens lighthearted,
gradually turns unsettling. Story layered in later.

## Visual theme (reference: image.png, 02-ink.html)
- Paper, not void. Warm washi paper field (#f2efe6 with soft radial
  light), sumi ink strokes (#1c1b18), one reserved accent: hanko seal
  red (#b43a2b).
- Fish are ink line drawings. Signature move: strokes draw themselves
  on (dash-offset ink animation) when a fish appears.
- Depth via ink washes: large pale silhouette fish, faint seabed
  hills, kelp strands, small bubbles, all barely-there gray washes.
- Type: Shippori Mincho serif for fish names and titles, Manrope
  light for UI. Wide letterspaced microlabels. Roman numeral section
  headers (I · SHOAL, II · CURRENTS).
- Panel on the right: big currency number, dotted leaders from name
  to price, right-aligned numbers. Locked/unknown entries render as a
  solid ink bar with ?.
- Corner furniture: settings/sound/pause icons top right, zone marker
  bottom right (ZONE I), occasional vertical Japanese caption as
  flavor (深海より).
- Red is spent nowhere except one place, to be chosen (candidate:
  the prestige seal).

## Core loop
- Start with one fish. Fish generate currency passively.
- Income scales with a fish's age, up to a cap.
- Each type has its own age/income curve; shapes differ. Some pay
  little for a long stretch then spike. Average rises with age, with
  occasional dips. Starter fish: flat curve as baseline.
- At growth stages the player picks traits (placeholder upgrades
  first; real trait pool designed later).
- Per-type population caps; upgrades can raise them.
- Currency unlocks new types.

## Zones
- Descending requires pressure-rated gear bought as a large lump sum.
  A save-versus-spend decision, not a passive threshold.
- Each zone has its own currency. On descent, accumulated income
  converts at a ratio (details undecided).

## Prestige
- Resets all zones, returns to zone 1, grants permanent bonuses.

## Open questions
- Kept SVG fish are white-stroke; need an ink recolor pass before
  they read on paper.
- Fonts load from Google CDN in the reference; self-host for
  Steam/offline eventually.
- Currency names and identity per zone; conversion ratios.
- Trait pool contents; number of growth stages per type.
- Age curve shapes per type, actual numbers.
- Where the red accent lives.
- How and when the unsettling turn begins.

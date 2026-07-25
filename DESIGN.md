# RAIN

rules: pure #000. thin falling lines, never drops. uniform field. zero chrome. vanilla js, no deps.

## line
call them streaks
r1 variants: solid taper blur comet soft, solid picked
r2 enlarged width ladder 5 4 3 2 1.5
r3: full field solid, dense real rain, live width switch, keys 1-5,
  field px 1 .8 .6 .4 .3
r4 (compare.html now): fixed "needle" look - hard flat-alpha short thin
  line on pure black read as sharp/uncomfortable at density. fix: fade
  both ends (gradient, brightest mid), kills hard edges/blunt caps.
  same widths/speeds/density, testing if softer

## plan
- lock width, becomes the base streak
- depth = future upgrade on fine (parallax layers), not a style
- mist storm glow rebuilt on locked line later

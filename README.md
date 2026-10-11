# ANX4 PIRATES (v0.1)

3D browser pirate game (Three.js). Character: `assets/models/captain_jack_sparrow.glb` (CC-BY 4.0, "captain jack sparrow" by istamareseh on Sketchfab: keep the credit if you publish).

## Run
ES modules and GLB loading need a web server (not `file://`):
```
cd anx4-pirates
python3 -m http.server 8000      # then open http://localhost:8000
```
Needs internet on first load: Three.js r160 comes from the jsDelivr CDN (see the import map in `index.html`).
Put the GLB at `assets/models/captain_jack_sparrow.glb` (a copy is already there in the folder; the ZIP omits it because it is 136 MB).

## Smaller model (recommended, especially for phones)
The original has 1.2M triangles / 3.6M vertices. Make a lighter copy and keep the original untouched:
```
npm i -g @gltf-transform/cli
gltf-transform optimize assets/models/captain_jack_sparrow.glb assets/models/captain_jack_sparrow.optimized.glb --compress meshopt --texture-compress webp
```
The game tries `*.optimized.glb` first and falls back to the original.

## Controls
PC: WASD, mouse (click canvas to capture), Space jump, Shift run, E draw/sheathe, Left click attack (press again during a swing to chain a 3-hit combo), Right click block, V victory, F talk, wheel zoom.
Phone: left stick, drag right side to look, buttons Jump/Run/Attack/Block/Sword/Victory/Talk, "Controls" hides the pad.

## Layout
`src/main.js` loop and loading · `player.js` movement/model · `animations.js` animation states · `world.js` island/water/palms/rocks/dock · `village.js` buildings/props · `npc.js` NPCs and training dummy · `ui.js` input and HUD · `physics.js` gravity/collision/boundary · `layout.js` map data · `tests/logic.test.mjs` (`node tests/logic.test.mjs`).

## Important limitation: animation
The supplied GLB is a static, rigid mesh: **no skeleton and no animation clips**. All 11 states are therefore *procedural whole-body poses* (lean, bob, twist, squash, fall) plus a separate sword prop. Arms and legs do not bend. Real limb animation needs a rigged model (e.g. rig it in Blender/Mixamo, then drive the clips with `THREE.AnimationMixer`).
If the character faces backwards, set `MODEL.yaw = Math.PI` in `src/player.js`. Sword/hand position is tunable via `HAND`/`HIP` in `src/animations.js`.

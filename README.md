# LearnPHYS206

Interactive lessons and models for Newtonian mechanics.
It's a plain static site (HTML, CSS, and JavaScript modules) with **no build step and no dependencies**, so Vercel serves it as-is.

## Run it locally

ES modules don't load from `file://`, so serve the folder with any static server:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy to Vercel

Option A, through GitHub (recommended, because it redeploys on every push):
1. Push this folder to a GitHub repo.
2. On vercel.com, choose **Add New → Project** and import the repo.
3. Set Framework Preset to **Other**, leave the Build Command empty, and leave the Output Directory as the default (`.`).
4. Deploy.

Option B, from the CLI (needs Node):
```bash
npx vercel
```

## Project structure

```
index.html              page shell: header, nav, footer
css/styles.css          all styling and theme tokens (light/dark)
js/app.js               hash router, theme toggle, mobile nav
js/pages.js             one function per page (landing, module navigation, module, sims, walkthroughs, about)
                        (single sims and walkthroughs are reached from their module; there are no separate library pages)
js/icons.js             the site's line icons (used instead of emoji in the interface)
js/fx-bridge.js         mounts the animated background and scroll effects on each page (see below)
assets/vendor/taste-skill/  effects copied unchanged from the taste-skill plugin (MIT): the contour-line
                        background, the course-map diagram, the pinned "How it works" steps, and the rolling numbers
js/hero.js              home page animation
js/content/topics.js        ← ADD MODULES HERE (order = module number)
js/content/unit1.js         ← Unit 1 lessons (format for any lesson-based module)
js/content/unit2.js         ← Unit 2 lessons
js/content/unit3.js         ← Unit 3 lessons
js/content/unit4.js         ← Unit 4 lessons
js/content/unit5.js         ← Unit 5 lessons
js/content/unit6.js         ← Unit 6 lessons
js/content/unit7.js         ← Unit 7 lessons
js/content/unit8.js         ← Unit 8 lessons
js/content/unit9.js         ← Unit 9 lessons
js/content/unit10.js        ← Unit 10 lessons
js/content/unit11.js        ← Unit 11 lessons
js/content/unit13.js        ← Unit 13 lessons (periodic motion; Unit 12 not added yet)
js/content/walkthroughs.js  ← ADD PROBLEMS HERE (template at the bottom)
js/sims/index.js            ← REGISTER SIMULATIONS HERE
js/sims/canvas.js       shared helpers: sliders, arrows, readouts, HiDPI canvas
js/sims/projectile.js   projectile motion sim
js/sims/incline.js      inclined plane and friction sim
js/widgets/index.js         ← REGISTER INTERACTIVE MODELS HERE (used inside lessons)
js/widgets/units.js     unit converter, area scaling, dimension checker, sig figs, Fermi, target
js/widgets/vectors.js   walk, vector addition, scalar multiple, components, dot product
js/widgets/cross3d.js   3D cross product model (drag to rotate)
js/widgets/motion.js    1D trip, tangent vs. secant, speeding-up signs, linked x/v/a graphs
js/widgets/kinematics.js  equation solver, braking distance, free fall
js/widgets/graphs.js    shared graph panels and numeric integration
js/widgets/motion2d.js  path vectors, acceleration split, projectiles, circular motion, relative velocity
js/widgets/forces.js    net force, inertia, frames, sled (ΣF = ma), weight, third-law pairs, FBD builder
js/widgets/applying.js  sorter, cables, ramps, elevator, pulleys, friction, curves, loops
js/widgets/energy.js    work, work-energy bars, springs, power
js/widgets/conservation.js  energy bars, slide, pendulum, springs, friction ledger, paths, U(x), energy diagrams
js/widgets/momentum.js  impulse, airbags, recoil, 1D/2D collisions, ballistic pendulum, center of mass, rockets
js/widgets/rotation.js  radians, spin, rim points, moment of inertia, flywheel, pulley drop, parallel axis, slices
js/widgets/dynamics.js  torque, Στ = Iα, heavy pulley, rolling, rotational work/power, angular momentum, skater
js/widgets/equilibrium.js  couples, torque about any pivot, center of gravity, tipping, seesaw, plank, ladder, hinge-and-cable, stress/strain, moduli
js/widgets/oscillation.js  reference circle, spring SHM graphs, energy well, hanging spring, pendulum lab/race, physical pendulum, damping, resonance
vercel.json             static hosting config
```

## How to add content

| You want to add… | Edit | Notes |
|---|---|---|
| A new chapter | `js/content/topics.js` | Set `status` to `live`, `in-progress`, or `planned`. |
| A lesson | the module's `lessons` array (see `js/content/unit1.js`) | Put an interactive model anywhere with `<div data-widget="name"></div>`. |
| A walkthrough | `js/content/walkthroughs.js` | Copy the template. Problems must be original. |
| A simulation | new `js/sims/<name>.js` and `js/sims/index.js` | Export `mount(container)` and return a cleanup function. Use `incline.js` as a model. |
| About page text, feedback link | `js/pages.js` | The `about()` function. |
| Key equations for a module | `js/content/topics.js` | Written in LaTeX inside ``String.raw`...` ``. |

Dashed "✏️" placeholder boxes mark content still to write. They only appear when you run the site locally (localhost), never on the live site.

## Ground rules
Problems are original. Nothing comes from current PHYS 206 homework, quizzes, or exams, or from textbooks (Aggie Honor Code and copyright).

## Animations
- **Home hero:** an animated contour map (`data-fx="contour-lines"`), a WebGL background with a CSS fallback.
- **Home stats:** the numbers roll once like an odometer (`data-moment="counter-rolls"`).
- **How it works:** the section stays on screen while its four steps open one at a time (`data-moment="pinned-chapters"`). This happens on screens 1024px wide and 640px tall or larger; smaller screens show the steps as a plain list.
- **Course map (home page):** how the modules connect, drawn by the taste-skill diagram builder, with light pulses along the lines. Edit the boxes and lines in `MAP` and `MAP_EDGES` in `js/pages.js` (positions are fractions of the box). Clicking a box opens its module; phones see the plain module list instead.
- **Progress bars:** a CSS fill animation in `css/styles.css` (`.progress-pill`).

All of them rest or show a still frame when the visitor's system asks for reduced motion.

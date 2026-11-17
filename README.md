# LearnPHYS206

Interactive simulations and step-by-step walkthroughs for Newtonian mechanics.
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
| Bio, feedback link, concept notes | `js/pages.js` | Look for the dashed "✏️" placeholder boxes. |

## Ground rules
Problems are original. Nothing comes from current PHYS 206 homework, quizzes, or exams, or from textbooks (Aggie Honor Code and copyright).

// ============================================================
// WIDGET REGISTRY
// Lessons place a widget with <div data-widget="name" data-...></div>.
// Each widget is mount(el, dataset) and may return a cleanup function.
// To add one: write it in this folder, import it, add it to `widgets`.
// ============================================================
import { unitConverter, areaScaling, dimensionChecker, sigfigCounter, sigfigCalc, accuracyTarget, fermi } from "./units.js";
import { walker, vectorAdd, scalarMultiply, components, dotProduct } from "./vectors.js";
import { cross3d } from "./cross3d.js";
import { trip1d, xtTangent, speedSign, motionGraphs } from "./motion.js";
import { kinematicsSolver, braking, freeFall } from "./kinematics.js";
import { pathVectors, accelSplit, projectileSplit, projectileLab, rangeAngle, circular, trainFrames, relativeVelocity } from "./motion2d.js";
import { netForce, inertiaPuck, framesCup, sled, weightPlanets, pairFinder, collisionPair, fbdBuilder } from "./forces.js";
import { problemClassifier, twoCables, tiltedAxes, elevator, pulleySystem, frictionPush, inclineSim, forceSourceQuiz, curveCar, loopTop } from "./applying.js";
import { workAngle, workSignQuiz, workTable, keSpeed, workEnergyBars, springWork, springLauncher, stairsPower, enginePower } from "./energy.js";
import { slideEnergy, pendulumEnergy, springBlockEnergy, launcherHeight, energyLedger, frictionDetective, pathWork, forceFromU, energyDiagram } from "./conservation.js";
import { impulseFt, airbag, pushApart, collision1d, collision2d, ballisticPendulum, elasticCases, cmFinder, fireworkCm, rocket } from "./momentum.js";
import { radianWheel, angularMotion, spinGraph, rimPoint, inertiaDumbbell, inertiaShapes, flywheel, pulleyDrop, parallelAxis, rodIntegral } from "./rotation.js";
import { wrenchTorque, netTorqueWheel, diskTorque, heavyPulley, rollingWheel, rollingRace, torqueWork, engineTorque, particleL, torqueL, skater, merryGoRound } from "./dynamics.js";
import { coupleForces, pivotAnywhere, cgPlank, tippingBlock, seesaw, plankSupports, ladder, hingeCable, wireStretch, bulkDepth, shearBlock, stressStrain } from "./equilibrium.js";
import { refCircle, springShm, amplitudeRace, shmEnergy, verticalSpring, spaceScale, pendulumLab, pendulumRace, measureG, periodTrap, physicalPendulum, dampedOscillator, resonance } from "./oscillation.js";

// Inline answer box for practice problems. data-answer, data-tol (relative), data-unit, data-label, data-exact.
function answerCheck(el, d) {
  el.classList.add("answer-check");
  el.innerHTML = `
    <label>${d.label ? `<span>${d.label}</span>` : ""}
      <input class="input input-num" inputmode="decimal" placeholder="Your answer" />
      ${d.unit ? `<span class="muted">${d.unit}</span>` : ""}
    </label>
    <button class="btn btn-ghost btn-sm">Check</button>
    <span class="answer-result" aria-live="polite"></span>`;
  const input = el.querySelector("input"), out = el.querySelector(".answer-result");
  const target = Number(d.answer), tol = Number(d.tol || 0.02);
  const check = () => {
    // accept unicode minus, thousands commas, and "4.0 × 10^7" / "4.0x10^7" scientific notation
    const v = Number(input.value.replace(/−/g, "-").replace(/,/g, "").replace(/\s*[×x*]\s*10\s*\^\s*/i, "e").replace(/\s+/g, ""));
    if (input.value.trim() === "" || !isFinite(v)) { out.textContent = "Enter a number."; out.className = "answer-result"; return; }
    const ok = d.exact ? input.value.trim() === d.answer : Math.abs(v - target) <= Math.abs(target) * tol + 1e-9;
    const close = d.exact && Math.abs(v - target) < 0.2;
    out.textContent = ok ? "✓ Correct" : close ? "Close. Check your significant figures." : "Not quite. Try again or open the solution.";
    out.className = "answer-result " + (ok ? "good" : "bad");
  };
  el.querySelector("button").addEventListener("click", check);
  input.addEventListener("keydown", (e) => e.key === "Enter" && check());
}

export const widgets = {
  "unit-converter": unitConverter,
  "area-scaling": areaScaling,
  "dimension-checker": dimensionChecker,
  "sigfig-counter": sigfigCounter,
  "sigfig-calc": sigfigCalc,
  "accuracy-target": accuracyTarget,
  fermi,
  walker,
  "vector-add": vectorAdd,
  "scalar-multiply": scalarMultiply,
  components,
  "dot-product": dotProduct,
  "cross-3d": cross3d,
  "trip-1d": trip1d,
  "xt-tangent": xtTangent,
  "speed-sign": speedSign,
  "motion-graphs": motionGraphs,
  "kinematics-solver": kinematicsSolver,
  braking,
  "free-fall": freeFall,
  "path-vectors": pathVectors,
  "accel-split": accelSplit,
  "projectile-split": projectileSplit,
  "projectile-lab": projectileLab,
  "range-angle": rangeAngle,
  circular,
  "train-frames": trainFrames,
  "relative-velocity": relativeVelocity,
  "net-force": netForce,
  "inertia-puck": inertiaPuck,
  "frames-cup": framesCup,
  sled,
  "weight-planets": weightPlanets,
  "pair-finder": pairFinder,
  "collision-pair": collisionPair,
  "fbd-builder": fbdBuilder,
  "problem-classifier": problemClassifier,
  "two-cables": twoCables,
  "tilted-axes": tiltedAxes,
  elevator,
  "pulley-system": pulleySystem,
  "friction-push": frictionPush,
  "incline-sim": inclineSim,
  "force-source-quiz": forceSourceQuiz,
  "curve-car": curveCar,
  "loop-top": loopTop,
  "work-angle": workAngle,
  "work-sign-quiz": workSignQuiz,
  "work-table": workTable,
  "ke-speed": keSpeed,
  "work-energy-bars": workEnergyBars,
  "spring-work": springWork,
  "spring-launcher": springLauncher,
  "stairs-power": stairsPower,
  "engine-power": enginePower,
  "slide-energy": slideEnergy,
  "pendulum-energy": pendulumEnergy,
  "spring-block-energy": springBlockEnergy,
  "launcher-height": launcherHeight,
  "energy-ledger": energyLedger,
  "friction-detective": frictionDetective,
  "path-work": pathWork,
  "force-from-u": forceFromU,
  "energy-diagram": energyDiagram,
  "impulse-ft": impulseFt,
  airbag,
  "push-apart": pushApart,
  "collision-1d": collision1d,
  "collision-2d": collision2d,
  "ballistic-pendulum": ballisticPendulum,
  "elastic-cases": elasticCases,
  "cm-finder": cmFinder,
  "firework-cm": fireworkCm,
  rocket,
  "radian-wheel": radianWheel,
  "angular-motion": angularMotion,
  "spin-graph": spinGraph,
  "rim-point": rimPoint,
  "inertia-dumbbell": inertiaDumbbell,
  "inertia-shapes": inertiaShapes,
  flywheel,
  "pulley-drop": pulleyDrop,
  "parallel-axis": parallelAxis,
  "rod-integral": rodIntegral,
  "wrench-torque": wrenchTorque,
  "net-torque-wheel": netTorqueWheel,
  "disk-torque": diskTorque,
  "heavy-pulley": heavyPulley,
  "rolling-wheel": rollingWheel,
  "rolling-race": rollingRace,
  "torque-work": torqueWork,
  "engine-torque": engineTorque,
  "particle-l": particleL,
  "torque-l": torqueL,
  skater,
  "merry-go-round": merryGoRound,
  "couple-forces": coupleForces,
  "pivot-anywhere": pivotAnywhere,
  "cg-plank": cgPlank,
  "tipping-block": tippingBlock,
  seesaw,
  "plank-supports": plankSupports,
  ladder,
  "hinge-cable": hingeCable,
  "wire-stretch": wireStretch,
  "bulk-depth": bulkDepth,
  "shear-block": shearBlock,
  "stress-strain": stressStrain,
  "ref-circle": refCircle,
  "spring-shm": springShm,
  "amplitude-race": amplitudeRace,
  "shm-energy": shmEnergy,
  "vertical-spring": verticalSpring,
  "space-scale": spaceScale,
  "pendulum-lab": pendulumLab,
  "pendulum-race": pendulumRace,
  "measure-g": measureG,
  "period-trap": periodTrap,
  "physical-pendulum": physicalPendulum,
  "damped-oscillator": dampedOscillator,
  resonance,
  "answer-check": answerCheck,
};

export function mountWidgets(root) {
  const cleanups = [];
  root.querySelectorAll("[data-widget]").forEach((el) => {
    const fn = widgets[el.dataset.widget];
    if (!fn) { el.textContent = `Unknown widget: ${el.dataset.widget}`; return; }
    try {
      const c = fn(el, el.dataset);
      if (typeof c === "function") cleanups.push(c);
    } catch (err) {
      console.error(err);
      el.textContent = "This interactive model failed to load.";
    }
  });
  return () => cleanups.forEach((c) => c());
}

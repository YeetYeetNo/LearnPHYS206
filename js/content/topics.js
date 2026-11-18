// ============================================================
// MODULES REGISTRY
// Add a new module by adding an object to this array.
// The order here is the module number shown on the site.
// sims / walkthroughs: ids from js/sims/index.js and js/content/walkthroughs.js
// lessons (optional): full lesson pages. See js/content/unit1.js for the format.
// equations: written in LaTeX inside String.raw`...` (so backslashes stay as typed);
//   KaTeX typesets them on the module page.
// ============================================================

import { unit1Lessons } from "./unit1.js";
import { unit2Lessons } from "./unit2.js";
import { unit3Lessons } from "./unit3.js";
import { unit4Lessons } from "./unit4.js";
import { unit5Lessons } from "./unit5.js";
import { unit6Lessons } from "./unit6.js";
import { unit7Lessons } from "./unit7.js";
import { unit8Lessons } from "./unit8.js";
import { unit9Lessons } from "./unit9.js";
import { unit10Lessons } from "./unit10.js";
import { unit11Lessons } from "./unit11.js";
import { unit13Lessons } from "./unit13.js";

export const topics = [
  {
    id: "units-vectors",
    title: "Units, Quantities & Vectors",
    icon: "📏",
    chapter: "Chapter 1",
    summary: "Units, conversions, dimensional analysis, significant figures, estimates, vectors, components, and dot and cross products.",
    subtopics: unit1Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`A_x = A\cos\theta,\quad A_y = A\sin\theta`, note: "components from magnitude and angle" },
      { eq: String.raw`A = \sqrt{A_x^2 + A_y^2 + A_z^2}`, note: "magnitude from components" },
      { eq: String.raw`\vec A\cdot\vec B = AB\cos\phi = A_xB_x + A_yB_y + A_zB_z`, note: "dot product (a scalar)" },
      { eq: String.raw`|\vec A\times\vec B| = AB\sin\phi`, note: "cross product magnitude" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit1Lessons,
  },
  {
    id: "motion-1d",
    title: "Motion Along a Straight Line",
    icon: "🚗",
    chapter: "Chapter 2",
    summary: "Displacement, velocity, and acceleration in 1D: x-t and v-t graphs, the constant-acceleration equations, free fall, and integration.",
    subtopics: unit2Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`v = \frac{dx}{dt},\quad a = \frac{dv}{dt}`, note: "velocity and acceleration as derivatives" },
      { eq: String.raw`v = v_0 + at`, note: "no displacement" },
      { eq: String.raw`x = x_0 + v_0t + \tfrac12 at^2`, note: "no final velocity" },
      { eq: String.raw`v^2 = v_0^2 + 2a(x - x_0)`, note: "no time" },
      { eq: String.raw`x - x_0 = \tfrac12(v_0 + v)\,t`, note: "no acceleration" },
      { eq: String.raw`a_y = -g = -9.80\ \text{m/s}^2`, note: "free fall, +y up" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit2Lessons,
  },
  {
    // id kept as "kinematics" so existing links to the projectile sim and tennis walkthrough still work
    id: "kinematics",
    title: "Motion in Two Dimensions",
    icon: "🎾",
    chapter: "Chapter 3",
    summary: "Position, velocity, and acceleration as vectors, projectile motion, circular motion, and relative velocity.",
    subtopics: unit3Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\vec v = \frac{d\vec r}{dt},\quad \vec a = \frac{d\vec v}{dt}`, note: "each component separately" },
      { eq: String.raw`x = (v_0\cos\alpha_0)\,t,\quad v_x = v_0\cos\alpha_0`, note: "horizontal: no acceleration" },
      { eq: String.raw`y = (v_0\sin\alpha_0)\,t - \tfrac12 gt^2`, note: "vertical: free fall" },
      { eq: String.raw`R = \frac{v_0^2\sin 2\alpha_0}{g}`, note: "range, level ground only" },
      { eq: String.raw`a_\text{rad} = \frac{v^2}{R} = \frac{4\pi^2R}{T^2}`, note: "toward the center" },
      { eq: String.raw`\vec v_{P/A} = \vec v_{P/B} + \vec v_{B/A}`, note: "relative velocity" },
    ],
    sims: ["projectile"],
    walkthroughs: ["tennis-serve"],
    lessons: unit3Lessons,
  },
  {
    id: "newtons-laws",
    title: "Newton's Laws of Motion",
    icon: "🍎",
    chapter: "Chapter 4",
    summary: "Forces and net force, the first law and equilibrium, ΣF = ma, mass vs. weight, third-law pairs, and free-body diagrams.",
    subtopics: unit4Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\textstyle\sum\vec F = m\vec a`, note: "Newton's 2nd law, the core of the course" },
      { eq: String.raw`\textstyle\sum F_x = ma_x,\quad \sum F_y = ma_y`, note: "one component at a time" },
      { eq: String.raw`\textstyle\sum\vec F = 0`, note: "equilibrium: at rest or constant velocity" },
      { eq: String.raw`w = mg`, note: "weight; g = 9.80 m/s² on Earth" },
      { eq: String.raw`\vec F_{A\text{ on }B} = -\vec F_{B\text{ on }A}`, note: "Newton's 3rd law" },
      { eq: String.raw`1\ \text{N} = 1\ \text{kg}\cdot\text{m/s}^2`, note: "the newton" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit4Lessons,
  },
  {
    id: "applying-newton",
    title: "Applying Newton's Laws",
    icon: "🛗",
    chapter: "Chapter 5",
    summary: "One strategy for every force problem: equilibrium, ramps, elevators, pulleys, static and kinetic friction, and circular-motion dynamics.",
    subtopics: unit5Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`f_k = \mu_k n,\quad f_s \le \mu_s n`, note: "kinetic and static friction" },
      { eq: String.raw`a = g\sin\theta`, note: "frictionless ramp; n = mg cos θ" },
      { eq: String.raw`n = m(g + a)`, note: "elevator scale reading (+ up)" },
      { eq: String.raw`a = \frac{m_2 g}{m_1 + m_2}`, note: "table + hanging block, no friction" },
      { eq: String.raw`\textstyle\sum F_\text{center} = \frac{mv^2}{R}`, note: "supplied by a real force" },
      { eq: String.raw`v_\text{max} = \sqrt{\mu_s gR},\quad \tan\beta = \frac{v^2}{gR}`, note: "flat and banked curves" },
    ],
    sims: ["incline"],
    walkthroughs: ["ramp-box"],
    lessons: unit5Lessons,
  },
  {
    id: "work-energy",
    title: "Work and Kinetic Energy",
    icon: "⚡",
    chapter: "Chapter 6",
    summary: "Work by constant and varying forces, kinetic energy, the work-energy theorem, springs, and power.",
    subtopics: unit6Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`W = Fs\cos\phi`, note: "work by a constant force (joules)" },
      { eq: String.raw`K = \tfrac12 mv^2`, note: "kinetic energy" },
      { eq: String.raw`W_\text{tot} = K_2 - K_1`, note: "the work-energy theorem" },
      { eq: String.raw`W = \int F\,dx`, note: "area under the F-x graph" },
      { eq: String.raw`W_\text{spring} = \tfrac12 k(x_2^2 - x_1^2)`, note: "spring, Hooke's law F = kx" },
      { eq: String.raw`P = \frac{W}{t} = \vec F\cdot\vec v`, note: "power in watts; 1 hp = 746 W" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit6Lessons,
  },
  {
    id: "energy-conservation",
    title: "Potential Energy & Energy Conservation",
    icon: "🎢",
    chapter: "Chapter 7",
    summary: "Gravitational and elastic potential energy, conservation of mechanical energy, friction and W_other, conservative forces, F = −dU/dx, and energy diagrams.",
    subtopics: unit7Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`U_\text{grav} = mgy`, note: "you choose where y = 0" },
      { eq: String.raw`U_\text{el} = \tfrac12 kx^2`, note: "x from the relaxed length" },
      { eq: String.raw`K_1 + U_1 + W_\text{other} = K_2 + U_2`, note: "the one to know by heart" },
      { eq: String.raw`\Delta K + \Delta U + \Delta U_\text{int} = 0`, note: "total energy is always conserved" },
      { eq: String.raw`F_x = -\frac{dU}{dx}`, note: "force points toward lower U" },
      { eq: String.raw`K = E - U(x)`, note: "reading an energy diagram" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit7Lessons,
  },
  {
    id: "momentum",
    title: "Momentum, Impulse & Collisions",
    icon: "🎱",
    chapter: "Chapter 8",
    summary: "Momentum and impulse, conservation of momentum, inelastic and elastic collisions in 1D and 2D, center of mass, and rocket propulsion.",
    subtopics: unit8Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\vec p = m\vec v`, note: "a vector: direction matters" },
      { eq: String.raw`\vec J = \textstyle\sum\vec F\,\Delta t = \Delta\vec p`, note: "impulse-momentum theorem; area under F-t" },
      { eq: String.raw`m_Av_{A1} + m_Bv_{B1} = m_Av_{A2} + m_Bv_{B2}`, note: "isolated system" },
      { eq: String.raw`v_{B2} - v_{A2} = -(v_{B1} - v_{A1})`, note: "elastic collisions only" },
      { eq: String.raw`x_\text{cm} = \frac{\sum m_ix_i}{M},\quad \vec P = M\vec v_\text{cm}`, note: "center of mass" },
      { eq: String.raw`\Delta v = v_\text{ex}\ln\frac{m_0}{m}`, note: "rocket equation" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit8Lessons,
  },
  {
    id: "rotation",
    title: "Rotation of Rigid Bodies",
    icon: "🛞",
    chapter: "Chapter 9",
    summary: "Angular position, velocity, and acceleration, constant-α kinematics, v = rω, moment of inertia, rotational kinetic energy, and the parallel-axis theorem.",
    subtopics: unit9Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\omega = \frac{d\theta}{dt},\quad \alpha = \frac{d\omega}{dt}`, note: "radians! 1 rev = 2π rad" },
      { eq: String.raw`\omega = \omega_0 + \alpha t,\quad \theta = \omega_0t + \tfrac12\alpha t^2`, note: "constant α (Unit 2's equations)" },
      { eq: String.raw`v = r\omega,\quad a_\text{tan} = r\alpha,\quad a_\text{rad} = \omega^2r`, note: "linear ↔ angular" },
      { eq: String.raw`I = \textstyle\sum m_ir_i^2 = \int r^2\,dm`, note: "depends on the axis" },
      { eq: String.raw`K_\text{rot} = \tfrac12 I\omega^2`, note: "rotational kinetic energy" },
      { eq: String.raw`I_P = I_\text{cm} + Md^2`, note: "parallel-axis theorem" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit9Lessons,
  },
  {
    id: "rotational-dynamics",
    title: "Dynamics of Rotational Motion",
    icon: "⚙️",
    chapter: "Chapter 10",
    summary: "Torque, Στ = Iα with linked pulleys, rolling without slipping, rotational work and power, and angular momentum and its conservation.",
    subtopics: unit10Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\tau = rF\sin\phi = F\ell`, note: "counterclockwise is positive" },
      { eq: String.raw`\textstyle\sum\tau = I\alpha`, note: "link to sliding parts with a = Rα" },
      { eq: String.raw`v_\text{cm} = R\omega,\quad K = \tfrac12 Mv^2 + \tfrac12 I\omega^2`, note: "rolling without slipping" },
      { eq: String.raw`W = \tau\,\Delta\theta,\quad P = \tau\omega`, note: "rotational work and power (rad/s!)" },
      { eq: String.raw`L = I\omega,\quad L = mv\ell`, note: "angular momentum" },
      { eq: String.raw`I_1\omega_1 = I_2\omega_2`, note: "when Στ_ext = 0" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit10Lessons,
  },
  {
    id: "equilibrium",
    title: "Equilibrium & Elasticity",
    icon: "🏗️",
    chapter: "Chapter 11",
    summary: "The two conditions for equilibrium, center of gravity and tipping, solving seesaw, plank, ladder, and hinge problems, and stress, strain, and the elastic moduli.",
    subtopics: unit11Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`\textstyle\sum\vec F = 0,\quad \sum\tau = 0`, note: "about any point you choose" },
      { eq: String.raw`x_\text{cg} = \frac{\sum m_ix_i}{\sum m_i}`, note: "center of gravity" },
      { eq: String.raw`Y = \frac{F_\perp/A}{\Delta L/L_0}`, note: "tension or compression" },
      { eq: String.raw`B = -\frac{\Delta p}{\Delta V/V_0}`, note: "bulk modulus" },
      { eq: String.raw`S = \frac{F_\parallel/A}{x/h}`, note: "shear modulus" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit11Lessons,
  },
  {
    id: "periodic-motion",
    title: "Periodic Motion",
    icon: "🕰️",
    chapter: "Chapter 14",
    summary: "Amplitude, period, and frequency, simple harmonic motion and its energy, vertical springs, simple and physical pendulums, damping, and resonance.",
    subtopics: unit13Lessons.map((l) => l.title),
    equations: [
      { eq: String.raw`f = \frac1T,\quad \omega = 2\pi f`, note: "angular frequency in rad/s" },
      { eq: String.raw`x = A\cos(\omega t + \phi)`, note: "radians, not degrees!" },
      { eq: String.raw`\omega = \sqrt{k/m},\quad v_\text{max} = \omega A,\quad a_\text{max} = \omega^2A`, note: "mass on a spring" },
      { eq: String.raw`E = \tfrac12 kA^2,\quad v = \omega\sqrt{A^2 - x^2}`, note: "energy in SHM" },
      { eq: String.raw`T = 2\pi\sqrt{L/g}`, note: "simple pendulum, small swings" },
      { eq: String.raw`T = 2\pi\sqrt{\frac{I}{mgd}}`, note: "physical pendulum, I about the pivot" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit13Lessons,
  },
];

export const getTopic = (id) => topics.find((t) => t.id === id);

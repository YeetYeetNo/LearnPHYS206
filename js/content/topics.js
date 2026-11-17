// ============================================================
// MODULES REGISTRY
// Add a new module by adding an object to this array.
// The order here is the module number shown on the site.
// sims / walkthroughs: ids from js/sims/index.js and js/content/walkthroughs.js
// lessons (optional): full lesson pages. See js/content/unit1.js for the format.
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
      { eq: "Aₓ = A·cos θ,  Aᵧ = A·sin θ", note: "components from magnitude and angle" },
      { eq: "A = √(Aₓ² + Aᵧ² + A_z²)", note: "magnitude from components" },
      { eq: "A·B = AB·cos φ = AₓBₓ + AᵧBᵧ + A_zB_z", note: "dot product (a scalar)" },
      { eq: "|A × B| = AB·sin φ", note: "cross product magnitude" },
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
      { eq: "v = dx/dt,  a = dv/dt", note: "velocity and acceleration as derivatives" },
      { eq: "v = v₀ + a·t", note: "no displacement" },
      { eq: "x = x₀ + v₀·t + ½·a·t²", note: "no final velocity" },
      { eq: "v² = v₀² + 2a·(x − x₀)", note: "no time" },
      { eq: "x − x₀ = ½(v₀ + v)·t", note: "no acceleration" },
      { eq: "a_y = −g = −9.80 m/s²", note: "free fall, +y up" },
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
      { eq: "v = dr/dt,  a = dv/dt", note: "each component separately" },
      { eq: "x = (v₀ cos α₀)·t,  vₓ = v₀ cos α₀", note: "horizontal: no acceleration" },
      { eq: "y = (v₀ sin α₀)·t − ½·g·t²", note: "vertical: free fall" },
      { eq: "R = v₀²·sin(2α₀) / g", note: "range, level ground only" },
      { eq: "a_rad = v²/R = 4π²R/T²", note: "toward the center" },
      { eq: "v(P/A) = v(P/B) + v(B/A)", note: "relative velocity" },
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
      { eq: "ΣF = m·a", note: "Newton's 2nd law, the core of the course" },
      { eq: "ΣFₓ = m·aₓ,  ΣFᵧ = m·aᵧ", note: "one component at a time" },
      { eq: "ΣF = 0", note: "equilibrium: at rest or constant velocity" },
      { eq: "w = m·g", note: "weight; g = 9.80 m/s² on Earth" },
      { eq: "F(A on B) = −F(B on A)", note: "Newton's 3rd law" },
      { eq: "1 N = 1 kg·m/s²", note: "the newton" },
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
      { eq: "fₖ = μₖ·n,  fₛ ≤ μₛ·n", note: "kinetic and static friction" },
      { eq: "a = g·sin θ", note: "frictionless ramp; n = mg cos θ" },
      { eq: "n = m(g + a)", note: "elevator scale reading (+ up)" },
      { eq: "a = m₂g / (m₁ + m₂)", note: "table + hanging block, no friction" },
      { eq: "ΣF_center = mv²/R", note: "supplied by a real force" },
      { eq: "v_max = √(μₛgR),  tan β = v²/gR", note: "flat and banked curves" },
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
      { eq: "W = F·s·cos φ", note: "work by a constant force (joules)" },
      { eq: "K = ½·m·v²", note: "kinetic energy" },
      { eq: "W_tot = K₂ − K₁", note: "the work-energy theorem" },
      { eq: "W = ∫F dx", note: "area under the F-x graph" },
      { eq: "W_spring = ½k(x₂² − x₁²)", note: "spring, Hooke's law F = kx" },
      { eq: "P = W/t = F·v", note: "power in watts; 1 hp = 746 W" },
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
      { eq: "U_grav = m·g·y", note: "you choose where y = 0" },
      { eq: "U_el = ½·k·x²", note: "x from the relaxed length" },
      { eq: "K₁ + U₁ + W_other = K₂ + U₂", note: "the one to know by heart" },
      { eq: "ΔK + ΔU + ΔU_int = 0", note: "total energy is always conserved" },
      { eq: "Fₓ = −dU/dx", note: "force points toward lower U" },
      { eq: "K = E − U(x)", note: "reading an energy diagram" },
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
      { eq: "p = m·v", note: "a vector: direction matters" },
      { eq: "J = ΣF·Δt = Δp", note: "impulse-momentum theorem; area under F-t" },
      { eq: "m_A·v_A1 + m_B·v_B1 = m_A·v_A2 + m_B·v_B2", note: "isolated system" },
      { eq: "v_B2 − v_A2 = −(v_B1 − v_A1)", note: "elastic collisions only" },
      { eq: "x_cm = Σmᵢxᵢ / M,  P = M·v_cm", note: "center of mass" },
      { eq: "Δv = v_ex·ln(m₀/m)", note: "rocket equation" },
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
      { eq: "ω = dθ/dt,  α = dω/dt", note: "radians! 1 rev = 2π rad" },
      { eq: "ω = ω₀ + αt,  θ = ω₀t + ½αt²", note: "constant α (Unit 2's equations)" },
      { eq: "v = rω,  a_tan = rα,  a_rad = ω²r", note: "linear ↔ angular" },
      { eq: "I = Σmᵢrᵢ² = ∫r² dm", note: "depends on the axis" },
      { eq: "K_rot = ½·I·ω²", note: "rotational kinetic energy" },
      { eq: "I_P = I_cm + Md²", note: "parallel-axis theorem" },
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
      { eq: "τ = rF·sin φ = F·ℓ", note: "counterclockwise is positive" },
      { eq: "Στ = I·α", note: "link to sliding parts with a = Rα" },
      { eq: "v_cm = Rω,  K = ½Mv² + ½Iω²", note: "rolling without slipping" },
      { eq: "W = τ·Δθ,  P = τ·ω", note: "rotational work and power (rad/s!)" },
      { eq: "L = Iω,  L = mvℓ", note: "angular momentum" },
      { eq: "I₁ω₁ = I₂ω₂", note: "when Στ_ext = 0" },
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
      { eq: "ΣF = 0,  Στ = 0", note: "about any point you choose" },
      { eq: "x_cg = Σmᵢxᵢ / Σmᵢ", note: "center of gravity" },
      { eq: "Y = (F⊥/A)/(ΔL/L₀)", note: "tension or compression" },
      { eq: "B = −Δp/(ΔV/V₀)", note: "bulk modulus" },
      { eq: "S = (F∥/A)/(x/h)", note: "shear modulus" },
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
      { eq: "f = 1/T,  ω = 2πf", note: "angular frequency in rad/s" },
      { eq: "x = A cos(ωt + φ)", note: "radians, not degrees!" },
      { eq: "ω = √(k/m),  v_max = ωA,  a_max = ω²A", note: "mass on a spring" },
      { eq: "E = ½kA²,  v = ω√(A² − x²)", note: "energy in SHM" },
      { eq: "T = 2π√(L/g)", note: "simple pendulum, small swings" },
      { eq: "T = 2π√(I/(mgd))", note: "physical pendulum, I about the pivot" },
    ],
    sims: [],
    walkthroughs: [],
    lessons: unit13Lessons,
  },
];

export const getTopic = (id) => topics.find((t) => t.id === id);

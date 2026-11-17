// ============================================================
// SIMULATIONS REGISTRY
// To add a simulation:
//   1. Create js/sims/<name>.js exporting `mount(container)` that
//      returns a cleanup function (cancel animation, remove listeners).
//   2. Import it below and add an entry.
// ============================================================

import { mount as projectile } from "./projectile.js";
import { mount as incline } from "./incline.js";

export const sims = [
  {
    id: "projectile",
    title: "Projectile Motion",
    icon: "🎾",
    topic: "kinematics",
    summary: "Set the launch speed, angle, height, and gravity, then watch the trajectory, range, and flight time update.",
    mount: projectile,
  },
  {
    id: "incline",
    title: "Inclined Plane",
    icon: "📐",
    topic: "applying-newton",
    summary: "Tilt a ramp, change mass and friction, and see the free-body diagram and acceleration change.",
    mount: incline,
  },
];

export const getSim = (id) => sims.find((s) => s.id === id);

// ============================================================
// WALKTHROUGHS REGISTRY
// Every problem here must be ORIGINAL: not PHYS 206 homework,
// quizzes, or exams, and not copied from a textbook.
//
// Each walkthrough has 4 steps: setup, diagram, equations, solution.
// Step bodies are HTML strings. A diagram step can hold inline SVG.
// Copy the TEMPLATE at the bottom to add a new problem.
// ============================================================

export const walkthroughs = [
  {
    id: "tennis-serve",
    topic: "kinematics",
    title: "A Flat Tennis Shot",
    difficulty: "Intro",
    sim: "projectile",
    statement: `A player hits a tennis ball <strong>horizontally</strong> at <strong>22 m/s</strong> from a height of <strong>2.4 m</strong>. Ignoring air resistance and spin, how far does the ball travel horizontally before it hits the ground?`,
    steps: [
      {
        title: "Setup: what do we know?",
        body: `
          <p>Choose up as +y and the launch point as x = 0. Because the hit is horizontal, all of the initial velocity is in x.</p>
          <ul>
            <li>v₀ₓ = 22 m/s, v₀ᵧ = 0</li>
            <li>Δy = −2.4 m (the ball ends up lower)</li>
            <li>aᵧ = −g = −9.8 m/s², aₓ = 0</li>
            <li>Unknown: Δx</li>
          </ul>`,
      },
      {
        title: "Diagram",
        body: `
          <svg class="diagram" viewBox="0 0 420 200" role="img" aria-label="Ball launched horizontally from 2.4 m and landing a distance delta x away">
            <line x1="20" y1="170" x2="400" y2="170" stroke="currentColor" stroke-width="2"/>
            <line x1="40" y1="170" x2="40" y2="50" stroke="currentColor" stroke-dasharray="4 4"/>
            <text x="48" y="115">2.4 m</text>
            <path d="M40 50 Q 250 50 330 170" fill="none" stroke="#c45c5c" stroke-width="2.5" stroke-dasharray="6 5"/>
            <circle cx="40" cy="50" r="7" fill="#d4e157" stroke="#556b00"/>
            <line x1="40" y1="50" x2="110" y2="50" stroke="#2f80ed" stroke-width="2.5" marker-end="url(#arr)"/>
            <text x="70" y="40">v₀ = 22 m/s</text>
            <line x1="40" y1="188" x2="330" y2="188" stroke="currentColor"/>
            <text x="170" y="184">Δx = ?</text>
            <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#2f80ed"/></marker></defs>
          </svg>`,
      },
      {
        title: "Equations",
        body: `
          <p>Horizontal and vertical motion are independent. They share only the time t.</p>
          <div class="eq">Vertical: Δy = v₀ᵧ·t − ½·g·t²</div><br/>
          <div class="eq">Horizontal: Δx = v₀ₓ·t</div>
          <p>Find t from the vertical equation first, then use it in the horizontal one.</p>`,
      },
      {
        title: "Solution",
        body: `
          <p>With v₀ᵧ = 0: −2.4 = −½(9.8)t², so t = √(2·2.4 / 9.8) ≈ <strong>0.70 s</strong>.</p>
          <p>Δx = (22 m/s)(0.70 s) ≈ <span class="answer">15 m</span></p>
          <p class="muted">Check: a singles court is about 23.8 m long, so 15 m is a sensible distance for a flat shot. Try it in the projectile simulation with angle 0° and height 2.4 m.</p>`,
      },
    ],
  },
  {
    id: "ramp-box",
    topic: "applying-newton",
    title: "Box Sliding Down a Rough Ramp",
    difficulty: "Core",
    sim: "incline",
    statement: `A <strong>4.0 kg</strong> box slides down a ramp tilted at <strong>30°</strong>. The coefficient of kinetic friction between the box and ramp is <strong>0.20</strong>. What is the box's acceleration?`,
    steps: [
      {
        title: "Setup: what do we know?",
        body: `
          <p>Tilt the axes: +x points down the ramp and +y points perpendicular to the ramp, away from it.</p>
          <ul><li>m = 4.0 kg, θ = 30°, μₖ = 0.20, g = 9.8 m/s²</li><li>Unknown: a (along the ramp)</li></ul>`,
      },
      {
        title: "Free-body diagram",
        body: `
          <svg class="diagram" viewBox="0 0 420 220" role="img" aria-label="Box on 30 degree incline with gravity, normal, and friction forces">
            <polygon points="30,200 390,200 390,0" fill="none" stroke="currentColor" stroke-width="2"/>
            <g transform="translate(220,94) rotate(-29.05)">
              <rect x="-25" y="-40" width="50" height="40" fill="#f2c94c" stroke="#8a6d1c"/>
              <line x1="0" y1="-20" x2="0" y2="-95" stroke="#2f80ed" stroke-width="3"/>
              <text x="6" y="-80">N</text>
              <line x1="0" y1="-20" x2="65" y2="-20" stroke="#eb5757" stroke-width="3"/>
              <text x="58" y="-28">f_k</text>
            </g>
            <line x1="210" y1="77" x2="210" y2="167" stroke="#27ae60" stroke-width="3"/>
            <text x="218" y="162">mg</text>
            <text x="70" y="192">30°</text>
          </svg>
          <p class="muted">Friction points <em>up</em> the ramp, opposite the motion.</p>`,
      },
      {
        title: "Equations",
        body: `
          <div class="eq">y: N − m·g·cos θ = 0  →  N = m·g·cos θ</div><br/>
          <div class="eq">x: m·g·sin θ − μₖ·N = m·a</div>
          <p>Substitute N and divide by m. The mass cancels:</p>
          <div class="eq">a = g(sin θ − μₖ·cos θ)</div>`,
      },
      {
        title: "Solution",
        body: `
          <p>a = 9.8 × (sin 30° − 0.20 × cos 30°) = 9.8 × (0.500 − 0.173)</p>
          <p>a ≈ <span class="answer">3.2 m/s² down the ramp</span></p>
          <p class="muted">Check: without friction it would be g·sin 30° = 4.9 m/s². Friction should reduce that, and it does.</p>`,
      },
    ],
  },

  // ---------- TEMPLATE: copy, rename the id, fill in ----------
  // {
  //   id: "your-problem-id",
  //   topic: "energy",            // must match an id in topics.js
  //   title: "Problem Title",
  //   difficulty: "Intro" | "Core" | "Challenge",
  //   sim: "projectile",          // optional, id from sims/index.js
  //   statement: `Problem text...`,
  //   steps: [
  //     { title: "Setup: what do we know?", body: `...` },
  //     { title: "Diagram", body: `<svg>...</svg>` },
  //     { title: "Equations", body: `...` },
  //     { title: "Solution", body: `...` },
  //   ],
  // },
];

export const getWalkthrough = (id) => walkthroughs.find((w) => w.id === id);

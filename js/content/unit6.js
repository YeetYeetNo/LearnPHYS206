// ============================================================
// UNIT 6 LESSONS: Work and Kinetic Energy (Chapter 6)
// Source: "PHYS 206 Unit 6 Study Guide" (Oct 26, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit6Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 6 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 6 of PHYS 206 is Chapter 6 of the course textbook, work and kinetic energy (sections 1–4), taught in week 6 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It's on <strong>Exam II</strong>, which covers Chapters 4–7.</p>
      <p>This unit introduces a new way to solve problems: <strong>energy</strong>. With Newton's laws, you track forces and acceleration moment by moment. With energy, you often skip straight from the start of a motion to the end, without caring what happened in between.</p>
      <p>The central result, the <strong>work-energy theorem</strong>, links the two approaches. Work is how forces transfer energy, and kinetic energy is the energy of motion. Total work done on an object equals the change in its kinetic energy.</p>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Calculate the work done by a constant force, including its sign</li>
        <li>Find the total work done by several forces</li>
        <li>Use the work-energy theorem to find speeds without kinematics</li>
        <li>Calculate work done by varying forces, including springs</li>
        <li>Calculate power, the rate of doing work</li>
      </ul>
      <div class="callout"><strong>Rule of thumb:</strong> when a problem gives you distances and asks for speeds (or the reverse), and doesn't mention time, energy is usually the fastest route.</div>`,
  },

  {
    id: "work",
    title: "Work done by a constant force",
    minutes: 10,
    interactives: ["Work and the angle φ", "Positive, zero, or negative? sorter"],
    body: String.raw`
      <p>In physics, <strong>work</strong> has a precise meaning: a force does work on an object when the object moves while the force acts on it. No movement, no work, no matter how hard you push.</p>

      <h2>The definition</h2>
      <p>For a constant force <strong>F</strong> acting while an object moves through a displacement <strong>s</strong>:</p>
      $$W = \vec{F}\cdot\vec{s} = Fs\cos\phi$$
      <p>Here φ is the angle between the force and the displacement. This is Unit 1's dot product in action: only the part of the force along the motion does any work.</p>
      <p>Work is a <strong>scalar</strong>, not a vector. Its SI unit is the <strong>joule (J)</strong>, where 1 J = 1 N·m.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>You pull a suitcase 20 m along a level floor with a 50 N force on the handle, angled 35° above horizontal. How much work do you do?</p>
        ${solution(String.raw`
          $$W = (50)(20)\cos 35^\circ = 820\ \text{J}$$
          <p>Only the horizontal part of your pull, 50 cos 35° = 41 N, does work. The upward part just partly lifts the suitcase's weight off the floor.</p>`)}
      </div>
      <h3>Try it: change the angle</h3>
      <p class="muted">The green or red shadow on the floor is the part of the force along the motion, F cos φ. Swing the force past 90° and watch the work turn negative.</p>
      <div data-widget="work-angle"></div>

      <h2>The sign of work</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Angle φ between F and s</th><th>Work</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>Less than 90°</td><td>Positive</td><td>Pushing a cart forward</td></tr>
          <tr><td>Exactly 90°</td><td>Zero</td><td>The normal force on an object sliding across a floor</td></tr>
          <tr><td>More than 90°</td><td>Negative</td><td>Friction on a sliding box; brakes on a car</td></tr>
        </tbody>
      </table>
      <p><strong>Positive work</strong> adds energy to the object. <strong>Negative work</strong> removes it.</p>

      <h2>When work is zero</h2>
      <p>Physics work is different from effort. You do <strong>zero work</strong> on an object when:</p>
      <ul>
        <li><strong>It doesn't move:</strong> holding a heavy box still in the air.</li>
        <li><strong>The force is perpendicular to the motion:</strong> carrying a box across a room at constant height and speed. Your upward force is at 90° to the horizontal motion.</li>
      </ul>
      <p>In the second case, your muscles burn energy and you feel tired. But no work is done on the box, because its energy doesn't change.</p>
      <h3>Practice: positive, zero, or negative?</h3>
      <div data-widget="work-sign-quiz"></div>`,
  },

  {
    id: "total-work",
    title: "Total work when several forces act",
    minutes: 9,
    interactives: ["Crate work table"],
    body: String.raw`
      <p>When several forces act on an object, each one does its own work. The <strong>total work</strong> is the sum of all of them, and it's the quantity that matters in the work-energy theorem.</p>

      <h2>Two equivalent ways to find total work</h2>
      <ol>
        <li><strong>Add each force's work:</strong> W_tot = W₁ + W₂ + W₃ + …, keeping each one's sign.</li>
        <li><strong>Use the net force:</strong> W_tot = (ΣF)·s, the work done by the net force.</li>
      </ol>
      <p>Both always give the same answer. Method 1 is usually easier to keep organized; method 2 is a good check.</p>

      <div class="example">
        <div class="example-label">Worked example: pulling a crate with friction</div>
        <p>A 40 kg crate is pulled 8.0 m across a level floor by a horizontal rope with 150 N of tension. The coefficient of kinetic friction is 0.25. Find the work done by each force and the total work.</p>
        ${solution(String.raw`
          <p>First, the free-body diagram: weight (down), normal force (up), tension (forward), and kinetic friction (backward). Since the floor is level, n = mg = (40)(9.80) = 392 N, and friction is fₖ = (0.25)(392) = 98 N.</p>
          <table class="table">
            <thead><tr><th>Force</th><th>Size</th><th>Angle to motion</th><th>Work</th></tr></thead>
            <tbody>
              <tr><td>Tension</td><td>150 N</td><td>0°</td><td>(150)(8.0) = +1200 J</td></tr>
              <tr><td>Friction</td><td>98 N</td><td>180°</td><td>(98)(8.0)(−1) = −784 J</td></tr>
              <tr><td>Normal force</td><td>392 N</td><td>90°</td><td>0</td></tr>
              <tr><td>Weight</td><td>392 N</td><td>90°</td><td>0</td></tr>
            </tbody>
          </table>
          <p><strong>Total work:</strong> 1200 − 784 = <strong>+416 J</strong>.</p>
          <p><strong>Check with the net force:</strong> the net force is 150 − 98 = 52 N forward, and (52)(8.0) = 416 J. It matches.</p>
          <p>The total work is positive, so the crate gains energy and speeds up. The next lesson turns that into a speed.</p>`)}
      </div>
      <h3>Try it: the work table, live</h3>
      <p class="muted">Change the pull, the rope angle, friction, or distance. Each force gets its own row. Notice that angling the rope up lowers n, which lowers friction.</p>
      <div data-widget="work-table"></div>`,
  },

  {
    id: "work-energy-theorem",
    title: "Kinetic energy and the work-energy theorem",
    minutes: 12,
    interactives: ["Kinetic energy vs. speed", "Work-energy bar chart"],
    body: String.raw`
      <p>Kinetic energy is the energy an object has because it's moving. The work-energy theorem says total work changes it. Together, they let you find speeds from forces and distances, with no time and no acceleration needed.</p>

      <h2>Kinetic energy</h2>
      $$K = \tfrac{1}{2}mv^2$$
      <p>Kinetic energy is a scalar, measured in joules, and it's never negative. Because of the v², <strong>doubling an object's speed quadruples its kinetic energy.</strong> That's why a car at 60 mph needs about four times the braking distance it needs at 30 mph.</p>
      <div data-widget="ke-speed"></div>

      <h2>The work-energy theorem</h2>
      $$W_{\text{tot}} = K_2 - K_1 = \Delta K$$
      <p>The total work done on an object equals the change in its kinetic energy. Positive total work speeds it up, negative total work slows it down, and zero total work leaves its speed unchanged.</p>
      <p>This isn't a new law. It comes straight from Newton's second law combined with v² = v₀² + 2as from Unit 2: multiply that equation by ½m, and ma·s becomes F·s, the work.</p>
      <h3>See it: energy bookkeeping</h3>
      <p class="muted">Slide the distance or press play. The bars always balance: starting K plus every force's work equals the new K. Try all three worked examples.</p>
      <div data-widget="work-energy-bars"></div>

      <div class="example">
        <div class="example-label">Worked example 1: the crate's final speed</div>
        <p>The 40 kg crate from the previous lesson starts from rest and receives 416 J of total work over 8.0 m. How fast is it moving?</p>
        ${solution(String.raw`
          $$416 = \tfrac{1}{2}(40)v^2 - 0 \quad\Rightarrow\quad v = \sqrt{\frac{2(416)}{40}} = 4.6\ \text{m/s}$$
          <p>No acceleration, no time: just work in, speed out.</p>`)}
      </div>
      <div class="example">
        <div class="example-label">Worked example 2: stopping distance</div>
        <p>A 1200 kg car moving at 25 m/s brakes, and the road applies a 6000 N friction force. How far does it skid?</p>
        ${solution(String.raw`
          <ol>
            <li>Initial kinetic energy: K₁ = ½(1200)(25)² = 375,000 J. Final kinetic energy: K₂ = 0.</li>
            <li>Friction does negative work: W = −(6000)d.</li>
            <li>Work-energy theorem: −6000d = 0 − 375,000, so <strong>d = 62.5 m</strong>.</li>
          </ol>`)}
      </div>
      <div class="example">
        <div class="example-label">Worked example 3: a dropped object</div>
        <p>An object falls from rest through a height h. How fast is it moving when it lands?</p>
        ${solution(String.raw`
          <p>Gravity does work W = mgh, so mgh = ½mv², giving <strong>v = √(2gh)</strong>. The mass cancels, matching what you learned about free fall in Unit 2. Dropped from 5.0 m, an object lands at √(2 × 9.80 × 5.0) = <strong>9.9 m/s</strong>.</p>`)}
      </div>`,
  },

  {
    id: "springs",
    title: "Work done by varying forces (springs)",
    minutes: 12,
    interactives: ["Spring work as an area", "Spring launcher"],
    body: String.raw`
      <p>W = Fs cos φ only works when the force is constant. When the force changes as the object moves, you add up the work in tiny pieces, which means an integral. The most important example is a spring.</p>

      <h2>Work as an integral, and as an area</h2>
      <p>For a force that varies with position along the x-axis:</p>
      $$W = \int_{x_1}^{x_2} F_x\,dx$$
      <p>Graphically, <strong>work is the area under the F-x graph</strong>, just as displacement was the area under the v-t graph in Unit 2. For a constant force, that area is a rectangle, F × s, which matches the earlier formula.</p>

      <h2>Springs and Hooke's law</h2>
      <p>To stretch or compress an ideal spring by a distance x from its relaxed length, you need a force proportional to x:</p>
      $$F_x = kx$$
      <p>The <strong>spring constant</strong> k, in N/m, measures stiffness. A stiff spring has a large k. The spring itself pulls back the opposite way, with force −kx, always trying to return to its relaxed length.</p>
      <p>The F-x graph is a straight line through the origin, so the work is a triangle's area:</p>
      $$W = \tfrac{1}{2}kx^2$$
      <p>That's the work <strong>you</strong> do to stretch or compress the spring from its relaxed length. The spring does the same amount of work with the opposite sign. To go from x₁ to x₂, the work is \(\tfrac{1}{2}k(x_2^2 - x_1^2)\), not \(\tfrac{1}{2}k(x_2 - x_1)^2\).</p>
      <h3>See it: work is the shaded area</h3>
      <p class="muted">The shaded triangle is the real work. The dashed rectangle is the common mistake, F × x. Switch to "between two stretches" to see why ½k(x₂² − x₁²) is right.</p>
      <div data-widget="spring-work"></div>

      <div class="example">
        <div class="example-label">Worked example 1: stretching a spring</div>
        <p>A spring with k = 200 N/m is stretched 0.15 m from its relaxed length. Find the force needed at full stretch and the work done.</p>
        ${solution(String.raw`
          <ol>
            <li>Force needed at full stretch: F = (200)(0.15) = <strong>30 N</strong>.</li>
            <li>Work done: W = ½(200)(0.15)² = <strong>2.25 J</strong>. It's less than 30 N × 0.15 m = 4.5 J because the force starts at zero and builds up.</li>
          </ol>`)}
      </div>
      <div class="example">
        <div class="example-label">Worked example 2: a spring launcher</div>
        <p>A spring with k = 800 N/m is compressed 0.10 m against a 0.50 kg block on a frictionless surface, then released. How fast is the block moving when it leaves the spring?</p>
        ${solution(String.raw`
          <ol>
            <li>Work done by the spring as it relaxes: ½(800)(0.10)² = 4.0 J.</li>
            <li>Work-energy theorem: 4.0 = ½(0.50)v² − 0, so v² = 16, and <strong>v = 4.0 m/s</strong>.</li>
          </ol>
          <p>This is the payoff of the work-energy theorem. The spring force changes constantly, so Unit 2's constant-acceleration equations can't solve this problem, but energy handles it in two lines.</p>`)}
      </div>
      <h3>Try it: launch the block</h3>
      <p class="muted">The spring's work flows into the block's kinetic energy as it relaxes. The push is strongest at the start and fades to zero as the spring reaches its relaxed length.</p>
      <div data-widget="spring-launcher"></div>`,
  },

  {
    id: "power",
    title: "Power",
    minutes: 8,
    interactives: ["Stair-climbing power", "Engine power"],
    body: String.raw`
      <p>Work tells you how much energy a force transfers. Power tells you how fast. Walking up a flight of stairs and sprinting up it take the same work, but sprinting takes far more power.</p>

      <h2>Average and instantaneous power</h2>
      $$P_{\text{av}} = \frac{\Delta W}{\Delta t} \qquad P = \frac{dW}{dt}$$
      <p>The SI unit is the <strong>watt (W)</strong>, where 1 W = 1 J/s. You'll also see <strong>horsepower</strong>: 1 hp = 746 W.</p>
      <div class="callout warn">Don't confuse the two W's: in formulas, W is work, and as a unit, W is watts.</div>

      <div class="example">
        <div class="example-label">Worked example 1: climbing stairs</div>
        <p>A 60 kg student runs up a flight of stairs 4.0 m high in 5.0 s. What's their average power output?</p>
        ${solution(String.raw`
          <ol>
            <li>Work done against gravity: W = mgh = (60)(9.80)(4.0) = 2350 J.</li>
            <li>Average power: P = 2350 J / 5.0 s = <strong>470 W</strong>, about 0.63 hp.</li>
          </ol>
          <p>Walking up the same stairs in 15 s takes the same 2350 J of work, but only 157 W of power.</p>`)}
      </div>
      <h3>Try it: run vs. walk</h3>
      <div data-widget="stairs-power"></div>

      <h2>Power from force and velocity</h2>
      <p>For a force acting on a moving object, the instantaneous power is:</p>
      $$P = \vec{F}\cdot\vec{v} = Fv\cos\phi$$
      <p>This version is especially useful for engines and motors, where you know the force and the speed.</p>
      <div class="example">
        <div class="example-label">Worked example 2: a car engine</div>
        <p>A car cruises at 25 m/s while its engine pushes it forward with 2000 N, balancing air resistance and road friction. What power does the engine deliver?</p>
        ${solution(String.raw`
          $$P = Fv = (2000)(25) = 50{,}000\ \text{W} = 50\ \text{kW} \approx 67\ \text{hp}$$
          <p>The car isn't speeding up, so its kinetic energy is constant. The engine's power all goes into fighting resistance.</p>`)}
      </div>
      <div data-widget="engine-power"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 18,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 6 errors are about signs and about which work goes into the work-energy theorem. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Using the full force instead of the part along the motion.</strong> Work needs the cos φ.</li>
        <li><strong>Forgetting that friction does negative work.</strong></li>
        <li><strong>Counting work when nothing moves,</strong> or when the force is perpendicular to the motion.</li>
        <li><strong>Plugging one force's work into the work-energy theorem.</strong> It needs the total work from all forces.</li>
        <li><strong>Forgetting kinetic energy goes as v².</strong> Doubling speed means four times the energy.</li>
        <li><strong>Computing spring work as F × x.</strong> It's ½kx², because the force builds up from zero.</li>
        <li><strong>Writing ½k(x₂ − x₁)²</strong> for stretching between two points. It's ½k(x₂² − x₁²).</li>
      </ul>

      <h2>Key formulas</h2>
      $$W = Fs\cos\phi \qquad W_{\text{tot}} = \Delta K \qquad K = \tfrac{1}{2}mv^2$$
      $$W = \int_{x_1}^{x_2} F_x\,dx \qquad W_{\text{spring}} = \tfrac{1}{2}k\left(x_2^2 - x_1^2\right)$$
      $$P_{\text{av}} = \frac{\Delta W}{\Delta t} \qquad P = Fv\cos\phi \qquad 1\ \text{hp} = 746\ \text{W}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>You push a lawnmower 30 m with an 80 N force directed 40° below horizontal. How much work do you do?</p>
          <div data-widget="answer-check" data-answer="1840" data-tol="0.03" data-label="W" data-unit="J"></div>
          ${solution("W = (80)(30) cos 40° = <strong>1800 J</strong> (1840 J before rounding).")}
        </li>
        <li class="problem">
          <p>A 5.0 kg box slides 3.0 m across a level floor while a 12 N friction force acts on it. Find the work done by friction, the normal force, and gravity.</p>
          <div data-widget="answer-check" data-answer="-36" data-label="Friction" data-unit="J"></div>
          <div data-widget="answer-check" data-answer="0" data-label="Normal force" data-unit="J"></div>
          <div data-widget="answer-check" data-answer="0" data-label="Gravity" data-unit="J"></div>
          ${solution("Friction: (12)(3.0)(−1) = <strong>−36 J</strong>. Normal force and gravity: <strong>0</strong> each (perpendicular to the motion).")}
        </li>
        <li class="problem">
          <p>A 2.0 kg ball moves at 6.0 m/s. Find its kinetic energy. What is it if the speed doubles?</p>
          <div data-widget="answer-check" data-answer="36" data-label="K" data-unit="J"></div>
          <div data-widget="answer-check" data-answer="144" data-label="K at double speed" data-unit="J"></div>
          ${solution("K = ½(2.0)(6.0)² = <strong>36 J</strong>. At double the speed: <strong>144 J</strong>, four times as much.")}
        </li>
        <li class="problem">
          <p>A glove stops a 0.15 kg baseball moving at 40 m/s, moving back 0.20 m as it catches it. Find the average force on the ball.</p>
          <div data-widget="answer-check" data-answer="600" data-label="F" data-unit="N"></div>
          ${solution("K = ½(0.15)(40)² = 120 J must be removed: F(0.20) = 120, so <strong>F = 600 N</strong>.")}
        </li>
        <li class="problem">
          <p>How much total work speeds a 1500 kg car from rest to 20 m/s?</p>
          <div data-widget="answer-check" data-answer="300000" data-label="W" data-unit="J"></div>
          ${solution("W = ½(1500)(20)² = <strong>300,000 J</strong> (300 kJ).")}
        </li>
        <li class="problem">
          <p>A spring has k = 400 N/m. How much work does it take to stretch it from 0 to 0.10 m? From 0.10 m to 0.20 m?</p>
          <div data-widget="answer-check" data-answer="2.0" data-label="0 → 0.10 m" data-unit="J"></div>
          <div data-widget="answer-check" data-answer="6.0" data-label="0.10 → 0.20 m" data-unit="J"></div>
          ${solution("0 to 0.10 m: ½(400)(0.10)² = <strong>2.0 J</strong>. 0.10 to 0.20 m: ½(400)(0.20² − 0.10²) = <strong>6.0 J</strong>, three times as much for the same added stretch.")}
        </li>
        <li class="problem">
          <p>An elevator motor lifts an 800 kg car at a constant 2.0 m/s. What power does it deliver?</p>
          <div data-widget="answer-check" data-answer="16000" data-label="P" data-unit="W"></div>
          ${solution("P = Fv = mgv = (800)(9.80)(2.0) = <strong>16,000 W</strong>, about 16 kW or 21 hp.")}
        </li>
        <li class="problem">
          <p>Use the work-energy theorem to find the speed of an object dropped from 12 m, just before it lands.</p>
          <div data-widget="answer-check" data-answer="15" data-tol="0.04" data-label="v" data-unit="m/s"></div>
          ${solution("mgh = ½mv², so v = √(2 × 9.80 × 12) = <strong>15 m/s</strong>.")}
        </li>
      </ol>
      <p class="muted small">Sources: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>; PHYS 206 custom pre-lectures, Chapter 6 topics (Texas A&amp;M).</p>`,
  },
];

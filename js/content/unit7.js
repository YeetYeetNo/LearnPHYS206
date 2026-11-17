// ============================================================
// UNIT 7 LESSONS: Potential Energy and Energy Conservation (Chapter 7)
// Source: "PHYS 206 Unit 7 Study Guide" (Oct 26, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit7Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 7 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 7 of PHYS 206 is Chapter 7 of the course textbook, potential energy and energy conservation (sections 1–5), taught in week 7 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It's the last chapter on <strong>Exam II</strong>, which covers Chapters 4–7.</p>
      <p>Unit 6 showed that work changes kinetic energy. This unit adds <strong>potential energy</strong>: energy stored by an object's position, like a raised book or a stretched spring. Stored energy can turn back into motion, and that leads to one of the most powerful ideas in physics: <strong>conservation of energy</strong>.</p>
      <p>When only gravity and springs do work, the total of kinetic plus potential energy stays constant. That lets you solve problems with curved paths, like roller coasters and swings, that would be nearly impossible with Newton's laws.</p>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Calculate gravitational and elastic potential energy</li>
        <li>Use conservation of mechanical energy to find speeds and heights</li>
        <li>Include friction and other forces with the full energy equation</li>
        <li>Tell conservative forces from nonconservative ones</li>
        <li>Find a force from a potential-energy function</li>
        <li>Read an energy diagram for turning points and equilibrium</li>
      </ul>
      <div class="callout"><strong>The equation to know by heart</strong>, introduced in the "other forces" lesson: $$K_1 + U_1 + W_{\text{other}} = K_2 + U_2$$</div>`,
  },

  {
    id: "gravitational",
    title: "Gravitational potential energy and conservation",
    minutes: 12,
    interactives: ["Slide energy model", "Pendulum energy model"],
    body: String.raw`
      <p>Lift a book onto a shelf, and the work you do isn't lost. It's stored, ready to turn into motion if the book falls. That stored energy is gravitational potential energy.</p>

      <h2>Gravitational potential energy</h2>
      <p>For an object of mass m at height y:</p>
      $$U_{\text{grav}} = mgy$$
      <p>You choose where y = 0. Put it at the floor, the table, or the bottom of the hill, whatever's convenient. Only <strong>changes</strong> in U ever matter physically, so the choice can't affect your answer, as long as you keep it the same for the whole problem.</p>
      <p>The link to work: when an object moves from height y₁ to y₂, gravity does work \(W_{\text{grav}} = U_1 - U_2\). Falling (U decreases) means gravity does positive work; rising means negative work.</p>

      <h2>Conservation of mechanical energy</h2>
      <p>The total <strong>mechanical energy</strong> is E = K + U. If gravity is the only force doing work, it stays constant:</p>
      $$K_1 + U_1 = K_2 + U_2 \quad\Longrightarrow\quad \tfrac{1}{2}mv_1^2 + mgy_1 = \tfrac{1}{2}mv_2^2 + mgy_2$$
      <p>Energy shifts between kinetic and potential, but the total never changes. A falling object loses U and gains exactly as much K.</p>
      <p>Forces that do no work, like a normal force perpendicular to the motion, don't break conservation. That's why this works on curved tracks.</p>

      <div class="example">
        <div class="example-label">Worked example 1: a frictionless slide</div>
        <p>A child starts from rest at the top of a frictionless water slide 20 m high. How fast are they going at the bottom? At a point 8.0 m above the bottom?</p>
        ${solution(String.raw`
          <ol>
            <li>Set y = 0 at the bottom. Start: K₁ = 0, U₁ = mg(20). Mass cancels from every term.</li>
            <li>At the bottom: ½v² = g(20), so v = √(2 × 9.80 × 20) = <strong>19.8 m/s</strong>.</li>
            <li>At 8.0 m: ½v² = g(20 − 8.0), so v = √(2 × 9.80 × 12) = <strong>15.3 m/s</strong>.</li>
          </ol>
          <p>The shape of the slide doesn't matter. A straight drop, a gentle ramp, or a twisting tube all give the same speed at the same height. Only the height lost counts.</p>`)}
      </div>
      <h3>Try it: slide down any shape</h3>
      <p class="muted">Change the slide's shape and slide the rider down. At the same height, the speed is always the same. Then move the zero of height to the top of the slide: every U changes, but the speeds don't.</p>
      <div data-widget="slide-energy"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a pendulum</div>
        <p>A pendulum bob is released from rest 0.50 m above its lowest point. How fast is it moving at the bottom?</p>
        ${solution(String.raw`<p>v = √(2 × 9.80 × 0.50) = <strong>3.1 m/s</strong>. The string's tension never does work, because it's always perpendicular to the bob's motion.</p>`)}
      </div>
      <h3>See it: a swinging pendulum</h3>
      <p class="muted">The energy sloshes between U and K twice per swing, while the total stays flat. The tension arrow is always at 90° to the velocity, so it never does work.</p>
      <div data-widget="pendulum-energy"></div>`,
  },

  {
    id: "elastic",
    title: "Elastic potential energy",
    minutes: 11,
    interactives: ["Block hits a spring", "Spring launches a ball upward"],
    body: String.raw`
      <p>A stretched or compressed spring stores energy too. Unit 6 showed that it takes ½kx² of work to stretch a spring by x; that work is stored as elastic potential energy, ready to be released.</p>

      <h2>The formula</h2>
      $$U_{\text{el}} = \tfrac{1}{2}kx^2$$
      <p>Here x is the stretch or compression measured from the spring's relaxed length. Unlike gravity, you can't choose the zero point: U_el = 0 only when the spring is relaxed. Because x is squared, U_el is the same for a stretch or a compression of the same size, and it's never negative.</p>

      <h2>Conservation with springs</h2>
      <p>When only springs and gravity do work, mechanical energy is still conserved. Just include every type of potential energy:</p>
      $$K_1 + U_{\text{grav},1} + U_{\text{el},1} = K_2 + U_{\text{grav},2} + U_{\text{el},2}$$

      <div class="example">
        <div class="example-label">Worked example 1: a block hits a spring</div>
        <p>A 0.40 kg block slides across a frictionless floor at 3.0 m/s and runs into a horizontal spring with k = 250 N/m. How far does the spring compress? How fast is the block moving when the compression is half that?</p>
        ${solution(String.raw`
          <ol>
            <li>Starting energy, all kinetic: ½(0.40)(3.0)² = 1.8 J. Height doesn't change, so ignore gravity.</li>
            <li>At maximum compression, the block stops for an instant, so all 1.8 J is in the spring:
              $$1.8 = \tfrac{1}{2}(250)x^2 \quad\Rightarrow\quad x = 0.12\ \text{m}$$</li>
            <li>At half compression, x = 0.060 m, the spring holds ½(250)(0.060)² = 0.45 J. The rest is kinetic: ½(0.40)v² = 1.8 − 0.45 = 1.35 J, so <strong>v = 2.6 m/s</strong>.</li>
          </ol>
          <p>At half the compression, the spring holds only a quarter of the energy. That's the x² at work.</p>`)}
      </div>
      <h3>Try it: crash into the spring</h3>
      <p class="muted">Move the block into the spring. The bars show K turning into U_el. Stop at half the maximum compression and compare the two bars.</p>
      <div data-widget="spring-block-energy"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a spring launcher</div>
        <p>A spring with k = 500 N/m is compressed 0.20 m and launches a 0.10 kg ball straight up. Ignoring the short distance the spring itself moves, how high does the ball go?</p>
        ${solution(String.raw`<p>The spring stores ½(500)(0.20)² = 10 J. At the top, all of it has become gravitational energy: (0.10)(9.80)h = 10, so <strong>h = 10 m</strong> above the launch point.</p>`)}
      </div>
      <h3>See it: elastic → kinetic → gravitational</h3>
      <div data-widget="launcher-height"></div>`,
  },

  {
    id: "other-forces",
    title: "When other forces do work",
    minutes: 12,
    interactives: ["Ramp with friction energy ledger", "Where did the energy go?"],
    body: String.raw`
      <p>Real problems usually have friction, a push, or a rope pulling. Those forces add or remove mechanical energy, so K + U is no longer constant. The fix is one extra term.</p>

      <h2>The full energy equation</h2>
      $$K_1 + U_1 + W_{\text{other}} = K_2 + U_2$$
      <p>W_other is the work done by every force <em>except</em> gravity and springs, since their work is already counted inside U. This one equation covers every energy problem in PHYS 206:</p>
      <ul>
        <li><strong>W_other = 0:</strong> mechanical energy is conserved (the previous two lessons).</li>
        <li><strong>W_other &lt; 0:</strong> friction or air drag removes energy, so the object ends with less K + U.</li>
        <li><strong>W_other &gt; 0:</strong> a push, a motor, or a rope adds energy.</li>
      </ul>

      <div class="example">
        <div class="example-label">Worked example 1: a box sliding down a ramp with friction</div>
        <p>A 2.0 kg box starts from rest at the top of a ramp 4.0 m long, tilted at 30°, so its top is 2.0 m high. The coefficient of kinetic friction is 0.20. How fast is it moving at the bottom?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Starting energy:</strong> U₁ = (2.0)(9.80)(2.0) = 39.2 J, with y = 0 at the bottom. K₁ = 0.</li>
            <li><strong>Friction's work:</strong> on a ramp, n = mg cos 30° = 17.0 N (Unit 5), so fₖ = (0.20)(17.0) = 3.4 N. Friction acts against the motion over 4.0 m: W_other = −(3.4)(4.0) = −13.6 J.</li>
            <li><strong>Energy equation:</strong> 0 + 39.2 − 13.6 = ½(2.0)v² + 0, so v² = 25.6 and <strong>v = 5.1 m/s</strong>.</li>
          </ol>
          <p>Without friction it would have reached √(2 × 9.80 × 2.0) = 6.3 m/s. Friction turned 13.6 J of mechanical energy into heat.</p>`)}
      </div>
      <h3>Try it: the energy ledger</h3>
      <p class="muted">Slide the box down. U drains into K, while friction steadily moves energy into heat. The total, including heat, never changes.</p>
      <div data-widget="energy-ledger"></div>

      <div class="example">
        <div class="example-label">Worked example 2: how much energy did friction take?</div>
        <p>A 50 kg skateboarder starts from rest at the top of a 5.0 m ramp and reaches the bottom at 9.0 m/s. How much work did friction do?</p>
        ${solution(String.raw`
          <ol>
            <li>U₁ = (50)(9.80)(5.0) = 2450 J, and K₂ = ½(50)(9.0)² = 2025 J.</li>
            <li>0 + 2450 + W_other = 2025 + 0, so <strong>W_other = −425 J</strong>.</li>
          </ol>`)}
      </div>
      <p>You can work the equation in either direction: use known friction to find a speed, or use known speeds to find the energy friction removed.</p>
      <h3>Try it: work backward</h3>
      <div data-widget="friction-detective"></div>`,
  },

  {
    id: "conservative",
    title: "Conservative vs. nonconservative forces",
    minutes: 9,
    interactives: ["Path-dependence explorer"],
    body: String.raw`
      <p>Why do gravity and springs get a potential energy, while friction doesn't? Because they belong to two different kinds of force.</p>

      <h2>Conservative forces</h2>
      <p>A force is <strong>conservative</strong> if the work it does can always be stored and fully recovered. Gravity and spring forces are conservative. Their work has four equivalent properties:</p>
      <ul>
        <li>It can be written as a difference in potential energy: W = U₁ − U₂.</li>
        <li>It's <strong>reversible</strong>: lift a book and lower it again, and gravity gives back exactly the energy it took.</li>
        <li>It's <strong>path-independent</strong>: it depends only on the start and end points. Carrying a box up the stairs or riding the elevator, gravity does the same work.</li>
        <li><strong>Around any closed loop, the total work is zero.</strong> Go anywhere and return to the start, and gravity's net work is zero.</li>
      </ul>

      <h2>Nonconservative forces</h2>
      <p>Friction and air resistance are <strong>nonconservative</strong>. Their work depends on the path: drag a box 10 m in a straight line, or 30 m along a winding path to the same spot, and friction removes three times as much energy on the longer route. Push the box around a loop back to where it started, and friction has done negative work the whole way, never zero.</p>
      <p>That's why friction has no potential energy. There's no stored energy to recover; it's gone from the mechanical system.</p>
      <h3>Try it: same start, same end, different paths</h3>
      <p class="muted">Pick a force and a path. Gravity's work never depends on the path. Friction's always does, and the round trip makes the difference obvious.</p>
      <div data-widget="path-work"></div>

      <h2>Where the energy goes: internal energy</h2>
      <p>Energy removed by friction isn't destroyed. It becomes <strong>internal energy</strong>, the random motion of atoms that shows up as heat. Rub your hands together, and they warm up. Including it, the full conservation of energy is:</p>
      $$\Delta K + \Delta U + \Delta U_{\text{int}} = 0$$
      <p>For the sliding box in the previous lesson, friction's −13.6 J of work became +13.6 J of internal energy in the box and ramp. Total energy, counting every form, is always conserved. This is the law of conservation of energy, and no experiment has ever broken it.</p>`,
  },

  {
    id: "force-from-u",
    title: "Force from potential energy",
    minutes: 9,
    interactives: ["Force from the slope of U(x)"],
    body: String.raw`
      <p>So far you've gone from force to potential energy. You can also go backward: if you know U(x), you can find the conservative force by differentiating.</p>

      <h2>The relationship</h2>
      $$F_x(x) = -\frac{dU}{dx}$$
      <p>In words: <strong>the force is the negative slope of the potential-energy curve.</strong> The minus sign means the force always pushes toward lower potential energy, "downhill" on a graph of U.</p>

      <h2>Checking it on what you know</h2>
      <ul>
        <li><strong>Spring:</strong> U = ½kx², so F = −d(½kx²)/dx = <strong>−kx</strong>. That's the spring's restoring force from Unit 6.</li>
        <li><strong>Gravity:</strong> U = mgy, so F = −d(mgy)/dy = <strong>−mg</strong>. A force of mg pointing down, the weight.</li>
      </ul>
      <p>Both match, which is a good sign the relationship works.</p>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A particle moving along the x-axis has potential energy \(U(x) = 3x^2 - 2x^3\), with U in joules and x in meters. Find the force on it at x = 2.0 m, and find where the force is zero.</p>
        ${solution(String.raw`
          <ol>
            <li>Differentiate: dU/dx = 6x − 6x², so F(x) = −6x + 6x².</li>
            <li>At x = 2.0 m: F = −6(2.0) + 6(2.0)² = −12 + 24 = <strong>+12 N</strong>, pointing in the +x direction.</li>
            <li>The force is zero where 6x² − 6x = 0, so 6x(x − 1) = 0, giving <strong>x = 0 and x = 1.0 m</strong>.</li>
          </ol>
          <p>Points where the force is zero are equilibrium points: an object placed there at rest would stay there. The next lesson shows how to tell which kind of equilibrium each one is.</p>`)}
      </div>
      <h3>See it: the force is the downhill direction</h3>
      <p class="muted">Slide x along the curve. The tangent's slope is dU/dx, and the force arrow always points downhill, opposite the slope. It starts on the worked example at x = 2.0 m.</p>
      <div data-widget="force-from-u"></div>
      <p>In three dimensions, the same idea applies to each component: \(F_x = -\partial U/\partial x\), \(F_y = -\partial U/\partial y\), and \(F_z = -\partial U/\partial z\).</p>`,
  },

  {
    id: "energy-diagrams",
    title: "Energy diagrams",
    minutes: 11,
    interactives: ["Interactive energy diagram"],
    body: String.raw`
      <p>An energy diagram is a graph of potential energy U(x) against position x, with a horizontal line drawn at the total mechanical energy E. Without solving any equations, it tells you where an object can go, where it turns around, and where it can sit still.</p>

      <h2>Reading the diagram</h2>
      <p>At any position, the kinetic energy is the gap between the total-energy line and the U curve:</p>
      $$K = E - U(x)$$
      <p>Kinetic energy can't be negative, so:</p>
      <ul>
        <li><strong>Allowed regions:</strong> where the U curve is below the E line. The bigger the gap, the faster the object moves there.</li>
        <li><strong>Forbidden regions:</strong> where U would rise above E. The object can never get there.</li>
        <li><strong>Turning points:</strong> where the U curve crosses the E line. There K = 0, so the object stops for an instant and reverses direction.</li>
      </ul>

      <h2>Equilibrium points</h2>
      <p>Where the U curve is flat (dU/dx = 0), the force is zero, so these are equilibrium points. There are two kinds:</p>
      <ul>
        <li><strong>Stable equilibrium: a minimum of U,</strong> the bottom of a valley. Nudge the object, and the force pushes it back toward the bottom, like a marble in a bowl.</li>
        <li><strong>Unstable equilibrium: a maximum of U,</strong> the top of a hill. Nudge the object, and the force pushes it farther away, like a marble balanced on an upside-down bowl.</li>
      </ul>
      <h3>Try it: drag the energy line</h3>
      <p class="muted">Raise or lower E. Red regions are forbidden, the dots mark turning points, and the ball moves fastest where the gap E − U is biggest. On the cubic curve, push E above 1.0 J and watch the ball escape over the hill.</p>
      <div data-widget="energy-diagram"></div>

      <div class="example">
        <div class="example-label">Worked example 1: the spring</div>
        <p>For a mass on a spring with k = 200 N/m and total energy 1.0 J, find the turning points.</p>
        ${solution(String.raw`
          <p>U = ½kx² is a U-shaped curve with its minimum at x = 0, a stable equilibrium. The turning points are where ½kx² = 1.0 J:</p>
          $$x = \pm\sqrt{\frac{2E}{k}} = \pm\sqrt{\frac{2(1.0)}{200}} = \pm 0.10\ \text{m}$$
          <p>The mass oscillates back and forth between −0.10 m and +0.10 m, moving fastest at x = 0.</p>`)}
      </div>
      <div class="example">
        <div class="example-label">Worked example 2: the curve from the previous lesson</div>
        <p>For \(U(x) = 3x^2 - 2x^3\), the equilibrium points were x = 0 and x = 1.0 m. Classify them, and describe the motion for different energies.</p>
        ${solution(String.raw`
          <ul>
            <li><strong>At x = 0,</strong> U = 0, and the curve is a valley: a <strong>stable</strong> equilibrium.</li>
            <li><strong>At x = 1.0 m,</strong> U = 3 − 2 = 1.0 J, and the curve is a hilltop: an <strong>unstable</strong> equilibrium.</li>
          </ul>
          <p>A particle starting near x = 0 with total energy below 1.0 J is trapped in the valley, oscillating back and forth. With more than 1.0 J, it can climb over the hill at x = 1.0 m and escape toward large x, where U keeps dropping.</p>`)}
      </div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 20,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 7 errors are bookkeeping: counting an energy twice, losing a sign, or measuring from the wrong zero. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Double counting gravity.</strong> If you use mgy for U, don't also put gravity's work in W_other.</li>
        <li><strong>Changing the zero of height partway through a problem.</strong> Pick one y = 0 and keep it.</li>
        <li><strong>Measuring a spring's x from the wrong point.</strong> It's always from the relaxed length.</li>
        <li><strong>Giving friction positive work.</strong> Friction's W_other is negative.</li>
        <li><strong>Assuming mechanical energy is always conserved.</strong> Only when W_other = 0.</li>
        <li><strong>Thinking a turning point has zero acceleration.</strong> The velocity is zero there; the force usually isn't.</li>
        <li><strong>Dropping the minus sign in F = −dU/dx.</strong> The force points toward lower U.</li>
      </ul>

      <h2>Key formulas</h2>
      $$U_{\text{grav}} = mgy \qquad U_{\text{el}} = \tfrac{1}{2}kx^2 \qquad K = \tfrac{1}{2}mv^2$$
      $$K_1 + U_1 + W_{\text{other}} = K_2 + U_2$$
      $$\Delta K + \Delta U + \Delta U_{\text{int}} = 0 \qquad F_x = -\frac{dU}{dx}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A 0.50 kg ball is dropped from 10 m. How fast is it moving when it's 4.0 m above the ground?</p>
          <div data-widget="answer-check" data-answer="11" data-tol="0.04" data-label="v" data-unit="m/s"></div>
          ${solution("It drops 6.0 m: v = √(2 × 9.80 × 6.0) = <strong>11 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A frictionless roller coaster car passes the top of a 30 m hill at 5.0 m/s. (a) How fast is it at ground level? (b) Can it make it over a 32 m hill?</p>
          <div data-widget="answer-check" data-answer="25" data-tol="0.03" data-label="(a) v" data-unit="m/s"></div>
          ${solution("(a) v² = 5.0² + 2(9.80)(30) = 613, so <strong>v = 25 m/s</strong>. (b) <strong>No.</strong> Climbing 2.0 m higher needs ½v² ≥ g(2.0), or v² ≥ 39 m²/s², but it only has 25 m²/s² at the first hilltop.")}
        </li>
        <li class="problem">
          <p>How much energy is stored in a spring with k = 1200 N/m compressed 0.050 m?</p>
          <div data-widget="answer-check" data-answer="1.5" data-label="U" data-unit="J"></div>
          ${solution("U = ½(1200)(0.050)² = <strong>1.5 J</strong>.")}
        </li>
        <li class="problem">
          <p>A 0.25 kg block slides at 2.0 m/s into a spring with k = 100 N/m on a frictionless surface. Find the maximum compression.</p>
          <div data-widget="answer-check" data-answer="0.10" data-label="x" data-unit="m"></div>
          ${solution("½(0.25)(2.0)² = 0.50 J = ½(100)x², so <strong>x = 0.10 m</strong>.")}
        </li>
        <li class="problem">
          <p>A 60 kg skier starts from rest and descends 40 m vertically, reaching 25 m/s at the bottom. How much work did friction and air resistance do?</p>
          <div data-widget="answer-check" data-answer="-4770" data-tol="0.02" data-label="W_other" data-unit="J"></div>
          ${solution("U₁ = (60)(9.80)(40) = 23,520 J and K₂ = ½(60)(25)² = 18,750 J, so <strong>W_other = −4800 J</strong> (−4770 J before rounding).")}
        </li>
        <li class="problem">
          <p>A 3.0 kg box slides across a level floor at 6.0 m/s with μₖ = 0.30. Use energy to find how far it slides before stopping.</p>
          <div data-widget="answer-check" data-answer="6.1" data-label="d" data-unit="m"></div>
          ${solution("½(3.0)(6.0)² = 54 J must equal friction's work, (0.30)(3.0)(9.80)d, so <strong>d = 6.1 m</strong>.")}
        </li>
        <li class="problem">
          <p>A particle has U(x) = 4x², in joules and meters. Find the force on it at x = 0.50 m.</p>
          <div data-widget="answer-check" data-answer="-4.0" data-label="F" data-unit="N"></div>
          ${solution("F = −dU/dx = −8x = <strong>−4.0 N</strong> (pointing toward x = 0).")}
        </li>
        <li class="problem">
          <p>Classify each force as conservative or nonconservative: gravity, kinetic friction, a spring force, air resistance.</p>
          ${solution("<strong>Conservative:</strong> gravity and the spring force. <strong>Nonconservative:</strong> kinetic friction and air resistance.", "Show answer")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

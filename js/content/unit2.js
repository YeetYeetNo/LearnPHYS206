// ============================================================
// UNIT 2 LESSONS: Motion Along a Straight Line (Chapter 2)
// Source: "PHYS 206 Unit 2 Study Guide" (Oct 25, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit2Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 2 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 2 of PHYS 206 is Chapter 2 of the course textbook, motion along a straight line (sections 1–6), taught in week 2 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It's your first real physics: describing exactly how things move. Like Chapter 1, it's on Exam I.</p>
      <p>This unit is called <strong>kinematics</strong>, the study of motion without asking what causes it. Forces, the "why" of motion, come in Chapter 4. For now the question is only <em>how</em>: where something is, how fast it's going, and how that speed is changing.</p>
      <p>Everything here happens in one dimension, along a single straight line. That keeps the math simple, and it sets up Chapter 3, where you'll run this same analysis in x and y at the same time.</p>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Tell displacement from distance, and average velocity from average speed</li>
        <li>Find velocity and acceleration from graphs, using slopes and areas</li>
        <li>Choose and solve the right constant-acceleration equation for any problem</li>
        <li>Solve free-fall problems for objects thrown up or dropped</li>
        <li>Use derivatives and integrals to go between position, velocity, and acceleration</li>
      </ul>
      <div class="callout"><strong>The one idea to hold onto:</strong> velocity is how fast position changes, and acceleration is how fast velocity changes. Every lesson in this module is that idea from a different angle.</div>`,
  },

  {
    id: "average-velocity",
    title: "Displacement, time & average velocity",
    minutes: 8,
    interactives: ["1D trip builder"],
    body: String.raw`
      <p>To describe motion on a line, you need a coordinate system: an origin and a positive direction. Usually +x points right. An object's position x is just its coordinate on that line, and it can be negative.</p>

      <h2>Displacement</h2>
      <p>Displacement is the change in position, final minus initial:</p>
      $$\Delta x = x_2 - x_1$$
      <p>The Greek letter Δ (delta) always means "final minus initial." Displacement has a sign: positive means you moved in the +x direction, and negative means you moved in the −x direction.</p>
      <p>Displacement only depends on where you start and stop. Run from x = 0 to x = 50 m and back to x = 20 m, and your displacement is +20 m. Your distance traveled is 50 + 30 = 80 m. Distance is never negative; displacement can be.</p>

      <h2>Average velocity</h2>
      <p>Average velocity is displacement divided by the time it took:</p>
      $$v_{\text{av},x} = \frac{\Delta x}{\Delta t} = \frac{x_2 - x_1}{t_2 - t_1}$$
      <p>Its units are m/s, and its sign matches the displacement. In the running example, if the whole trip took 20 s, the average velocity is +20 m / 20 s = +1.0 m/s.</p>

      <h2>Average velocity vs. average speed</h2>
      <p>Average speed uses total distance instead of displacement. For the same trip it's 80 m / 20 s = 4.0 m/s. The two only match when the object never reverses direction.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A car drives 120 m east in 10 s, then 40 m west in 5 s. Take east as +x. Find the average velocity and the average speed.</p>
        ${solution(String.raw`
          <ol>
            <li>Displacement: Δx = +120 m + (−40 m) = +80 m.</li>
            <li>Total time: Δt = 10 s + 5 s = 15 s.</li>
            <li>Average velocity: 80 m / 15 s = +5.3 m/s (east).</li>
            <li>Average speed: (120 m + 40 m) / 15 s = 10.7 m/s.</li>
          </ol>
          <p>The speed is double the velocity because the car backtracked. That gap is exactly what exam questions on this topic test.</p>`)}
      </div>
      <h3>Try it: build a trip</h3>
      <p class="muted">Set two legs of a trip and press play. Watch average velocity and average speed split apart as soon as the second leg reverses direction.</p>
      <div data-widget="trip-1d"></div>`,
  },

  {
    id: "instantaneous",
    title: "Instantaneous velocity & position-time graphs",
    minutes: 9,
    interactives: ["Tangent vs. secant explorer"],
    body: String.raw`
      <p>Average velocity describes a whole trip. <strong>Instantaneous velocity</strong> is the velocity at one exact moment, like your speedometer reading. It's what "velocity" means from here on.</p>

      <h2>Instantaneous velocity is a derivative</h2>
      <p>Shrink the time interval Δt toward zero, and average velocity becomes instantaneous velocity:</p>
      $$v_x = \lim_{\Delta t \to 0} \frac{\Delta x}{\Delta t} = \frac{dx}{dt}$$
      <p>In words: velocity is the derivative of position with respect to time. If you know x(t), differentiate it to get v(t).</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A cyclist's position is \(x(t) = 3.0t^2 + 2.0t\), with x in meters and t in seconds. Find the velocity at t = 4.0 s.</p>
        ${solution(String.raw`
          <ol>
            <li>Differentiate: \(v(t) = dx/dt = 6.0t + 2.0\).</li>
            <li>Plug in t = 4.0 s: v = 6.0(4.0) + 2.0 = <strong>26 m/s</strong>.</li>
          </ol>`)}
      </div>

      <h2>Reading a position-time (x-t) graph</h2>
      <p>On a graph with time on the horizontal axis and position on the vertical axis:</p>
      <ul>
        <li>The <strong>slope</strong> at any point is the instantaneous velocity. A steeper line means a faster object.</li>
        <li><strong>Upward slope:</strong> moving in the +x direction (v &gt; 0).</li>
        <li><strong>Downward slope:</strong> moving in the −x direction (v &lt; 0).</li>
        <li><strong>Flat (zero slope):</strong> momentarily at rest (v = 0).</li>
        <li><strong>Straight line:</strong> constant velocity.</li>
        <li><strong>Curved line:</strong> changing velocity, so the object is accelerating.</li>
      </ul>
      <p>The slope of a line connecting two points on the graph (a <em>secant</em>) gives the average velocity between those times. The slope of the <em>tangent</em> line at one point gives the instantaneous velocity there.</p>
      <h3>See it: from average to instantaneous</h3>
      <p class="muted">The orange secant gives the average velocity over Δt. Press "Shrink Δt" and watch it turn into the blue tangent line. That limit is exactly what dx/dt means. The model starts on the cyclist example at t = 4.0 s.</p>
      <div data-widget="xt-tangent"></div>
      <div class="callout warn"><strong>A common trap:</strong> the height of the x-t graph is position, not speed. A tall point on the graph means the object is far from the origin, not that it's moving fast. Try the "out and back" motion above: the highest point is where the object is momentarily stopped.</div>`,
  },

  {
    id: "acceleration",
    title: "Acceleration & velocity-time graphs",
    minutes: 11,
    interactives: ["Speeding up or slowing down?", "Linked x-t, v-t, a-t graphs"],
    body: String.raw`
      <p>Acceleration is to velocity what velocity is to position: the rate of change. If your velocity is changing, in size or direction, you're accelerating.</p>

      <h2>Average and instantaneous acceleration</h2>
      $$a_{\text{av},x} = \frac{\Delta v_x}{\Delta t} \qquad a_x = \frac{dv_x}{dt} = \frac{d^2x}{dt^2}$$
      <p>The units are m/s², read "meters per second, per second." An acceleration of 3 m/s² means the velocity changes by 3 m/s every second.</p>
      <p>Continuing the cyclist from the last lesson: \(v(t) = 6.0t + 2.0\), so \(a = dv/dt = 6.0\ \text{m/s}^2\). It's constant, which is why x(t) had a t² term.</p>

      <h2>The sign of acceleration (the big misconception)</h2>
      <p>Negative acceleration does <strong>not</strong> automatically mean slowing down. The sign only tells you which way the velocity is changing.</p>
      <ul>
        <li><strong>Speeding up:</strong> velocity and acceleration have the same sign.</li>
        <li><strong>Slowing down:</strong> velocity and acceleration have opposite signs.</li>
      </ul>
      <p>A car moving in the −x direction (v &lt; 0) with a &lt; 0 is speeding up in the −x direction. A car with v &gt; 0 and a &lt; 0 is braking. Always compare the two signs.</p>
      <h3>Try it: all four sign combinations</h3>
      <p class="muted">Pick the signs of v and a. The dots are snapshots taken at equal time steps. Growing gaps mean speeding up, and shrinking gaps mean slowing down.</p>
      <div data-widget="speed-sign"></div>

      <h2>Reading a velocity-time (v-t) graph</h2>
      <ul>
        <li>The <strong>slope</strong> is the acceleration. A straight line means constant acceleration.</li>
        <li>The <strong>area under the curve</strong> is the displacement. Area below the time axis counts as negative displacement.</li>
        <li><strong>Crossing v = 0</strong> means the object stops and reverses direction at that moment.</li>
        <li><strong>Flat line:</strong> constant velocity, so zero acceleration.</li>
      </ul>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A runner's velocity rises steadily from 0 to 8.0 m/s over 4.0 s. Find the acceleration and the displacement.</p>
        ${solution(String.raw`
          <ol>
            <li>Acceleration = slope: (8.0 − 0) / 4.0 = <strong>2.0 m/s²</strong>.</li>
            <li>Displacement = area under the line, a triangle: ½ × 4.0 s × 8.0 m/s = <strong>16 m</strong>.</li>
          </ol>`)}
      </div>

      <h2>How the three graphs connect</h2>
      <p>Going down the chain, each graph is the slope of the one above it: the slope of x-t gives v-t, and the slope of v-t gives a-t. Going up the chain, each graph is the area under the one below it. That's just derivatives and integrals drawn as pictures.</p>
      <h3>See it: three linked graphs</h3>
      <p class="muted">Move the time slider or press play. The tangent on each graph has the slope of the next graph down, and the shaded area on each graph is the change in the graph above it. It starts on the runner example; try "Turnaround" to see v cross zero.</p>
      <div data-widget="motion-graphs" data-preset="runner"></div>`,
  },

  {
    id: "constant-acceleration",
    title: "Motion with constant acceleration",
    minutes: 14,
    interactives: ["Kinematic equation solver", "Braking distance model"],
    body: String.raw`
      <p>When acceleration is constant, four equations describe everything. This is the core of Unit 2 and the most-tested part of it. The skill isn't memorizing them; it's picking the right one.</p>

      <h2>The four kinematic equations</h2>
      <p>Each equation leaves out exactly one of the five variables: \(x - x_0\) (displacement), \(v_0\), \(v\), \(a\), and \(t\).</p>
      <table class="table eq-table">
        <tbody>
          <tr><td>$$v_x = v_{0x} + a_x t$$</td><td>no displacement</td></tr>
          <tr><td>$$x = x_0 + v_{0x}t + \tfrac{1}{2}a_x t^2$$</td><td>no final velocity</td></tr>
          <tr><td>$$v_x^2 = v_{0x}^2 + 2a_x(x - x_0)$$</td><td>no time</td></tr>
          <tr><td>$$x - x_0 = \tfrac{1}{2}(v_{0x} + v_x)\,t$$</td><td>no acceleration</td></tr>
        </tbody>
      </table>
      <div class="callout warn">These only work when acceleration is constant. If a changes with time, use the calculus method in the integration lesson.</div>

      <h2>Problem-solving strategy</h2>
      <ol>
        <li>Sketch the motion and choose your origin and positive direction.</li>
        <li>List the five variables. Write down the three you know and the one you want.</li>
        <li>Find the missing variable, the one you neither know nor need.</li>
        <li>Pick the equation without that variable, and solve.</li>
        <li>Check the answer: units, signs, and whether the size is reasonable.</li>
      </ol>
      <h3>Try it: the equation picker</h3>
      <p class="muted">Mark three variables as known, one as the one to find, and one as not needed. The solver follows steps 3 and 4 and shows which equation it picked.</p>
      <div data-widget="kinematics-solver"></div>

      <h2>Worked example: braking distance</h2>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A car moving at 25 m/s brakes with a constant deceleration of 5.0 m/s². How far does it travel before stopping, and how long does it take?</p>
        ${solution(String.raw`
          <ol>
            <li>Take the direction of motion as +x. Then v₀ = +25 m/s, v = 0 (it stops), and a = −5.0 m/s². The acceleration is negative because it opposes the velocity.</li>
            <li>For the distance, time is unknown and not needed, so use the no-time equation:
              $$0 = (25)^2 + 2(-5.0)\,\Delta x \quad\Rightarrow\quad \Delta x = \frac{625}{10} = 62.5\ \text{m}$$</li>
            <li>For the time, use v = v₀ + at: 0 = 25 + (−5.0)t, so t = 5.0 s.</li>
            <li>Check: average velocity is (25 + 0)/2 = 12.5 m/s, and 12.5 m/s × 5.0 s = 62.5 m. The two methods agree. The stopping distance rounds to 63 m.</li>
          </ol>`)}
      </div>
      <p>Notice the squared relationship: double the starting speed to 50 m/s, and the stopping distance becomes four times larger, 250 m. That's why speeding is so dangerous.</p>
      <h3>See it: why stopping distance grows with v²</h3>
      <p class="muted">Change the speed and the braking. The faded car shows where you'd stop at double the speed.</p>
      <div data-widget="braking"></div>`,
  },

  {
    id: "free-fall",
    title: "Free fall",
    minutes: 11,
    interactives: ["Free-fall model with live graphs"],
    body: String.raw`
      <p>Free fall is just constant-acceleration motion with a known acceleration. Any object moving under gravity alone, ignoring air resistance, accelerates downward at g = 9.80 m/s². That's true whether it's dropped, thrown up, or thrown down.</p>

      <h2>Setting up free-fall problems</h2>
      <p>Free fall is vertical, so use y instead of x. The usual choice is +y pointing up, which makes the acceleration:</p>
      $$a_y = -g = -9.80\ \text{m/s}^2$$
      <p>Then use the same four kinematic equations from the previous lesson. Note that g itself is always positive (9.80 m/s²). The minus sign comes from your choice of +y as up.</p>

      <h2>Three facts that solve most free-fall problems</h2>
      <ul>
        <li><strong>At the top of its path, the velocity is zero, but the acceleration is still −9.80 m/s².</strong> Gravity never switches off. This is the most common free-fall mistake.</li>
        <li><strong>The motion is symmetric</strong> when the object lands at the same height it was launched from. The time going up equals the time coming down.</li>
        <li><strong>The speed at any height is the same going up and coming down,</strong> just with opposite signs on the velocity.</li>
      </ul>
      <p>Mass doesn't appear anywhere. Without air resistance, a bowling ball and a tennis ball dropped together hit the ground at the same time.</p>
      <h3>See it: a ball in free fall</h3>
      <p class="muted">Press play, or jump to the top. The orange acceleration arrow never changes, even when the blue velocity arrow shrinks to zero.</p>
      <div data-widget="free-fall"></div>

      <h2>Worked example: ball thrown straight up</h2>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>You throw a ball straight up at 15.0 m/s. Take +y up, with y₀ = 0 at your hand. (a) How high does it go? (b) How long does it take to reach the top? (c) When does it return to your hand? (d) How fast is it moving when it gets back?</p>
        ${solution(String.raw`
          <p><strong>a)</strong> At the top, v = 0. Time isn't needed, so use the no-time equation:</p>
          $$0 = (15.0)^2 + 2(-9.80)\,y_{\max} \quad\Rightarrow\quad y_{\max} = \frac{225}{19.6} = 11.5\ \text{m}$$
          <p><strong>b)</strong> Use v = v₀ + at: 0 = 15.0 − 9.80t, so t = 1.53 s.</p>
          <p><strong>c)</strong> By symmetry, the trip down takes as long as the trip up, so the total is 2 × 1.53 = 3.06 s.</p>
          <p><strong>d)</strong> By symmetry, the speed is the same as the launch speed, 15.0 m/s. The velocity is −15.0 m/s because it's now moving down.</p>
          <p>You can check part (c) directly: set y = 0 in \(y = v_0t - \tfrac{1}{2}gt^2\). That gives t(15.0 − 4.90t) = 0, so t = 0 (the launch) or t = 3.06 s. The model above starts on this example.</p>`)}
      </div>`,
  },

  {
    id: "integration",
    title: "Velocity and position by integration",
    minutes: 10,
    interactives: ["Integration grapher"],
    body: String.raw`
      <p>When acceleration changes over time, the four kinematic equations no longer apply. Instead, you work backward with integrals. Differentiating takes you from position to velocity to acceleration; integrating takes you back up.</p>

      <h2>The integration formulas</h2>
      $$v_x(t) = v_{0x} + \int_0^t a_x\,dt \qquad x(t) = x_0 + \int_0^t v_x\,dt$$
      <p>In words: change in velocity is the area under the a-t graph, and change in position is the area under the v-t graph. The starting values v₀ and x₀ are the integration constants.</p>

      <h2>Where the constant-acceleration equations come from</h2>
      <p>If a is constant, the first integral is easy: \(v = v_0 + at\). Integrate that again, and you get \(x = x_0 + v_0t + \tfrac{1}{2}at^2\). So the kinematic equations aren't separate rules to memorize. They're what these integrals give you when a doesn't change.</p>

      <h2>Worked example: changing acceleration</h2>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A rocket sled starts from rest at x = 0. Its acceleration increases with time as \(a(t) = (2.0\ \text{m/s}^3)\,t\). Find its velocity and position at t = 3.0 s.</p>
        ${solution(String.raw`
          <ol>
            <li>Velocity: integrate the acceleration, starting from v₀ = 0.
              $$v(t) = \int_0^t 2.0\,t\,dt = 1.0\,t^2 \quad\Rightarrow\quad v(3.0) = 9.0\ \text{m/s}$$</li>
            <li>Position: integrate the velocity, starting from x₀ = 0.
              $$x(t) = \int_0^t 1.0\,t^2\,dt = \frac{t^3}{3} \quad\Rightarrow\quad x(3.0) = 9.0\ \text{m}$$</li>
            <li>Check by differentiating back: d(t³/3)/dt = t², and d(t²)/dt = 2t. Both match.</li>
          </ol>
          <p>If you had wrongly used x = ½at² with the final acceleration of 6.0 m/s², you'd get 27 m, three times too big. That's why it matters to check whether a is constant before choosing a method.</p>`)}
      </div>
      <h3>See it: areas build each graph</h3>
      <p class="muted">The shaded area under a-t is the change in velocity so far, and the shaded area under v-t is the change in position. It starts on the rocket sled; slide time to 3.0 s and compare with the worked example, including the wrong ½at² answer.</p>
      <div data-widget="motion-graphs" data-mode="integrate"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 18,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 2 errors are sign errors or picking the wrong equation, not hard physics. Review the list below, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Assuming velocity is zero means acceleration is zero.</strong> At the top of a throw, v = 0 but a = −9.80 m/s².</li>
        <li><strong>Treating negative acceleration as "slowing down."</strong> Compare the signs of v and a instead.</li>
        <li><strong>Mixing sign conventions mid-problem.</strong> Choose +x (or +y) once and stick with it.</li>
        <li><strong>Using the kinematic equations when a isn't constant.</strong> Integrate instead.</li>
        <li><strong>Confusing</strong> displacement with distance, or average velocity with average speed.</li>
        <li><strong>Reading an x-t graph's height as speed.</strong> Speed is the slope, not the height.</li>
        <li><strong>Forgetting area below the axis is negative</strong> on a v-t graph.</li>
      </ul>

      <h2>Key formulas</h2>
      $$v_x = \frac{dx}{dt} \qquad a_x = \frac{dv_x}{dt}$$
      $$v_x = v_{0x} + a_x t \qquad x = x_0 + v_{0x}t + \tfrac{1}{2}a_x t^2$$
      $$v_x^2 = v_{0x}^2 + 2a_x(x - x_0) \qquad x - x_0 = \tfrac{1}{2}(v_{0x} + v_x)\,t$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A jogger runs one lap of a 400 m track in 80 s, ending where they started. Find the average velocity and the average speed.</p>
          <div data-widget="answer-check" data-answer="0" data-label="Average velocity" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="5.0" data-label="Average speed" data-unit="m/s"></div>
          ${solution("Average velocity = <strong>0</strong> (zero displacement). Average speed = 400 m / 80 s = <strong>5.0 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>An object's position is x(t) = 4.0t³ − 2.0t, in meters and seconds. Find its velocity and acceleration at t = 2.0 s.</p>
          <div data-widget="answer-check" data-answer="46" data-label="v" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="48" data-label="a" data-unit="m/s²"></div>
          ${solution("v = 12t² − 2.0 = <strong>46 m/s</strong>. a = 24t = <strong>48 m/s²</strong>.")}
        </li>
        <li class="problem">
          <p>A car starts from rest and accelerates at 3.0 m/s² for 8.0 s. Find its final speed and the distance covered.</p>
          <div data-widget="answer-check" data-answer="24" data-label="Final speed" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="96" data-label="Distance" data-unit="m"></div>
          ${solution("v = 0 + 3.0 × 8.0 = <strong>24 m/s</strong>. x = ½ × 3.0 × 8.0² = <strong>96 m</strong>.")}
        </li>
        <li class="problem">
          <p>A plane needs 60 m/s to take off from a 1200 m runway, starting from rest. What constant acceleration does it need?</p>
          <div data-widget="answer-check" data-answer="1.5" data-label="a" data-unit="m/s²"></div>
          ${solution("Using v² = v₀² + 2aΔx: a = 60² / (2 × 1200) = <strong>1.5 m/s²</strong>.")}
        </li>
        <li class="problem">
          <p>A stone dropped from a bridge hits the water 2.5 s later. How high is the bridge, and how fast is the stone moving at impact?</p>
          <div data-widget="answer-check" data-answer="31" data-label="Height" data-unit="m"></div>
          <div data-widget="answer-check" data-answer="24.5" data-label="Impact speed" data-unit="m/s"></div>
          ${solution("Height = ½ × 9.80 × 2.5² = <strong>31 m</strong>. Speed = 9.80 × 2.5 = <strong>24.5 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>Is the object speeding up or slowing down? (a) v = +10 m/s, a = −4 m/s². (b) v = −6 m/s, a = −2 m/s².</p>
          ${solution("(a) <strong>Slowing down</strong> (opposite signs). (b) <strong>Speeding up</strong> (same signs, moving faster in −x). You can check both in the sign model in the acceleration lesson.", "Show answer")}
        </li>
        <li class="problem">
          <p>An object has a(t) = (6.0 m/s³)t, with v₀ = 2.0 m/s and x₀ = 0. Find v and x at t = 2.0 s.</p>
          <div data-widget="answer-check" data-answer="14" data-label="v" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="12" data-label="x" data-unit="m"></div>
          ${solution("v(t) = 2.0 + 3.0t², so v = <strong>14 m/s</strong>. x(t) = 2.0t + 1.0t³, so x = <strong>12 m</strong>.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

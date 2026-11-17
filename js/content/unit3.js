// ============================================================
// UNIT 3 LESSONS: Motion in Two or Three Dimensions (Chapter 3)
// Source: "PHYS 206 Unit 3 Study Guide" (Oct 26, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit3Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 3 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 3 of PHYS 206 is Chapter 3 of the course textbook, motion in two or three dimensions (sections 1–5), taught in week 3 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It's the last chapter on Exam I, which covers Chapters 1–3.</p>
      <p>This unit combines the two before it. Unit 1 gave you vectors, and Unit 2 gave you kinematics on a line. Now you describe motion that curves through a plane, like a thrown ball, a car on a curve, or a plane flying in a crosswind.</p>
      <div class="callout"><strong>The big idea:</strong> motion in x and motion in y are independent. You can split any 2D problem into two separate 1D problems, solve each with Unit 2's equations, and link them through time.</div>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Write position, velocity, and acceleration as vectors with components</li>
        <li>Explain how acceleration can change an object's speed, its direction, or both</li>
        <li>Solve projectile problems: horizontal launches, angled launches, range, and maximum height</li>
        <li>Find centripetal acceleration for circular motion</li>
        <li>Combine velocities measured from different reference frames</li>
      </ul>
      <div class="callout warn"><strong>Exam tip:</strong> projectile motion is usually the biggest single topic from this chapter on the exam, so give it the most practice time.</div>`,
  },

  {
    id: "vectors-of-motion",
    title: "Position, velocity & acceleration as vectors",
    minutes: 9,
    interactives: ["Path vector explorer"],
    body: String.raw`
      <p>In one dimension, a sign was enough to give direction. In two or three dimensions, you need full vectors. The good news: each definition from Unit 2 carries over, just applied to every component at once.</p>

      <h2>Position vector</h2>
      <p>The position vector <strong>r</strong> points from the origin to the object:</p>
      $$\vec{r} = x\,\hat{\imath} + y\,\hat{\jmath} + z\,\hat{k}$$
      <p>Displacement is the change in position, \(\Delta\vec{r} = \vec{r}_2 - \vec{r}_1\), the arrow from the starting point to the ending point.</p>

      <h2>Velocity vector</h2>
      <p>Average velocity is Δ<strong>r</strong>/Δt. Instantaneous velocity is the derivative, taken one component at a time:</p>
      $$\vec{v} = \frac{d\vec{r}}{dt} = \frac{dx}{dt}\,\hat{\imath} + \frac{dy}{dt}\,\hat{\jmath} + \frac{dz}{dt}\,\hat{k}$$
      <p>The velocity vector is always <strong>tangent to the path</strong>, pointing the way the object is moving at that instant. Its magnitude is the speed.</p>

      <h2>Acceleration vector</h2>
      $$\vec{a} = \frac{d\vec{v}}{dt} = \frac{dv_x}{dt}\,\hat{\imath} + \frac{dv_y}{dt}\,\hat{\jmath} + \frac{dv_z}{dt}\,\hat{k}$$
      <p>Unlike velocity, acceleration does <strong>not</strong> have to point along the path. For anything moving on a curve, it points at least partly toward the inside of the curve. The next lesson explains why.</p>

      <h3>See it: vectors on a moving path</h3>
      <p class="muted">Slide time along the path. The blue <strong>v</strong> always lies along the path, while the orange <strong>a</strong> points toward the inside of the curve. It starts on the drone example at t = 1.0 s.</p>
      <div data-widget="path-vectors"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A drone's position is \(\vec{r}(t) = (3.0t)\,\hat{\imath} + (2.0t^2)\,\hat{\jmath}\), in meters and seconds. Find its velocity, speed, and acceleration at t = 1.0 s.</p>
        ${solution(String.raw`
          <ol>
            <li>Velocity: differentiate each component. \(\vec{v}(t) = 3.0\,\hat{\imath} + 4.0t\,\hat{\jmath}\), so at t = 1.0 s, <strong>v = 3.0 î + 4.0 ĵ m/s</strong>.</li>
            <li>Speed: |v| = √(3.0² + 4.0²) = <strong>5.0 m/s</strong>, at tan⁻¹(4.0/3.0) = <strong>53°</strong> above the +x axis.</li>
            <li>Acceleration: differentiate again. <strong>a = 4.0 ĵ m/s²</strong>, constant and pointing straight up.</li>
          </ol>
          <p>Notice the x-velocity stays at 3.0 m/s while the y-velocity grows. The acceleration only affects the y-motion, which is the independence idea at work.</p>`)}
      </div>`,
  },

  {
    id: "speed-vs-direction",
    title: "Changing speed vs. changing direction",
    minutes: 8,
    interactives: ["Acceleration splitter"],
    body: String.raw`
      <p>In two dimensions, acceleration can do two different jobs. It can change how fast you're going, which way you're going, or both. Splitting acceleration into two components relative to the velocity makes this clear.</p>

      <h2>The two components of acceleration</h2>
      <ul>
        <li><strong>Parallel component (a<sub>∥</sub>):</strong> points along the velocity, or directly against it. It changes the <strong>speed</strong>.</li>
        <li><strong>Perpendicular component (a<sub>⊥</sub>):</strong> points sideways to the velocity. It changes the <strong>direction</strong> of motion.</li>
      </ul>

      <h2>Reading the angle between a and v</h2>
      <table class="table">
        <thead><tr><th>Angle between a and v</th><th>What happens</th></tr></thead>
        <tbody>
          <tr><td>Less than 90°</td><td>Speeding up and turning</td></tr>
          <tr><td>Exactly 90°</td><td>Constant speed, only turning</td></tr>
          <tr><td>More than 90°</td><td>Slowing down and turning</td></tr>
          <tr><td>0° or 180°</td><td>Straight-line motion, speeding up or slowing down</td></tr>
        </tbody>
      </table>
      <h3>Try it: split the acceleration</h3>
      <p class="muted">Drag the tips of v and a. The model splits a into its parallel and perpendicular parts, reads the angle off the table above, and sketches the path the object starts to follow.</p>
      <div data-widget="accel-split"></div>

      <h2>Why this matters</h2>
      <div class="callout"><strong>The key surprise:</strong> an object moving at constant speed can still be accelerating. A car taking a curve at a steady 30 mph is accelerating, because its direction keeps changing. That acceleration points toward the inside of the curve.</div>
      <p>This idea sets up two later lessons. In projectile motion, gravity points down while the velocity tilts, so the ball both speeds up or slows down and curves. In uniform circular motion, the acceleration is purely perpendicular, so only the direction changes.</p>`,
  },

  {
    id: "projectile-setup",
    title: "Projectile motion: the setup",
    minutes: 9,
    interactives: ["Drop vs. launch side-by-side"],
    body: String.raw`
      <p>A projectile is any object launched into the air and then left to move under gravity alone: a thrown ball, a kicked football, water from a hose. Ignoring air resistance, every projectile follows the same rules.</p>

      <h2>The core idea: two independent motions</h2>
      <ul>
        <li><strong>Horizontal (x):</strong> no acceleration. The x-velocity stays constant the whole flight.</li>
        <li><strong>Vertical (y):</strong> constant acceleration \(a_y = -g = -9.80\ \text{m/s}^2\). This is exactly Unit 2's free fall.</li>
      </ul>
      <p>The two motions don't affect each other. The only thing they share is <strong>time</strong>. A bullet fired horizontally and a bullet dropped from the same height hit the ground at the same moment.</p>
      <h3>See it: dropped vs. launched</h3>
      <p class="muted">Both balls leave the same height at the same instant. The snapshots are taken at equal time steps: the two balls are always at the same height, and the launched ball's horizontal spacing never changes.</p>
      <div data-widget="projectile-split"></div>

      <h2>Splitting the launch velocity</h2>
      <p>If the projectile launches at speed v₀ and angle α₀ above horizontal, use Unit 1's components:</p>
      $$v_{0x} = v_0\cos\alpha_0 \qquad v_{0y} = v_0\sin\alpha_0$$

      <h2>The projectile equations</h2>
      <p>With the origin at the launch point and +y up:</p>
      $$x = (v_0\cos\alpha_0)\,t \qquad v_x = v_0\cos\alpha_0$$
      $$y = (v_0\sin\alpha_0)\,t - \tfrac{1}{2}g t^2 \qquad v_y = v_0\sin\alpha_0 - g t$$
      <p>The vertical motion also works with any of Unit 2's equations, including \(v_y^2 = v_{0y}^2 - 2g(y - y_0)\).</p>

      <h2>Key facts</h2>
      <ul>
        <li><strong>At the highest point, vᵧ = 0, but vₓ is not zero.</strong> The projectile is still moving sideways. Its speed at the top is v₀ cos α₀, not zero.</li>
        <li><strong>The acceleration is −g at every point,</strong> including the top.</li>
        <li><strong>The path is a parabola.</strong></li>
      </ul>

      <h2>Strategy</h2>
      <ol>
        <li>Draw the trajectory, and set the origin and axes.</li>
        <li>Split the launch velocity into components.</li>
        <li>Write separate known/unknown lists for x and for y.</li>
        <li><strong>Usually, find the time first</strong> from the vertical motion, since that's where gravity acts.</li>
        <li>Use that time in the horizontal equation to find the distance.</li>
      </ol>`,
  },

  {
    id: "projectile-examples",
    title: "Projectile motion: worked examples",
    minutes: 14,
    interactives: ["Projectile lab", "Range vs. launch angle"],
    body: String.raw`
      <p>Almost every projectile problem is one of two types: a horizontal launch from a height, or an angled launch. Work through both examples step by step before reading the solutions.</p>

      <div class="example">
        <div class="example-label">Example 1: horizontal launch</div>
        <p>A ball rolls off a 1.25 m tall table at 3.0 m/s. How far from the table does it land, and how fast is it going when it hits the floor?</p>
        ${solution(String.raw`
          <p>Put the origin on the floor directly below the table edge, with +y up. Because the launch is horizontal, v₀ₓ = 3.0 m/s and v₀ᵧ = 0.</p>
          <ol>
            <li><strong>Time from the vertical motion.</strong> The ball falls 1.25 m starting with zero vertical velocity:
              $$1.25 = \tfrac{1}{2}(9.80)\,t^2 \quad\Rightarrow\quad t = \sqrt{\frac{2(1.25)}{9.80}} = 0.505\ \text{s}$$</li>
            <li><strong>Distance from the horizontal motion:</strong> x = (3.0)(0.505) = <strong>1.5 m</strong>.</li>
            <li><strong>Velocity at impact:</strong> vₓ is still 3.0 m/s, and vᵧ = −9.80 × 0.505 = −4.95 m/s.</li>
            <li><strong>Speed:</strong> √(3.0² + 4.95²) = <strong>5.8 m/s</strong>, at tan⁻¹(4.95/3.0) = <strong>59° below horizontal</strong>.</li>
          </ol>
          <p>The fall time depends only on the height. Roll the ball off twice as fast, and it still takes 0.505 s to land; it just lands twice as far away.</p>`)}
      </div>

      <div class="example">
        <div class="example-label">Example 2: angled launch</div>
        <p>A soccer ball is kicked from level ground at 20.0 m/s, 37.0° above horizontal. Find its maximum height, time in the air, and range.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Components:</strong> v₀ₓ = 20.0 cos 37.0° = 16.0 m/s, and v₀ᵧ = 20.0 sin 37.0° = 12.0 m/s.</li>
            <li><strong>Maximum height:</strong> at the top, vᵧ = 0.
              $$0 = (12.0)^2 - 2(9.80)\,h \quad\Rightarrow\quad h = \frac{144}{19.6} = 7.35\ \text{m}$$</li>
            <li><strong>Time to the top:</strong> 0 = 12.0 − 9.80t, so t = 1.22 s. Landing at the same height, the total flight is twice that: <strong>2.45 s</strong>.</li>
            <li><strong>Range:</strong> x = v₀ₓ × total time = 16.0 × 2.45 = <strong>39.2 m</strong>.</li>
          </ol>`)}
      </div>

      <h3>Try it: projectile lab</h3>
      <p class="muted">Load either example, then scrub through the flight. The table splits every quantity into its x and y parts. Notice that at the top, vᵧ = 0 but the speed is not zero. The lab uses exact sines, so Example 2 shows 7.39 m and 39.2 m; the worked example rounds v₀ᵧ to 12.0 m/s, which gives 7.35 m.</p>
      <div data-widget="projectile-lab"></div>

      <h2>The range formula (level ground only)</h2>
      <p>When a projectile lands at the same height it started from, the range is:</p>
      $$R = \frac{v_0^2 \sin 2\alpha_0}{g}$$
      <p>Check it on Example 2: (20.0)² sin 74° / 9.80 = 39.2 m, a match. Two takeaways: the maximum range comes at 45°, and complementary angles like 30° and 60° give the same range.</p>
      <h3>See it: complementary angles</h3>
      <p class="muted">The model draws a launch at α and at 90° − α. They land in the same spot. The curve underneath shows the range for every angle, peaking at 45°.</p>
      <div data-widget="range-angle"></div>
      <div class="callout warn">Don't use the range formula if the launch and landing heights differ, as in Example 1. Solve with time instead.</div>`,
  },

  {
    id: "circular-motion",
    title: "Motion in a circle",
    minutes: 10,
    interactives: ["Circular motion model"],
    body: String.raw`
      <p>An object moving in a circle is always accelerating, even at constant speed, because its direction keeps changing. This acceleration points toward the center of the circle and is called <strong>centripetal</strong> ("center-seeking") acceleration.</p>

      <h2>Uniform circular motion</h2>
      <p>In uniform circular motion, the speed is constant. The acceleration is purely perpendicular to the velocity (the 90° case from the earlier table), so it only changes the direction. Its magnitude is:</p>
      $$a_{\text{rad}} = \frac{v^2}{R}$$
      <p>Here R is the radius of the circle, and the acceleration always points toward the center. Faster motion or a tighter circle both mean a larger acceleration.</p>

      <h2>Using the period</h2>
      <p>The period T is the time for one full trip around the circle. In one period the object travels one circumference, so v = 2πR/T. Substituting into the formula above:</p>
      $$a_{\text{rad}} = \frac{4\pi^2 R}{T^2}$$
      <p>Use this version when a problem gives you the time per revolution instead of the speed.</p>

      <h3>See it: circular motion</h3>
      <p class="muted">The blue velocity is always tangent and the orange acceleration always points to the center. Add tangential acceleration to see nonuniform motion, where the total acceleration tilts forward.</p>
      <div data-widget="circular"></div>

      <h2>Worked examples</h2>
      <div class="example">
        <div class="example-label">A car on a curve</div>
        <p>A car takes a curve of radius 50 m at 20 m/s. Find its centripetal acceleration.</p>
        ${solution("a = (20)²/50 = <strong>8.0 m/s²</strong> toward the center of the curve. That's almost as large as g, which is why you feel pushed sideways.")}
      </div>
      <div class="example">
        <div class="example-label">A Ferris wheel</div>
        <p>A rider sits 10 m from the center of a wheel that turns once every 20 s. Find the rider's speed and acceleration.</p>
        ${solution(String.raw`
          <ol>
            <li>Speed: v = 2π(10)/20 = <strong>3.1 m/s</strong>.</li>
            <li>Acceleration: a = 4π²(10)/(20)² = <strong>0.99 m/s²</strong>, toward the center.</li>
          </ol>`)}
      </div>

      <h2>Nonuniform circular motion</h2>
      <p>If the speed changes while moving in a circle, the acceleration has two parts:</p>
      <ul>
        <li><strong>Radial part:</strong> v²/R toward the center. It changes the direction, just as before.</li>
        <li><strong>Tangential part:</strong> d|v|/dt along the path. It changes the speed.</li>
      </ul>
      <p>The total acceleration is the vector sum of the two. A car speeding up around a curve has both: one part pointing inward and one pointing forward.</p>`,
  },

  {
    id: "relative-velocity",
    title: "Relative velocity",
    minutes: 11,
    interactives: ["Train reference frames", "Crosswind vector model"],
    body: String.raw`
      <p>Velocity always depends on who's measuring it. A passenger walking down a train aisle at 1 m/s is moving at 1 m/s to someone on the train, but at about 31 m/s to someone standing beside the tracks. Each observer's point of view is called a <strong>reference frame</strong>.</p>

      <h2>The subscript rule</h2>
      <p>Write v(P/A) for "the velocity of P relative to A." Velocities in different frames combine like this:</p>
      $$\vec{v}_{P/A} = \vec{v}_{P/B} + \vec{v}_{B/A}$$
      <p>The trick for remembering it: the inner letters (B) match and "cancel" like a chain, leaving P/A. Also, reversing the order flips the sign: v(A/B) = −v(B/A).</p>

      <h2>One dimension</h2>
      <p>The train passenger: the passenger moves at +1.0 m/s relative to the train, and the train moves at +30 m/s relative to the ground. So the passenger moves at 1.0 + 30 = <strong>31 m/s</strong> relative to the ground. Walking toward the back instead, it's −1.0 + 30 = <strong>29 m/s</strong>.</p>
      <div data-widget="train-frames"></div>

      <h2>Two dimensions: the crosswind airplane</h2>
      <p>In 2D, the same rule applies, but you add the velocities as vectors, using components.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A plane flies with its nose pointed due north at 240 km/h relative to the air. A wind blows due east at 100 km/h relative to the ground. Find the plane's velocity relative to the ground.</p>
        ${solution(String.raw`
          <ol>
            <li>Set up the chain: v(plane/ground) = v(plane/air) + v(air/ground).</li>
            <li>The two vectors are perpendicular, so the magnitude is √(240² + 100²) = <strong>260 km/h</strong>.</li>
            <li>The direction is tan⁻¹(100/240) = <strong>22.6° east of north</strong>.</li>
          </ol>
          <p><strong>Follow-up:</strong> to actually travel due north, the pilot must point the plane into the wind. The eastward wind has to be canceled by the plane's westward component, so sin θ = 100/240, giving a heading of <strong>24.6° west of north</strong>. The ground speed drops to √(240² − 100²) = <strong>218 km/h</strong>.</p>`)}
      </div>
      <h3>Try it: fly in a crosswind</h3>
      <p class="muted">Drag the tips to set the plane's velocity through the air (blue) and the wind (red). The plane's nose points along blue, but it actually travels along green, the tail-to-head sum of the other two. Press "Head due north" to have the model solve the follow-up.</p>
      <div data-widget="relative-velocity"></div>
      <p>River-crossing boat problems work exactly the same way, with the water's current playing the role of the wind. In the model, read "air" as "water."</p>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 18,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 3 points are lost by mixing up x and y quantities or misreading what happens at the top of a trajectory. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Saying the speed is zero at the top of a projectile's path.</strong> Only vᵧ is zero; vₓ keeps going.</li>
        <li><strong>Putting gravity in the horizontal equation.</strong> The x-acceleration of a projectile is zero.</li>
        <li><strong>Forgetting to split the launch velocity</strong> into v₀ cos α and v₀ sin α.</li>
        <li><strong>Using the range formula when launch and landing heights differ.</strong> Solve with time instead.</li>
        <li><strong>Thinking constant speed means no acceleration.</strong> Circular motion always has v²/R toward the center.</li>
        <li><strong>Pointing centripetal acceleration outward.</strong> It always points toward the center.</li>
        <li><strong>Adding relative velocities as plain numbers</strong> when they point in different directions. Add them as vectors.</li>
      </ul>

      <h2>Key formulas</h2>
      $$x = (v_0\cos\alpha_0)\,t \qquad y = (v_0\sin\alpha_0)\,t - \tfrac{1}{2}g t^2$$
      $$v_x = v_0\cos\alpha_0 \qquad v_y = v_0\sin\alpha_0 - g t \qquad R = \frac{v_0^2\sin 2\alpha_0}{g}$$
      $$a_{\text{rad}} = \frac{v^2}{R} = \frac{4\pi^2 R}{T^2} \qquad \vec{v}_{P/A} = \vec{v}_{P/B} + \vec{v}_{B/A}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>An object's position is \(\vec{r}(t) = (2.0t^2)\,\hat{\imath} + (5.0t)\,\hat{\jmath}\), in meters and seconds. Find its velocity, speed, and acceleration at t = 2.0 s.</p>
          <div data-widget="answer-check" data-answer="9.4" data-label="Speed" data-unit="m/s"></div>
          ${solution("v = 4.0t î + 5.0 ĵ, so at t = 2.0 s, <strong>v = 8.0 î + 5.0 ĵ m/s</strong>. Speed = √(8.0² + 5.0²) = <strong>9.4 m/s</strong>. Acceleration = <strong>4.0 î m/s²</strong>, constant.")}
        </li>
        <li class="problem">
          <p>A ball is thrown horizontally at 12 m/s from the top of a 20 m cliff. How long is it in the air, and how far from the base of the cliff does it land?</p>
          <div data-widget="answer-check" data-answer="2.0" data-label="Time" data-unit="s"></div>
          <div data-widget="answer-check" data-answer="24" data-label="Distance" data-unit="m"></div>
          ${solution("Time: 20 = ½(9.80)t², so t = <strong>2.0 s</strong> (2.02 s). Distance: 12 × 2.02 = <strong>24 m</strong>.")}
        </li>
        <li class="problem">
          <p>A projectile is launched from level ground at 30 m/s, 60° above horizontal. Find its maximum height and range.</p>
          <div data-widget="answer-check" data-answer="34" data-label="Max height" data-unit="m"></div>
          <div data-widget="answer-check" data-answer="80" data-label="Range" data-unit="m"></div>
          ${solution("v₀ᵧ = 30 sin 60° = 26.0 m/s, so h = 26.0² / (2 × 9.80) = <strong>34 m</strong>. Range = 30² sin 120° / 9.80 = <strong>80 m</strong>.")}
        </li>
        <li class="problem">
          <p>In problem 3, what is the projectile's speed at its highest point? What other launch angle gives the same range?</p>
          <div data-widget="answer-check" data-answer="15" data-label="Speed at top" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="30" data-label="Other angle" data-unit="°"></div>
          ${solution("Speed at the top = v₀ₓ = 30 cos 60° = <strong>15 m/s</strong>. The complementary angle, <strong>30°</strong>, gives the same range.")}
        </li>
        <li class="problem">
          <p>A car takes an 80 m radius curve at 25 m/s. Find its centripetal acceleration.</p>
          <div data-widget="answer-check" data-answer="7.8" data-label="a" data-unit="m/s²"></div>
          ${solution("a = 25² / 80 = <strong>7.8 m/s²</strong>, toward the center of the curve.")}
        </li>
        <li class="problem">
          <p>A ball on a string moves in a 0.50 m radius circle, completing one revolution every 0.25 s. Find its centripetal acceleration.</p>
          <div data-widget="answer-check" data-answer="316" data-label="a" data-unit="m/s²"></div>
          ${solution("a = 4π²(0.50) / (0.25)² = <strong>316 m/s²</strong>, toward the center.")}
        </li>
        <li class="problem">
          <p>A boat points straight across a river at 4.0 m/s relative to the water. The current flows at 3.0 m/s. Find the boat's velocity relative to the shore.</p>
          <div data-widget="answer-check" data-answer="5.0" data-label="Magnitude" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="37" data-label="Angle downstream" data-unit="°"></div>
          ${solution("Magnitude: √(4.0² + 3.0²) = <strong>5.0 m/s</strong>. Direction: tan⁻¹(3.0/4.0) = <strong>37° downstream</strong> from straight across.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

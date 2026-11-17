// ============================================================
// UNIT 10 LESSONS: Dynamics of Rotational Motion (Chapter 10)
// Source: "PHYS 206 Unit 10 Study Guide" (Nov 4, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit10Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 10 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 10 of PHYS 206 is Chapter 10 of the course textbook, dynamics of rotational motion. It's part of <strong>Exam III</strong>, which covers Chapters 8–11 on the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>.</p>
      <div class="callout warn">The department's own pre-lecture notes flag Chapter 10 as one of the tougher chapters, so budget extra practice time.</div>
      <p>Unit 9 described rotation. This unit explains what causes it, the same jump Unit 4 made after Units 2 and 3. In linear motion, forces cause acceleration. In rotation, <strong>torques</strong> cause angular acceleration.</p>
      <p>The parallels continue from Unit 9:</p>
      <table class="table" style="max-width:none">
        <thead><tr><th>Linear</th><th>Rotational</th></tr></thead>
        <tbody>
          <tr><td>Force F</td><td>Torque τ</td></tr>
          <tr><td>ΣF = ma</td><td>Στ = Iα</td></tr>
          <tr><td>Work F·s</td><td>Work τΔθ</td></tr>
          <tr><td>Power Fv</td><td>Power τω</td></tr>
          <tr><td>Momentum p = mv</td><td>Angular momentum L = Iω</td></tr>
          <tr><td>Momentum conserved when ΣF = 0</td><td>Angular momentum conserved when Στ = 0</td></tr>
        </tbody>
      </table>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Calculate torque from a force and its lever arm</li>
        <li>Use Στ = Iα to solve pulley and rotation problems</li>
        <li>Analyze objects that roll without slipping, using forces or energy</li>
        <li>Calculate rotational work and power</li>
        <li>Find angular momentum and use its conservation, as in a spinning skater pulling in her arms</li>
      </ul>
      <div class="callout"><strong>The hardest problems</strong> in this unit combine linear and rotational motion, like a block hanging from a heavy pulley. The trick is always the same: write ΣF = ma for the things that slide, Στ = Iα for the things that spin, and link them with a = Rα.</div>`,
  },

  {
    id: "torque",
    title: "Torque",
    minutes: 11,
    interactives: ["Wrench torque model", "Net torque on a wheel"],
    body: String.raw`
      <p>Torque is a force's ability to make something rotate. Push on a door right next to the hinges, and it barely moves. Push at the handle with the same force, and it swings open easily. Same force, different torque.</p>

      <h2>What torque depends on</h2>
      <p>Three things decide how much a force twists an object:</p>
      <ul>
        <li><strong>How big the force is.</strong></li>
        <li><strong>How far from the axis it acts</strong> (r, the distance from the axis to where the force is applied).</li>
        <li><strong>Its direction.</strong> Only the part of the force perpendicular to r causes rotation. Pushing straight toward or away from the hinge does nothing.</li>
      </ul>

      <h2>The formula</h2>
      $$\tau = rF\sin\phi = F\ell$$
      <p>Here φ is the angle between <strong>r</strong> and <strong>F</strong>, and ℓ = r sin φ is the <strong>lever arm</strong>: the perpendicular distance from the axis to the force's line of action. Both forms give the same answer; use whichever is easier to see in the problem.</p>
      <p>The unit is the newton-meter (N·m). It's dimensionally the same as a joule, but don't call torque "joules": torque isn't energy.</p>

      <h2>The sign of torque</h2>
      <p>Use the same convention as Unit 9: <strong>counterclockwise torque is positive, clockwise is negative.</strong> When several forces act, the net torque is the sum, with signs.</p>

      <h2>As a vector</h2>
      <p>Torque is a cross product (Unit 1):</p>
      $$\vec{\tau} = \vec{r}\times\vec{F}$$
      <p>Its direction lies along the rotation axis, found with the right-hand rule. For PHYS 206 problems in a plane, the sign convention above is usually enough.</p>

      <div class="example">
        <div class="example-label">Worked example 1: a wrench</div>
        <p>You push on a wrench 0.25 m from the bolt with 80 N of force. Find the torque when the push is perpendicular to the wrench, at 60° to it, and straight along it toward the bolt.</p>
        ${solution(String.raw`
          <ul>
            <li><strong>Perpendicular to the wrench:</strong> τ = (0.25)(80) sin 90° = <strong>20 N·m</strong>.</li>
            <li><strong>At 60° to the wrench:</strong> τ = (0.25)(80) sin 60° = <strong>17 N·m</strong>.</li>
            <li><strong>Straight along the wrench, toward the bolt:</strong> τ = (0.25)(80) sin 0° = <strong>0</strong>. No rotation at all.</li>
          </ul>`)}
      </div>
      <h3>Try it: push the wrench</h3>
      <p class="muted">Change the angle and where you push. The dashed line is the force's line of action, and the green segment is the lever arm ℓ. Torque is F times that green length.</p>
      <div data-widget="wrench-torque"></div>

      <div class="example">
        <div class="example-label">Worked example 2: net torque on a wheel</div>
        <p>A wheel of radius 0.50 m can spin about its center. A 10 N force pulls tangentially at its rim, counterclockwise. A 6.0 N force pulls tangentially 0.20 m from the center, clockwise. Find the net torque.</p>
        ${solution(String.raw`
          <ol>
            <li>First torque: +(0.50)(10) = +5.0 N·m.</li>
            <li>Second torque: −(0.20)(6.0) = −1.2 N·m.</li>
            <li>Net torque: 5.0 − 1.2 = <strong>3.8 N·m, counterclockwise</strong>.</li>
          </ol>
          <p>The smaller force loses because it acts closer to the axis, not just because it's smaller.</p>`)}
      </div>
      <h3>Try it: a torque tug-of-war</h3>
      <div data-widget="net-torque-wheel"></div>`,
  },

  {
    id: "torque-alpha",
    title: "Torque and angular acceleration",
    minutes: 13,
    interactives: ["Disk spin-up model", "Block on a heavy pulley"],
    body: String.raw`
      <p>This is Newton's second law for rotation, and it's the core equation of the unit:</p>
      $$\sum \tau = I\alpha$$
      <p>Net torque causes angular acceleration, and the moment of inertia resists it, just as mass resists linear acceleration in ΣF = ma. A bigger I means more torque is needed for the same α.</p>

      <div class="example">
        <div class="example-label">Worked example 1: spinning up a disk</div>
        <p>A solid disk with M = 5.0 kg and R = 0.20 m can spin freely about its center. A string wrapped around its rim is pulled with a steady 10 N. Find the angular acceleration.</p>
        ${solution(String.raw`
          <ol>
            <li>Torque: the string pulls tangentially at the rim, so τ = RF = (0.20)(10) = 2.0 N·m.</li>
            <li>Moment of inertia: I = ½MR² = ½(5.0)(0.20)² = 0.10 kg·m².</li>
            <li>Angular acceleration: α = τ/I = 2.0/0.10 = <strong>20 rad/s²</strong>.</li>
          </ol>`)}
      </div>
      <div data-widget="disk-torque"></div>

      <h2>The strategy for linked problems</h2>
      <p>The most common exam problem connects sliding objects to spinning ones, like a block hanging from a heavy pulley. Use this recipe:</p>
      <ol>
        <li><strong>Draw a free-body diagram for each object.</strong> For the pulley, mark where each force acts, because torque depends on position.</li>
        <li><strong>Write ΣF = ma</strong> for each object that moves in a line.</li>
        <li><strong>Write Στ = Iα</strong> for each object that spins.</li>
        <li><strong>Link them</strong> with the no-slip condition: a = Rα.</li>
        <li><strong>Solve</strong> the system of equations.</li>
      </ol>
      <div class="example">
        <div class="example-label">Worked example 2: a block on a heavy pulley</div>
        <p>A 1.0 kg block hangs from a rope wrapped around a pulley, a solid disk with M = 2.0 kg and R = 0.10 m. Find the block's acceleration and the rope's tension.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Block</strong> (down is positive): mg − T = ma, so 9.80 − T = 1.0a.</li>
            <li><strong>Pulley:</strong> only the tension creates a torque, at radius R: TR = Iα = (½MR²)(a/R). The R's cancel, leaving T = ½Ma = 1.0a.</li>
            <li><strong>Combine:</strong> 9.80 − 1.0a = 1.0a, so <strong>a = 4.9 m/s²</strong>, and <strong>T = 4.9 N</strong>.</li>
          </ol>`)}
      </div>
      <h3>Try it: the heavy pulley</h3>
      <p class="muted">The model follows the recipe: ΣF = ma for the block, Στ = Iα for the pulley, linked by a = Rα. Make the pulley massless and the block falls at g with zero tension.</p>
      <div data-widget="heavy-pulley"></div>

      <h2>Sanity checks</h2>
      <ul>
        <li><strong>The acceleration is less than g,</strong> because the pulley's inertia holds the block back. With a massless pulley, the block would simply free-fall at 9.80 m/s².</li>
        <li><strong>The tension is less than the block's 9.80 N weight,</strong> as it must be for the block to accelerate down.</li>
        <li><strong>It matches Unit 9.</strong> Falling 1.5 m at this acceleration gives v = √(2 × 4.9 × 1.5) = 3.8 m/s, the same answer Unit 9 got with energy. Forces and energy always agree.</li>
      </ul>
      <p>One important difference from Unit 5: with a massive pulley, the rope tension is <strong>different on each side</strong> of the pulley. That difference is exactly what creates the torque that spins it.</p>`,
  },

  {
    id: "rolling",
    title: "Rolling without slipping",
    minutes: 13,
    interactives: ["Rolling-wheel velocity model", "Rolling race"],
    body: String.raw`
      <p>A rolling wheel does two things at once: its center moves forward, and it spins about that center. When it rolls without slipping, the two motions are locked together.</p>

      <h2>The rolling condition</h2>
      $$v_{\text{cm}} = R\omega \qquad a_{\text{cm}} = R\alpha$$
      <p>A surprising consequence: <strong>the point touching the ground is momentarily at rest.</strong> The forward motion of the center and the backward motion of the bottom edge from spinning cancel exactly. The top of the wheel, meanwhile, moves at 2v_cm, twice as fast as the car the wheel is on.</p>
      <h3>See it: translation + spin = rolling</h3>
      <p class="muted">Each point's velocity is the center's forward v plus its spin velocity. Toggle the two parts to see them add: 2v at the top, zero at the ground.</p>
      <div data-widget="rolling-wheel"></div>

      <h2>Kinetic energy of a rolling object</h2>
      <p>A rolling object has both kinds of kinetic energy:</p>
      $$K = \tfrac{1}{2}Mv_{\text{cm}}^2 + \tfrac{1}{2}I_{\text{cm}}\omega^2$$
      <p>The first term is the motion of the center; the second is the spin about the center.</p>

      <h2>Rolling down a ramp</h2>
      <p>Write the object's moment of inertia as I = cMR², where c depends on its shape (c = 1 for a hoop, ½ for a solid disk, 2/5 for a solid sphere). Rolling from rest down a height h, energy conservation gives:</p>
      $$Mgh = \tfrac{1}{2}Mv^2(1 + c) \quad\Rightarrow\quad v = \sqrt{\frac{2gh}{1 + c}}$$
      <p>Static friction at the contact point provides the torque that makes the object spin. Because the contact point doesn't slide, friction does no work, so mechanical energy is still conserved.</p>

      <div class="example">
        <div class="example-label">Worked example: the rolling race</div>
        <p>A solid sphere, a solid disk, and a hoop are released from rest at the top of a ramp 1.0 m high. Which reaches the bottom first, and how fast?</p>
        ${solution(String.raw`
          <table class="table">
            <thead><tr><th>Object</th><th>c</th><th>Speed at the bottom</th></tr></thead>
            <tbody>
              <tr><td>Solid sphere</td><td>2/5</td><td>√(2 × 9.80 × 1.0 / 1.4) = 3.7 m/s</td></tr>
              <tr><td>Solid disk</td><td>1/2</td><td>√(2 × 9.80 × 1.0 / 1.5) = 3.6 m/s</td></tr>
              <tr><td>Hoop</td><td>1</td><td>√(2 × 9.80 × 1.0 / 2.0) = 3.1 m/s</td></tr>
            </tbody>
          </table>
          <p>The sphere wins and the hoop finishes last, regardless of their masses or sizes, which both cancel out. The reason: the more of an object's energy goes into spinning (bigger c), the less is left for moving forward. For comparison, a block sliding down a frictionless ramp would reach √(2 × 9.80 × 1.0) = 4.4 m/s, since none of its energy goes into spin.</p>`)}
      </div>
      <h3>Try it: race them</h3>
      <p class="muted">Release all four at once. Each one's acceleration is g sin θ / (1 + c), so the order never changes, whatever the height or angle.</p>
      <div data-widget="rolling-race"></div>
      <p>The same result from forces: the acceleration down a ramp of angle θ is \(a = g\sin\theta / (1 + c)\).</p>`,
  },

  {
    id: "work-power",
    title: "Work and power in rotational motion",
    minutes: 9,
    interactives: ["Torque does work", "Engine torque and power"],
    body: String.raw`
      <p>A torque that turns an object through an angle does work on it, just as a force that moves an object through a distance does. Every formula from Unit 6 has a rotational version.</p>

      <h2>Rotational work</h2>
      <p>For a constant torque turning an object through an angle Δθ (in radians):</p>
      $$W = \tau\,\Delta\theta$$
      <p>If the torque varies, integrate: W = ∫τ dθ. Torque times angle replaces force times distance.</p>

      <h2>The rotational work-energy theorem</h2>
      <p>The total work done by torques equals the change in rotational kinetic energy:</p>
      $$W_{\text{tot}} = \tfrac{1}{2}I\omega_2^2 - \tfrac{1}{2}I\omega_1^2$$

      <h2>Rotational power</h2>
      <p>The rate at which a torque does work:</p>
      $$P = \tau\omega$$
      <p>This replaces P = Fv, and it's how engines are rated: an engine's power depends on both the torque it produces and how fast it spins.</p>

      <div class="example">
        <div class="example-label">Worked example 1: spinning up a flywheel</div>
        <p>A motor applies a constant 15 N·m torque to a flywheel with I = 0.50 kg·m², starting from rest. After it turns through 20 rad, how fast is it spinning?</p>
        ${solution(String.raw`
          <ol>
            <li>Work done: W = (15)(20) = 300 J.</li>
            <li>Work-energy theorem: 300 = ½(0.50)ω² − 0, so ω² = 1200 and <strong>ω = 35 rad/s</strong>.</li>
          </ol>
          <p>No time and no angular acceleration needed, just like the linear version.</p>`)}
      </div>
      <div data-widget="torque-work"></div>

      <div class="example">
        <div class="example-label">Worked example 2: engine power</div>
        <p>A car engine produces 400 N·m of torque at 3000 rpm. What power is it delivering?</p>
        ${solution(String.raw`
          <ol>
            <li>Convert to rad/s: 3000 × 2π / 60 = 314 rad/s.</li>
            <li>Power: P = (400)(314) = <strong>126,000 W</strong>, about 126 kW or 168 hp.</li>
          </ol>
          <p>Forgetting to convert rpm to rad/s here would make the answer about 10 times too big (the rpm number is about 10× the rad/s number), which is one of the most common mistakes in this unit.</p>`)}
      </div>
      <div data-widget="engine-torque"></div>`,
  },

  {
    id: "angular-momentum",
    title: "Angular momentum",
    minutes: 11,
    interactives: ["Angular momentum of a passing particle", "Torque changes L"],
    body: String.raw`
      <p>Angular momentum is the rotational version of momentum from Unit 8. It measures how much "spin" something has, and how hard that spin is to stop.</p>

      <h2>For a single particle</h2>
      <p>A particle moving past a point has angular momentum about that point:</p>
      $$\vec{L} = \vec{r}\times\vec{p} \qquad L = mvr\sin\phi = mv\ell$$
      <p>The structure mirrors torque: torque is r × F, and angular momentum is r × p. A particle doesn't need to move in a circle to have angular momentum; it just needs to move past the point at some distance. Only the part of its velocity perpendicular to <strong>r</strong> counts.</p>
      <div class="example">
        <div class="example-label">Example</div>
        <p>A 0.20 kg ball whirls on a 0.50 m string at 4.0 m/s. Find its angular momentum about the center.</p>
        ${solution(String.raw`<p>Its velocity is perpendicular to the string, so L = (0.20)(4.0)(0.50) = <strong>0.40 kg·m²/s</strong>.</p>`)}
      </div>
      <h3>See it: L for a straight-line motion</h3>
      <p class="muted">The ball moves in a straight line. As it passes, r and φ keep changing, but r sin φ is always the same lever arm ℓ, so L = mvℓ stays constant.</p>
      <div data-widget="particle-l"></div>

      <h2>For a rigid body</h2>
      <p>For an object spinning about a symmetry axis, adding up every particle's mvr gives:</p>
      $$L = I\omega$$
      <p>This mirrors p = mv. The units are kg·m²/s, and the direction is along the rotation axis, by the right-hand rule.</p>

      <h2>Torque changes angular momentum</h2>
      <p>Just as net force is the rate of change of momentum, net torque is the rate of change of angular momentum:</p>
      $$\sum\vec{\tau} = \frac{d\vec{L}}{dt}$$
      <p>For a rigid body with a fixed I, this is just Στ = Iα in another form. But this version is more general: it also works when I changes, which is exactly what makes the next lesson possible.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>The solid disk from the Στ = Iα lesson (I = 0.10 kg·m²) starts from rest, and a 2.0 N·m torque acts on it. How long until its angular momentum reaches 2.0 kg·m²/s, and how fast is it spinning then?</p>
        ${solution(String.raw`
          <ol>
            <li>Time: ΔL = τΔt, so Δt = 2.0 / 2.0 = <strong>1.0 s</strong>.</li>
            <li>Spin rate: ω = L/I = 2.0 / 0.10 = <strong>20 rad/s</strong>.</li>
          </ol>
          <p>Check against the earlier result: that disk had α = 20 rad/s², so after 1.0 s it reaches ω = 20 rad/s. The two methods agree.</p>`)}
      </div>
      <div data-widget="torque-l"></div>`,
  },

  {
    id: "conservation-l",
    title: "Conservation of angular momentum",
    minutes: 12,
    interactives: ["Spinning skater", "Jumping onto a merry-go-round"],
    body: String.raw`
      <p>If the net external torque on a system is zero, its total angular momentum stays constant:</p>
      $$\sum\tau_{\text{ext}} = 0 \quad\Longrightarrow\quad I_1\omega_1 = I_2\omega_2$$
      <p>This is the rotational version of momentum conservation from Unit 8, and it explains some of the most striking motions in physics. Unlike a single rigid body, a system can change its own moment of inertia, and when I changes, ω must change to compensate.</p>

      <div class="example">
        <div class="example-label">Worked example 1: the spinning skater</div>
        <p>A figure skater spins at 2.0 rad/s with her arms out, giving a moment of inertia of 4.0 kg·m². She pulls her arms in, dropping her moment of inertia to 1.0 kg·m². How fast does she spin?</p>
        ${solution(String.raw`
          <ol>
            <li>The ice is nearly frictionless, so there's no external torque, and L is conserved.</li>
            <li>(4.0)(2.0) = (1.0)ω₂, so <strong>ω₂ = 8.0 rad/s</strong>, four times faster.</li>
          </ol>
          <p><strong>Check the energy:</strong> her kinetic energy goes from ½(4.0)(2.0)² = 8.0 J to ½(1.0)(8.0)² = 32 J. Angular momentum is conserved, but kinetic energy isn't. The extra 24 J comes from the work her muscles do pulling her arms inward.</p>`)}
      </div>
      <h3>Try it: pull the arms in</h3>
      <p class="muted">Slide the arms in and out. L stays fixed, so ω rises as I falls, while K = L²/(2I) climbs.</p>
      <div data-widget="skater"></div>

      <div class="example">
        <div class="example-label">Worked example 2: jumping onto a merry-go-round</div>
        <p>A merry-go-round with I = 300 kg·m² and radius 2.0 m sits at rest. A 30 kg child runs at 4.0 m/s, tangent to its edge, and jumps on at the rim. How fast does it spin afterward?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Before:</strong> only the child has angular momentum about the center: L = mvr = (30)(4.0)(2.0) = 240 kg·m²/s.</li>
            <li><strong>After:</strong> the child rides at the rim, adding mr² = (30)(2.0)² = 120 kg·m². The total moment of inertia is 300 + 120 = 420 kg·m².</li>
            <li><strong>Conserve L:</strong> 240 = 420ω, so <strong>ω = 0.57 rad/s</strong>.</li>
          </ol>
          <p>This is the rotational version of a perfectly inelastic collision: the child "sticks" to the merry-go-round, so angular momentum is conserved but kinetic energy is lost.</p>`)}
      </div>
      <h3>Try it: jump on</h3>
      <div data-widget="merry-go-round"></div>

      <h2>A brief note on gyroscopes</h2>
      <p>If your syllabus includes gyroscopes: a spinning gyroscope supported at one end doesn't fall. Gravity's torque is horizontal, so it changes the <em>direction</em> of the angular momentum instead of its size, and the axis swings slowly in a circle. This motion is called <strong>precession</strong>. Check with your instructor whether it's on your exam; many PHYS 206 sections cover it only briefly.</p>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 22,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 10 errors happen where linear and rotational motion meet: missing the a = Rα link, or leaving out one kind of energy. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Using r instead of the lever arm.</strong> Torque needs the sin φ, or the perpendicular distance.</li>
        <li><strong>Assuming equal tension on both sides of a heavy pulley.</strong> The difference is what spins it.</li>
        <li><strong>Forgetting the link a = Rα,</strong> or giving a and α inconsistent signs.</li>
        <li><strong>Leaving out rotational energy for a rolling object.</strong> It has both ½Mv² and ½Iω².</li>
        <li><strong>Thinking static friction does work on an object rolling without slipping.</strong> It provides torque, but no work.</li>
        <li><strong>Conserving kinetic energy when I changes.</strong> Only angular momentum is conserved.</li>
        <li><strong>Plugging rpm into P = τω or K = ½Iω².</strong> Use rad/s.</li>
      </ul>

      <h2>Key formulas</h2>
      $$\tau = rF\sin\phi = F\ell \qquad \sum\tau = I\alpha \qquad v_{\text{cm}} = R\omega$$
      $$K_{\text{rolling}} = \tfrac{1}{2}Mv_{\text{cm}}^2 + \tfrac{1}{2}I_{\text{cm}}\omega^2 \qquad W = \tau\Delta\theta \qquad P = \tau\omega$$
      $$L = I\omega \qquad L_{\text{particle}} = mv\ell \qquad \sum\vec{\tau} = \frac{d\vec{L}}{dt} \qquad I_1\omega_1 = I_2\omega_2$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A 50 N force acts 0.40 m from a pivot, at 30° to the lever. Find the torque.</p>
          <div data-widget="answer-check" data-answer="10" data-label="τ" data-unit="N·m"></div>
          ${solution("τ = (0.40)(50) sin 30° = <strong>10 N·m</strong>.")}
        </li>
        <li class="problem">
          <p>A net torque of 8.0 N·m acts on a wheel with I = 0.40 kg·m². Find its angular acceleration.</p>
          <div data-widget="answer-check" data-answer="20" data-label="α" data-unit="rad/s²"></div>
          ${solution("α = 8.0 / 0.40 = <strong>20 rad/s²</strong>.")}
        </li>
        <li class="problem">
          <p>A 2.0 kg block hangs from a rope wrapped around a pulley, a solid disk of mass 4.0 kg. Find the block's acceleration and the rope tension.</p>
          <div data-widget="answer-check" data-answer="4.9" data-label="a" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="9.8" data-label="T" data-unit="N"></div>
          ${solution("Block: (2.0)(9.80) − T = 2.0a. Pulley: T = ½Ma = 2.0a. So 19.6 = 4.0a, giving <strong>a = 4.9 m/s²</strong> and <strong>T = 9.8 N</strong>.")}
        </li>
        <li class="problem">
          <p>A solid cylinder rolls from rest down a ramp 2.0 m high. Find its speed at the bottom.</p>
          <div data-widget="answer-check" data-answer="5.1" data-label="v" data-unit="m/s"></div>
          ${solution("v = √(2 × 9.80 × 2.0 / 1.5) = <strong>5.1 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 2.0 kg hoop rolls without slipping at 3.0 m/s. Find its total kinetic energy.</p>
          <div data-widget="answer-check" data-answer="18" data-label="K" data-unit="J"></div>
          ${solution("For a hoop, c = 1, so K = ½Mv²(1 + 1) = Mv² = (2.0)(3.0)² = <strong>18 J</strong>, half of it in spin.")}
        </li>
        <li class="problem">
          <p>A 25 N·m torque keeps a wheel spinning at 40 rad/s. What power does it deliver?</p>
          <div data-widget="answer-check" data-answer="1000" data-label="P" data-unit="W"></div>
          ${solution("P = (25)(40) = <strong>1000 W</strong>.")}
        </li>
        <li class="problem">
          <p>A 0.10 kg ball moves at 5.0 m/s along a straight line that passes 2.0 m from a point. Find its angular momentum about that point.</p>
          <div data-widget="answer-check" data-answer="1.0" data-label="L" data-unit="kg·m²/s"></div>
          ${solution("L = mvℓ = (0.10)(5.0)(2.0) = <strong>1.0 kg·m²/s</strong>.")}
        </li>
        <li class="problem">
          <p>A skater spinning at 2.0 rev/s with I = 3.0 kg·m² pulls in her arms to I = 1.2 kg·m². Find her new spin rate.</p>
          <div data-widget="answer-check" data-answer="5.0" data-label="ω₂" data-unit="rev/s"></div>
          ${solution("(3.0)(2.0) = (1.2)ω₂, so <strong>ω₂ = 5.0 rev/s</strong>. Ratios work in any consistent unit.")}
        </li>
        <li class="problem">
          <p>A disk with I = 0.50 kg·m² spins at 12 rad/s. A second disk, I = 0.25 kg·m² and not spinning, is dropped onto it, and they spin together. Find their final angular velocity.</p>
          <div data-widget="answer-check" data-answer="8.0" data-label="ω" data-unit="rad/s"></div>
          ${solution("(0.50)(12) = (0.75)ω, so <strong>ω = 8.0 rad/s</strong>.")}
        </li>
      </ol>
      <p class="muted small">Sources: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>; PHYS 206 custom pre-lectures, Chapter 10 note (Texas A&amp;M).</p>`,
  },
];

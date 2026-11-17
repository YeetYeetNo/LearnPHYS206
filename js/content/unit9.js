// ============================================================
// UNIT 9 LESSONS: Rotation of Rigid Bodies (Chapter 9)
// Source: "PHYS 206 Unit 9 Study Guide" (Nov 4, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit9Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 9 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 9 of PHYS 206 is Chapter 9 of the course textbook, rotation of rigid bodies. It's part of <strong>Exam III</strong>, which covers Chapters 8–11 on the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>.</p>
      <p>Until now, every object has been treated as a point that slides or flies. Real objects also <strong>spin</strong>: wheels, fans, figure skaters, the Earth. This unit describes that spinning motion, and it's the rotational version of Units 2 and 6 combined.</p>
      <p>The good news is that you already know most of it. Every linear quantity has a rotational twin, and every equation has the same shape:</p>
      <table class="table">
        <thead><tr><th>Linear</th><th>Rotational</th></tr></thead>
        <tbody>
          <tr><td>Position x</td><td>Angle θ</td></tr>
          <tr><td>Velocity v</td><td>Angular velocity ω</td></tr>
          <tr><td>Acceleration a</td><td>Angular acceleration α</td></tr>
          <tr><td>Mass m</td><td>Moment of inertia I</td></tr>
          <tr><td>Kinetic energy ½mv²</td><td>Rotational kinetic energy ½Iω²</td></tr>
        </tbody>
      </table>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Describe rotation with angular position, velocity, and acceleration</li>
        <li>Solve constant-angular-acceleration problems with the rotational kinematic equations</li>
        <li>Convert between angular and linear quantities</li>
        <li>Find moments of inertia for common shapes, including with the parallel-axis theorem</li>
        <li>Use rotational kinetic energy in energy-conservation problems</li>
      </ul>
      <div class="callout">This unit is all about <strong>describing</strong> rotation. The next unit adds torque, the cause of rotation, just as Unit 4 added forces after Units 2 and 3.</div>`,
  },

  {
    id: "angular-quantities",
    title: "Angular position, velocity, and acceleration",
    minutes: 10,
    interactives: ["Radian wheel", "Spinning-wheel model"],
    body: String.raw`
      <p>A <strong>rigid body</strong> is an object that keeps its shape as it moves, like a wheel or a door. When it rotates about a fixed axis, every point on it turns through the same angle in the same time. So one angle describes the whole object.</p>

      <h2>Angular position and radians</h2>
      <p>The angle θ measures how far the object has turned. In physics, angles are measured in <strong>radians</strong>:</p>
      $$\theta = \frac{s}{r}$$
      <p>Here s is the arc length a point travels along its circle, and r is that point's distance from the axis. One full turn is 2π rad = 360°, so 1 rad is about 57.3°.</p>
      <div class="callout warn">Radians are required in rotational formulas, because equations like s = rθ only work in radians. Set your calculator to radian mode for this unit.</div>
      <h3>See it: what a radian is</h3>
      <p class="muted">One radian is the angle where the arc length equals the radius. Drag the angle and compare degrees, radians, and revolutions. The rpm converter is built in.</p>
      <div data-widget="radian-wheel"></div>

      <h2>Angular velocity</h2>
      <p>Angular velocity is how fast the angle changes:</p>
      $$\omega = \frac{d\theta}{dt}$$
      <p>Its units are rad/s. The usual sign convention: <strong>counterclockwise is positive</strong>, clockwise is negative.</p>
      <p>You'll often see rotation speeds in revolutions per minute (rpm). To convert, multiply by 2π rad per revolution and divide by 60 s per minute. For example, a motor spinning at 3000 rpm has ω = 3000 × 2π / 60 = <strong>314 rad/s</strong>.</p>

      <h2>Angular acceleration</h2>
      <p>Angular acceleration is how fast the angular velocity changes:</p>
      $$\alpha = \frac{d\omega}{dt} = \frac{d^2\theta}{dt^2}$$
      <p>Its units are rad/s². As in Unit 2, compare signs: if ω and α have the same sign, the rotation speeds up; opposite signs mean it slows down.</p>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A wheel's angular position is θ(t) = 2.0t³, in radians and seconds. Find its angular velocity and acceleration at t = 2.0 s.</p>
        ${solution(String.raw`
          <ol>
            <li>Differentiate once: ω = dθ/dt = 6.0t², so ω = 6.0(2.0)² = <strong>24 rad/s</strong>.</li>
            <li>Differentiate again: α = dω/dt = 12t, so α = 12(2.0) = <strong>24 rad/s²</strong>.</li>
          </ol>
          <p>This is exactly the derivative chain from Unit 2, with θ, ω, and α in place of x, v, and a.</p>`)}
      </div>

      <h2>Direction as a vector</h2>
      <p>Angular velocity also has a direction, along the rotation axis. Use the <strong>right-hand rule</strong>: curl your fingers the way the object spins, and your thumb points along ω. A wheel spinning counterclockwise as you look at it has ω pointing toward you.</p>
      <h3>See it: spin, signs, and direction</h3>
      <p class="muted">Pick ω and α. Same signs speed the wheel up, opposite signs slow it down. The symbol in the middle shows ω's direction: ⊙ toward you (counterclockwise), ⊗ away from you (clockwise).</p>
      <div data-widget="angular-motion"></div>`,
  },

  {
    id: "constant-alpha",
    title: "Rotation with constant angular acceleration",
    minutes: 11,
    interactives: ["Spin-up / spin-down model"],
    body: String.raw`
      <p>When the angular acceleration is constant, rotation follows four equations. They're Unit 2's kinematic equations with every letter swapped for its rotational twin, so the strategy is identical: list what you know, find the variable you don't need, and pick the equation without it.</p>

      <h2>The four rotational kinematic equations</h2>
      <table class="table eq-table">
        <tbody>
          <tr><td>$$\omega = \omega_0 + \alpha t$$</td><td>no angle</td></tr>
          <tr><td>$$\theta = \theta_0 + \omega_0 t + \tfrac{1}{2}\alpha t^2$$</td><td>no final angular velocity</td></tr>
          <tr><td>$$\omega^2 = \omega_0^2 + 2\alpha(\theta - \theta_0)$$</td><td>no time</td></tr>
          <tr><td>$$\theta - \theta_0 = \tfrac{1}{2}(\omega_0 + \omega)\,t$$</td><td>no angular acceleration</td></tr>
        </tbody>
      </table>

      <div class="example">
        <div class="example-label">Worked example 1: a blender winding down</div>
        <p>A blender blade spins at 300 rad/s. When it's switched off, it slows at a steady rate and stops in 6.0 s. Find its angular acceleration and how many revolutions it makes while stopping.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Angular acceleration:</strong> 0 = 300 + α(6.0), so <strong>α = −50 rad/s²</strong>. It's negative because it opposes the spin.</li>
            <li><strong>Angle turned:</strong> use the no-acceleration equation: Δθ = ½(300 + 0)(6.0) = 900 rad.</li>
            <li><strong>Convert to revolutions:</strong> 900 / 2π = <strong>143 revolutions</strong>.</li>
            <li><strong>Check with the no-time equation:</strong> 0 = 300² + 2(−50)Δθ, so Δθ = 90,000/100 = 900 rad. It matches.</li>
          </ol>`)}
      </div>
      <div class="example">
        <div class="example-label">Worked example 2: a wheel spinning up</div>
        <p>A wheel starts from rest with a constant angular acceleration of 4.0 rad/s². How long until it reaches 20 rad/s, and how far does it turn in that time?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Time:</strong> 20 = 0 + 4.0t, so <strong>t = 5.0 s</strong>.</li>
            <li><strong>Angle:</strong> θ = ½(4.0)(5.0)² = <strong>50 rad</strong>, which is 50/2π = 8.0 revolutions.</li>
          </ol>`)}
      </div>
      <h3>See it: the area under ω-t is the angle</h3>
      <p class="muted">Load either example and play it. The counter tracks revolutions, and the shaded area under the ω-t graph is the angle turned, exactly like displacement in Unit 2.</p>
      <div data-widget="spin-graph"></div>
      <div class="callout warn"><strong>The most common mistake here is mixing units:</strong> θ must be in radians, and ω in rad/s, not rpm. Convert everything before plugging in, and convert back to revolutions only at the end.</div>`,
  },

  {
    id: "linear-angular",
    title: "Relating linear and angular quantities",
    minutes: 10,
    interactives: ["Points on a spinning wheel"],
    body: String.raw`
      <p>Every point on a spinning object shares the same θ, ω, and α. But points farther from the axis travel bigger circles, so they move faster in m/s. The distance from the axis, r, connects the two descriptions.</p>

      <h2>The connecting equations (radians only)</h2>
      $$s = r\theta \qquad v = r\omega \qquad a_{\text{tan}} = r\alpha$$
      <ul>
        <li><strong>v = rω</strong> is a point's linear speed along its circle. On a spinning merry-go-round, a rider at the edge moves faster than one near the center, even though they turn at the same rate.</li>
        <li><strong>a_tan = rα</strong> is the tangential acceleration, along the circle. It changes the point's speed, and it's zero if ω is constant.</li>
      </ul>

      <h2>Don't forget the radial part</h2>
      <p>Every point moving in a circle also has the centripetal acceleration from Unit 3, pointing toward the axis:</p>
      $$a_{\text{rad}} = \frac{v^2}{r} = \omega^2 r$$
      <p>A point's total acceleration is the vector sum of the tangential and radial parts. They're perpendicular, so the magnitude is \(\sqrt{a_{\text{tan}}^2 + a_{\text{rad}}^2}\).</p>
      <div class="example">
        <div class="example-label">Worked example: a point on a wheel's rim</div>
        <p>A wheel of radius 0.30 m spins at 20 rad/s and is speeding up at 5.0 rad/s². For a point on its rim, find the speed, both acceleration components, and the total acceleration.</p>
        ${solution(String.raw`
          <ol>
            <li>Speed: v = (0.30)(20) = <strong>6.0 m/s</strong>.</li>
            <li>Tangential acceleration: (0.30)(5.0) = <strong>1.5 m/s²</strong>.</li>
            <li>Radial acceleration: (20)²(0.30) = <strong>120 m/s²</strong>, toward the center.</li>
            <li>Total: √(120² + 1.5²) ≈ <strong>120 m/s²</strong>, almost all of it radial.</li>
          </ol>
          <p>Even a slowly speeding-up wheel has a huge radial acceleration at its rim. That's why a fast-spinning wheel can fling off mud.</p>`)}
      </div>
      <h3>See it: same ω, different speeds</h3>
      <p class="muted">The two marked points turn together, but the outer one moves faster. Arrows show each point's v, a_tan, and a_rad. Move the inner point to compare.</p>
      <div data-widget="rim-point"></div>

      <h2>Ropes on pulleys</h2>
      <p>When a rope wraps around a pulley or spool without slipping, the rope moves at the speed of the pulley's rim. So the rope's speed is v = Rω, and its acceleration is a = Rα, with R the pulley's radius. This link is the key to almost every pulley problem in the next unit, and to the falling-block model in the rotational-energy lesson.</p>`,
  },

  {
    id: "moment-of-inertia",
    title: "Moment of inertia",
    minutes: 12,
    interactives: ["Dumbbell axis model", "Shape comparison"],
    body: String.raw`
      <p>In linear motion, mass measures how hard it is to change an object's velocity. In rotation, the <strong>moment of inertia</strong> I measures how hard it is to change its angular velocity. But it depends on more than mass: it depends on <strong>where</strong> the mass sits relative to the axis.</p>

      <h2>The definition</h2>
      <p>For a set of point masses, each at distance r from the rotation axis:</p>
      $$I = m_1r_1^2 + m_2r_2^2 + \cdots = \sum m_i r_i^2$$
      <p>Its units are kg·m². Because of the r², <strong>mass far from the axis counts much more</strong> than mass near it. Doubling a mass's distance from the axis quadruples its contribution.</p>
      <p>You can feel this: a baseball bat is easy to twist around its long axis, but hard to swing around its handle, because swinging puts the mass much farther from the axis.</p>

      <h2>The axis matters</h2>
      <p>The same object has a different moment of inertia for each axis. Always ask "about which axis?" before computing I.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>Two 2.0 kg balls are attached to a light 1.0 m rod, one at each end. Find I about the rod's center and about one end.</p>
        ${solution(String.raw`
          <ul>
            <li><strong>Spinning about the rod's center:</strong> each ball is 0.50 m away, so I = 2 × (2.0)(0.50)² = <strong>1.0 kg·m²</strong>.</li>
            <li><strong>Spinning about one end:</strong> one ball sits on the axis (r = 0) and contributes nothing. The other is 1.0 m away, so I = (2.0)(1.0)² = <strong>2.0 kg·m²</strong>.</li>
          </ul>
          <p>Same object, same mass, but twice as hard to spin about the end.</p>`)}
      </div>
      <h3>Try it: slide the axis</h3>
      <p class="muted">Move the axis along the rod. Each ball's contribution is m r², so the farther ball always dominates. The lowest I is when the axis is at the center of mass.</p>
      <div data-widget="inertia-dumbbell"></div>

      <h2>Common shapes</h2>
      <p>For solid objects, the sum becomes an integral (covered in the last lesson). The results for common shapes, each of mass M, are worth knowing:</p>
      <table class="table" style="max-width:none">
        <thead><tr><th>Shape</th><th>Axis</th><th>Moment of inertia</th></tr></thead>
        <tbody>
          <tr><td>Thin hoop or ring, radius R</td><td>Through center, perpendicular to the hoop</td><td>MR²</td></tr>
          <tr><td>Solid disk or cylinder, radius R</td><td>Through center, along the cylinder's axis</td><td>½MR²</td></tr>
          <tr><td>Solid sphere, radius R</td><td>Through center</td><td>(2/5)MR²</td></tr>
          <tr><td>Thin spherical shell, radius R</td><td>Through center</td><td>(2/3)MR²</td></tr>
          <tr><td>Thin rod, length L</td><td>Through center, perpendicular to the rod</td><td>(1/12)ML²</td></tr>
          <tr><td>Thin rod, length L</td><td>Through one end, perpendicular to the rod</td><td>(1/3)ML²</td></tr>
        </tbody>
      </table>
      <p>Compare the hoop and the disk: same mass and radius, but the hoop's I is twice as big, because all its mass sits at the edge. Your exam formula sheet will likely list these, but understanding why they differ is what earns the points on conceptual questions.</p>
      <h3>See it: same M and R, different I</h3>
      <div data-widget="inertia-shapes"></div>`,
  },

  {
    id: "rotational-energy",
    title: "Rotational kinetic energy",
    minutes: 12,
    interactives: ["Flywheel energy", "Block unwinding from a pulley"],
    body: String.raw`
      <p>A spinning object has kinetic energy even if it isn't going anywhere: every bit of it is moving in a circle. Adding up ½mv² for every piece, with v = rω, gives a formula that looks just like the linear one.</p>

      <h2>The formula</h2>
      $$K_{\text{rot}} = \tfrac{1}{2}I\omega^2$$
      <p>Moment of inertia takes the place of mass, and angular velocity takes the place of velocity. The units are joules, and ω must be in rad/s.</p>

      <h2>Energy conservation with rotation</h2>
      <p>Rotational kinetic energy is just another form of energy, so it slots right into Unit 7's equation:</p>
      $$K_1 + U_1 + W_{\text{other}} = K_2 + U_2$$
      <p>where K now includes every moving part: ½mv² for things that slide or fall, and ½Iω² for things that spin.</p>

      <div class="example">
        <div class="example-label">Worked example 1: a flywheel</div>
        <p>A flywheel is a solid disk of mass 50 kg and radius 0.40 m, spinning at 300 rad/s. How much energy does it store?</p>
        ${solution(String.raw`
          <ol>
            <li>Moment of inertia: I = ½(50)(0.40)² = 4.0 kg·m².</li>
            <li>Energy: K = ½(4.0)(300)² = <strong>180,000 J</strong>, enough to lift a small car about 15 m.</li>
          </ol>`)}
      </div>
      <div data-widget="flywheel"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a weight unwinding from a pulley</div>
        <p>A rope is wrapped around a pulley, a solid disk with M = 2.0 kg and R = 0.10 m. A 1.0 kg block hangs from the rope. Starting from rest, the block falls 1.5 m, unwinding the rope and spinning the pulley. How fast is the block moving?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Energy in:</strong> the block loses mgh = (1.0)(9.80)(1.5) = 14.7 J of potential energy.</li>
            <li><strong>Energy out:</strong> it goes into two places: the block's ½mv² and the pulley's ½Iω².</li>
            <li><strong>Link the motions:</strong> the rope doesn't slip, so ω = v/R. With I = ½MR², the pulley's energy becomes ½(½MR²)(v/R)² = ¼Mv². The radius cancels.</li>
            <li><strong>Solve:</strong> 14.7 = ½(1.0)v² + ¼(2.0)v² = 1.0v², so <strong>v = 3.8 m/s</strong>.</li>
          </ol>
          <p>If the pulley were massless, the block would reach √(2 × 9.80 × 1.5) = 5.4 m/s. A heavy pulley soaks up part of the energy in its spin, so the block falls slower.</p>`)}
      </div>
      <h3>See it: where the energy goes</h3>
      <p class="muted">Drop the block. The bars split the block's lost U between its own K and the pulley's spin. Switch the pulley to a hoop or make it massless and compare the landing speed.</p>
      <div data-widget="pulley-drop"></div>
      <p>Rolling objects, like a ball rolling down a ramp, have both kinds of kinetic energy at once. That's covered in detail in the next unit.</p>`,
  },

  {
    id: "parallel-axis",
    title: "Parallel-axis theorem and moment of inertia by integration",
    minutes: 12,
    interactives: ["Parallel-axis explorer", "Building I from slices"],
    body: String.raw`
      <p>The table of common shapes gives I for a few standard axes. These two tools handle everything else: the parallel-axis theorem shifts an axis, and integration builds I from scratch.</p>

      <h2>The parallel-axis theorem</h2>
      <p>If you know an object's moment of inertia about an axis through its center of mass, you can find it about any <strong>parallel</strong> axis a distance d away:</p>
      $$I_P = I_{\text{cm}} + Md^2$$
      <p>Two rules: the axes must be parallel, and one of them must pass through the center of mass. Because Md² is always positive, <strong>the center-of-mass axis always gives the smallest moment of inertia</strong> of any parallel axis.</p>
      <p><strong>Check it on the rod.</strong> A rod's I about its center is (1/12)ML². Its end is d = L/2 from the center, so:</p>
      $$I_{\text{end}} = \tfrac{1}{12}ML^2 + M\left(\tfrac{L}{2}\right)^2 = \tfrac{1}{12}ML^2 + \tfrac{3}{12}ML^2 = \tfrac{1}{3}ML^2$$
      <p>That matches the table's value for a rod about its end.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A solid disk with M = 2.0 kg and R = 0.20 m spins about an axis through a point on its rim, parallel to its central axis. Find its moment of inertia.</p>
        ${solution(String.raw`
          <ol>
            <li>About the center: I_cm = ½(2.0)(0.20)² = 0.040 kg·m².</li>
            <li>Shift to the rim, d = R = 0.20 m: Md² = (2.0)(0.20)² = 0.080 kg·m².</li>
            <li>Total: I = 0.040 + 0.080 = <strong>0.12 kg·m²</strong>, three times the central value.</li>
          </ol>`)}
      </div>
      <h3>See it: I grows as d²</h3>
      <p class="muted">Move the axis away from the center of mass. The curve is I = I_cm + Md², a parabola whose lowest point is the center of mass.</p>
      <div data-widget="parallel-axis"></div>

      <h2>Moment of inertia by integration</h2>
      <p>For a continuous object, the sum Σmr² becomes an integral over every tiny piece of mass dm:</p>
      $$I = \int r^2\,dm$$
      <p>The trick is writing dm in terms of a position variable. For a uniform rod of mass M and length L, the mass per length is λ = M/L, so a slice of length dx has dm = (M/L) dx.</p>
      <div class="example">
        <div class="example-label">Worked example: a rod about one end</div>
        <p>Put the axis at x = 0, with the rod running to x = L. Find I.</p>
        ${solution(String.raw`
          <p>Each slice sits a distance x from the axis:</p>
          $$I = \int_0^L x^2\,\frac{M}{L}\,dx = \frac{M}{L}\cdot\frac{L^3}{3} = \tfrac{1}{3}ML^2$$
          <p>That's where the table value comes from. Change the limits to −L/2 and +L/2 (axis at the center), and the same integral gives (1/12)ML².</p>`)}
      </div>
      <h3>See it: the sum becomes the integral</h3>
      <p class="muted">Chop the rod into N slices and add up m r² for each. As N grows, the sum closes in on the integral's exact answer.</p>
      <div data-widget="rod-integral"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 20,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 9 errors are unit slips (degrees or rpm instead of radians) and moment-of-inertia mix-ups. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Using degrees or rpm in formulas.</strong> Convert to radians and rad/s first.</li>
        <li><strong>Forgetting that I depends on the axis.</strong> Always identify the axis before choosing a formula.</li>
        <li><strong>Using MR² for every round object.</strong> A hoop is MR², but a solid disk is ½MR² and a solid sphere is (2/5)MR².</li>
        <li><strong>Leaving out the pulley's rotational energy</strong> in a falling-mass problem.</li>
        <li><strong>Applying the parallel-axis theorem from an axis that isn't through the center of mass.</strong></li>
        <li><strong>Forgetting the radial acceleration</strong> of a point on a spinning object, even when α = 0.</li>
        <li><strong>Thinking every point on a spinning object has the same speed.</strong> They share ω, but v = rω grows with distance from the axis.</li>
      </ul>

      <h2>Key formulas</h2>
      $$\omega = \frac{d\theta}{dt} \qquad \alpha = \frac{d\omega}{dt} \qquad 1\ \text{rev} = 2\pi\ \text{rad}$$
      $$\omega = \omega_0 + \alpha t \qquad \theta = \theta_0 + \omega_0 t + \tfrac{1}{2}\alpha t^2 \qquad \omega^2 = \omega_0^2 + 2\alpha\Delta\theta$$
      $$v = r\omega \qquad a_{\text{tan}} = r\alpha \qquad a_{\text{rad}} = \omega^2 r$$
      $$I = \sum m_i r_i^2 = \int r^2\,dm \qquad K_{\text{rot}} = \tfrac{1}{2}I\omega^2 \qquad I_P = I_{\text{cm}} + Md^2$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>Convert 45 rpm to rad/s.</p>
          <div data-widget="answer-check" data-answer="4.7" data-label="ω" data-unit="rad/s"></div>
          ${solution("45 × 2π / 60 = <strong>4.7 rad/s</strong>.")}
        </li>
        <li class="problem">
          <p>A fan spinning at 50 rad/s slows uniformly to rest in 10 s. Find its angular acceleration and how many revolutions it makes while stopping.</p>
          <div data-widget="answer-check" data-answer="-5.0" data-label="α" data-unit="rad/s²"></div>
          <div data-widget="answer-check" data-answer="40" data-label="Revolutions" data-unit="rev"></div>
          ${solution("0 = 50 + α(10), so <strong>α = −5.0 rad/s²</strong>. Δθ = ½(50 + 0)(10) = 250 rad = <strong>40 revolutions</strong>.")}
        </li>
        <li class="problem">
          <p>A wheel starts from rest with α = 3.0 rad/s². Find its angular velocity and the angle it has turned after 4.0 s.</p>
          <div data-widget="answer-check" data-answer="12" data-label="ω" data-unit="rad/s"></div>
          <div data-widget="answer-check" data-answer="24" data-label="θ" data-unit="rad"></div>
          ${solution("ω = (3.0)(4.0) = <strong>12 rad/s</strong>. θ = ½(3.0)(4.0)² = <strong>24 rad</strong>.")}
        </li>
        <li class="problem">
          <p>A point 0.25 m from the axis of a wheel spinning at 8.0 rad/s, with α = 2.0 rad/s². Find its speed, tangential acceleration, and radial acceleration.</p>
          <div data-widget="answer-check" data-answer="2.0" data-label="v" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="0.50" data-label="a_tan" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="16" data-label="a_rad" data-unit="m/s²"></div>
          ${solution("v = (0.25)(8.0) = <strong>2.0 m/s</strong>. Tangential: (0.25)(2.0) = <strong>0.50 m/s²</strong>. Radial: (8.0)²(0.25) = <strong>16 m/s²</strong>.")}
        </li>
        <li class="problem">
          <p>Find the moment of inertia of three point masses rotating about one axis: 1.0 kg at 0.20 m, 2.0 kg at 0.30 m, and 3.0 kg at 0.10 m.</p>
          <div data-widget="answer-check" data-answer="0.25" data-label="I" data-unit="kg·m²"></div>
          ${solution("I = (1.0)(0.20)² + (2.0)(0.30)² + (3.0)(0.10)² = 0.04 + 0.18 + 0.03 = <strong>0.25 kg·m²</strong>.")}
        </li>
        <li class="problem">
          <p>A 4.0 kg solid sphere of radius 0.10 m spins at 20 rad/s about its center. Find its rotational kinetic energy.</p>
          <div data-widget="answer-check" data-answer="3.2" data-label="K" data-unit="J"></div>
          ${solution("I = (2/5)(4.0)(0.10)² = 0.016 kg·m², so K = ½(0.016)(20)² = <strong>3.2 J</strong>.")}
        </li>
        <li class="problem">
          <p>A thin 0.50 kg hoop of radius 0.30 m hangs on a nail and swings about a point on its rim. Find its moment of inertia about that point.</p>
          <div data-widget="answer-check" data-answer="0.090" data-label="I" data-unit="kg·m²"></div>
          ${solution("I = MR² + MR² = 2MR² = 2(0.50)(0.30)² = <strong>0.090 kg·m²</strong>.")}
        </li>
        <li class="problem">
          <p>A 1.5 kg block hangs from a rope wrapped around a pulley shaped like a thin hoop (M = 3.0 kg). Starting from rest, the block falls 2.0 m. How fast is it moving?</p>
          <div data-widget="answer-check" data-answer="3.6" data-label="v" data-unit="m/s"></div>
          ${solution("The hoop's energy is ½(MR²)(v/R)² = ½Mv². So (1.5)(9.80)(2.0) = ½(1.5)v² + ½(3.0)v², giving 29.4 = 2.25v² and <strong>v = 3.6 m/s</strong>.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

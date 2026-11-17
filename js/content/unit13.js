// ============================================================
// UNIT 13 LESSONS: Periodic Motion (Chapter 14)
// Source: "PHYS 206 Unit 13 Study Guide" (Nov 16, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit13Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 13 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 13 of PHYS 206 is Chapter 14 of the course textbook, periodic motion. It's the <strong>last chapter of the course</strong>. Like gravitation, it isn't on any midterm: on the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>, it's tested only on the <strong>comprehensive final</strong>, which covers Chapters 1–11, 13, and 14.</p>
      <p>Periodic motion is any motion that repeats: a mass bouncing on a spring, a swinging pendulum, a vibrating guitar string, atoms jiggling in a solid. The most important kind is <strong>simple harmonic motion (SHM)</strong>. It's everywhere in physics because almost any system nudged slightly away from a stable equilibrium oscillates this way.</p>
      <p>This unit ties together a lot of the course:</p>
      <ul>
        <li>Hooke's law (Unit 6)</li>
        <li>Energy conservation and the energy diagrams where a mass on a spring rocks between turning points (Unit 7)</li>
        <li>Torque and moment of inertia (Units 9 and 10), for pendulums</li>
      </ul>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Describe oscillations with amplitude, period, frequency, and angular frequency</li>
        <li>Write and use the position, velocity, and acceleration equations for SHM</li>
        <li>Use energy conservation to find speeds and amplitudes in SHM</li>
        <li>Find the period of a mass on a spring, a simple pendulum, and a physical pendulum</li>
        <li>Explain damping, forced oscillations, and resonance</li>
      </ul>
      <div class="callout"><strong>The key fact to remember:</strong> in SHM, the period does not depend on the amplitude. As long as its swings stay small, a pendulum keeps the same time whether its arc is wider or narrower, which is exactly why pendulums were used in clocks.</div>`,
  },

  {
    id: "describing",
    title: "Describing oscillation",
    minutes: 8,
    interactives: ["Reference circle"],
    body: String.raw`
      <p>Every oscillation happens around a stable <strong>equilibrium</strong>, the position where the net force is zero. Pull the object away, and a <strong>restoring force</strong> pushes it back. It overshoots, gets pushed back again, and repeats. A handful of quantities describe that repeating motion.</p>

      <h2>The vocabulary</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Quantity</th><th>Symbol</th><th>Meaning</th><th>Unit</th></tr></thead>
        <tbody>
          <tr><td>Amplitude</td><td>\(A\)</td><td>The maximum distance from equilibrium</td><td>m (or rad for angles)</td></tr>
          <tr><td>Period</td><td>\(T\)</td><td>The time for one full cycle</td><td>s</td></tr>
          <tr><td>Frequency</td><td>\(f\)</td><td>The number of cycles per second</td><td>hertz (Hz) = 1/s</td></tr>
          <tr><td>Angular frequency</td><td>\(\omega\)</td><td>\(2\pi\) times the frequency</td><td>rad/s</td></tr>
        </tbody>
      </table>
      <p>The amplitude is always positive. One full cycle means going out to one side, across to the other, and back to the start, so the object travels a total distance of <strong>4A</strong> per cycle.</p>

      <h2>How they connect</h2>
      $$f = \frac{1}{T} \qquad \omega = 2\pi f = \frac{2\pi}{T}$$
      <p>Angular frequency borrows its name from Unit 9's rotation. You can picture SHM as the <strong>shadow of a point moving around a circle</strong> at angular speed \(\omega\): the shadow slides back and forth in exactly the motion this unit describes.</p>
      <h3>See it: SHM is a shadow of circular motion</h3>
      <p class="muted">The dot goes around the circle at a steady rate. Its shadow on the line below moves in SHM, and the graph traces the shadow's position over time.</p>
      <div data-widget="ref-circle"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A mass on a spring bounces between \(x = -0.050\) m and \(x = +0.050\) m, completing 10 cycles in 4.0 s.</p>
        ${solution(String.raw`
          <ol>
        <li><strong>Amplitude:</strong> \(A = 0.050\) m, half the full side-to-side distance.</li>
        <li><strong>Period:</strong> \(T = 4.0\text{ s}/10 = 0.40\) s.</li>
        <li><strong>Frequency:</strong> \(f = 1/0.40 = 2.5\) Hz.</li>
        <li><strong>Angular frequency:</strong> \(\omega = 2\pi(2.5) = 15.7\) rad/s.</li>
        <li><strong>Distance per cycle:</strong> \(4A = 0.20\) m.</li>
      </ol>`)}
      </div>
      <div class="callout warn"><strong>Common mistake:</strong> calling the full distance between the two extremes (0.10 m here) the amplitude. Amplitude is measured from the center, not edge to edge.</div>`,
  },

  {
    id: "shm",
    title: "Simple harmonic motion",
    minutes: 12,
    interactives: ["Mass on a spring", "Amplitude race"],
    body: String.raw`
      <p>Simple harmonic motion happens whenever the restoring force is <strong>directly proportional to the displacement</strong>. The classic example is a mass on an ideal spring, sliding on a frictionless surface.</p>

      <h2>Where it comes from</h2>
      <p>The spring force is Hooke's law from Unit 6, \(F = -kx\). Plug it into Newton's second law:</p>
      $$-kx = ma \quad\Rightarrow\quad a = -\frac{k}{m}\,x$$
      <p>The acceleration always points back toward equilibrium and grows with distance. That's the signature of SHM. The motion repeats with angular frequency and period:</p>
      $$\omega = \sqrt{\frac{k}{m}} \qquad T = 2\pi\sqrt{\frac{m}{k}}$$
      <p>These match intuition. A stiffer spring (bigger \(k\)) oscillates faster, and a heavier mass (bigger \(m\)) oscillates slower. And <strong>the amplitude doesn't appear anywhere</strong>: stretch the spring twice as far, and the mass has farther to go but moves faster, finishing each cycle in exactly the same time.</p>
      <h3>See it: two amplitudes, one period</h3>
      <p class="muted">Both blocks have the same mass and spring. One is pulled out twice as far. Watch them pass through the center at the same moments.</p>
      <div data-widget="amplitude-race"></div>

      <h2>Position, velocity, and acceleration</h2>
      <p>The position follows a cosine wave:</p>
      $$x(t) = A\cos(\omega t + \phi)$$
      <p>The <strong>phase angle</strong> \(\phi\) sets where the motion starts. If the mass is released from rest at \(x = +A\), then \(\phi = 0\). Differentiating gives the velocity and acceleration:</p>
      $$v(t) = -\omega A\sin(\omega t + \phi) \qquad a(t) = -\omega^2 A\cos(\omega t + \phi) = -\omega^2 x$$
      <p>Two patterns are worth memorizing:</p>
      <ul>
        <li><strong>At equilibrium (\(x = 0\)):</strong> the speed is at its maximum, \(v_{\max} = \omega A\), and the acceleration is zero.</li>
        <li><strong>At the ends (\(x = \pm A\)):</strong> the speed is zero, and the acceleration is at its maximum, \(a_{\max} = \omega^2 A\).</li>
      </ul>
      <h3>See it: x, v, and a together</h3>
      <p class="muted">Set the spring, the mass, and the pull, then play. The three graphs share a time cursor: v peaks where x crosses zero, and a is always the mirror image of x. The time slider also shows what a degree-mode calculator would give you.</p>
      <div data-widget="spring-shm"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 0.50 kg block on a spring with \(k = 200\) N/m is pulled 0.10 m from equilibrium and released from rest.</p>
        ${solution(String.raw`
          <ol>
        <li><strong>Angular frequency:</strong> \(\omega = \sqrt{200/0.50} = 20\) rad/s.</li>
        <li><strong>Period and frequency:</strong> \(T = 2\pi/20 = 0.31\) s, so \(f = 3.2\) Hz.</li>
        <li><strong>Maximum speed:</strong> \(\omega A = (20)(0.10) = 2.0\) m/s, reached as it passes equilibrium.</li>
        <li><strong>Maximum acceleration:</strong> \(\omega^2 A = (20)^2(0.10) = 40\) m/s², at the ends.</li>
        <li><strong>Position at \(t = 0.050\) s:</strong> it starts from rest at \(+A\), so \(\phi = 0\) and \(x = 0.10\cos(20 \times 0.050) = 0.10\cos(1.0\text{ rad}) = 0.054\) m.</li>
      </ol>`)}
      </div>
      <div class="callout warn">In step 5, the angle \(\omega t\) is in <strong>radians</strong>. Leaving your calculator in degree mode is the most common way to lose points on SHM problems.</div>`,
  },

  {
    id: "energy",
    title: "Energy in simple harmonic motion",
    minutes: 10,
    interactives: ["SHM energy well"],
    body: String.raw`
      <p>A mass on a frictionless spring trades energy back and forth between motion and stretch, but the total never changes. That makes energy the fastest way to answer most "how fast is it moving at this position?" questions.</p>

      <h2>Total energy is constant</h2>
      $$E = \tfrac{1}{2}mv^2 + \tfrac{1}{2}kx^2 = \tfrac{1}{2}kA^2$$
      <ul>
        <li><strong>At the ends (\(x = \pm A\)):</strong> the mass is momentarily at rest, so all the energy is stored in the spring: \(E = \tfrac12 kA^2\).</li>
        <li><strong>At equilibrium (\(x = 0\)):</strong> the spring is relaxed, so all the energy is kinetic: \(E = \tfrac12 mv_{\max}^2\).</li>
      </ul>
      <p>This is the energy diagram from Unit 7 come to life: a U-shaped potential curve, with the mass rocking between turning points at \(\pm A\).</p>

      <h2>Speed at any position</h2>
      <p>Solving the energy equation for \(v\) gives a handy formula:</p>
      $$v = \pm\,\omega\sqrt{A^2 - x^2}$$
      <p>It's zero at \(x = \pm A\) and largest, \(\omega A\), at \(x = 0\). The \(\pm\) reflects that the mass passes each position twice per cycle, once in each direction.</p>
      <h3>See it: the energy well</h3>
      <p class="muted">Drag the position slider or press play. The bars show how the fixed total splits between kinetic and spring energy. The dashed marks show where the two are equal: not halfway out, but at \(A/\sqrt2\).</p>
      <div data-widget="shm-energy"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>Use the block from the previous lesson: \(m = 0.50\) kg, \(k = 200\) N/m, \(A = 0.10\) m.</p>
        ${solution(String.raw`
          <ol>
        <li><strong>Total energy:</strong> \(E = \tfrac12(200)(0.10)^2 = 1.0\) J.</li>
        <li><strong>Speed at \(x = 0.060\) m:</strong> the spring holds \(\tfrac12(200)(0.060)^2 = 0.36\) J. The rest is kinetic: \(\tfrac12(0.50)v^2 = 1.0 - 0.36 = 0.64\) J, so \(v = 1.6\) m/s.</li>
        <li><strong>Check with the formula:</strong> \(v = 20\sqrt{0.10^2 - 0.060^2} = 20 \times 0.080 = 1.6\) m/s. It matches.</li>
        <li><strong>Where are kinetic and potential energy equal?</strong> When \(\tfrac12 kx^2 = \tfrac12 E\), so \(x = A/\sqrt2 = 0.071\) m. Not halfway out (0.050 m), because potential energy grows as \(x^2\).</li>
      </ol>`)}
      </div>

      <h2>Finding the amplitude from a push</h2>
      <p>Energy also works backward. If the same block sits at equilibrium and gets a kick to 3.0 m/s, all of that kinetic energy ends up in the spring at the turning point:</p>
      $$\tfrac12 mv^2 = \tfrac12 kA^2 \quad\Rightarrow\quad A = \frac{v}{\omega} = \frac{3.0}{20} = 0.15\text{ m}$$
      <p class="muted">Try it: press "Kick from equilibrium" in the model above.</p>`,
  },

  {
    id: "applications",
    title: "Vertical springs and other applications",
    minutes: 10,
    interactives: ["Hanging spring", "Spring scale in orbit"],
    body: String.raw`
      <p>SHM shows up far beyond a block sliding on a table. The same math describes hanging springs, twisting wires, and even vibrating molecules.</p>

      <h2>A vertical spring</h2>
      <p>Hang a mass from a spring, and gravity stretches it to a new equilibrium where the spring force balances the weight:</p>
      $$k\,\Delta\ell = mg \quad\Rightarrow\quad \Delta\ell = \frac{mg}{k}$$
      <p>The good news: <strong>gravity only shifts the center of the oscillation.</strong> Measured from the new equilibrium, the mass oscillates in SHM with the same \(\omega = \sqrt{k/m}\) and the same period as on a horizontal surface. Just measure \(x\) and \(A\) from the hanging equilibrium, not from the spring's relaxed length.</p>
      <h3>See it: same period, shifted center</h3>
      <p class="muted">Pull the mass down and let go. It bounces symmetrically about the hanging equilibrium (orange), not the relaxed length (gray). Switch gravity off, Moon, or Earth: the center moves, but the period doesn't.</p>
      <div data-widget="vertical-spring"></div>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 0.40 kg mass hangs from a spring with \(k = 40\) N/m. Find its stretch at equilibrium and its period.</p>
        ${solution(String.raw`
          <ol>
        <li><strong>Stretch at equilibrium:</strong> \(\Delta\ell = (0.40)(9.80)/40 = 0.098\) m.</li>
        <li><strong>Period if you pull it down and release it:</strong> \(T = 2\pi\sqrt{0.40/40} = 0.63\) s, no matter how far you pull it (within the spring's limits).</li>
          </ol>`)}
      </div>

      <h2>Measuring mass with a spring</h2>
      <p>Since \(T = 2\pi\sqrt{m/k}\), timing an oscillation reveals the mass, even where nothing has weight. That's useful in orbit, where astronauts float and a bathroom scale reads zero.</p>
      $$m = \frac{kT^2}{4\pi^2}$$
      <p><strong>Example.</strong> A person attached to a spring with \(k = 600\) N/m oscillates with a 2.0 s period: \(m = (600)(2.0)^2/(4\pi^2) = 61\) kg.</p>
      <div data-widget="space-scale"></div>

      <h2>Angular SHM</h2>
      <p>A disk hanging from a twisted wire (a <strong>torsion pendulum</strong>) feels a restoring <strong>torque</strong> proportional to its twist angle: \(\tau = -\kappa\theta\), where \(\kappa\) is the wire's torsion constant. Using Unit 10's \(\sum\tau = I\alpha\) gives the same math with rotational symbols:</p>
      $$\omega = \sqrt{\frac{\kappa}{I}}$$
      <p>A mechanical watch's balance wheel works this way.</p>

      <h2>Why SHM is everywhere</h2>
      <p>Near the bottom of any potential-energy valley (Unit 7's stable equilibrium), the curve looks like a parabola, \(\tfrac12 kx^2\). So <strong>almost any system nudged slightly from stable equilibrium oscillates in SHM.</strong> That includes atoms vibrating in a molecule, a boat bobbing on water, and a building swaying in the wind.</p>`,
  },

  {
    id: "simple-pendulum",
    title: "The simple pendulum",
    minutes: 12,
    interactives: ["Pendulum lab", "Pendulum race", "Measure g", "Spring or pendulum?"],
    body: String.raw`
      <p>A simple pendulum is an idealized model: a point mass \(m\) on a massless string of length \(L\), swinging under gravity. It isn't exactly SHM, but for small swings it comes extremely close.</p>

      <h2>Where the restoring force comes from</h2>
      <p>When the pendulum is pulled to an angle \(\theta\), gravity's component along the arc pulls it back:</p>
      $$F = -mg\sin\theta$$
      <p>That's not proportional to the displacement, so it isn't exactly SHM. But for small angles, \(\sin\theta \approx \theta\) (in radians). Then the force is proportional to the displacement along the arc, and the pendulum behaves like a spring. The approximation is excellent up to about 15°.</p>

      <h2>The period</h2>
      $$\omega = \sqrt{\frac{g}{L}} \qquad T = 2\pi\sqrt{\frac{L}{g}}$$
      <p>Two surprises worth remembering:</p>
      <ul>
        <li><strong>The mass doesn't matter.</strong> A heavy and a light bob on the same string swing together, for the same reason that everything falls at the same rate.</li>
        <li><strong>For small swings, the amplitude doesn't matter either.</strong> A 5° swing and a 10° swing take the same time. For large angles, the period gets slightly longer, so the small-angle formula no longer applies.</li>
      </ul>
      <h3>See it: the pendulum lab</h3>
      <p class="muted">The solid pendulum follows the exact equation; the faint one follows the small-angle formula. At small amplitudes they stay together. Crank the amplitude past about 30° and watch the real one fall behind.</p>
      <div data-widget="pendulum-lab"></div>
      <h3>See it: what does and doesn't change the period</h3>
      <p class="muted">Two pendulums side by side. Change one bob's mass or its small amplitude: they stay in step. Change its length: they drift apart.</p>
      <div data-widget="pendulum-race"></div>

      <h2>Worked examples</h2>
      <p><strong>A 1.0 m pendulum on Earth:</strong></p>
      $$T = 2\pi\sqrt{\frac{1.0}{9.80}} = 2.0\ \text{s}$$
      <p><strong>The same pendulum on the Moon,</strong> where \(g = 1.62\) m/s²: \(T = 2\pi\sqrt{1.0/1.62} = 4.9\) s. Weaker gravity means a slower swing.</p>
      <p><strong>Measuring g.</strong> A 0.50 m pendulum is timed at 1.42 s per swing cycle. Solving the period formula for \(g\):</p>
      $$g = \frac{4\pi^2 L}{T^2} = \frac{4\pi^2(0.50)}{(1.42)^2} = 9.8\ \text{m/s}^2$$
      <p>This is a classic lab experiment, and a reminder that a pendulum clock runs at a different rate at different elevations, where \(g\) is slightly different.</p>
      <div data-widget="measure-g"></div>

      <h2>Pendulum vs. spring</h2>
      <div class="callout warn">A spring's period depends on the <strong>mass</strong> but not on gravity. A pendulum's period depends on <strong>gravity</strong> but not on the mass. Swapping those two is a favorite multiple-choice trap.</div>
      <div data-widget="period-trap"></div>`,
  },

  {
    id: "physical-pendulum",
    title: "The physical pendulum",
    minutes: 10,
    interactives: ["Swinging rod"],
    body: String.raw`
      <p>Real pendulums aren't point masses on weightless strings. A swinging rod, a leg, or a door on a hinge is a <strong>physical pendulum</strong>: a rigid object swinging about a pivot. Analyzing it uses Unit 10's torque and Unit 9's moment of inertia.</p>

      <h2>The restoring torque</h2>
      <p>Gravity acts at the object's center of mass, a distance \(d\) from the pivot. When the object swings to angle \(\theta\), gravity produces a torque pulling it back:</p>
      $$\tau = -mgd\sin\theta \approx -mgd\,\theta \quad (\text{small angles})$$
      <p>Combining this with \(\sum\tau = I\alpha\) gives SHM with:</p>
      $$\omega = \sqrt{\frac{mgd}{I}} \qquad T = 2\pi\sqrt{\frac{I}{mgd}}$$
      <p>Here \(I\) is the moment of inertia <strong>about the pivot</strong>, often found with the parallel-axis theorem from Unit 9.</p>
      <p><strong>Check it on a simple pendulum.</strong> A point mass at distance \(L\) has \(I = mL^2\) and \(d = L\). Then \(T = 2\pi\sqrt{mL^2/(mgL)} = 2\pi\sqrt{L/g}\), the simple pendulum formula. The physical pendulum is the general case.</p>

      <div class="example">
        <div class="example-label">Worked example: a swinging rod</div>
        <p>A uniform 1.0 m rod swings from a pivot at one end. Find its period for small swings.</p>
        ${solution(String.raw`
          <ol>
        <li><strong>Moment of inertia about the end:</strong> \(I = \tfrac13 ML^2\) (from Unit 9's table).</li>
        <li><strong>Distance to the center of mass:</strong> \(d = L/2\).</li>
        <li><strong>Period:</strong> the mass cancels:
              $$T = 2\pi\sqrt{\frac{\tfrac{1}{3}ML^2}{Mg\,(L/2)}} = 2\pi\sqrt{\frac{2L}{3g}} = 2\pi\sqrt{\frac{2(1.0)}{3(9.80)}} = 1.6\ \text{s}$$</li>
          </ol>`)}
      </div>
      <p>A 1.0 m simple pendulum has a 2.0 s period, but the rod swings faster. Much of its mass sits close to the pivot, which makes it act like a shorter simple pendulum.</p>
      <h3>See it: move the pivot</h3>
      <p class="muted">Slide the pivot along a uniform rod. The model uses the parallel-axis theorem for I, shows the equivalent simple pendulum beside it, and plots the period against pivot position. Notice the period shoots up as the pivot nears the center.</p>
      <div data-widget="physical-pendulum"></div>

      <h2>A real-world application: walking</h2>
      <p>Your leg swings forward like a physical pendulum. Treating a 0.90 m leg as a uniform rod gives \(T = 2\pi\sqrt{2(0.90)/(3 \times 9.80)} \approx 1.6\) s. That's close to the natural rhythm of a comfortable walking stride, which is why walking faster than your natural pace takes noticeably more effort.</p>`,
  },

  {
    id: "damped-forced",
    title: "Damped and forced oscillations, and resonance",
    minutes: 10,
    interactives: ["Damped oscillator", "Resonance"],
    body: String.raw`
      <p>Ideal SHM would go on forever. Real oscillations lose energy to friction and air resistance, and many are pushed by outside forces. These ideas are usually tested <strong>conceptually</strong>, so focus on what happens and why.</p>

      <h2>Damped oscillations</h2>
      <p>A damping force, like air drag or a shock absorber, removes mechanical energy (Unit 7's nonconservative work). The simplest model is a force proportional to velocity, \(F = -bv\), where \(b\) is the damping constant. For light damping, the amplitude shrinks exponentially:</p>
      $$A(t) = A_0\,e^{-(b/2m)t}$$
      <p>The oscillation also slows down slightly, with a lower angular frequency than the undamped \(\sqrt{k/m}\).</p>
      <p><strong>Example.</strong> If \(b/2m = 0.10\ \text{s}^{-1}\), then after 10 s the amplitude has dropped by a factor of \(e^{-1}\), to about <strong>37%</strong> of its starting value.</p>

      <h2>Three levels of damping</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Type</th><th>What happens</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>Underdamped</td><td>Oscillates while the amplitude slowly shrinks</td><td>A playground swing left alone</td></tr>
          <tr><td>Critically damped</td><td>Returns to equilibrium as fast as possible, with no oscillation</td><td>A well-designed car suspension</td></tr>
          <tr><td>Overdamped</td><td>Returns slowly, with no oscillation</td><td>A door closer on a heavy door</td></tr>
        </tbody>
      </table>
      <p>Car shock absorbers are designed near <strong>critical damping</strong>: hit a bump, and the car settles quickly instead of bouncing up and down.</p>
      <h3>See it: turn up the damping</h3>
      <p class="muted">Slide the damping from none to heavy. The dashed envelope is \(A_0e^{-(b/2m)t}\). The buttons jump to each of the three regimes.</p>
      <div data-widget="damped-oscillator"></div>

      <h2>Forced oscillations</h2>
      <p>A periodic outside force can keep an oscillator going. The system ends up oscillating at the <strong>driving frequency</strong>, not its own natural frequency. How large the motion gets depends on how close those two frequencies are.</p>

      <h2>Resonance</h2>
      <p>When the driving frequency matches the system's <strong>natural frequency</strong>, the amplitude becomes very large. This is <strong>resonance</strong>. Each push adds energy at exactly the right moment, so the energy builds up cycle after cycle.</p>
      <ul>
        <li><strong>Pushing a swing:</strong> push once per swing, in time with its motion, and small pushes build a big swing. Push at random times, and little happens.</li>
        <li><strong>A singer shattering a glass:</strong> a note matched to the glass's natural frequency can make it vibrate until it breaks.</li>
        <li><strong>Engineering:</strong> buildings, bridges, and machines are designed so that everyday forces, like footsteps, wind, or engine vibrations, don't match their natural frequencies.</li>
      </ul>
      <p>Damping limits resonance. The less damping a system has, the taller and sharper its resonance peak, which is why lightly damped structures need the most careful design.</p>
      <h3>See it: tune the driver</h3>
      <p class="muted">Sweep the driving frequency across the natural frequency and watch the steady-state amplitude on the response curve. Lower the damping and the peak gets taller and narrower.</p>
      <div data-widget="resonance"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes and practice problems",
    minutes: 22,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 13 errors are about where things are largest, and which quantities do or don't affect the period. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Calling the full side-to-side distance the amplitude.</strong> Amplitude is measured from equilibrium.</li>
        <li><strong>Leaving the calculator in degrees</strong> for \(x = A\cos(\omega t + \phi)\). The angle is in radians.</li>
        <li><strong>Thinking the speed is largest at the ends.</strong> It's largest at equilibrium; the acceleration is largest at the ends.</li>
        <li><strong>Mixing up \(f\) and \(\omega\).</strong> \(\omega = 2\pi f\), so they differ by a factor of about 6.</li>
        <li><strong>Thinking a pendulum's period depends on its mass,</strong> or a spring's period depends on \(g\). It's the reverse.</li>
        <li><strong>Using the simple pendulum formula</strong> for large angles or for a swinging rigid object.</li>
        <li><strong>Measuring a vertical spring's oscillation from its relaxed length</strong> instead of from the hanging equilibrium.</li>
      </ul>

      <h2>Key formulas</h2>
      $$f = \frac{1}{T} \qquad \omega = 2\pi f \qquad x(t) = A\cos(\omega t + \phi) \qquad v_{\max} = \omega A \qquad a_{\max} = \omega^2 A$$
      $$\text{Spring: } \omega = \sqrt{\frac{k}{m}} \qquad E = \tfrac{1}{2}kA^2 \qquad v = \pm\,\omega\sqrt{A^2 - x^2}$$
      $$\text{Simple pendulum: } T = 2\pi\sqrt{\frac{L}{g}} \qquad \text{Physical pendulum: } T = 2\pi\sqrt{\frac{I}{mgd}}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A pendulum completes 30 cycles in 45 s. Find its period, frequency, and angular frequency.</p>
          <div data-widget="answer-check" data-answer="1.5" data-label="T" data-unit="s"></div>
          <div data-widget="answer-check" data-answer="0.67" data-label="f" data-unit="Hz"></div>
          <div data-widget="answer-check" data-answer="4.2" data-label="ω" data-unit="rad/s"></div>
          ${solution("T = 45/30 = <strong>1.5 s</strong>. f = 1/1.5 = <strong>0.67 Hz</strong>. ω = 2π(0.67) = <strong>4.2 rad/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 2.0 kg mass on a spring with k = 50 N/m oscillates with an amplitude of 0.20 m. Find ω, the period, the maximum speed, the maximum acceleration, and the total energy.</p>
          <div data-widget="answer-check" data-answer="5.0" data-label="ω" data-unit="rad/s"></div>
          <div data-widget="answer-check" data-answer="1.3" data-tol="0.04" data-label="T" data-unit="s"></div>
          <div data-widget="answer-check" data-answer="1.0" data-label="v_max" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="5.0" data-label="a_max" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="1.0" data-label="E" data-unit="J"></div>
          ${solution("ω = √(50/2.0) = <strong>5.0 rad/s</strong>. T = 2π/5.0 = <strong>1.3 s</strong>. v_max = (5.0)(0.20) = <strong>1.0 m/s</strong>. a_max = (5.0)²(0.20) = <strong>5.0 m/s²</strong>. E = ½(50)(0.20)² = <strong>1.0 J</strong>.")}
        </li>
        <li class="problem">
          <p>For the oscillator in problem 2, how fast is the mass moving at x = 0.12 m?</p>
          <div data-widget="answer-check" data-answer="0.80" data-label="v" data-unit="m/s"></div>
          ${solution("v = 5.0√(0.20² − 0.12²) = 5.0(0.16) = <strong>0.80 m/s</strong>. You can check it in the energy-well model.")}
        </li>
        <li class="problem">
          <p>If the mass on a spring is quadrupled, what happens to the period? Give the new period divided by the old one.</p>
          <div data-widget="answer-check" data-answer="2" data-label="T_new / T_old"></div>
          ${solution("T ∝ √m, so the period <strong>doubles</strong>.")}
        </li>
        <li class="problem">
          <p>How long must a simple pendulum be to have a period of 1.0 s?</p>
          <div data-widget="answer-check" data-answer="0.25" data-label="L" data-unit="m"></div>
          ${solution("L = gT²/(4π²) = (9.80)(1.0)²/(4π²) = <strong>0.25 m</strong>.")}
        </li>
        <li class="problem">
          <p>A spring oscillator and a pendulum are both taken to the Moon (g = 1.62 m/s²). What happens to each period? Give the factor by which the pendulum's period changes.</p>
          <div data-widget="answer-check" data-answer="2.5" data-label="T_Moon / T_Earth (pendulum)"></div>
          ${solution("The spring's period is <strong>unchanged</strong> (it doesn't depend on g). The pendulum's period gets <strong>longer</strong>, by a factor of √(9.80/1.62) ≈ <strong>2.5</strong>.")}
        </li>
        <li class="problem">
          <p>A 0.30 kg mass stretches a vertical spring 0.12 m at equilibrium. Find the spring constant and the oscillation period.</p>
          <div data-widget="answer-check" data-answer="24.5" data-label="k" data-unit="N/m"></div>
          <div data-widget="answer-check" data-answer="0.70" data-label="T" data-unit="s"></div>
          ${solution("k = mg/Δℓ = (0.30)(9.80)/0.12 = <strong>24.5 N/m</strong>. T = 2π√(0.30/24.5) = <strong>0.70 s</strong>.")}
        </li>
        <li class="problem">
          <p>A 1.0 m meter stick swings from a pivot 0.25 m from one end. Find its period for small swings.</p>
          <div data-widget="answer-check" data-answer="1.5" data-tol="0.03" data-label="T" data-unit="s"></div>
          ${solution("The pivot is d = 0.25 m from the center. Parallel-axis theorem: I = (1/12)M(1.0)² + M(0.25)² = 0.146M. T = 2π√(0.146/(9.80 × 0.25)) = <strong>1.5 s</strong>. Set the pivot to 0.25 m in the swinging-rod model to check it.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

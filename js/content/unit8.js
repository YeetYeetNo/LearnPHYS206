// ============================================================
// UNIT 8 LESSONS: Momentum, Impulse, and Collisions (Chapter 8)
// Source: "PHYS 206 Unit 8 Study Guide" (Nov 4, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit8Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 8 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 8 of PHYS 206 is Chapter 8 of the course textbook, momentum, impulse, and collisions, taught in week 8 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It starts the material for <strong>Exam III</strong>, which covers Chapters 8–11.</p>
      <p>Energy, from Units 6 and 7, solves many problems, but it struggles with collisions. When two cars crash, forces are huge, last a split second, and turn energy into heat and crumpled metal. You usually can't track them.</p>
      <p>This unit gives you a new conserved quantity that handles collisions easily: <strong>momentum</strong>. When objects interact only with each other, their total momentum stays the same, no matter how violent the interaction.</p>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Calculate momentum and impulse, and use the impulse-momentum theorem</li>
        <li>Apply conservation of momentum to collisions, explosions, and recoil</li>
        <li>Solve inelastic and perfectly inelastic collisions, in one and two dimensions</li>
        <li>Solve elastic collisions in one dimension</li>
        <li>Find the center of mass of a system and describe how it moves</li>
      </ul>
      <div class="callout"><strong>The key question for every collision problem:</strong> is kinetic energy conserved? Momentum always is (for an isolated system); kinetic energy is conserved only in elastic collisions.</div>`,
  },

  {
    id: "momentum-impulse",
    title: "Momentum and impulse",
    minutes: 12,
    interactives: ["Impulse as an area", "Why airbags work"],
    body: String.raw`
      <p>Momentum measures how hard it is to stop something. A slow truck and a fast baseball can both be hard to stop, for different reasons. Momentum combines mass and velocity into one quantity.</p>

      <h2>Momentum</h2>
      $$\vec{p} = m\vec{v}$$
      <p>Momentum is a <strong>vector</strong>, pointing the same way as the velocity. Its units are kg·m/s. Because it's a vector, signs and directions matter. This is the biggest difference from kinetic energy, which is a scalar.</p>
      <p>Newton actually wrote his second law in terms of momentum: the net force equals the rate of change of momentum.</p>
      $$\sum \vec{F} = \frac{d\vec{p}}{dt}$$
      <p>For a constant mass, this is the familiar ΣF = ma.</p>

      <h2>Impulse</h2>
      <p>Impulse measures the effect of a force over a period of time. For a constant net force acting for a time Δt:</p>
      $$\vec{J} = \sum \vec{F}\,\Delta t$$
      <p>If the force varies, as in nearly every collision, impulse is the integral of force over time, which equals <strong>the area under the F-t graph</strong>. Its units are N·s, the same as kg·m/s.</p>

      <h2>The impulse-momentum theorem</h2>
      $$\vec{J} = \Delta\vec{p} = \vec{p}_2 - \vec{p}_1$$
      <p>The impulse on an object equals its change in momentum. This parallels the work-energy theorem from Unit 6: work changes kinetic energy, impulse changes momentum.</p>

      <div class="example">
        <div class="example-label">Worked example 1: hitting a baseball</div>
        <p>A 0.145 kg baseball arrives at the bat at 40 m/s and leaves at 50 m/s in the opposite direction. The bat is in contact for 1.5 ms. Find the impulse and the average force.</p>
        ${solution(String.raw`
          <ol>
            <li>Take the outgoing direction as +x. Then v₁ = −40 m/s and v₂ = +50 m/s.</li>
            <li>Impulse: J = m(v₂ − v₁) = (0.145)(50 − (−40)) = (0.145)(90) = <strong>13 kg·m/s</strong>.</li>
            <li>Average force: F = J/Δt = 13.05 / 0.0015 = <strong>8700 N</strong>.</li>
          </ol>
          <p>The ball reverses direction, so its speed change is 90 m/s, not 10 m/s. Missing that sign is the most common impulse mistake.</p>`)}
      </div>
      <h3>See it: impulse is the area under F-t</h3>
      <p class="muted">The shaded pulse is the bat's force on the ball. Its area is the impulse, and the dashed rectangle with the same area gives the average force. Turn on "forget the sign" to see the classic mistake.</p>
      <div data-widget="impulse-ft"></div>

      <div class="example">
        <div class="example-label">Worked example 2: why airbags work</div>
        <p>A 70 kg driver moving at 15 m/s has to stop in a crash. Compare the force from hitting the dashboard (stopping in 0.010 s) with hitting an airbag (stopping in 0.15 s).</p>
        ${solution(String.raw`
          <p>The momentum change, (70)(15) = 1050 kg·m/s, is fixed. Only the stopping time can change:</p>
          <ul>
            <li><strong>Hitting the dashboard, stopping in 0.010 s:</strong> F = 1050 / 0.010 = <strong>105,000 N</strong>.</li>
            <li><strong>Hitting an airbag, stopping in 0.15 s:</strong> F = 1050 / 0.15 = <strong>7000 N</strong>.</li>
          </ul>
          <p>Same impulse, fifteen times less force. Crumple zones, padded gym floors, and bending your knees when you land all work the same way: they stretch out the time.</p>`)}
      </div>
      <h3>See it: same area, different shape</h3>
      <div data-widget="airbag"></div>`,
  },

  {
    id: "conservation",
    title: "Conservation of momentum",
    minutes: 10,
    interactives: ["Push-apart and recoil model"],
    body: String.raw`
      <div class="callout"><strong>This is the most important idea in the unit.</strong> If the net external force on a system is zero, the total momentum of the system stays constant.</div>
      $$\vec{P}_{\text{total}} = \vec{p}_A + \vec{p}_B + \cdots = \text{constant}$$

      <h2>Why it works: internal forces cancel</h2>
      <p>When two objects push on each other, Newton's third law says the forces are equal and opposite. So the impulse A gives B is exactly canceled by the impulse B gives A. Whatever momentum one gains, the other loses.</p>
      <p>That's why you need to define a <strong>system</strong>. Forces between objects inside the system are <strong>internal</strong> and cancel out. Only <strong>external</strong> forces, from things outside the system, can change the total momentum.</p>

      <h2>When can you use it?</h2>
      <ul>
        <li><strong>Isolated systems:</strong> no external forces, or external forces that cancel (like weight and normal force on a level surface).</li>
        <li><strong>Brief collisions and explosions:</strong> even if friction or gravity acts, the collision forces are so much larger and so brief that the external forces barely matter during the impact. Treat momentum as conserved from just before to just after.</li>
      </ul>
      <p>Momentum is a vector, so it's conserved <strong>separately in each direction</strong>: total pₓ is constant, and total pᵧ is constant.</p>

      <div class="example">
        <div class="example-label">Worked example: two skaters push apart</div>
        <p>A 60 kg skater and a 40 kg skater stand still on frictionless ice, then push off each other. The 40 kg skater slides away at 3.0 m/s. How fast does the 60 kg skater move?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>System:</strong> both skaters. The push is internal; weight and normal forces cancel. So momentum is conserved.</li>
            <li><strong>Before:</strong> both at rest, so the total momentum is zero.</li>
            <li><strong>After:</strong> total momentum must still be zero. Take the 40 kg skater's direction as +x:
              $$0 = (40)(3.0) + (60)\,v \quad\Rightarrow\quad v = -2.0\ \text{m/s}$$</li>
          </ol>
          <p>The 60 kg skater moves at <strong>2.0 m/s in the opposite direction</strong>. The heavier skater moves slower, so their momenta are equal in size and cancel.</p>`)}
      </div>
      <h3>Try it: push apart</h3>
      <p class="muted">Set the masses and how fast the right-hand object leaves. The momentum bars always cancel, and the center of mass (the ✕) never moves.</p>
      <div data-widget="push-apart"></div>

      <h2>Recoil works the same way</h2>
      <p>A gun firing a bullet, a rocket pushing out exhaust, and you stepping off a small boat are all the same problem: something starting at rest splits into pieces whose momenta add up to zero. Try the boat preset in the model above.</p>`,
  },

  {
    id: "inelastic",
    title: "Inelastic collisions",
    minutes: 14,
    interactives: ["1D collision lab", "2D intersection crash", "Ballistic pendulum"],
    body: String.raw`
      <p>In every collision of an isolated system, momentum is conserved. What separates the types of collision is what happens to kinetic energy.</p>

      <h2>The three types of collision</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Type</th><th>Momentum</th><th>Kinetic energy</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>Elastic</td><td>Conserved</td><td>Conserved</td><td>Billiard balls (nearly)</td></tr>
          <tr><td>Inelastic</td><td>Conserved</td><td>Some lost</td><td>A car bumper crumpling and bouncing back</td></tr>
          <tr><td>Perfectly inelastic</td><td>Conserved</td><td>Most lost; the objects stick together</td><td>Two train cars coupling</td></tr>
        </tbody>
      </table>
      <p>The "lost" kinetic energy becomes heat, sound, and bent material, as in Unit 7's internal energy.</p>

      <h2>Perfectly inelastic collisions</h2>
      <p>When the objects stick together, they share one final velocity. Conservation of momentum gives it directly:</p>
      $$m_A v_{A1} + m_B v_{B1} = (m_A + m_B)\,v_2$$
      <div class="example">
        <div class="example-label">Worked example 1: a rear-end collision</div>
        <p>A 1200 kg car moving at 20 m/s rear-ends an 800 kg car moving at 10 m/s in the same direction. The cars lock together. Find their speed afterward and the kinetic energy lost.</p>
        ${solution(String.raw`
          <ol>
            <li>Momentum before: (1200)(20) + (800)(10) = 32,000 kg·m/s.</li>
            <li>After: (2000)v₂ = 32,000, so <strong>v₂ = 16 m/s</strong>.</li>
            <li>Kinetic energy before: ½(1200)(20)² + ½(800)(10)² = 280,000 J. After: ½(2000)(16)² = 256,000 J.</li>
            <li>Lost: <strong>24,000 J</strong>, turned into heat and crumpled metal.</li>
          </ol>`)}
      </div>
      <h3>Try it: the collision lab</h3>
      <p class="muted">The "bounciness" slider runs from perfectly inelastic (0, they stick) to elastic (1). Momentum before and after always match; watch what happens to kinetic energy as you change it.</p>
      <div data-widget="collision-1d" data-preset="rear-end"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a two-dimensional collision</div>
        <p>At an intersection, a 1500 kg car heading east at 20 m/s collides with a 2500 kg truck heading north at 12 m/s. They stick together. Find their velocity just after the crash.</p>
        ${solution(String.raw`
          <p>Conserve each component separately:</p>
          <ol>
            <li><strong>East (x):</strong> only the car moved east. (1500)(20) = (4000)vₓ, so vₓ = 7.5 m/s.</li>
            <li><strong>North (y):</strong> only the truck moved north. (2500)(12) = (4000)vᵧ, so vᵧ = 7.5 m/s.</li>
            <li><strong>Combine:</strong> v = √(7.5² + 7.5²) = <strong>10.6 m/s</strong>, at tan⁻¹(7.5/7.5) = <strong>45° north of east</strong>.</li>
          </ol>`)}
      </div>
      <h3>See it: momentum adds as vectors</h3>
      <div data-widget="collision-2d"></div>

      <div class="example">
        <div class="example-label">Worked example 3: the ballistic pendulum</div>
        <p>A 0.010 kg bullet moving at 300 m/s embeds in a 2.0 kg wooden block hanging from strings. How high does the block swing?</p>
        ${solution(String.raw`
          <p>This takes two steps, because the physics changes partway through:</p>
          <ol>
            <li><strong>The collision (momentum, not energy):</strong> (0.010)(300) = (2.010)v, so v = 1.49 m/s. Energy isn't conserved here, because the bullet tearing into the wood creates heat.</li>
            <li><strong>The swing (energy, from Unit 7):</strong> ½v² = gh, so h = (1.49)² / (2 × 9.80) = <strong>0.11 m</strong>.</li>
          </ol>
          <p>Using energy for the collision step is a classic mistake. Use momentum during the collision, then energy after it.</p>`)}
      </div>
      <h3>See it: momentum for the hit, energy for the swing</h3>
      <div data-widget="ballistic-pendulum"></div>`,
  },

  {
    id: "elastic",
    title: "Elastic collisions",
    minutes: 12,
    interactives: ["1D collision lab (elastic)", "Mass-ratio explorer"],
    body: String.raw`
      <p>In an elastic collision, objects bounce off each other with no kinetic energy lost. Both momentum and kinetic energy are conserved, so you get two equations, which is enough to find both final velocities.</p>

      <h2>The two conservation equations (one dimension)</h2>
      $$m_A v_{A1} + m_B v_{B1} = m_A v_{A2} + m_B v_{B2}$$
      $$\tfrac{1}{2}m_A v_{A1}^2 + \tfrac{1}{2}m_B v_{B1}^2 = \tfrac{1}{2}m_A v_{A2}^2 + \tfrac{1}{2}m_B v_{B2}^2$$
      <p>Solving these together is messy, but there's a shortcut. Combined, they say the two objects separate at the same relative speed they approached with:</p>
      $$v_{B2} - v_{A2} = -(v_{B1} - v_{A1})$$
      <p>Use this relative-velocity equation with the momentum equation. Both are linear, so the algebra is much easier than working with squared velocities.</p>

      <h2>The special case: a target at rest</h2>
      <p>When object A hits object B, which starts at rest, the results are:</p>
      $$v_{A2} = \frac{m_A - m_B}{m_A + m_B}\,v_{A1} \qquad v_{B2} = \frac{2m_A}{m_A + m_B}\,v_{A1}$$
      <p>Three limiting cases are worth knowing by intuition:</p>
      <ul>
        <li><strong>Equal masses:</strong> A stops dead, and B takes off with A's full velocity. The two simply trade velocities, like a cue ball hitting another ball straight on.</li>
        <li><strong>Heavy A hits light B:</strong> A barely slows down, and B shoots off at almost twice A's speed, like a bowling ball hitting a ping-pong ball.</li>
        <li><strong>Light A hits heavy B:</strong> A bounces back at almost its original speed, and B barely moves, like a ball bouncing off a wall.</li>
      </ul>
      <h3>See it: all three cases on one graph</h3>
      <p class="muted">Slide the mass ratio. The curves give each object's final velocity as a fraction of A's starting velocity.</p>
      <div data-widget="elastic-cases"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 0.50 kg cart moving at 3.0 m/s collides elastically with a 1.0 kg cart at rest on a frictionless track. Find both final velocities.</p>
        ${solution(String.raw`
          <ol>
            <li>Cart A: v_A2 = (0.50 − 1.0)/(1.5) × 3.0 = <strong>−1.0 m/s</strong>. It bounces backward.</li>
            <li>Cart B: v_B2 = (2 × 0.50)/(1.5) × 3.0 = <strong>+2.0 m/s</strong>.</li>
            <li>Check momentum: before, (0.50)(3.0) = 1.5. After, (0.50)(−1.0) + (1.0)(2.0) = 1.5. It matches.</li>
            <li>Check kinetic energy: before, ½(0.50)(3.0)² = 2.25 J. After, ½(0.50)(1.0)² + ½(1.0)(2.0)² = 0.25 + 2.0 = 2.25 J. It matches too, so the collision really is elastic.</li>
          </ol>`)}
      </div>
      <h3>Try it: the carts, colliding</h3>
      <div data-widget="collision-1d" data-preset="elastic-carts"></div>`,
  },

  {
    id: "center-of-mass",
    title: "Center of mass",
    minutes: 11,
    interactives: ["Center-of-mass finder", "Exploding firework"],
    body: String.raw`
      <p>The center of mass is the "average position" of a system's mass, weighted by how much mass sits where. It's the single point that moves as if the whole system were concentrated there.</p>

      <h2>Finding the center of mass</h2>
      <p>For a set of point masses:</p>
      $$x_{\text{cm}} = \frac{m_1x_1 + m_2x_2 + \cdots}{m_1 + m_2 + \cdots} = \frac{\sum m_i x_i}{M}$$
      <p>In two or three dimensions, do the same calculation separately for y and z. For symmetric objects of uniform density, like a sphere, a rod, or a disk, the center of mass is at the geometric center.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 2.0 kg mass sits at x = 0, and a 6.0 kg mass sits at x = 4.0 m. Where is the center of mass?</p>
        ${solution(String.raw`
          $$x_{\text{cm}} = \frac{(2.0)(0) + (6.0)(4.0)}{2.0 + 6.0} = \frac{24}{8.0} = 3.0\ \text{m}$$
          <p>The center of mass is closer to the heavier object, three-quarters of the way toward it, because it holds three-quarters of the mass.</p>`)}
      </div>
      <h3>Try it: drag the masses</h3>
      <p class="muted">Drag the masses and change their sizes. The ✕ is the center of mass, always pulled toward the heavier ones.</p>
      <div data-widget="cm-finder"></div>

      <h2>How the center of mass moves</h2>
      <p>The total momentum of a system equals its total mass times the velocity of its center of mass:</p>
      $$\vec{P} = M\vec{v}_{\text{cm}} \qquad \sum \vec{F}_{\text{ext}} = M\vec{a}_{\text{cm}}$$
      <p>The second equation is Newton's second law for a whole system. Only external forces move the center of mass. Internal forces, however violent, can't.</p>

      <h2>Two consequences worth knowing</h2>
      <ul>
        <li><strong>If momentum is conserved, the center of mass moves at constant velocity.</strong> The two skaters from the conservation lesson started at rest. After pushing apart, they fly in opposite directions, but their center of mass stays exactly where it was.</li>
        <li><strong>An exploding firework's center of mass keeps following the original arc.</strong> The explosion is internal, so the pieces scatter, but their center of mass continues along the same parabola the shell was on, as if nothing had happened.</li>
      </ul>
      <h3>See it: the firework</h3>
      <p class="muted">Launch the shell. After it bursts, the fragments fly apart, but the ✕ keeps following the dashed parabola the shell was on.</p>
      <div data-widget="firework-cm"></div>`,
  },

  {
    id: "rockets",
    title: "Rocket propulsion",
    minutes: 7,
    interactives: ["Rocket equation model"],
    body: String.raw`
      <div class="callout warn">The PHYS 206 schedule marks this section with a footnote rather than listing it with the main exam sections, so check your syllabus before spending much time on it. It's a short, neat application of momentum conservation.</div>

      <h2>How a rocket moves</h2>
      <p>A rocket has nothing to push against in space. It moves forward by throwing mass, its exhaust, backward at high speed. The exhaust gains backward momentum, so the rocket gains an equal amount of forward momentum. It's the same recoil idea as the skaters, repeated continuously.</p>
      <p>What makes rockets different is that their <strong>mass keeps decreasing</strong> as fuel burns, so ΣF = ma doesn't apply in its simple form.</p>

      <h2>The key results</h2>
      <p>If the exhaust leaves at speed v_ex relative to the rocket, the thrust (the forward force on the rocket) and the rocket's acceleration in empty space are:</p>
      $$F_{\text{thrust}} = -v_{\text{ex}}\frac{dm}{dt} \qquad a = -\frac{v_{\text{ex}}}{m}\frac{dm}{dt}$$
      <p>Since dm/dt is negative (the rocket loses mass), both come out positive. Integrating gives the rocket's total speed gain as its mass drops from m₀ to m:</p>
      $$v - v_0 = v_{\text{ex}}\ln\frac{m_0}{m}$$
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A rocket's exhaust leaves at 2000 m/s. If the rocket burns fuel until its mass is one-third of its starting mass, how much does its speed increase?</p>
        ${solution(String.raw`<p>Its speed increases by 2000 ln 3 = <strong>2200 m/s</strong>.</p>`)}
      </div>
      <h3>See it: the logarithm is the catch</h3>
      <p class="muted">Burn more fuel and watch the speed gain flatten out. Each extra m/s costs more fuel than the last, which is why real rockets use multiple stages.</p>
      <div data-widget="rocket"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 20,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 8 errors come from treating momentum like a scalar, or conserving kinetic energy when it isn't conserved. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Ignoring direction.</strong> When an object bounces back, its velocity changes sign, so the momentum change is larger than it looks.</li>
        <li><strong>Conserving kinetic energy in an inelastic collision.</strong> Only momentum is conserved there.</li>
        <li><strong>Using energy conservation across a collision,</strong> as in the ballistic pendulum. Use momentum during the impact, energy after.</li>
        <li><strong>Adding 2D momenta as plain numbers.</strong> Conserve x and y separately.</li>
        <li><strong>Applying conservation when a large external force acts</strong> over a long time. The system must be isolated, or the interaction brief.</li>
        <li><strong>Mixing up impulse and force.</strong> Impulse is force times time.</li>
        <li><strong>Thinking the heavier object feels the bigger force</strong> in a collision. Third-law forces are equal; the lighter object just changes velocity more.</li>
      </ul>

      <h2>Key formulas</h2>
      $$\vec{p} = m\vec{v} \qquad \vec{J} = \sum\vec{F}\,\Delta t = \Delta\vec{p} \qquad \sum\vec{F} = \frac{d\vec{p}}{dt}$$
      $$m_A v_{A1} + m_B v_{B1} = m_A v_{A2} + m_B v_{B2} \qquad v_{B2} - v_{A2} = -(v_{B1} - v_{A1}) \ (\text{elastic})$$
      $$x_{\text{cm}} = \frac{\sum m_i x_i}{M} \qquad \vec{P} = M\vec{v}_{\text{cm}} \qquad \sum\vec{F}_{\text{ext}} = M\vec{a}_{\text{cm}}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>What is the momentum of a 1000 kg car moving at 25 m/s?</p>
          <div data-widget="answer-check" data-answer="25000" data-label="p" data-unit="kg·m/s"></div>
          ${solution("p = (1000)(25) = <strong>25,000 kg·m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 0.40 kg soccer ball moving at 10 m/s is kicked straight back at 15 m/s. The kick lasts 0.020 s. Find the impulse and the average force.</p>
          <div data-widget="answer-check" data-answer="10" data-label="J" data-unit="kg·m/s"></div>
          <div data-widget="answer-check" data-answer="500" data-label="F" data-unit="N"></div>
          ${solution("J = (0.40)(15 − (−10)) = <strong>10 kg·m/s</strong>. F = 10 / 0.020 = <strong>500 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 5.0 kg rifle fires a 0.020 kg bullet at 500 m/s. Find the rifle's recoil speed.</p>
          <div data-widget="answer-check" data-answer="2.0" data-label="Recoil speed" data-unit="m/s"></div>
          ${solution("0 = (0.020)(500) + (5.0)v, so the rifle recoils at <strong>2.0 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 3000 kg truck at 10 m/s hits a parked 1000 kg car, and they stick together. Find their speed and the kinetic energy lost.</p>
          <div data-widget="answer-check" data-answer="7.5" data-label="v" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="37500" data-label="KE lost" data-unit="J"></div>
          ${solution("(3000)(10) = (4000)v, so <strong>v = 7.5 m/s</strong>. KE drops from 150,000 J to 112,500 J, so <strong>37,500 J</strong> is lost.")}
        </li>
        <li class="problem">
          <p>A 2.0 kg ball at 4.0 m/s collides elastically and head-on with an identical ball at rest. Find both final velocities.</p>
          <div data-widget="answer-check" data-answer="0" data-label="First ball" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="4.0" data-label="Second ball" data-unit="m/s"></div>
          ${solution("Equal masses trade velocities: the first ball <strong>stops</strong>, and the second moves at <strong>4.0 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 1.0 kg ball at 6.0 m/s collides elastically and head-on with a 3.0 kg ball at rest. Find both final velocities.</p>
          <div data-widget="answer-check" data-answer="-3.0" data-label="v_A" data-unit="m/s"></div>
          <div data-widget="answer-check" data-answer="3.0" data-label="v_B" data-unit="m/s"></div>
          ${solution("v_A = (1.0 − 3.0)/(4.0) × 6.0 = <strong>−3.0 m/s</strong> (it bounces back). v_B = (2.0)/(4.0) × 6.0 = <strong>+3.0 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>Find the center of mass of three masses: 3.0 kg at (0, 0), 1.0 kg at (4.0 m, 0), and 2.0 kg at (0, 3.0 m).</p>
          <div data-widget="answer-check" data-answer="0.67" data-label="x_cm" data-unit="m"></div>
          <div data-widget="answer-check" data-answer="1.0" data-label="y_cm" data-unit="m"></div>
          ${solution("x_cm = (1.0 × 4.0)/6.0 = <strong>0.67 m</strong>. y_cm = (2.0 × 3.0)/6.0 = <strong>1.0 m</strong>.")}
        </li>
        <li class="problem">
          <p>In a perfectly inelastic collision, which is conserved: momentum, kinetic energy, both, or neither?</p>
          ${solution("<strong>Momentum only.</strong> Kinetic energy is lost when the objects stick together.", "Show answer")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

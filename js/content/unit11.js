// ============================================================
// UNIT 11 LESSONS: Equilibrium and Elasticity (Chapter 11)
// Source: "PHYS 206 Unit 11 Study Guide" (Nov 4, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit11Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 11 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 11 of PHYS 206 is Chapter 11 of the course textbook, equilibrium and elasticity. It's the last chapter on <strong>Exam III</strong>, which covers Chapters 8–11 on the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>.</p>
      <p>This unit is about objects that <strong>don't</strong> move: bridges, shelves, ladders, cranes, your own arm holding a weight. Engineers use exactly these methods to make sure buildings stay standing. It has two parts:</p>
      <ul>
        <li><strong>Equilibrium:</strong> combining Unit 5's force balance with Unit 10's torque to find the forces that hold a rigid object still.</li>
        <li><strong>Elasticity:</strong> what happens when those forces stretch, squeeze, or twist the object itself, since no real material is perfectly rigid.</li>
      </ul>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>State and apply both conditions for equilibrium</li>
        <li>Find the center of gravity of an object or a system</li>
        <li>Solve equilibrium problems for seesaws, beams, ladders, and hinged structures</li>
        <li>Calculate stress and strain, and use Young's modulus</li>
        <li>Distinguish tensile, bulk, and shear stress, and elastic from plastic behavior</li>
      </ul>
      <div class="callout"><strong>The single most useful trick in this unit:</strong> choose the point you take torques about so that unknown forces pass through it. Those forces then drop out of the torque equation entirely, often leaving just one unknown.</div>`,
  },

  {
    id: "two-conditions",
    title: "The two conditions for equilibrium",
    minutes: 9,
    interactives: ["Balanced forces that still spin", "Torques about any pivot"],
    body: String.raw`
      <p>In Unit 5, an object was in equilibrium if the forces on it balanced. That was enough for a point. For a real, extended object, it isn't: forces can balance and still spin it.</p>

      <h2>Why one condition isn't enough</h2>
      <p>Push a book on a table with one hand at its left edge, pushing up the page, and the other hand at its right edge, pushing down the page, with equal forces. The net force is zero, so the book doesn't slide. But it rotates. Equal and opposite forces that don't act along the same line create a net torque.</p>
      <h3>See it: ΣF = 0 isn't enough</h3>
      <p class="muted">Slide the two equal, opposite forces apart. As soon as they stop sharing a line, the net force stays zero but a net torque appears.</p>
      <div data-widget="couple-forces"></div>

      <h2>The two conditions</h2>
      <p>A rigid body is in equilibrium only if <strong>both</strong> of these hold:</p>
      $$\text{First condition:}\quad \sum F_x = 0 \quad\text{and}\quad \sum F_y = 0$$
      $$\text{Second condition:}\quad \sum \tau = 0 \quad \text{(about any point)}$$
      <p>The first condition means the center of mass doesn't accelerate. The second means the object doesn't start rotating. Together, they give up to three equations in a 2D problem: one for x, one for y, and one for torque.</p>

      <h2>The key fact: pick any pivot</h2>
      <p>If an object is truly in equilibrium, the net torque is zero about <strong>every</strong> point, not just the real axle or hinge. So you get to choose the point you take torques about.</p>
      <p>That freedom is the most powerful tool in this unit. Choose a point where an unknown force acts. That force has a lever arm of zero, so it vanishes from the torque equation, leaving fewer unknowns to solve for.</p>
      <h3>See it: the torques always cancel</h3>
      <p class="muted">This plank is in equilibrium. Move the pivot anywhere: each force's torque changes, but the total is always zero. Put the pivot on a support and that support's torque disappears.</p>
      <div data-widget="pivot-anywhere"></div>

      <h2>Static equilibrium</h2>
      <p>Most problems in this unit are <strong>static equilibrium</strong>: the object is completely at rest, not moving or rotating at all. Equilibrium also includes moving at constant velocity and spinning at a constant rate, but that's rare in these problems.</p>`,
  },

  {
    id: "center-of-gravity",
    title: "Center of gravity",
    minutes: 9,
    interactives: ["Plank-and-box center of gravity", "Tipping model"],
    body: String.raw`
      <p>Gravity pulls on every bit of an object. To compute its torque, you'd have to add up the torque on every piece, unless you use a shortcut.</p>

      <h2>The shortcut</h2>
      <p>The <strong>center of gravity</strong> is the point where you can treat the object's entire weight as acting. Gravity's total torque about any pivot equals the full weight mg acting at that one point.</p>
      <p>When gravity is the same everywhere across the object, which is true for anything you'll meet in PHYS 206, the center of gravity is the same point as the <strong>center of mass</strong> from Unit 8. So you find it with the same formula:</p>
      $$x_{\text{cg}} = \frac{\sum m_i x_i}{\sum m_i}$$
      <p>For a uniform object, like a uniform beam or board, the center of gravity is at its geometric center. A uniform 4.0 m beam's weight acts 2.0 m from either end.</p>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A uniform 4.0 m plank of mass 20 kg has a 10 kg box sitting 1.0 m from its left end. Where is the center of gravity of the plank plus box?</p>
        ${solution(String.raw`
          <ol>
            <li>The plank's weight acts at its middle, x = 2.0 m from the left end.</li>
            <li>The box sits at x = 1.0 m.</li>
            <li>Combine:
              $$x_{\text{cg}} = \frac{(20)(2.0) + (10)(1.0)}{20 + 10} = \frac{50}{30} = 1.7\ \text{m}$$</li>
          </ol>
          <p>The combined center of gravity shifts from the plank's middle toward the box.</p>`)}
      </div>
      <h3>Try it: move the box</h3>
      <div data-widget="cg-plank"></div>

      <h2>Balance and tipping</h2>
      <p>An object resting on a base stays upright as long as its center of gravity is directly above its base of support. If the center of gravity moves outside the base, gravity's torque tips it over.</p>
      <p>That's why a wide stance keeps you steady, why tall bookcases get bolted to walls, and why a race car sits low to the ground: a low center of gravity and a wide base make tipping harder.</p>
      <h3>See it: tip the box</h3>
      <p class="muted">Tilt the box on its corner. While the center of gravity is above the base, gravity's torque pulls it back. Past the tipping angle, the torque flips and it falls over. Try a tall, narrow box and then a wide, low one.</p>
      <div data-widget="tipping-block"></div>`,
  },

  {
    id: "solving",
    title: "Solving rigid-body equilibrium problems",
    minutes: 12,
    interactives: ["Seesaw balancer", "Plank on two supports"],
    body: String.raw`
      <p>Every equilibrium problem follows the same recipe. The only real decision is where to put the pivot.</p>

      <h2>The strategy</h2>
      <ol>
        <li><strong>Draw an extended free-body diagram.</strong> Unlike a Unit 4 dot diagram, draw the actual object (a beam, a ladder) and attach each force at the exact point where it acts. Location matters for torque.</li>
        <li><strong>Put each weight at its center of gravity.</strong></li>
        <li><strong>Choose your pivot point</strong> where the most unknown forces act, so they drop out of the torque equation.</li>
        <li><strong>Write the torque equation,</strong> Στ = 0, with counterclockwise positive.</li>
        <li><strong>Write the force equations,</strong> ΣFₓ = 0 and ΣFᵧ = 0.</li>
        <li><strong>Solve,</strong> usually starting with the torque equation, since your pivot choice often leaves it with just one unknown.</li>
      </ol>

      <div class="example">
        <div class="example-label">Worked example 1: a seesaw</div>
        <p>A uniform 10 kg seesaw is pivoted at its center. A 30 kg child sits 1.6 m to the left of the pivot. Where must a 40 kg child sit to balance it, and what force does the pivot exert?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Pivot at the center.</strong> The seesaw's own weight and the pivot force both act there, so neither creates a torque.</li>
            <li><strong>Torques:</strong> the left child creates counterclockwise torque, and the right child clockwise. They must cancel:
              $$(30)(9.80)(1.6) - (40)(9.80)\,x = 0 \quad\Rightarrow\quad x = 1.2\ \text{m}$$</li>
            <li><strong>Forces:</strong> the pivot must hold up everything: n = (30 + 40 + 10)(9.80) = <strong>784 N</strong>.</li>
          </ol>
          <p>The heavier child sits <strong>1.2 m</strong> to the right, closer to the pivot. Note that g cancels from the torque equation, so you can balance masses times distances directly.</p>`)}
      </div>
      <h3>Try it: balance the seesaw</h3>
      <p class="muted">Move the children until the net torque is zero. The seesaw tips toward whichever side has more torque, not more weight.</p>
      <div data-widget="seesaw"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a plank on two supports</div>
        <p>A uniform 6.0 m plank with a mass of 40 kg rests on supports at each end. A 60 kg person stands 2.0 m from the left end. Find the force each support exerts.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Pivot at the left support.</strong> That removes its unknown force from the torque equation.</li>
            <li><strong>Torques about the left end:</strong> the right support pushes up 6.0 m away (counterclockwise). The plank's weight acts at its 3.0 m center, and the person stands at 2.0 m (both clockwise):
              $$F_R(6.0) - (40)(9.80)(3.0) - (60)(9.80)(2.0) = 0 \quad\Rightarrow\quad F_R = 392\ \text{N}$$</li>
            <li><strong>Vertical forces:</strong> F_L + F_R = (40 + 60)(9.80) = 980 N, so <strong>F_L = 588 N</strong> and <strong>F_R = 392 N</strong>.</li>
          </ol>
          <p>The support nearer the person carries more of the load, which matches intuition and makes a good final check.</p>`)}
      </div>
      <h3>Try it: walk across the plank</h3>
      <p class="muted">Walk the person from one end to the other and watch the load shift between the supports. The two forces always add up to the total weight.</p>
      <div data-widget="plank-supports"></div>`,
  },

  {
    id: "harder",
    title: "Harder equilibrium problems",
    minutes: 14,
    interactives: ["Ladder against a wall", "Beam with a hinge and cable"],
    body: String.raw`
      <p>Two setups show up on almost every exam: a ladder leaning against a wall, and a beam held out from a wall by a hinge and a cable. Both use the same recipe; the challenge is getting every force and lever arm right.</p>

      <div class="example">
        <div class="example-label">Worked example 1: a ladder against a wall</div>
        <p>A uniform 5.0 m ladder with a mass of 15 kg leans against a frictionless wall. Its base sits 3.0 m from the wall, so its top touches the wall 4.0 m up. Find the force from the wall, the forces from the floor, and the minimum coefficient of static friction to keep it from slipping.</p>
        ${solution(String.raw`
          <p><strong>The forces:</strong></p>
          <ul>
            <li>Weight, 147 N, down at the ladder's midpoint (1.5 m horizontally from the base)</li>
            <li>The wall's normal force n_w, horizontal, at the top (a frictionless wall can't push up or down)</li>
            <li>The floor's normal force n_f, up, at the base</li>
            <li>Static friction f_s, horizontal, at the base, pointing toward the wall</li>
          </ul>
          <p><strong>Steps:</strong></p>
          <ol>
            <li><strong>Pivot at the base.</strong> Both floor forces act there, so they drop out.</li>
            <li><strong>Torques:</strong> n_w acts horizontally 4.0 m above the base, so its lever arm is 4.0 m. The weight acts straight down 1.5 m out from the base, so its lever arm is 1.5 m. They must balance: n_w(4.0) = (147)(1.5), so <strong>n_w = 55 N</strong>.</li>
            <li><strong>Vertical forces:</strong> <strong>n_f = 147 N</strong>, holding up the full weight.</li>
            <li><strong>Horizontal forces:</strong> friction balances the wall: <strong>f_s = 55 N</strong>.</li>
            <li><strong>Minimum friction coefficient:</strong> μₛ = f_s / n_f = 55 / 147 = <strong>0.37</strong>. Any less, and the base slides out.</li>
          </ol>`)}
      </div>
      <p>If a person climbs the ladder, the weight's torque about the base grows, so the ladder needs more friction. That's why ladders tend to slip when you're near the top.</p>
      <h3>Try it: climb the ladder</h3>
      <p class="muted">Send a person up the ladder and watch the friction needed rise. When it passes what the floor can give, the ladder slips.</p>
      <div data-widget="ladder"></div>

      <div class="example">
        <div class="example-label">Worked example 2: a beam with a hinge and a cable</div>
        <p>A uniform 3.0 m beam with a mass of 20 kg sticks out horizontally from a wall, attached by a hinge. A cable runs from the beam's outer end back to the wall, making a 30° angle with the beam. A 50 kg sign hangs from the outer end. Find the cable tension and the hinge force.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Pivot at the hinge.</strong> The hinge force is unknown in both size and direction, so this is the best choice.</li>
            <li><strong>Torques:</strong> the cable's upward part, T sin 30°, acts 3.0 m out. The beam's weight acts at 1.5 m, and the sign's weight at 3.0 m:
              $$T\sin 30^\circ(3.0) = (20)(9.80)(1.5) + (50)(9.80)(3.0) \quad\Rightarrow\quad T = 1180\ \text{N}$$</li>
            <li><strong>Horizontal forces:</strong> the cable pulls the beam toward the wall with T cos 30° = 1020 N, so the hinge must push outward with <strong>1020 N</strong>.</li>
            <li><strong>Vertical forces:</strong> the hinge plus the cable's upward part must hold 70 kg: V + 588 = 686, so the hinge pushes up with <strong>98 N</strong>.</li>
          </ol>
          <p>The cable tension, 1180 N, is almost twice the total weight of the beam and sign. A shallow cable angle has a short effective lever arm, so it needs a lot of tension, the same lesson as the clothesline in Unit 5.</p>`)}
      </div>
      <h3>Try it: change the cable angle</h3>
      <p class="muted">Flatten the cable and the tension shoots up. The hinge force can point in any direction, so the model solves both components.</p>
      <div data-widget="hinge-cable"></div>`,
  },

  {
    id: "stress-strain",
    title: "Stress, strain, and Young's modulus",
    minutes: 10,
    interactives: ["Wire-stretch calculator"],
    body: String.raw`
      <p>So far, objects have been perfectly rigid. Real ones aren't: a steel cable holding a sign stretches a little, and a column holding up a roof squeezes a little. Elasticity describes how much.</p>

      <h2>Stress: how hard the material is pushed or pulled</h2>
      <p>Stress is force spread over area:</p>
      $$\text{Stress} = \frac{F_\perp}{A}$$
      <p>Its unit is the <strong>pascal (Pa)</strong>, where 1 Pa = 1 N/m². Dividing by area makes sense: a thick rope and a thin thread under the same force aren't equally strained. The thin one is much closer to snapping.</p>
      <ul>
        <li><strong>Tensile stress:</strong> pulling, as in a cable or a rope.</li>
        <li><strong>Compressive stress:</strong> pushing, as in a column or a table leg.</li>
      </ul>

      <h2>Strain: how much the material deforms</h2>
      <p>Strain is the fractional change in length:</p>
      $$\text{Strain} = \frac{\Delta L}{L_0}$$
      <p>It has no units. A strain of 0.001 means the object stretched by 0.1% of its original length.</p>

      <h2>Young's modulus</h2>
      <p>For small deformations, stress is proportional to strain. This is Hooke's law from Unit 6, written for materials. The constant of proportionality is <strong>Young's modulus</strong>:</p>
      $$Y = \frac{\text{stress}}{\text{strain}} = \frac{F_\perp / A}{\Delta L / L_0} \quad\Rightarrow\quad \Delta L = \frac{F L_0}{AY}$$
      <p>Y depends only on the material, not its shape. A stiff material has a large Y. Steel's is about 2.0 × 10¹¹ Pa; aluminum's is about 7.0 × 10¹⁰ Pa, so aluminum stretches about three times as much under the same stress.</p>

      <div class="example">
        <div class="example-label">Worked example: a steel wire</div>
        <p>A 50 kg mass hangs from a steel wire 2.0 m long with a cross-sectional area of 4.0 mm². How much does the wire stretch?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Convert the area:</strong> 4.0 mm² = 4.0 × 10⁻⁶ m². Getting this conversion right is half the problem: 1 mm² = 10⁻⁶ m², not 10⁻³.</li>
            <li><strong>Force:</strong> F = (50)(9.80) = 490 N.</li>
            <li><strong>Stress:</strong> 490 / (4.0 × 10⁻⁶) = 1.2 × 10⁸ Pa.</li>
            <li><strong>Stretch:</strong>
              $$\Delta L = \frac{(490)(2.0)}{(4.0\times 10^{-6})(2.0\times 10^{11})} = 1.2\times 10^{-3}\ \text{m} = 1.2\ \text{mm}$$</li>
          </ol>
          <p>A thin wire holding a person-sized weight stretches only about a millimeter, which is why we usually treat cables as rigid.</p>`)}
      </div>
      <h3>Try it: hang a weight on a wire</h3>
      <p class="muted">Pick a material and change the load, length, and thickness. The stretch is drawn magnified, because the real one is tiny. Toggle the area-conversion mistake to see how far off it puts you.</p>
      <div data-widget="wire-stretch"></div>`,
  },

  {
    id: "bulk-shear-plastic",
    title: "Bulk stress, shear stress, and plasticity",
    minutes: 12,
    interactives: ["Shear deck-of-cards model", "Deep-ocean compression", "Stress-strain curve"],
    body: String.raw`
      <p>Tension and compression stretch or squeeze an object along one direction. Two other kinds of stress deform it differently, and every kind of stress has a limit beyond which the material is permanently changed.</p>

      <h2>The three kinds of stress</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Stress</th><th>What it does</th><th>Strain</th><th>Modulus</th></tr></thead>
        <tbody>
          <tr><td>Tensile or compressive</td><td>Stretches or squeezes along one direction</td><td>ΔL / L₀</td><td>Young's modulus Y</td></tr>
          <tr><td>Bulk (pressure)</td><td>Squeezes from every side, changing volume</td><td>ΔV / V₀</td><td>Bulk modulus B</td></tr>
          <tr><td>Shear</td><td>Pushes sideways on opposite faces, skewing the shape</td><td>x / h</td><td>Shear modulus S</td></tr>
        </tbody>
      </table>
      <p>The pattern is the same each time: <strong>modulus = stress / strain</strong>.</p>

      <h2>Bulk stress</h2>
      <p>An object submerged in a fluid is squeezed equally from all sides. The bulk stress is the pressure change Δp, and the volume shrinks:</p>
      $$B = -\frac{\Delta p}{\Delta V / V_0}$$
      <p>The minus sign makes B positive, because more pressure means a smaller volume. Water has B ≈ 2.2 × 10⁹ Pa.</p>
      <div class="example">
        <div class="example-label">Example</div>
        <p>About 1000 m deep in the ocean, the extra pressure is roughly 1.0 × 10⁷ Pa. How much is water compressed there?</p>
        ${solution(String.raw`<p>ΔV/V₀ = −(1.0 × 10⁷)/(2.2 × 10⁹) = <strong>−0.0045</strong>, only about half a percent. That's why liquids are usually treated as incompressible.</p>`)}
      </div>
      <div data-widget="bulk-depth"></div>

      <h2>Shear stress</h2>
      <p>Shear happens when forces push sideways, parallel to opposite faces, like sliding the top of a deck of cards while holding the bottom. The shear stress is F∥/A, the top face slides over by a distance x, and h is the object's height:</p>
      $$S = \frac{F_\parallel / A}{x / h}$$
      <div class="example">
        <div class="example-label">Example</div>
        <p>A rubber pad 0.050 m tall, with a top area of 0.10 m² and S = 1.0 × 10⁶ Pa, feels a 500 N sideways force. How far does its top shift?</p>
        ${solution(String.raw`<p>The shear stress is 500 / 0.10 = 5000 Pa, the strain is 5000 / (1.0 × 10⁶) = 0.0050, and the top shifts x = (0.0050)(0.050) = <strong>2.5 × 10⁻⁴ m</strong>, a quarter of a millimeter.</p>`)}
      </div>
      <h3>See it: skew the deck</h3>
      <div data-widget="shear-block"></div>

      <h2>Elasticity vs. plasticity</h2>
      <p>The moduli above only apply to small deformations. As stress increases, a material passes through stages:</p>
      <ol>
        <li><strong>Elastic region:</strong> stress is proportional to strain, and the object springs fully back when released.</li>
        <li><strong>Elastic limit (yield point):</strong> beyond this, the material no longer returns to its original shape.</li>
        <li><strong>Plastic region:</strong> the deformation becomes permanent. A bent paper clip stays bent.</li>
        <li><strong>Fracture:</strong> at the breaking stress, the material snaps.</li>
      </ol>
      <h3>See it: load and unload a material</h3>
      <p class="muted">Pull to a strain, then release. Inside the elastic region it returns to zero. Past the yield point it comes back along a parallel line and stays permanently stretched. Pull far enough and it breaks.</p>
      <div data-widget="stress-strain"></div>
      <p>Engineers design structures to stay well inside the elastic region, so that buildings and bridges always return to their original shape after a load.</p>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 22,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 11 errors are lever-arm mistakes and missing forces. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Using only ΣF = 0.</strong> A rigid body also needs Στ = 0.</li>
        <li><strong>Forgetting the beam's or ladder's own weight,</strong> or putting it anywhere but the center of gravity.</li>
        <li><strong>Choosing an awkward pivot.</strong> Put it where the most unknowns act.</li>
        <li><strong>Using the distance along a slanted object as the lever arm.</strong> For a ladder's weight, the lever arm is the horizontal distance, not the distance along the ladder.</li>
        <li><strong>Mixing up clockwise and counterclockwise signs.</strong></li>
        <li><strong>Assuming a hinge force points along the beam.</strong> It can point in any direction; solve for both components.</li>
        <li><strong>Converting mm² to m² wrong.</strong> 1 mm² = 10⁻⁶ m².</li>
      </ul>

      <h2>Key formulas</h2>
      $$\sum F_x = 0 \qquad \sum F_y = 0 \qquad \sum\tau = 0 \ (\text{about any point}) \qquad x_{\text{cg}} = \frac{\sum m_i x_i}{\sum m_i}$$
      $$\text{Stress} = \frac{F}{A} \qquad Y = \frac{F/A}{\Delta L/L_0} \qquad B = -\frac{\Delta p}{\Delta V/V_0} \qquad S = \frac{F_\parallel/A}{x/h}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution. For answers in scientific notation, type them like 4.0e7.</p>
      <ol class="problems">
        <li class="problem">
          <p>A 25 kg child sits 2.0 m left of a seesaw's center pivot. Where must a 50 kg adult sit to balance it?</p>
          <div data-widget="answer-check" data-answer="1.0" data-label="Distance right of the pivot" data-unit="m"></div>
          ${solution("(25)(2.0) = (50)x, so the adult sits <strong>1.0 m</strong> right of the pivot.")}
        </li>
        <li class="problem">
          <p>Find the center of gravity of three masses on a line: 2.0 kg at x = 0, 3.0 kg at x = 0.50 m, and 5.0 kg at x = 1.0 m.</p>
          <div data-widget="answer-check" data-answer="0.65" data-label="x_cg" data-unit="m"></div>
          ${solution("x_cg = (0 + 1.5 + 5.0)/10 = <strong>0.65 m</strong>.")}
        </li>
        <li class="problem">
          <p>A uniform 8.0 m beam with a mass of 50 kg rests on supports at both ends. An 80 kg person stands 2.0 m from the right end. Find both support forces.</p>
          <div data-widget="answer-check" data-answer="441" data-label="F_L" data-unit="N"></div>
          <div data-widget="answer-check" data-answer="833" data-label="F_R" data-unit="N"></div>
          ${solution("Torques about the left end: F_R(8.0) = (50)(9.80)(4.0) + (80)(9.80)(6.0), so <strong>F_R = 833 N</strong>. Then F_L = (130)(9.80) − 833 = <strong>441 N</strong>.")}
        </li>
        <li class="problem">
          <p>You hold a 5.0 kg ball in your hand, 0.35 m from your elbow. Your biceps pulls straight up on your forearm 0.040 m from the elbow. Ignoring the forearm's weight, find the biceps force.</p>
          <div data-widget="answer-check" data-answer="430" data-label="F" data-unit="N"></div>
          ${solution("Torques about the elbow: F(0.040) = (5.0)(9.80)(0.35), so <strong>F = 430 N</strong>, almost nine times the ball's weight. Muscles trade force for range of motion.")}
        </li>
        <li class="problem">
          <p>A uniform 6.0 m, 20 kg ladder leans against a frictionless wall with its base 2.0 m from the wall. Find the wall's force and the minimum μₛ at the floor.</p>
          <div data-widget="answer-check" data-answer="35" data-label="n_w" data-unit="N"></div>
          <div data-widget="answer-check" data-answer="0.18" data-tol="0.03" data-label="μₛ minimum"></div>
          ${solution("Height on the wall: √(6.0² − 2.0²) = 5.66 m. Torques about the base: n_w(5.66) = (196)(1.0), so <strong>n_w = 35 N</strong>. Friction must equal 35 N, and n_f = 196 N, so <strong>μₛ = 0.18</strong>. You can check it in the ladder model.")}
        </li>
        <li class="problem">
          <p>An aluminum rod (Y = 7.0 × 10¹⁰ Pa) is 1.5 m long, with a cross-sectional area of 2.0 × 10⁻⁴ m². Find the stress and the stretch under 8000 N of tension.</p>
          <div data-widget="answer-check" data-answer="4.0e7" data-label="Stress" data-unit="Pa"></div>
          <div data-widget="answer-check" data-answer="0.86" data-label="Stretch" data-unit="mm"></div>
          ${solution("Stress = 8000 / (2.0 × 10⁻⁴) = <strong>4.0 × 10⁷ Pa</strong>. ΔL = (8000)(1.5) / ((2.0 × 10⁻⁴)(7.0 × 10¹⁰)) = <strong>0.86 mm</strong>.")}
        </li>
        <li class="problem">
          <p>A 3.0 m steel cable (Y = 2.0 × 10¹¹ Pa) stretches 1.5 mm. Find the strain and the stress.</p>
          <div data-widget="answer-check" data-answer="5.0e-4" data-label="Strain"></div>
          <div data-widget="answer-check" data-answer="1.0e8" data-label="Stress" data-unit="Pa"></div>
          ${solution("Strain = 0.0015 / 3.0 = <strong>5.0 × 10⁻⁴</strong>. Stress = Y × strain = <strong>1.0 × 10⁸ Pa</strong>.")}
        </li>
        <li class="problem">
          <p>A solid block of volume 0.50 m³ with B = 1.6 × 10¹¹ Pa is put under 2.0 × 10⁷ Pa of extra pressure. By how much does its volume change?</p>
          <div data-widget="answer-check" data-answer="-6.3e-5" data-label="ΔV" data-unit="m³"></div>
          ${solution("ΔV = −V₀Δp/B = −(0.50)(2.0 × 10⁷)/(1.6 × 10¹¹) = <strong>−6.3 × 10⁻⁵ m³</strong>, a tiny shrinkage.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

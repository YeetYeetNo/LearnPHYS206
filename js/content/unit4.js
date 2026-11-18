// ============================================================
// UNIT 4 LESSONS: Newton's Laws of Motion (Chapter 4)
// Source: "PHYS 206 Unit 4 Study Guide" (Oct 26, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit4Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 4 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 4 of PHYS 206 is Chapter 4 of the course textbook, Newton's laws of motion (sections 1–6), taught in week 4 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It starts the material for <strong>Exam II</strong>, which covers Chapters 4–7.</p>
      <p>Units 2 and 3 were <strong>kinematics</strong>: describing motion. This unit starts <strong>dynamics</strong>: explaining it. The question changes from "how is it moving?" to "why is it moving that way?" The answer is always forces.</p>
      <p>Newton's three laws connect forces to motion. Combined with the kinematics you already know, they let you predict how almost any everyday object will move.</p>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Identify the forces acting on an object and find the net force</li>
        <li>Explain Newton's first law and what equilibrium means</li>
        <li>Use Newton's second law, ΣF = ma, one component at a time</li>
        <li>Tell mass from weight, and calculate weight</li>
        <li>Identify Newton's third-law action-reaction pairs correctly</li>
        <li>Draw a correct free-body diagram for any object</li>
      </ul>
      <div class="callout warn"><strong>The most important skill in this unit</strong> is the free-body diagram. Almost every problem for the rest of the course starts with one, so practice drawing them until it's automatic. The free-body diagram lesson has a builder you can practice on.</div>`,
  },

  {
    id: "forces",
    title: "Forces and interactions",
    minutes: 9,
    interactives: ["Net force builder"],
    body: String.raw`
      <p>A force is a push or a pull, and it always comes from an <strong>interaction between two objects</strong>. If you can't name the object doing the pushing or pulling, there's no force.</p>

      <h2>Forces are vectors</h2>
      <p>A force has a size and a direction, so everything from Unit 1 applies. The SI unit is the <strong>newton (N)</strong>, where \(1\ \text{N} = 1\ \text{kg}\cdot\text{m/s}^2\). One newton is roughly the weight of a medium apple.</p>

      <h2>The forces you'll see most</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th>Force</th><th>Symbol</th><th>Where it comes from</th><th>Direction</th></tr></thead>
        <tbody>
          <tr><td>Weight</td><td><strong>w</strong></td><td>Earth's gravity</td><td>Straight down</td></tr>
          <tr><td>Normal force</td><td><strong>n</strong></td><td>A surface pushing on an object</td><td>Perpendicular to the surface, away from it</td></tr>
          <tr><td>Friction</td><td><strong>f</strong></td><td>A surface resisting sliding</td><td>Parallel to the surface, opposing the sliding</td></tr>
          <tr><td>Tension</td><td><strong>T</strong></td><td>A rope, string, or cable pulling</td><td>Along the rope, away from the object</td></tr>
        </tbody>
      </table>
      <p>Weight is a <strong>long-range</strong> force: it acts without touching. The other three are <strong>contact</strong> forces: they only exist where two things touch.</p>

      <h2>Net force: adding forces together</h2>
      <p>When several forces act on one object, their combined effect is the same as a single force equal to their vector sum. This is called <strong>superposition</strong>, and the sum is the <strong>net force</strong>:</p>
      $$\sum \vec{F} = \vec{F}_1 + \vec{F}_2 + \vec{F}_3 + \cdots$$
      <p>In practice, add the components: \(\sum F_x = F_{1x} + F_{2x} + \ldots\), and the same for y.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>Two ropes pull on a crate. Rope 1 pulls with 50 N at 0° (east). Rope 2 pulls with 30 N at 120°. Find the net force.</p>
        ${solution(String.raw`
          <ol>
            <li>Rope 1 components: (50 N, 0).</li>
            <li>Rope 2 components: 30 cos 120° = −15 N, and 30 sin 120° = 26 N.</li>
            <li>Net components: ΣFₓ = 50 − 15 = 35 N, and ΣFᵧ = 0 + 26 = 26 N.</li>
            <li>Magnitude: √(35² + 26²) = <strong>44 N</strong>, at tan⁻¹(26/35) = <strong>37°</strong>.</li>
          </ol>
          <p>The crate responds as if one 44 N force were pulling it at 37°. That net force is what Newton's laws care about.</p>`)}
      </div>
      <h3>Try it: pull on the crate</h3>
      <p class="muted">Drag the rope tips. The green arrow is the single force that would have the same effect. It starts on the worked example; add a third rope and try to make the net force zero.</p>
      <div data-widget="net-force"></div>`,
  },

  {
    id: "first-law",
    title: "Newton's first law",
    minutes: 9,
    interactives: ["Hockey puck on ice", "Coffee cup in a braking car"],
    body: String.raw`
      <div class="callout"><strong>When the net force on an object is zero, its velocity doesn't change.</strong> An object at rest stays at rest, and an object moving stays moving at the same speed in the same direction.</div>

      <h2>Inertia</h2>
      <p>The tendency of an object to keep doing what it's already doing is called <strong>inertia</strong>. You feel it when a car brakes hard and your body keeps moving forward. Nothing pushed you forward; your body just kept its velocity while the car slowed down.</p>

      <h2>The big misconception</h2>
      <p>For most of history, people believed a moving object needs a force to keep it moving. It seems obvious: stop pushing a box, and it stops. But the box stops because friction acts on it, not because your push ran out.</p>
      <p><strong>Motion doesn't need a force. Changing motion does.</strong> A hockey puck on frictionless ice would slide forever with no force at all.</p>
      <h3>Try it: push a puck</h3>
      <p class="muted">Give the puck a short push, then let go. With friction it stops. Slide friction to zero and it never stops: once the push ends, the net force is zero and the velocity stays constant.</p>
      <div data-widget="inertia-puck"></div>

      <h2>Equilibrium</h2>
      <p>An object with zero net force is in <strong>equilibrium</strong>:</p>
      $$\sum \vec{F} = 0 \quad\Longleftrightarrow\quad \sum F_x = 0 \text{ and } \sum F_y = 0$$
      <p>Equilibrium includes two cases: sitting still, and moving at constant velocity. A car cruising at a steady 60 mph on a straight highway is in equilibrium, just like a book on a table. In both cases the forces balance.</p>

      <h2>Inertial frames of reference</h2>
      <p>Newton's laws only work in an <strong>inertial frame</strong>, one that isn't accelerating. The ground is a good enough inertial frame for almost every PHYS 206 problem.</p>
      <p>In an accelerating frame, the first law seems to fail. In a car that brakes suddenly, a coffee cup slides forward on the dashboard with no force pushing it. From the ground, nothing strange happened: the cup kept moving while the car slowed down underneath it.</p>
      <h3>See it: two points of view</h3>
      <p class="muted">Play the same braking event from the ground and from inside the car. From the ground the cup moves at a constant 15 m/s. From the car it seems to speed up forward with nothing pushing it.</p>
      <div data-widget="frames-cup"></div>`,
  },

  {
    id: "second-law",
    title: "Newton's second law",
    minutes: 12,
    interactives: ["Sled force model"],
    body: String.raw`
      <p>The second law says what happens when the forces don't balance: the object accelerates, in the direction of the net force.</p>
      $$\sum \vec{F} = m\vec{a}$$
      <p>This is the most important equation in PHYS 206. It's the bridge between forces and the kinematics from Units 2 and 3: forces determine acceleration, and acceleration determines motion.</p>

      <h2>What the equation says</h2>
      <ul>
        <li><strong>More force, more acceleration.</strong> Double the net force on an object, and its acceleration doubles.</li>
        <li><strong>More mass, less acceleration.</strong> The same push accelerates a shopping cart much more than a car. Mass measures how hard it is to change an object's motion.</li>
        <li><strong>The acceleration points the same way as the net force,</strong> not necessarily the way the object is moving.</li>
      </ul>

      <h2>Use it one component at a time</h2>
      <p>Just like kinematics, the second law splits into independent equations for each axis:</p>
      $$\sum F_x = m a_x \qquad \sum F_y = m a_y$$
      <p>Pick axes that make the problem easy. Usually that means one axis along the direction of the acceleration.</p>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 25 kg sled on level snow is pulled by a rope with 100 N of tension, angled 30° above horizontal. Friction opposes the motion with 40 N. Find the sled's acceleration, and its speed after 3.0 s if it starts from rest.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Choose axes:</strong> +x along the snow in the direction of motion, +y straight up.</li>
            <li><strong>x-components:</strong> the rope contributes 100 cos 30° = 86.6 N. Friction contributes −40 N.</li>
            <li><strong>Apply the second law in x:</strong>
              $$\sum F_x = 86.6 - 40 = 46.6\ \text{N} \quad\Rightarrow\quad a_x = \frac{46.6}{25} = 1.9\ \text{m/s}^2$$</li>
            <li><strong>Use kinematics for the speed:</strong> v = v₀ + at = 0 + (1.86)(3.0) = <strong>5.6 m/s</strong>.</li>
          </ol>
          <p>The y-direction forces (weight, normal force, and the rope's upward component) balance, because the sled doesn't leave the snow, so aᵧ = 0. That's why only the x-forces mattered here.</p>`)}
      </div>
      <h3>Try it: pull the sled</h3>
      <p class="muted">Change the rope tension, angle, friction, and mass. The model applies ΣFₓ = maₓ and ΣFᵧ = 0, then runs the motion for 3 s. Try doubling the tension, or doubling the mass, and compare the acceleration.</p>
      <div data-widget="sled"></div>`,
  },

  {
    id: "mass-weight",
    title: "Mass and weight",
    minutes: 7,
    interactives: ["Weight on other worlds"],
    body: String.raw`
      <p>In everyday speech, mass and weight mean the same thing. In physics they're different quantities, and mixing them up costs points.</p>

      <h2>The difference</h2>
      <table class="table" style="max-width:none">
        <thead><tr><th></th><th>Mass</th><th>Weight</th></tr></thead>
        <tbody>
          <tr><td><strong>What it is</strong></td><td>How much matter an object has, and its resistance to acceleration</td><td>The gravitational force pulling the object down</td></tr>
          <tr><td><strong>Type</strong></td><td>Scalar</td><td>Vector (points down)</td></tr>
          <tr><td><strong>Unit</strong></td><td>kilogram (kg)</td><td>newton (N)</td></tr>
          <tr><td><strong>Changes with location?</strong></td><td>No</td><td>Yes, depends on the local g</td></tr>
        </tbody>
      </table>

      <h2>Calculating weight</h2>
      <p>Weight is just Newton's second law applied to free fall. A falling object has only gravity acting on it and accelerates at g, so the force must be:</p>
      $$w = mg$$
      <p>On Earth, g = 9.80 m/s², so every kilogram weighs 9.80 N.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>What does a 70 kg student weigh on Earth, and on the Moon, where g = 1.62 m/s²?</p>
        ${solution(String.raw`
          <p>On Earth: (70)(9.80) = <strong>686 N</strong>. On the Moon: (70)(1.62) = <strong>113 N</strong>, about one-sixth as much.</p>
          <p>Their mass is still 70 kg on the Moon. They'd be just as hard to push sideways or to stop, even though they're easier to lift.</p>`)}
      </div>
      <h3>See it: same mass, different weight</h3>
      <p class="muted">Enter a mass, or a weight on Earth, and see the scale reading on each world. The mass bar never moves.</p>
      <div data-widget="weight-planets"></div>

      <div class="callout warn"><strong>Watch out for units.</strong> If a problem says an object "weighs 50 N," its mass is 50 / 9.80 = 5.1 kg, not 50 kg. If it says the object "has a mass of 50 kg," its weight is 490 N. Read carefully which one the problem gives you before plugging into ΣF = ma, which always needs mass in kg.</div>`,
  },

  {
    id: "third-law",
    title: "Newton's third law",
    minutes: 10,
    interactives: ["Action-reaction pair finder", "Car vs. truck collision"],
    body: String.raw`
      <div class="callout"><strong>If object A exerts a force on object B, then B exerts a force on A that is equal in size and opposite in direction.</strong> Forces always come in pairs, because every force comes from an interaction between two objects.</div>
      $$\vec{F}_{A \text{ on } B} = -\vec{F}_{B \text{ on } A}$$

      <h2>How to spot a true action-reaction pair</h2>
      <p>A real third-law pair always passes all four checks:</p>
      <ol>
        <li><strong>Two different objects.</strong> The forces act on different objects, never the same one.</li>
        <li><strong>Swapped labels.</strong> "A on B" pairs with "B on A."</li>
        <li><strong>Same type of force.</strong> A gravitational force pairs with a gravitational force; a normal force pairs with a normal force.</li>
        <li><strong>Equal size, opposite direction,</strong> always, even if the objects are accelerating.</li>
      </ol>

      <h2>The classic trap: a book on a table</h2>
      <p>A book resting on a table feels its weight (down) and the normal force (up). These are equal and opposite, so many students call them a third-law pair. <strong>They aren't.</strong> Both act on the same object, the book, and they're different types of force. They balance because of the first law: the book isn't accelerating.</p>
      <p>The real pairs are:</p>
      <ul>
        <li>Earth pulls the book down (gravity) ↔ the book pulls Earth up (gravity).</li>
        <li>The table pushes the book up (normal force) ↔ the book pushes the table down (normal force).</li>
      </ul>
      <h3>Try it: find the real pairs</h3>
      <p class="muted">Pick any two of the four forces. The model runs the four checks above on your pair.</p>
      <div data-widget="pair-finder"></div>

      <h2>Equal forces, different effects</h2>
      <p>Third-law forces are always equal, but their effects usually aren't, because each force acts on a different mass.</p>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 1000 kg car and a 4000 kg truck collide, pushing on each other with 20,000 N during the crash. Find each vehicle's acceleration.</p>
        ${solution(String.raw`
          <ul>
            <li>The car's acceleration: 20,000 / 1000 = <strong>20 m/s²</strong>.</li>
            <li>The truck's acceleration: 20,000 / 4000 = <strong>5.0 m/s²</strong>.</li>
          </ul>
          <p>The forces are identical, but the car's acceleration is four times larger. That's why the smaller vehicle fares worse, not because it was hit harder.</p>`)}
      </div>
      <h3>See it: equal pushes, unequal accelerations</h3>
      <div data-widget="collision-pair"></div>`,
  },

  {
    id: "free-body-diagrams",
    title: "Free-body diagrams",
    minutes: 14,
    interactives: ["Free-body diagram builder"],
    body: String.raw`
      <p>A <strong>free-body diagram (FBD)</strong> is a sketch of one object showing every force acting on it, and nothing else. It turns a messy real-world situation into a clean list of forces you can plug into ΣF = ma. Almost every problem from here on starts with one.</p>

      <h2>How to draw one, step by step</h2>
      <ol>
        <li><strong>Pick one object</strong> and mentally cut it free from everything around it.</li>
        <li><strong>Draw it as a dot or a simple box.</strong></li>
        <li><strong>Add weight first:</strong> an arrow straight down labeled w (or mg).</li>
        <li><strong>Check everything that touches it.</strong> Each contact adds a force: a surface gives a normal force (and maybe friction), and a rope gives tension.</li>
        <li><strong>Draw each force as an arrow</strong> starting at the object and pointing the way the force acts. Label every one.</li>
        <li><strong>Choose your axes,</strong> ideally with one axis along the acceleration.</li>
      </ol>

      <h2>What never goes on a free-body diagram</h2>
      <ul>
        <li><strong>Forces the object exerts on other things.</strong> Only forces acting <em>on</em> your object belong.</li>
        <li><strong>A separate "ma" arrow.</strong> The quantity ma is the result of the forces, not another force.</li>
        <li><strong>Velocity arrows.</strong> They describe motion, not force.</li>
        <li><strong>"The force of motion."</strong> There's no such force (see the first law).</li>
      </ul>
      <div class="callout"><strong>A quick check:</strong> for each force on your diagram, you should be able to name the object exerting it. If you can't, delete it.</div>

      <h3>Practice: build the diagram</h3>
      <p class="muted">Pick a situation, choose the forces you think belong, then press Check. Each force that belongs gets the object that exerts it. Each one that doesn't gets the reason it's wrong. The list includes tempting wrong answers on purpose.</p>
      <div data-widget="fbd-builder"></div>

      <h2>Worked example: the sled from the second-law lesson</h2>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>The 25 kg sled is pulled by a 100 N rope at 30° above horizontal, with 40 N of friction. List its forces and find the normal force.</p>
        ${solution(String.raw`
          <p>Its FBD has four forces:</p>
          <ul>
            <li><strong>Weight:</strong> mg = (25)(9.80) = 245 N, straight down (from Earth)</li>
            <li><strong>Normal force n:</strong> straight up (from the snow)</li>
            <li><strong>Tension:</strong> 100 N at 30° above horizontal (from the rope)</li>
            <li><strong>Friction:</strong> 40 N, horizontal and backward (from the snow)</li>
          </ul>
          <p>The y-direction isn't accelerating, so its forces must balance:</p>
          $$\sum F_y = n + 100\sin 30^\circ - 245 = 0 \quad\Rightarrow\quad n = 245 - 50 = 195\ \text{N}$$
          <p>This result is an important lesson: <strong>the normal force is not automatically equal to mg.</strong> The rope's upward pull carries part of the sled's weight, so the snow pushes up with only 195 N. Always find n from ΣFᵧ instead of assuming it. The sled model in the second-law lesson shows n changing as you change the rope angle.</p>`)}
      </div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 18,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Unit 4 mistakes are mostly conceptual, not mathematical. Most come from everyday intuition about forces that Newton's laws contradict. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Thinking a moving object needs a force to keep moving.</strong> Only changes in motion need a net force.</li>
        <li><strong>Calling weight and the normal force a third-law pair.</strong> They act on the same object, so they can't be.</li>
        <li><strong>Assuming the normal force always equals mg.</strong> Find it from ΣFᵧ.</li>
        <li><strong>Mixing up mass (kg) and weight (N).</strong> ΣF = ma needs mass.</li>
        <li><strong>Drawing "ma" as a force</strong> on a free-body diagram.</li>
        <li><strong>Thinking the bigger object exerts the bigger force</strong> in an interaction. Third-law forces are always equal.</li>
        <li><strong>Forgetting to split angled forces</strong> into x- and y-components.</li>
      </ul>

      <h2>Key formulas</h2>
      $$\sum \vec{F} = m\vec{a} \qquad \sum F_x = m a_x \qquad \sum F_y = m a_y$$
      $$w = mg \qquad \vec{F}_{A \text{ on } B} = -\vec{F}_{B \text{ on } A} \qquad 1\ \text{N} = 1\ \text{kg}\cdot\text{m/s}^2$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A 3.0 kg object feels a 12 N force east and a 5.0 N force west. Find the net force and the acceleration.</p>
          <div data-widget="answer-check" data-answer="7.0" data-label="Net force" data-unit="N east"></div>
          <div data-widget="answer-check" data-answer="2.3" data-label="Acceleration" data-unit="m/s² east"></div>
          ${solution("Net force = 12 − 5.0 = <strong>7.0 N east</strong>. Acceleration = 7.0 / 3.0 = <strong>2.3 m/s² east</strong>.")}
        </li>
        <li class="problem">
          <p>A 1200 kg car speeds up from rest to 20 m/s in 8.0 s. What net force acts on it?</p>
          <div data-widget="answer-check" data-answer="3000" data-label="Net force" data-unit="N"></div>
          ${solution("a = 20 / 8.0 = 2.5 m/s², so ΣF = (1200)(2.5) = <strong>3000 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 15 kg box on a level floor is pulled horizontally with 60 N while friction resists with 24 N. Find its acceleration and the normal force on it.</p>
          <div data-widget="answer-check" data-answer="2.4" data-label="Acceleration" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="147" data-label="Normal force" data-unit="N"></div>
          ${solution("a = (60 − 24) / 15 = <strong>2.4 m/s²</strong>. Vertically nothing else acts, so n = mg = (15)(9.80) = <strong>147 N</strong>.")}
        </li>
        <li class="problem">
          <p>An object weighs 98 N on Earth. What is its mass, and what would it weigh on Mars, where g = 3.71 m/s²?</p>
          <div data-widget="answer-check" data-answer="10" data-label="Mass" data-unit="kg"></div>
          <div data-widget="answer-check" data-answer="37" data-label="Weight on Mars" data-unit="N"></div>
          ${solution("Mass = 98 / 9.80 = <strong>10 kg</strong>. Weight on Mars = (10)(3.71) = <strong>37 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 4.0 kg lamp hangs at rest from a single vertical cord. Draw its free-body diagram and find the tension.</p>
          <div data-widget="answer-check" data-answer="39" data-label="Tension" data-unit="N"></div>
          ${solution("Two forces: weight (39.2 N, down) and tension (up). At rest, they balance, so <strong>T = 39 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 50 kg crate sits on the floor while you push down on it at 30° below horizontal with 200 N. It doesn't move. Find the normal force.</p>
          <div data-widget="answer-check" data-answer="590" data-label="Normal force" data-unit="N"></div>
          ${solution("ΣFᵧ = n − 490 − 200 sin 30° = 0, so <strong>n = 590 N</strong>. Pushing down increases the normal force above mg.")}
        </li>
        <li class="problem">
          <p>A truck pulls a trailer and both speed up together. Is the truck's pull on the trailer larger than the trailer's pull on the truck?</p>
          ${solution("<strong>No, they're equal</strong> (third law). The trailer speeds up because the truck's pull on it is larger than the friction and drag acting on it, not because the pair is unbalanced.", "Show answer")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

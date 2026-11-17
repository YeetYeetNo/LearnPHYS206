// ============================================================
// UNIT 5 LESSONS: Applying Newton's Laws (Chapter 5)
// Source: "PHYS 206 Unit 5 Study Guide" (Oct 26, 2026, @Dak)
// Same format as unit1.js: String.raw bodies, \( inline \) and $$ display $$ math,
// interactive models placed with <div data-widget="name"></div>.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

const SCHEDULE = "https://mechanics.physics.tamu.edu/class-schedule.php";

export const unit5Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 5 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 5 of PHYS 206 is Chapter 5 of the course textbook, applying Newton's laws (sections 1–4), taught in week 5 of the <a href="${SCHEDULE}" target="_blank" rel="noopener">common schedule</a>. It's on <strong>Exam II</strong>, which covers Chapters 4–7.</p>
      <p>This unit adds very little new physics. Unit 4 gave you the laws and free-body diagrams; this unit is about using them on the problem types that show up again and again. If Unit 4 was learning the rules, Unit 5 is learning to play.</p>
      <div class="callout">The only genuinely new force is <strong>friction</strong>. Everything else is practice applying ΣF = ma to new setups.</div>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Follow one consistent strategy for any force problem</li>
        <li>Solve equilibrium problems, like objects hanging from cables</li>
        <li>Handle inclined planes and apparent weight in elevators</li>
        <li>Solve connected-object problems with ropes and pulleys</li>
        <li>Use static and kinetic friction correctly</li>
        <li>Find the forces that keep an object moving in a circle</li>
      </ul>
      <div class="callout warn"><strong>This is a practice-heavy unit.</strong> The more problems you work, the faster you'll recognize which setup you're looking at. Every lesson has a model you can use to check your own answers.</div>`,
  },

  {
    id: "strategy",
    title: "The strategy for any force problem",
    minutes: 7,
    interactives: ["Equilibrium or dynamics? sorter"],
    body: String.raw`
      <p>Every problem in this unit can be solved with the same five steps. Use them every time, even on problems that seem easy. The structure is what keeps you from missing a force or a sign.</p>
      <ol>
        <li><strong>Identify the object</strong> (or objects) you're analyzing. If there are several, you'll do steps 2–4 for each one.</li>
        <li><strong>Draw a free-body diagram</strong> for each object, using the method from Unit 4.</li>
        <li><strong>Choose axes.</strong> Point one axis along the direction the object accelerates, or would accelerate. On a ramp, tilt your axes to match the ramp.</li>
        <li><strong>Write ΣF = ma for each axis,</strong> one equation per direction. If the object isn't accelerating in a direction, that side equals zero.</li>
        <li><strong>Solve the equations</strong> and check that the answer makes sense: units, signs, and size.</li>
      </ol>

      <h2>Equilibrium or dynamics?</h2>
      <p>The first decision in any problem is whether the object is accelerating:</p>
      <ul>
        <li><strong>Equilibrium:</strong> at rest or moving at constant velocity, so ΣFₓ = 0 and ΣFᵧ = 0.</li>
        <li><strong>Dynamics:</strong> speeding up, slowing down, or turning, so ΣFₓ = maₓ and ΣFᵧ = maᵧ.</li>
      </ul>
      <p>Watch for keywords. "At rest," "constant velocity," and "constant speed in a straight line" all mean equilibrium. "Speeds up," "starts from rest," and "slows down" mean dynamics.</p>
      <h3>Practice: sort the situations</h3>
      <p class="muted">Decide whether each object is in equilibrium or not. A few are designed to catch you.</p>
      <div data-widget="problem-classifier"></div>

      <h2>Counting equations</h2>
      <p>You can solve for as many unknowns as you have independent equations. Each object gives you two (one for x, one for y). If you have more unknowns than equations, you've missed a connection between the objects, like a shared rope tension or a shared acceleration.</p>`,
  },

  {
    id: "equilibrium",
    title: "Equilibrium problems",
    minutes: 9,
    interactives: ["Two-cable sign model"],
    body: String.raw`
      <p>An object in equilibrium has zero acceleration, so all its forces cancel: ΣFₓ = 0 and ΣFᵧ = 0. These problems usually ask for an unknown tension or normal force.</p>

      <div class="example">
        <div class="example-label">Worked example: a sign on two cables</div>
        <p>A 20 kg sign hangs at rest from two cables. Cable 1 pulls up and to the left at 30° above horizontal. Cable 2 pulls up and to the right at 60° above horizontal. Find the tension in each cable.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Free-body diagram:</strong> three forces on the sign. Weight w = (20)(9.80) = 196 N, down. T₁ at 30° up-left. T₂ at 60° up-right.</li>
            <li><strong>x-direction:</strong> the horizontal pulls must cancel.
              $$\sum F_x = T_2\cos 60^\circ - T_1\cos 30^\circ = 0 \quad\Rightarrow\quad T_2 = 1.73\,T_1$$</li>
            <li><strong>y-direction:</strong> the upward pulls must hold up the weight.
              $$\sum F_y = T_1\sin 30^\circ + T_2\sin 60^\circ - 196 = 0$$</li>
            <li><strong>Substitute</strong> T₂ = 1.73 T₁: 0.50 T₁ + (1.73)(0.866) T₁ = 2.0 T₁ = 196, so <strong>T₁ = 98 N</strong> and <strong>T₂ = 170 N</strong>.</li>
          </ol>`)}
      </div>
      <h3>Try it: hang the sign</h3>
      <p class="muted">Change the cable angles and the mass. The model solves ΣFₓ = 0 and ΣFᵧ = 0 for both tensions. Try the clothesline preset to see what happens as the cables flatten out.</p>
      <div data-widget="two-cables"></div>

      <h2>The lesson</h2>
      <p>The steeper cable (60°) carries more of the load. In general, <strong>the shallower a cable's angle, the more tension it needs</strong> to hold the same weight. A clothesline pulled almost flat can carry enormous tension from a light shirt, because almost all of its pull is horizontal and only a tiny part holds the weight up.</p>

      <h2>Equilibrium on a ramp</h2>
      <p>A block sitting still on a ramp is also in equilibrium. Those problems are easiest with tilted axes, covered in the next lesson.</p>`,
  },

  {
    id: "inclines-elevators",
    title: "Inclined planes and elevators",
    minutes: 12,
    interactives: ["Tilted-axes ramp model", "Elevator scale model"],
    body: String.raw`
      <p>These are the two most common dynamics setups. Both come down to choosing the right axes and finding the normal force correctly.</p>

      <h2>Inclined planes: tilt your axes</h2>
      <p>For an object on a ramp at angle θ, rotate your axes so x points down the slope and y points perpendicular to it. Now the normal force lies entirely along y, and the acceleration lies entirely along x. Only the weight has to be split into components:</p>
      $$w_{\parallel} = mg\sin\theta \ (\text{down the slope}) \qquad w_{\perp} = mg\cos\theta \ (\text{into the slope})$$
      <p>A way to remember which is which: at θ = 0 (flat ground), the down-slope part should be zero, and sin 0° = 0. So the sine goes with "down the slope."</p>
      <p>On a frictionless ramp:</p>
      <ul>
        <li><strong>Perpendicular to the ramp,</strong> nothing accelerates, so n = mg cos θ. The normal force is <em>less</em> than mg on a ramp.</li>
        <li><strong>Along the ramp,</strong> ΣFₓ = mg sin θ = ma, so <strong>a = g sin θ</strong>. The mass cancels.</li>
      </ul>
      <h3>See it: splitting the weight</h3>
      <p class="muted">Tilt the ramp and watch the two parts of the weight trade off. Set the angle to 0° and then to 60° to check the sine/cosine rule.</p>
      <div data-widget="tilted-axes"></div>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 5.0 kg block slides down a frictionless ramp tilted at 25°. Find its acceleration and the normal force.</p>
        ${solution(String.raw`
          <ol>
            <li>Acceleration: a = (9.80) sin 25° = <strong>4.1 m/s²</strong> down the slope.</li>
            <li>Normal force: n = (5.0)(9.80) cos 25° = <strong>44 N</strong>, less than its 49 N weight.</li>
          </ol>`)}
      </div>

      <h2>Elevators and apparent weight</h2>
      <p>A bathroom scale doesn't measure your weight. It measures the normal force it pushes up on you with. That reading is your <strong>apparent weight</strong>, and it changes when you accelerate vertically.</p>
      <p>Take +y up for a person of mass m in an elevator with acceleration a:</p>
      $$\sum F_y = n - mg = ma \quad\Rightarrow\quad n = m(g + a)$$
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>A 60 kg student stands on a scale in an elevator. Their true weight is (60)(9.80) = 588 N. What does the scale read when the elevator accelerates up at 2.0 m/s², accelerates down at 2.0 m/s², moves at constant speed, and falls freely?</p>
        ${solution(String.raw`
          <ul>
            <li><strong>Accelerating up at 2.0 m/s²:</strong> n = 60(9.80 + 2.0) = <strong>708 N</strong>. They feel heavier.</li>
            <li><strong>Accelerating down at 2.0 m/s²:</strong> n = 60(9.80 − 2.0) = <strong>468 N</strong>. They feel lighter.</li>
            <li><strong>Moving at constant speed, either direction:</strong> a = 0, so n = <strong>588 N</strong>, the true weight.</li>
            <li><strong>Cable snaps (free fall, a = −g):</strong> n = <strong>0</strong>. They feel weightless.</li>
          </ul>`)}
      </div>
      <h3>Try it: ride the elevator</h3>
      <p class="muted">Pick a trip. The scale reads m(g + a). Compare "moving up, slowing down" with "accelerating down": the motion is opposite, but the reading is the same.</p>
      <div data-widget="elevator"></div>
      <div class="callout warn">The scale reading depends on the <strong>acceleration</strong>, not the direction of motion. An elevator moving up but slowing down has downward acceleration, so the student feels lighter.</div>`,
  },

  {
    id: "connected-objects",
    title: "Connected objects",
    minutes: 12,
    interactives: ["Pulley system model"],
    body: String.raw`
      <p>When two objects are tied together by a rope, they move as a team. Each still gets its own free-body diagram and its own ΣF = ma, but two connections link the equations together.</p>

      <h2>The two connections</h2>
      <ul>
        <li><strong>Same tension at both ends.</strong> For a light rope over a frictionless pulley, the tension T is the same everywhere along it.</li>
        <li><strong>Same acceleration size.</strong> If the rope doesn't stretch, both objects speed up at the same rate, a. Their directions may differ: one might slide sideways while the other falls.</li>
      </ul>
      <div class="callout"><strong>Tip:</strong> pick each object's positive direction to follow the motion. If one block moves right while the other moves down, call "right" positive for the first and "down" positive for the second. Then a is positive for both.</div>

      <div class="example">
        <div class="example-label">Worked example: block on a table, block hanging</div>
        <p>A 4.0 kg block sits on a frictionless table. A rope runs from it over a pulley at the table's edge to a 2.0 kg block hanging in the air. Find the acceleration and the rope tension.</p>
        ${solution(String.raw`
          <ol>
            <li><strong>Block on the table (m₁ = 4.0 kg):</strong> the only horizontal force is the tension, pulling it toward the pulley.
              $$T = m_1 a = 4.0\,a$$</li>
            <li><strong>Hanging block (m₂ = 2.0 kg),</strong> with down as positive: its weight pulls down, and the tension pulls up.
              $$m_2 g - T = m_2 a \quad\Rightarrow\quad 19.6 - T = 2.0\,a$$</li>
            <li><strong>Combine:</strong> substitute T = 4.0a into the second equation. That gives 19.6 − 4.0a = 2.0a, so 6.0a = 19.6.</li>
            <li><strong>Results:</strong> a = <strong>3.3 m/s²</strong>, and T = (4.0)(3.27) = <strong>13 N</strong>.</li>
          </ol>`)}
      </div>
      <h3>Try it: release the blocks</h3>
      <p class="muted">Each block has its own forces drawn on it. Switch to the Atwood machine for two hanging blocks, or add friction to the table.</p>
      <div data-widget="pulley-system"></div>

      <h2>Sanity checks</h2>
      <ul>
        <li><strong>The tension (13 N) is less than the hanging block's weight (19.6 N).</strong> It has to be, or the hanging block wouldn't accelerate downward.</li>
        <li><strong>A shortcut:</strong> treat both blocks as one system. The only outside force driving the motion is the hanging weight, m₂g, and it moves the total mass. So a = m₂g/(m₁ + m₂) = 19.6/6.0 = 3.3 m/s², a match.</li>
      </ul>
      <p>For two blocks hanging on either side of one pulley (an <strong>Atwood machine</strong>), the same logic gives \(a = (m_2 - m_1)g/(m_1 + m_2)\), where m₂ is the heavier block.</p>`,
  },

  {
    id: "friction",
    title: "Friction",
    minutes: 14,
    interactives: ["Static vs. kinetic friction push", "Inclined plane with friction"],
    body: String.raw`
      <p>Friction is the force a surface exerts parallel to itself, resisting sliding. It's the reason a pushed box stops, and also the reason your shoes don't slip when you walk. There are two kinds, and telling them apart is the key skill.</p>

      <h2>Kinetic friction: when it's sliding</h2>
      <p>Once an object is sliding, kinetic friction opposes the motion with a constant size:</p>
      $$f_k = \mu_k\, n$$
      <p>The <strong>coefficient of kinetic friction</strong> μₖ is a unitless number that depends on the two surfaces, usually between about 0.1 and 1. Notice friction depends on the <strong>normal force</strong>, not directly on the weight. That's why it was so important in Unit 4 to find n from ΣFᵧ.</p>

      <h2>Static friction: when it's not sliding</h2>
      <p>Static friction holds an object in place. It adjusts its size to match whatever is trying to make the object slide, up to a maximum:</p>
      $$f_s \le \mu_s\, n$$
      <div class="callout"><strong>The ≤ is the most important symbol in this unit.</strong> μₛn is the <em>maximum</em> static friction, not the value it always has. Usually μₛ &gt; μₖ, which is why something is harder to start moving than to keep moving.</div>

      <div class="example">
        <div class="example-label">Worked example: pushing a box</div>
        <p>A 10 kg box sits on a floor with μₛ = 0.40 and μₖ = 0.30. The normal force is n = mg = 98 N. (1) You push with 20 N and it doesn't move: what is the friction force? (2) How hard must you push to start it moving? (3) Once it's sliding, you keep pushing with that force. What is its acceleration?</p>
        ${solution(String.raw`
          <ol>
            <li><strong>You push with 20 N, and it doesn't move.</strong> Static friction is exactly <strong>20 N</strong>, matching your push. It is not 0.40 × 98 = 39 N.</li>
            <li><strong>How hard to push to start it moving?</strong> Just over the maximum static friction: (0.40)(98) = <strong>39 N</strong>.</li>
            <li><strong>Once it's sliding, you keep pushing with 39 N.</strong> Kinetic friction is (0.30)(98) = 29.4 N. The net force is 39.2 − 29.4 = 9.8 N, so a = 9.8 / 10 = <strong>0.98 m/s²</strong>. The box speeds up even though you didn't push harder, because friction dropped once it started sliding.</li>
          </ol>`)}
      </div>
      <h3>Try it: push the box</h3>
      <p class="muted">Slowly raise the push. The graph traces friction against your push: it rises to match you, then drops to μₖn the moment the box breaks free. Lower the push again and see when the box stops.</p>
      <div data-widget="friction-push"></div>

      <h2>Friction on a ramp</h2>
      <ul>
        <li><strong>The steepest angle a block can sit still at</strong> is found by setting mg sin θ = μₛmg cos θ, which gives <strong>tan θ = μₛ</strong>. With μₛ = 0.40, that's 22°.</li>
        <li><strong>A block sliding down a ramp</strong> with kinetic friction accelerates at \(a = g(\sin\theta - \mu_k\cos\theta)\). On a 30° ramp with μₖ = 0.30, that's 9.80(0.500 − 0.260) = 2.4 m/s².</li>
      </ul>
      <h3>Try it: the inclined plane</h3>
      <p class="muted">Raise the angle until tan θ passes μₛ and the block starts to slide. Set μₖ = 0.30 at 30° to check the 2.4 m/s² result.</p>
      <div data-widget="incline-sim"></div>

      <h2>Direction of friction</h2>
      <p>Friction always opposes the sliding, or the tendency to slide, between the two surfaces. It doesn't always oppose the object's motion. When you walk, static friction pushes your foot <em>forward</em>, because your foot pushes backward on the ground.</p>`,
  },

  {
    id: "circular-dynamics",
    title: "Dynamics of circular motion",
    minutes: 14,
    interactives: ["What supplies the inward force?", "Car on a curve (flat or banked)", "Top of a vertical loop"],
    body: String.raw`
      <p>Unit 3 showed that an object moving in a circle accelerates toward the center at v²/R. Newton's second law says something must cause that acceleration: a net force pointing toward the center.</p>
      $$\sum F_{\text{toward center}} = \frac{m v^2}{R}$$

      <h2>"Centripetal force" is not a new force</h2>
      <p>This is the most common mistake in the whole unit. <strong>Never draw a separate "centripetal force" on a free-body diagram.</strong> "Centripetal" just describes the direction. The force toward the center is always supplied by a real force you already know:</p>
      <ul>
        <li>A car on a flat curve: <strong>static friction</strong> from the road</li>
        <li>A ball swung on a string: <strong>tension</strong></li>
        <li>The Moon orbiting Earth: <strong>gravity</strong></li>
      </ul>
      <p>And there's no outward "centrifugal" force either. The feeling of being thrown outward in a turning car is your body's inertia trying to go straight (Unit 4's first law).</p>
      <h3>Practice: name the real force</h3>
      <div data-widget="force-source-quiz"></div>

      <h2>Example 1: a car on a flat curve</h2>
      <div class="example">
        <div class="example-label">Worked example</div>
        <p>What's the fastest a car can take a flat curve of radius 50 m if μₛ = 0.80?</p>
        ${solution(String.raw`
          <p>Static friction provides the inward force, and its maximum is μₛmg. Set it equal to mv²/R:</p>
          $$\mu_s m g = \frac{m v^2}{R} \quad\Rightarrow\quad v = \sqrt{\mu_s g R} = \sqrt{(0.80)(9.80)(50)} = 20\ \text{m/s}$$
          <p>The mass cancels, so a truck and a sports car have the same limit. On ice (μₛ near 0.1), the limit drops to about 7 m/s.</p>`)}
      </div>

      <h2>Example 2: a banked curve</h2>
      <p>Tilting the road lets the normal force supply the inward push, with no friction needed. For a bank angle β, the vertical part of n holds up the car, and the horizontal part turns it. Dividing the two equations gives:</p>
      $$\tan\beta = \frac{v^2}{gR}$$
      <p>To design a curve of radius 80 m for 20 m/s: tan β = 400/784 = 0.51, so <strong>β = 27°</strong>.</p>
      <h3>Try it: take the curve</h3>
      <p class="muted">On a flat curve, raise the speed until the friction needed is more than the road can give. On a banked curve, see how the tilted normal force does the turning, and find the speed that needs no friction at all.</p>
      <div data-widget="curve-car"></div>

      <h2>Example 3: the top of a vertical loop</h2>
      <p>At the top of a roller-coaster loop of radius R, both gravity and the track's normal force point down, toward the center:</p>
      $$n + mg = \frac{m v^2}{R}$$
      <p>The slowest the car can go and still stay on the track is when n just reaches zero, so \(v_{\min} = \sqrt{gR}\). For a 10 m loop, that's √98 = <strong>9.9 m/s</strong>. Any slower, and gravity alone pulls the car into a tighter curve than the track, so it falls off.</p>
      <div data-widget="loop-top"></div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 20,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most Unit 5 errors come from friction, ramps, and circular motion. Review the list, then try the problems before checking the answers.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Using μₛn as the static friction every time.</strong> It's only the maximum. Below that, static friction matches the applied force.</li>
        <li><strong>Writing friction as μmg</strong> on a ramp or with an angled pull. Friction is μn, and n isn't always mg.</li>
        <li><strong>Swapping sine and cosine on a ramp.</strong> Down the slope is mg sin θ; into the slope is mg cos θ.</li>
        <li><strong>Drawing a "centripetal force" or "centrifugal force"</strong> on a free-body diagram. Use only real forces.</li>
        <li><strong>Assuming the rope tension equals the hanging weight</strong> in a pulley system. If anything accelerates, it doesn't.</li>
        <li><strong>Thinking apparent weight depends on the direction of motion.</strong> It depends on the acceleration.</li>
        <li><strong>Using one free-body diagram for two connected objects.</strong> Each object needs its own.</li>
      </ul>

      <h2>Key formulas</h2>
      $$f_k = \mu_k n \qquad f_s \le \mu_s n \qquad a_{\text{ramp}} = g\sin\theta \ (\text{frictionless})$$
      $$n_{\text{elevator}} = m(g + a) \qquad \sum F_{\text{center}} = \frac{mv^2}{R}$$
      $$v_{\max,\text{flat}} = \sqrt{\mu_s g R} \qquad \tan\beta = \frac{v^2}{gR} \qquad v_{\min,\text{loop top}} = \sqrt{gR}$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>A 12 kg box hangs at rest from two ropes, each at 45° above horizontal. Find the tension in each rope.</p>
          <div data-widget="answer-check" data-answer="83" data-label="T" data-unit="N"></div>
          ${solution("2T sin 45° = (12)(9.80) = 117.6 N, so <strong>T = 83 N</strong> in each rope.")}
        </li>
        <li class="problem">
          <p>An 8.0 kg block slides down a frictionless ramp tilted at 35°. Find its acceleration and the normal force.</p>
          <div data-widget="answer-check" data-answer="5.6" data-label="a" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="64" data-label="n" data-unit="N"></div>
          ${solution("a = 9.80 sin 35° = <strong>5.6 m/s²</strong>. n = (8.0)(9.80) cos 35° = <strong>64 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 75 kg person rides an elevator that's moving up but slowing down at 1.5 m/s². What does a scale under them read?</p>
          <div data-widget="answer-check" data-answer="620" data-label="Scale reading" data-unit="N"></div>
          ${solution("Slowing while moving up means a = −1.5 m/s². n = 75(9.80 − 1.5) = <strong>620 N</strong>, less than their 735 N weight.")}
        </li>
        <li class="problem">
          <p>A 6.0 kg block on a frictionless table is tied over a pulley to a 3.0 kg hanging block. Find the acceleration and the tension.</p>
          <div data-widget="answer-check" data-answer="3.3" data-label="a" data-unit="m/s²"></div>
          <div data-widget="answer-check" data-answer="20" data-label="T" data-unit="N"></div>
          ${solution("a = (3.0)(9.80)/(6.0 + 3.0) = <strong>3.3 m/s²</strong>. T = (6.0)(3.27) = <strong>20 N</strong>.")}
        </li>
        <li class="problem">
          <p>A 20 kg crate rests on a floor with μₛ = 0.50 and μₖ = 0.35. (a) You push with 50 N. What is the friction force? (b) What push starts it moving? (c) Keeping that push once it slides, what's its acceleration?</p>
          <div data-widget="answer-check" data-answer="50" data-label="(a) friction" data-unit="N"></div>
          <div data-widget="answer-check" data-answer="98" data-label="(b) push" data-unit="N"></div>
          <div data-widget="answer-check" data-answer="1.5" data-label="(c) a" data-unit="m/s²"></div>
          ${solution("n = 196 N. (a) <strong>50 N</strong>, matching the push, since 50 N is below the 98 N maximum. (b) Just over (0.50)(196) = <strong>98 N</strong>. (c) fₖ = (0.35)(196) = 68.6 N, so a = (98 − 68.6)/20 = <strong>1.5 m/s²</strong>.")}
        </li>
        <li class="problem">
          <p>A block sits on a 20° ramp with μₛ = 0.45. Does it slide?</p>
          ${solution("<strong>No.</strong> It would slide only if tan θ > μₛ, and tan 20° = 0.36 is less than 0.45. You can check it in the inclined-plane model in the friction lesson.", "Show answer")}
        </li>
        <li class="problem">
          <p>What's the maximum safe speed on a flat curve of radius 30 m if μₛ = 0.60?</p>
          <div data-widget="answer-check" data-answer="13" data-tol="0.04" data-label="v" data-unit="m/s"></div>
          ${solution("v = √((0.60)(9.80)(30)) = <strong>13 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>A 0.20 kg ball on a 0.80 m string is swung in a horizontal circle at 4.0 m/s. Ignoring gravity's effect on the string, find the tension.</p>
          <div data-widget="answer-check" data-answer="4.0" data-label="T" data-unit="N"></div>
          ${solution("T = mv²/R = (0.20)(4.0)²/0.80 = <strong>4.0 N</strong>.")}
        </li>
      </ol>
      <p class="muted small">Source: <a href="${SCHEDULE}" target="_blank" rel="noopener">PHYS 206 common weekly schedule (Texas A&amp;M)</a>.</p>`,
  },
];

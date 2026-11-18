// ============================================================
// UNIT 1 LESSONS: Units, Physical Quantities, and Vectors
// Source: "PHYS 206 Unit 1 Study Guide" (Oct 23, 2026, @Dak)
//
// Each lesson is one page. `body` is HTML written with String.raw so
// LaTeX backslashes survive. Math: \( inline \) and $$ display $$.
// Interactive models go anywhere as <div data-widget="name"></div>.
// Widget names are registered in js/widgets/index.js.
// `interactives` lists the models by name for the module menus.
// ============================================================

const solution = (body, label = "Show solution") =>
  `<details class="reveal"><summary>${label}</summary><div>${body}</div></details>`;

export const unit1Lessons = [
  {
    id: "overview",
    title: "Overview: what Unit 1 covers",
    minutes: 3,
    interactives: [],
    body: String.raw`
      <p>Unit 1 of PHYS 206 is Chapter 1 of the course textbook: units, physical quantities, and vectors (sections 1–10), taught in week 1 of the common schedule. It is the toolkit for everything after it. Motion, forces, energy, and rotation all come down to quantities with units, and most of them are vectors.</p>
      <div class="callout"><strong>Why it matters for Exam I.</strong> Exam I covers Chapters 1–3, so this unit is tested directly and also inside every kinematics problem that follows. Once units and vectors feel automatic, Chapters 2 and 3 become mostly bookkeeping.</div>
      <h2>By the end of this unit you should be able to</h2>
      <ul class="checklist">
        <li>Convert between units and check any equation with dimensional analysis</li>
        <li>Report answers with the right number of significant figures and make quick order-of-magnitude estimates</li>
        <li>Tell scalars from vectors, and add or subtract vectors both by drawing and by components</li>
        <li>Write any vector using the unit vectors \(\hat{\imath}\), \(\hat{\jmath}\), and \(\hat{k}\)</li>
        <li>Compute dot and cross products and explain what each one tells you</li>
      </ul>
      <h2>How to use this module</h2>
      <ol>
        <li>Read each lesson in order.</li>
        <li>Work each example yourself before you open its solution.</li>
        <li>Use the interactive models to check your intuition. Drag things and watch the numbers change.</li>
        <li>Finish with the practice problems in the last lesson, without looking at the answers.</li>
      </ol>`,
  },

  {
    id: "units",
    title: "Units, the SI system & conversions",
    minutes: 8,
    interactives: ["Unit converter", "Area scaling model"],
    body: String.raw`
      <p>A physical quantity is always a number plus a unit. "5" tells you nothing; "5 m" or "5 s" tells you something real. In physics, an answer without units is an incomplete answer.</p>

      <h2>The SI base units you'll use most</h2>
      <p>PHYS 206 runs on the SI (metric) system. Three base units carry almost the whole course:</p>
      <div class="unit-cards">
        <div><span class="big">m</span><strong>meter</strong><span>length</span></div>
        <div><span class="big">kg</span><strong>kilogram</strong><span>mass</span></div>
        <div><span class="big">s</span><strong>second</strong><span>time</span></div>
      </div>
      <p>Everything else is a <em>derived unit</em> built from these. Speed is m/s, acceleration is m/s², and force (Chapter 4) is the newton, where \(1\ \text{N} = 1\ \text{kg}\cdot\text{m/s}^2\).</p>

      <h2>Metric prefixes</h2>
      <table class="table">
        <thead><tr><th>Prefix</th><th>Symbol</th><th>Factor</th></tr></thead>
        <tbody>
          <tr><td>giga</td><td>G</td><td>10⁹</td></tr>
          <tr><td>mega</td><td>M</td><td>10⁶</td></tr>
          <tr><td>kilo</td><td>k</td><td>10³</td></tr>
          <tr><td>centi</td><td>c</td><td>10⁻²</td></tr>
          <tr><td>milli</td><td>m</td><td>10⁻³</td></tr>
          <tr><td>micro</td><td>μ</td><td>10⁻⁶</td></tr>
          <tr><td>nano</td><td>n</td><td>10⁻⁹</td></tr>
        </tbody>
      </table>

      <h2>Converting units: multiply by 1</h2>
      <p>A conversion factor is a fraction equal to 1, like (1609 m / 1 mi). Multiplying by it changes the units without changing the quantity. Set it up so the unit you want to cancel appears on top and bottom.</p>
      <div class="example">
        <div class="example-label">Example</div>
        <p>Convert 65 mi/h to m/s. Use 1 mi = 1609 m and 1 h = 3600 s.</p>
        ${solution(String.raw`
          $$65\ \frac{\text{mi}}{\text{h}} \times \frac{1609\ \text{m}}{1\ \text{mi}} \times \frac{1\ \text{h}}{3600\ \text{s}} = 29\ \text{m/s}$$
          <p>Miles cancel, hours cancel, and you're left with m/s. Sanity check: 29 m/s is a fast car speed, which matches 65 mi/h.</p>`)}
      </div>

      <h3>Try it: unit converter</h3>
      <p class="muted">Pick a quantity, type a value, and see each conversion factor applied in turn.</p>
      <div data-widget="unit-converter"></div>

      <div class="callout warn"><strong>Watch out for squared and cubed units.</strong> If the unit is squared, square the conversion factor too. Converting 3.0 m² to cm² gives \(3.0 \times (100\ \text{cm} / 1\ \text{m})^2 = 3.0 \times 10^4\ \text{cm}^2\), not 300 cm².</div>
      <h3>See why: area scaling</h3>
      <p class="muted">Slide to change the side length. A square that is 1 m on each side is 100 cm on each side, so it holds 100 × 100 squares that are 1 cm².</p>
      <div data-widget="area-scaling"></div>`,
  },

  {
    id: "dimensions",
    title: "Dimensional analysis",
    minutes: 6,
    interactives: ["Dimension checker"],
    body: String.raw`
      <p>Dimensional analysis is a free error check. Every quantity has dimensions: length [L], mass [M], time [T], or combinations of them. Velocity is [L/T] and acceleration is [L/T²].</p>
      <div class="callout"><strong>The rule:</strong> every term you add, subtract, or set equal must have the same dimensions.</div>

      <div class="example">
        <div class="example-label">Example</div>
        <p>Check the constant-acceleration equation you'll meet in Chapter 2:</p>
        $$x = x_0 + v_0 t + \tfrac{1}{2} a t^2$$
        ${solution(String.raw`
          <p>In dimensions, each term is</p>
          $$[L] = [L] + [L/T][T] + [L/T^2][T^2] = [L]$$
          <p>Every term is a length, so the equation is dimensionally consistent.</p>
          <p>Now test a wrong one: \(v = at^2\). The left side is [L/T], but the right side is \([L/T^2][T^2] = [L]\). The dimensions don't match, so the equation must be wrong.</p>`)}
      </div>

      <h3>Try it: dimension checker</h3>
      <p class="muted">Pick an equation. Each term turns green if its dimensions match the left side and red if they don't.</p>
      <div data-widget="dimension-checker"></div>

      <div class="callout warn"><strong>One limit.</strong> Dimensional analysis can't catch a missing pure number like ½ or 2π. It tells you an equation <em>could</em> be right, not that it <em>is</em> right.</div>`,
  },

  {
    id: "sig-figs",
    title: "Uncertainty, significant figures & estimates",
    minutes: 10,
    interactives: ["Accuracy vs. precision target", "Significant-figure counter", "Sig-fig calculator", "Fermi estimator"],
    body: String.raw`
      <p>No measurement is perfect, so every measured number carries an uncertainty. Significant figures are the shorthand for how precise a number is. An estimate gets you a ballpark answer before you do any careful math.</p>

      <h2>Uncertainty</h2>
      <p>A length written as 2.50 ± 0.02 cm means the true value is probably between 2.48 and 2.52 cm. The fractional uncertainty is 0.02 / 2.50 = 0.008, or 0.8%.</p>
      <p><strong>Accuracy vs. precision:</strong> accuracy is how close you are to the true value. Precision is how finely (and how repeatably) you can measure. A ruler with millimeter marks is precise, but if it's warped, it isn't accurate.</p>
      <h3>See it: accuracy vs. precision</h3>
      <p class="muted">The center of the target is the true value. Change the bias and the spread to get all four combinations.</p>
      <div data-widget="accuracy-target"></div>

      <h2>Counting significant figures</h2>
      <ul>
        <li><strong>Nonzero digits always count:</strong> 347 has 3.</li>
        <li><strong>Zeros between nonzero digits count:</strong> 2005 has 4.</li>
        <li><strong>Leading zeros never count:</strong> 0.0042 has 2.</li>
        <li><strong>Trailing zeros after a decimal point count:</strong> 3.50 has 3.</li>
        <li><strong>Use scientific notation to remove ambiguity:</strong> 1.50 × 10³ has 3, while "1500" is unclear.</li>
      </ul>
      <h3>Try it: significant-figure counter</h3>
      <p class="muted">Type any number. Significant digits are highlighted.</p>
      <div data-widget="sigfig-counter"></div>

      <h2>Rounding rules for calculations</h2>
      <p><strong>Multiplying or dividing:</strong> the answer keeps as many significant figures as the least precise input. For example, 3.24 m × 1.5 m = 4.86 m², which rounds to 4.9 m² because 1.5 has only 2 significant figures.</p>
      <p><strong>Adding or subtracting:</strong> the answer keeps as many decimal places as the input with the fewest. For example, 12.11 + 0.3 = 12.41, which rounds to 12.4.</p>
      <div data-widget="sigfig-calc"></div>
      <div class="callout warn"><strong>Round only at the end.</strong> Keep extra digits in intermediate steps. Rounding too early is a common way to lose points to small errors.</div>

      <h2>Order-of-magnitude estimates</h2>
      <p>An estimate (often called a Fermi estimate) uses round numbers to get within a factor of about 10. It's the fastest way to check whether a calculated answer is reasonable.</p>
      <div class="example">
        <div class="example-label">Example</div>
        <p>About how many times does a heart beat in a lifetime?</p>
        ${solution(String.raw`
          <ul><li>About 70 beats per minute</li><li>About 5 × 10⁵ minutes in a year (525,600 exactly)</li><li>About 80 years in a lifetime</li></ul>
          $$70 \times (5\times 10^5) \times 80 \approx 3 \times 10^9 \text{ beats}$$
          <p>The answer is about 3 billion. If a homework calculation ever gave you 3 million or 3 trillion, this estimate would tell you something went wrong.</p>`)}
      </div>
      <h3>Try it: Fermi estimator</h3>
      <p class="muted">Change the inputs and see where the answer lands on a powers-of-ten scale. Even large changes to the inputs rarely move it by a full power of ten.</p>
      <div data-widget="fermi"></div>`,
  },

  {
    id: "vectors",
    title: "Scalars, vectors & adding vectors graphically",
    minutes: 10,
    interactives: ["Distance vs. displacement walk", "Tail-to-head vector addition", "Scalar multiplication"],
    body: String.raw`
      <p>A <strong>scalar</strong> has only a size. A <strong>vector</strong> has a size and a direction. Most of PHYS 206 is about vectors, so this distinction matters on every problem.</p>
      <div class="grid grid-2">
        <div class="card"><h3>Scalars</h3><p>mass, time, temperature, distance, speed, energy</p></div>
        <div class="card"><h3>Vectors</h3><p>displacement, velocity, acceleration, force, momentum</p></div>
      </div>
      <p style="margin-top:16px">Vectors are written in bold (<strong>A</strong>) or with an arrow on top \((\vec{A})\). The magnitude, written |A| or just A, is the vector's length. A magnitude is never negative.</p>

      <h2>Distance vs. displacement</h2>
      <p>This is the classic first example. Walk 3 m east, then 4 m north.</p>
      <ul>
        <li>Your <strong>distance</strong> traveled is 3 + 4 = 7 m. That's a scalar.</li>
        <li>Your <strong>displacement</strong> is the straight arrow from start to finish. Its magnitude is \(\sqrt{3^2 + 4^2} = 5\) m, pointing 53.1° north of east.</li>
      </ul>
      <h3>Try it: take a walk</h3>
      <p class="muted">Click the grid to add stops to your path. Distance adds up every leg. Displacement only cares about where you start and where you end. Try walking in a loop back to the start.</p>
      <div data-widget="walker"></div>

      <h2>Adding vectors tail-to-head</h2>
      <p>To add <strong>A</strong> + <strong>B</strong> by drawing:</p>
      <ol>
        <li>Draw <strong>A</strong> to scale in its direction.</li>
        <li>Place the tail of <strong>B</strong> at the head (arrow tip) of <strong>A</strong>.</li>
        <li>The sum <strong>R</strong> is the arrow from the tail of <strong>A</strong> to the head of <strong>B</strong>.</li>
      </ol>
      <p>Order doesn't matter: A + B = B + A. If you draw both orders, the two paths form a parallelogram, and R is its diagonal.</p>
      <h3>Try it: vector addition</h3>
      <p class="muted">Drag the tips of A and B. Turn on the parallelogram to see that B + A gives the same R. Switch to subtraction to see A − B = A + (−B).</p>
      <div data-widget="vector-add" data-a="3,0" data-b="4,90"></div>
      <div class="callout"><strong>Key idea:</strong> you can't add vector magnitudes directly unless the vectors point the same way. A 3 m and a 4 m vector can add to anything from 1 m to 7 m, depending on their directions. Rotate B above and watch |R| change.</div>

      <h2>Negative vectors and subtraction</h2>
      <p>The vector −B has the same magnitude as B but points the opposite way. Subtraction is just adding a negative: A − B = A + (−B).</p>

      <h2>Multiplying a vector by a scalar</h2>
      <p>Multiplying <strong>A</strong> by a number c scales its length by |c|. If c is positive, the direction stays the same. If c is negative, the direction flips. So 2A is twice as long as A, and −2A is twice as long and pointing backward.</p>
      <div data-widget="scalar-multiply"></div>
      <p class="muted">Drawings are great for intuition, but they're slow and imprecise. For exact answers, use components, covered next.</p>`,
  },

  {
    id: "components",
    title: "Components & unit vectors",
    minutes: 12,
    interactives: ["Component explorer", "Component addition"],
    body: String.raw`
      <p>Components turn vector problems into ordinary arithmetic. You split each vector into an x-part and a y-part, add the parts separately, then rebuild the result. This is the method you'll use on almost every exam problem.</p>

      <h2>Breaking a vector into components</h2>
      <p>Measure the angle θ counterclockwise from the +x axis. Then:</p>
      $$A_x = A\cos\theta \qquad A_y = A\sin\theta$$
      <p>Components can be negative, and the sign carries the direction. A vector pointing left has a negative \(A_x\), and one pointing down has a negative \(A_y\).</p>

      <h2>Rebuilding a vector from components</h2>
      $$A = \sqrt{A_x^2 + A_y^2} \qquad \theta = \tan^{-1}\!\left(\frac{A_y}{A_x}\right)$$
      <div class="callout warn"><strong>The quadrant trap.</strong> A calculator's inverse tangent only returns angles between −90° and +90°. If \(A_x\) is negative, add 180° to the calculator's answer.<br/><br/>For example, \(A_x = -3\) and \(A_y = -4\) gives \(\tan^{-1}(-4/-3) = 53.1°\) on a calculator. But this vector points down and to the left, into the third quadrant. The real angle is 53.1° + 180° = 233.1°. Always sketch the vector first so you can see which quadrant it's in.</div>
      <h3>Try it: component explorer</h3>
      <p class="muted">Drag the tip of A into each quadrant. Compare what a calculator's tan⁻¹ says with the real angle.</p>
      <div data-widget="components"></div>

      <h2>Adding vectors by components</h2>
      <p>To find R = A + B, add the x-parts together and the y-parts together:</p>
      $$R_x = A_x + B_x \qquad R_y = A_y + B_y$$
      <div class="example">
        <div class="example-label">Worked example</div>
        <p><strong>A</strong> is 5.0 m at 30°, and <strong>B</strong> is 8.0 m at 120°. Find R = A + B.</p>
        ${solution(String.raw`
          <ol>
            <li>Components of A: \(A_x = 5.0\cos 30° = 4.33\) m, and \(A_y = 5.0\sin 30° = 2.50\) m.</li>
            <li>Components of B: \(B_x = 8.0\cos 120° = -4.00\) m, and \(B_y = 8.0\sin 120° = 6.93\) m.</li>
            <li>Add them: \(R_x = 4.33 + (-4.00) = 0.33\) m, and \(R_y = 2.50 + 6.93 = 9.43\) m.</li>
            <li>Magnitude: \(R = \sqrt{0.33^2 + 9.43^2} = 9.4\) m.</li>
            <li>Direction: \(\theta = \tan^{-1}(9.43 / 0.33) = 88°\). \(R_x\) is positive, so no quadrant correction is needed.</li>
          </ol>
          <p>The result, 9.4 m at 88°, points almost straight up. That makes sense: the x-parts nearly cancel, while the y-parts both point up.</p>`)}
      </div>
      <h3>See it: the worked example, live</h3>
      <p class="muted">This model starts at the worked example. The component table updates as you drag.</p>
      <div data-widget="vector-add" data-a="5,30" data-b="8,120" data-components="1"></div>

      <h2>Unit vectors: î, ĵ, k̂</h2>
      <p>A unit vector has a magnitude of exactly 1 and no units. It just points. The three standard ones point along the axes: \(\hat{\imath}\) along +x, \(\hat{\jmath}\) along +y, and \(\hat{k}\) along +z. Any vector can then be written in one line:</p>
      $$\vec{A} = A_x\,\hat{\imath} + A_y\,\hat{\jmath} + A_z\,\hat{k}$$
      <p>The result from the worked example becomes \(\vec{R} = (0.33\,\hat{\imath} + 9.43\,\hat{\jmath})\) m. In three dimensions, the magnitude extends naturally to \(\sqrt{A_x^2 + A_y^2 + A_z^2}\).</p>`,
  },

  {
    id: "products",
    title: "Products of vectors: dot & cross",
    minutes: 14,
    interactives: ["Dot product projector", "3D cross product model"],
    body: String.raw`
      <p>There are two ways to multiply two vectors. The <strong>dot product</strong> gives a number and measures how much two vectors point the same way. The <strong>cross product</strong> gives a new vector perpendicular to both. You'll use the dot product for work (Chapter 6) and the cross product for torque (Chapter 10).</p>

      <h2>The dot (scalar) product</h2>
      <p>Place the two vectors tail to tail, and let φ be the angle between them. Then:</p>
      $$\vec{A}\cdot\vec{B} = AB\cos\phi = A_xB_x + A_yB_y + A_zB_z$$
      <p>The result is a scalar, and its sign tells you about the angle:</p>
      <ul>
        <li><strong>Positive:</strong> the vectors point mostly the same way (φ &lt; 90°)</li>
        <li><strong>Zero:</strong> the vectors are perpendicular (φ = 90°)</li>
        <li><strong>Negative:</strong> the vectors point mostly opposite (φ &gt; 90°)</li>
      </ul>
      <p>For unit vectors, \(\hat{\imath}\cdot\hat{\imath} = \hat{\jmath}\cdot\hat{\jmath} = \hat{k}\cdot\hat{k} = 1\), and \(\hat{\imath}\cdot\hat{\jmath} = \hat{\jmath}\cdot\hat{k} = \hat{k}\cdot\hat{\imath} = 0\). That's why the component formula works: all the mixed terms vanish.</p>
      <h3>See it: the dot product as a projection</h3>
      <p class="muted">The shaded segment is the part of B that lies along A. A·B is |A| times that segment's signed length. Drag B around and watch the sign flip at 90°.</p>
      <div data-widget="dot-product"></div>

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>Let \(\vec{A} = 2\hat{\imath} + 3\hat{\jmath}\) and \(\vec{B} = 4\hat{\imath} - \hat{\jmath}\). Find A·B and the angle between them.</p>
        ${solution(String.raw`
          <ol>
            <li>Dot product: A·B = (2)(4) + (3)(−1) = 8 − 3 = 5.</li>
            <li>Magnitudes: \(A = \sqrt{2^2 + 3^2} = \sqrt{13} = 3.61\), and \(B = \sqrt{4^2 + 1^2} = \sqrt{17} = 4.12\).</li>
            <li>Angle: \(\cos\phi = 5 / (3.61 \times 4.12) = 0.336\), so φ = 70.3°.</li>
          </ol>
          <p>This is the most common use of the dot product in Unit 1: finding the angle between two vectors given in components. The dot product model above starts at this example.</p>`)}
      </div>

      <h2>The cross (vector) product</h2>
      <p>The cross product \(\vec{C} = \vec{A}\times\vec{B}\) is a vector. Its magnitude is:</p>
      $$|\vec{A}\times\vec{B}| = AB\sin\phi$$
      <p>Its direction is perpendicular to both A and B, found with the <strong>right-hand rule</strong>. Point the fingers of your right hand along A, curl them toward B, and your thumb points along A × B.</p>
      <h3>See it in 3D</h3>
      <p class="muted">Drag to rotate the view. The shaded parallelogram's area equals |A × B|. Swap the order to watch the result flip.</p>
      <div data-widget="cross-3d"></div>

      <h3>Key properties</h3>
      <ul>
        <li><strong>Order matters:</strong> A × B = −(B × A). Swapping the order flips the direction.</li>
        <li><strong>Parallel vectors give zero:</strong> sin 0° = 0, so \(\hat{\imath}\times\hat{\imath} = 0\).</li>
        <li><strong>Unit vector cycle:</strong> \(\hat{\imath}\times\hat{\jmath} = \hat{k}\), \(\hat{\jmath}\times\hat{k} = \hat{\imath}\), and \(\hat{k}\times\hat{\imath} = \hat{\jmath}\). Going backward around the cycle gives a minus sign.</li>
      </ul>
      <p>The component formula:</p>
      $$\vec{A}\times\vec{B} = (A_yB_z - A_zB_y)\,\hat{\imath} + (A_zB_x - A_xB_z)\,\hat{\jmath} + (A_xB_y - A_yB_x)\,\hat{k}$$

      <div class="example">
        <div class="example-label">Worked example</div>
        <p>Using the same \(\vec{A} = 2\hat{\imath} + 3\hat{\jmath}\) and \(\vec{B} = 4\hat{\imath} - \hat{\jmath}\), find A × B. Both have zero z-components, so only the \(\hat{k}\) term survives.</p>
        ${solution(String.raw`
          <ol>
            <li>\(\vec{A}\times\vec{B} = (A_xB_y - A_yB_x)\,\hat{k} = [(2)(-1) - (3)(4)]\,\hat{k} = -14\,\hat{k}\).</li>
            <li>Check with the magnitude formula: AB sin φ = (3.61)(4.12) sin 70.3° = 14.0. It matches.</li>
          </ol>
          <p>The minus sign means the result points along −z, into the page if x is right and y is up. The right-hand rule confirms it: curling from A toward B goes clockwise, so your thumb points into the page. The 3D model above starts at this example; rotate it to look down from +z.</p>`)}
      </div>`,
  },

  {
    id: "practice",
    title: "Common mistakes & practice problems",
    minutes: 15,
    interactives: ["Answer checker"],
    body: String.raw`
      <p>Most lost points in Unit 1 come from a small set of repeat mistakes, not from hard physics. Check this list before every quiz, then test yourself with the problems below.</p>

      <h2>Common mistakes</h2>
      <ul class="mistakes">
        <li><strong>Dropping units.</strong> Write units at every step; they catch errors for you.</li>
        <li><strong>Not squaring the conversion factor</strong> for areas and volumes: 1 m² = 10⁴ cm², not 100 cm².</li>
        <li><strong>Calculator in radians mode</strong> when the problem uses degrees.</li>
        <li><strong>Trusting tan⁻¹ blindly.</strong> If the x-component is negative, add 180°.</li>
        <li><strong>Adding magnitudes instead of components.</strong> 3 m + 4 m only equals 7 m when the vectors point the same way.</li>
        <li><strong>Mixing up</strong> distance and displacement, or speed and velocity.</li>
        <li><strong>Rounding too early.</strong> Keep extra digits until the final answer.</li>
        <li><strong>Swapping the cross product order.</strong> A × B = −(B × A).</li>
      </ul>

      <h2>Key formulas</h2>
      $$A_x = A\cos\theta,\quad A_y = A\sin\theta,\quad A = \sqrt{A_x^2 + A_y^2 + A_z^2}$$
      $$\vec{A}\cdot\vec{B} = AB\cos\phi = A_xB_x + A_yB_y + A_zB_z$$
      $$|\vec{A}\times\vec{B}| = AB\sin\phi$$

      <h2>Practice problems</h2>
      <p class="muted">Type your answer to check it, then open the full solution.</p>
      <ol class="problems">
        <li class="problem">
          <p>Convert 1.2 km/min to m/s.</p>
          <div data-widget="answer-check" data-answer="20" data-unit="m/s"></div>
          ${solution("1.2 km/min × (1000 m / 1 km) × (1 min / 60 s) = <strong>20 m/s</strong>.")}
        </li>
        <li class="problem">
          <p>Is the equation x = vt² dimensionally correct? Explain.</p>
          ${solution("No. The right side is [L/T][T²] = [L·T], which isn't a length, so it can't equal x.", "Show answer")}
        </li>
        <li class="problem">
          <p>Calculate 4.52 × 2.1 with the correct number of significant figures.</p>
          <div data-widget="answer-check" data-answer="9.5" data-exact="1"></div>
          ${solution("4.52 × 2.1 = 9.492, which rounds to <strong>9.5</strong> (2 significant figures, set by 2.1).")}
        </li>
        <li class="problem">
          <p>Find the x- and y-components of a 10.0 m vector at 210°.</p>
          <div data-widget="answer-check" data-answer="-8.66" data-label="Aₓ" data-unit="m"></div>
          <div data-widget="answer-check" data-answer="-5.00" data-label="Aᵧ" data-unit="m"></div>
          ${solution("Aₓ = 10.0 cos 210° = <strong>−8.66 m</strong>, and Aᵧ = 10.0 sin 210° = <strong>−5.00 m</strong>. Both are negative because the vector points into the third quadrant.")}
        </li>
        <li class="problem">
          <p>You walk 120 m north, then 50 m west. Find your displacement (magnitude and direction).</p>
          <div data-widget="answer-check" data-answer="130" data-label="Magnitude" data-unit="m"></div>
          <div data-widget="answer-check" data-answer="22.6" data-label="Angle west of north" data-unit="°"></div>
          ${solution("Magnitude: √(120² + 50²) = <strong>130 m</strong>. Direction: tan⁻¹(50/120) = <strong>22.6° west of north</strong>.")}
        </li>
        <li class="problem">
          <p>For \(\vec{A} = 3\hat{\imath} - 2\hat{\jmath} + \hat{k}\) and \(\vec{B} = -\hat{\imath} + 4\hat{\jmath} + 2\hat{k}\), find A·B and A × B.</p>
          <div data-widget="answer-check" data-answer="-7" data-label="A·B"></div>
          ${solution(String.raw`
            <p>A·B = (3)(−1) + (−2)(4) + (1)(2) = <strong>−7</strong>. For the cross product:</p>
            <ul>
              <li>\(\hat{\imath}\): (−2)(2) − (1)(4) = −8</li>
              <li>\(\hat{\jmath}\): (1)(−1) − (3)(2) = −7</li>
              <li>\(\hat{k}\): (3)(4) − (−2)(−1) = 10</li>
            </ul>
            <p>So <strong>A × B = −8î − 7ĵ + 10k̂</strong>. Check: its dot product with A is −24 + 14 + 10 = 0, so it's perpendicular, as it must be. You can enter these vectors in the 3D cross product model to see it.</p>`)}
        </li>
      </ol>`,
  },
];

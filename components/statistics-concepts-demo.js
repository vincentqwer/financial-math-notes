function createStatsSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function renderStatisticsConceptDemo(root) {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const type = root.dataset.demo;
  const state = { step: 0 };

  const copy = {
    "sampling-se": [
      "원자료는 그대로 흩어져 있습니다. 이 퍼짐이 SD입니다.",
      "표본평균은 표본을 다시 뽑을 때마다 움직입니다.",
      "n이 커지면 평균들의 분포가 좁아집니다. 이것이 SE가 작아지는 장면입니다.",
    ],
    "bias-mse": [
      "참값 주변에 추정값들이 모여 있습니다.",
      "중심이 참값에서 벗어나면 bias가 생깁니다.",
      "퍼짐까지 함께 보면 MSE = variance + bias^2 입니다.",
    ],
    "hypothesis-test": [
      "귀무가설 아래에서 나올 법한 분포를 먼저 둡니다.",
      "관측된 검정통계량이 꼬리 쪽으로 갈수록 이상한 결과입니다.",
      "꼬리 확률이 p-value이고, 충분히 작으면 H0를 기각합니다.",
    ],
    "normal-cdf": [
      "정규분포의 중심은 평균이고, 폭은 표준편차가 정합니다.",
      "Phi(x)는 x 왼쪽 넓이입니다.",
      "오른쪽 꼬리확률은 1 - Phi(x)로 읽습니다.",
    ],
    likelihood: [
      "데이터는 이미 관측되어 고정되어 있습니다.",
      "모수값을 바꿔 보며 관측 데이터가 얼마나 그럴듯한지 봅니다.",
      "우도가 최대인 지점이 MLE입니다.",
    ],
    "taylor-series": [
      "복잡한 함수도 한 점 주변에서는 접선으로 먼저 흉내낼 수 있습니다.",
      "2차항을 더하면 곡률까지 반영합니다.",
      "통계에서는 로그우도와 추정량을 근사할 때 자주 씁니다.",
    ],
    "exponential-wait": [
      "지수분포는 다음 사건까지 기다리는 시간을 나타냅니다.",
      "lambda가 클수록 사건이 자주 발생하므로 평균 대기시간이 짧아집니다.",
      "무기억성은 이미 기다린 시간이 앞으로의 대기시간을 바꾸지 않는다는 뜻입니다.",
    ],
    "chi-square": [
      "표준정규값을 제곱하면 항상 0 이상입니다.",
      "여러 제곱값을 더하면 카이제곱분포가 됩니다.",
      "관측빈도와 기대빈도의 차이가 커질수록 검정통계량이 커집니다.",
    ],
  };

  root.innerHTML = `
    <div class="stat-demo">
      <svg class="stat-demo__svg" viewBox="0 0 760 390" role="img" aria-label="통계 개념 애니메이션"></svg>
      <div class="stat-demo__footer">
        <strong data-title></strong>
        <p data-caption></p>
        <div class="stat-demo__controls">
          <button type="button" data-action="prev">이전</button>
          <button type="button" data-action="next">다음</button>
          <button type="button" data-action="reset">처음</button>
        </div>
      </div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const title = root.querySelector("[data-title]");
  const caption = root.querySelector("[data-caption]");
  const maxStep = (copy[type]?.length || 1) - 1;

  function el(name, attrs = {}, text = "") {
    const node = createStatsSvgElement(name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }

  function append(parent, name, attrs = {}, text = "") {
    const node = el(name, attrs, text);
    parent.append(node);
    return node;
  }

  function line(x1, y1, x2, y2, klass = "stat-line") {
    append(svg, "line", { x1, y1, x2, y2, class: klass });
  }

  function text(value, x, y, size = 18, klass = "stat-text") {
    append(svg, "text", { x, y, class: klass, "font-size": size }, value);
  }

  function gaussianPath(cx, base, width, height) {
    const points = [];
    for (let i = -90; i <= 90; i += 4) {
      const x = cx + (i / 90) * width;
      const y = base - height * Math.exp(-0.5 * (i / 34) ** 2);
      points.push(`${points.length ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  }

  function axes() {
    line(78, 312, 690, 312, "stat-axis");
    line(96, 330, 96, 58, "stat-axis");
  }

  function renderSamplingSe() {
    title.textContent = "SD와 SE";
    axes();
    text("raw data", 96, 44, 18, "stat-label");
    const raw = [142, 170, 188, 214, 248, 258, 310, 340, 372, 420, 466, 522, 586, 614];
    raw.forEach((x, i) => append(svg, "circle", { cx: x, cy: 134 + (i % 3) * 15, r: 7, class: "stat-dot stat-dot--raw" }));
    line(378, 112, 378, 176, "stat-marker");
    text("SD: 개별 데이터의 퍼짐", 412, 126, 18);

    if (state.step >= 1) {
      text("sampling means", 96, 205, 18, "stat-label");
      [262, 296, 334, 372, 410, 448, 486].forEach((x, i) => append(svg, "circle", { cx: x, cy: 258 + (i % 2) * 12, r: 7, class: "stat-dot stat-dot--mean" }));
      line(374, 236, 374, 294, "stat-marker");
      text("SE: 평균 추정량의 흔들림", 412, 250, 18);
    }

    if (state.step >= 2) {
      append(svg, "path", { d: gaussianPath(374, 312, 72, 70), class: "stat-curve stat-curve--wide" });
      append(svg, "path", { d: gaussianPath(374, 312, 38, 105), class: "stat-curve stat-curve--narrow" });
      text("n 증가 → SE 감소", 458, 304, 20, "stat-emphasis");
    }
  }

  function renderBiasMse() {
    title.textContent = "Bias, Variance, MSE";
    axes();
    line(370, 84, 370, 318, "stat-marker");
    text("참값 θ", 338, 70, 18, "stat-label");
    const unbiased = [[340, 166], [366, 150], [390, 174], [352, 196], [382, 208], [406, 192]];
    unbiased.forEach(([x, y]) => append(svg, "circle", { cx: x, cy: y, r: 8, class: "stat-dot stat-dot--mean" }));
    text("variance", 302, 238, 18);

    if (state.step >= 1) {
      line(512, 84, 512, 318, "stat-marker stat-marker--danger");
      text("E(θ̂)", 492, 70, 18, "stat-label stat-label--danger");
      append(svg, "path", { d: "M 370 112 C 408 96, 468 96, 512 112", class: "stat-arrow" });
      text("bias", 431, 94, 18, "stat-emphasis");
      [[492, 166], [516, 150], [542, 174], [504, 198], [532, 208]].forEach(([x, y]) => append(svg, "circle", { cx: x, cy: y, r: 8, class: "stat-dot stat-dot--bad" }));
    }

    if (state.step >= 2) {
      append(svg, "rect", { x: 116, y: 270, width: 518, height: 54, rx: 8, class: "stat-formula-box" });
      text("MSE(θ̂) = Var(θ̂) + Bias(θ̂)²", 172, 305, 24, "stat-formula");
    }
  }

  function renderHypothesis() {
    title.textContent = "가설검정과 p-value";
    axes();
    append(svg, "path", { d: gaussianPath(366, 312, 190, 180), class: "stat-curve" });
    text("H0 아래의 분포", 288, 76, 20, "stat-label");
    if (state.step >= 1) {
      line(548, 116, 548, 318, "stat-marker stat-marker--danger");
      text("관측값", 520, 104, 18, "stat-label--danger");
    }
    if (state.step >= 2) {
      append(svg, "path", { d: "M 548 312 C 574 280, 606 270, 666 294 L 666 312 Z", class: "stat-tail" });
      text("p-value", 590, 260, 22, "stat-emphasis");
      text("꼬리 면적이 작으면 H0 기각", 238, 354, 22, "stat-formula");
    }
  }

  function renderNormalCdf() {
    title.textContent = "정규분포와 Phi(x)";
    axes();
    append(svg, "path", { d: gaussianPath(366, 312, 190, 180), class: "stat-curve" });
    line(366, 100, 366, 318, "stat-marker");
    text("μ", 359, 342, 20, "stat-label");
    if (state.step >= 1) {
      append(svg, "path", { d: "M 96 312 C 182 310, 250 258, 300 170 C 318 138, 336 114, 366 132 L 366 312 Z", class: "stat-area" });
      line(366, 112, 366, 318, "stat-marker stat-marker--danger");
      text("Φ(x) = P(Z ≤ x)", 406, 160, 23, "stat-formula");
    }
    if (state.step >= 2) {
      append(svg, "path", { d: "M 504 312 C 542 220, 582 164, 666 306 L 666 312 Z", class: "stat-tail" });
      line(504, 202, 504, 318, "stat-marker stat-marker--danger");
      text("1 - Φ(x)", 532, 236, 23, "stat-emphasis");
    }
  }

  function renderLikelihood() {
    title.textContent = "우도와 MLE";
    axes();
    const dataX = [250, 274, 296, 318, 348, 370, 394, 424];
    dataX.forEach((x) => append(svg, "circle", { cx: x, cy: 294, r: 6, class: "stat-dot stat-dot--raw" }));
    text("관측 데이터는 고정", 248, 346, 19, "stat-label");
    const curve = state.step === 0 ? gaussianPath(282, 312, 70, 118) : state.step === 1 ? gaussianPath(430, 312, 70, 118) : gaussianPath(342, 312, 88, 150);
    append(svg, "path", { d: curve, class: "stat-curve stat-curve--bad" });
    if (state.step >= 1) text("모수 μ를 움직여 본다", 420, 118, 20, "stat-emphasis");
    if (state.step >= 2) {
      line(342, 116, 342, 318, "stat-marker stat-marker--danger");
      text("L(θ) 최대", 378, 138, 23, "stat-formula");
    }
  }

  function renderTaylor() {
    title.textContent = "테일러급수";
    axes();
    append(svg, "path", { d: "M 106 294 C 190 282, 246 248, 318 190 C 410 116, 514 96, 648 128", class: "stat-curve" });
    append(svg, "circle", { cx: 346, cy: 170, r: 7, class: "stat-dot stat-dot--mean" });
    text("a", 339, 344, 19, "stat-label");
    if (state.step >= 1) {
      line(184, 252, 560, 108, "stat-tangent");
      text("1차: 접선", 478, 94, 20, "stat-emphasis");
    }
    if (state.step >= 2) {
      append(svg, "path", { d: "M 154 286 C 250 236, 344 170, 548 126", class: "stat-curve stat-curve--narrow" });
      text("2차: 곡률까지 근사", 420, 246, 20, "stat-formula");
    }
  }

  function renderExponential() {
    title.textContent = "지수분포";
    axes();
    append(svg, "path", { d: "M 96 90 C 150 152, 210 212, 294 254 C 386 300, 498 312, 662 312", class: "stat-curve" });
    text("f(x)=λe^{-λx}", 104, 76, 23, "stat-formula");
    if (state.step >= 1) {
      append(svg, "path", { d: "M 96 72 C 126 128, 174 220, 264 274 C 362 320, 504 314, 662 312", class: "stat-curve stat-curve--bad" });
      text("λ 증가 → 대기시간 감소", 332, 142, 21, "stat-emphasis");
    }
    if (state.step >= 2) {
      append(svg, "rect", { x: 146, y: 250, width: 416, height: 58, rx: 8, class: "stat-formula-box" });
      text("P(X > s+t | X > s) = P(X > t)", 180, 286, 22, "stat-formula");
    }
  }

  function renderChiSquare() {
    title.textContent = "카이제곱";
    axes();
    const values = [[150, 120], [220, 175], [290, 148], [360, 210]];
    values.forEach(([x, y], i) => {
      append(svg, "circle", { cx: x, cy: y, r: 8, class: "stat-dot stat-dot--raw" });
      text(`Z${i + 1}`, x - 12, y - 18, 15, "stat-label");
      if (state.step >= 1) {
        line(x, y + 10, x, 312, "stat-marker");
        text(`Z${i + 1}²`, x - 16, 340, 16, "stat-label");
      }
    });
    if (state.step >= 1) text("제곱해서 모두 양수로 만든다", 430, 152, 20, "stat-emphasis");
    if (state.step >= 2) {
      append(svg, "rect", { x: 426, y: 214, width: 230, height: 62, rx: 8, class: "stat-formula-box" });
      text("χ² = Σ Zᵢ²", 478, 254, 25, "stat-formula");
    }
  }

  function draw() {
    svg.innerHTML = "";
    append(svg, "rect", { x: 0, y: 0, width: 760, height: 390, class: "stat-bg" });
    const renderers = {
      "sampling-se": renderSamplingSe,
      "bias-mse": renderBiasMse,
      "hypothesis-test": renderHypothesis,
      "normal-cdf": renderNormalCdf,
      likelihood: renderLikelihood,
      "taylor-series": renderTaylor,
      "exponential-wait": renderExponential,
      "chi-square": renderChiSquare,
    };
    (renderers[type] || renderSamplingSe)();
    caption.textContent = copy[type]?.[state.step] || "";
  }

  root.querySelector("[data-action='prev']").addEventListener("click", () => {
    state.step = Math.max(0, state.step - 1);
    draw();
  });
  root.querySelector("[data-action='next']").addEventListener("click", () => {
    state.step = Math.min(maxStep, state.step + 1);
    draw();
  });
  root.querySelector("[data-action='reset']").addEventListener("click", () => {
    state.step = 0;
    draw();
  });

  draw();
}

window.initStatisticsConceptDemos = function initStatisticsConceptDemos(scope = document) {
  scope
    .querySelectorAll(
      "[data-demo='sampling-se'], [data-demo='bias-mse'], [data-demo='hypothesis-test'], [data-demo='normal-cdf'], [data-demo='likelihood'], [data-demo='taylor-series'], [data-demo='exponential-wait'], [data-demo='chi-square']",
    )
    .forEach(renderStatisticsConceptDemo);
};

(function () {
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
  ];

  const states = [
    {
      label: "조금 틀린 직선",
      beta0: 1,
      beta1: 1,
      interceptDot: 1,
      slopeDot: 3,
      note: "잔차가 절편 방향과 기울기 방향에 남아 있어서 RSS를 더 줄일 수 있다.",
    },
    {
      label: "최적 직선",
      beta0: 1 / 3,
      beta1: 3 / 2,
      interceptDot: 0,
      slopeDot: 0,
      note: "잔차가 X의 두 열벡터에 직교한다. 이때 RSS가 최소가 된다.",
    },
  ];

  function fmt(value) {
    if (Math.abs(value) < 0.001) return "0";
    return Number(value.toFixed(3)).toString();
  }

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function render(container, stateIndex) {
    const state = states[stateIndex];
    const width = 640;
    const height = 360;
    const pad = 52;
    const xMin = 0.5;
    const xMax = 3.5;
    const yMin = 1;
    const yMax = 5.6;
    const projectX = (x) => pad + ((x - xMin) / (xMax - xMin)) * (width - pad * 2);
    const projectY = (y) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - pad * 2);
    const yHat = data.map((point) => state.beta0 + state.beta1 * point.x);
    const residuals = data.map((point, index) => point.y - yHat[index]);
    const rss = residuals.reduce((sum, value) => sum + value * value, 0);
    const lineStart = { x: xMin, y: state.beta0 + state.beta1 * xMin };
    const lineEnd = { x: xMax, y: state.beta0 + state.beta1 * xMax };

    container.innerHTML = "";
    const shell = makeEl("section", "orthogonal-demo");
    const header = makeEl("div", "orthogonal-demo__header");
    header.append(makeEl("h3", "", "잔차 직교 조건 애니메이션"));
    header.append(makeEl("p", "", state.note));

    const stage = makeEl("div", "orthogonal-demo__stage");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "선형회귀 잔차와 직교 조건 시각화");

    const grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
    grid.setAttribute("class", "orthogonal-demo__grid");
    for (let x = 1; x <= 3; x += 1) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", projectX(x));
      line.setAttribute("x2", projectX(x));
      line.setAttribute("y1", pad);
      line.setAttribute("y2", height - pad);
      grid.append(line);
    }
    for (let y = 2; y <= 5; y += 1) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", pad);
      line.setAttribute("x2", width - pad);
      line.setAttribute("y1", projectY(y));
      line.setAttribute("y2", projectY(y));
      grid.append(line);
    }
    svg.append(grid);

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("class", "orthogonal-demo__axis");
    xAxis.setAttribute("x1", pad);
    xAxis.setAttribute("x2", width - pad);
    xAxis.setAttribute("y1", height - pad);
    xAxis.setAttribute("y2", height - pad);
    svg.append(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("class", "orthogonal-demo__axis");
    yAxis.setAttribute("x1", pad);
    yAxis.setAttribute("x2", pad);
    yAxis.setAttribute("y1", pad);
    yAxis.setAttribute("y2", height - pad);
    svg.append(yAxis);

    const fitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    fitLine.setAttribute("class", "orthogonal-demo__fit");
    fitLine.setAttribute("x1", projectX(lineStart.x));
    fitLine.setAttribute("y1", projectY(lineStart.y));
    fitLine.setAttribute("x2", projectX(lineEnd.x));
    fitLine.setAttribute("y2", projectY(lineEnd.y));
    svg.append(fitLine);

    data.forEach((point, index) => {
      const x = projectX(point.x);
      const y = projectY(point.y);
      const yh = projectY(yHat[index]);

      const residual = document.createElementNS("http://www.w3.org/2000/svg", "line");
      residual.setAttribute("class", "orthogonal-demo__residual");
      residual.setAttribute("x1", x);
      residual.setAttribute("x2", x);
      residual.setAttribute("y1", y);
      residual.setAttribute("y2", yh);
      residual.style.animationDelay = `${index * 120}ms`;
      svg.append(residual);

      const fitted = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      fitted.setAttribute("class", "orthogonal-demo__fitted");
      fitted.setAttribute("cx", x);
      fitted.setAttribute("cy", yh);
      fitted.setAttribute("r", 6);
      svg.append(fitted);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "orthogonal-demo__point");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", 7);
      svg.append(dot);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "orthogonal-demo__label");
      label.setAttribute("x", x + 10);
      label.setAttribute("y", y - 8);
      label.textContent = `(${point.x}, ${point.y})`;
      svg.append(label);
    });

    stage.append(svg);

    const panel = makeEl("div", "orthogonal-demo__panel");
    panel.append(makeEl("strong", "", state.label));
    panel.append(makeEl("p", "", `ŷ = ${fmt(state.beta0)} + ${fmt(state.beta1)}x`));
    panel.append(makeEl("p", "", `ŷ = [${yHat.map(fmt).join(", ")}]`));
    panel.append(makeEl("p", "", `e = [${residuals.map(fmt).join(", ")}]`));
    panel.append(makeEl("p", "", `RSS = ${fmt(rss)}`));

    const checks = makeEl("div", "orthogonal-demo__checks");
    const intercept = makeEl("span", state.interceptDot === 0 ? "is-zero" : "is-not-zero", `x₁ᵀe = ${fmt(state.interceptDot)}`);
    const slope = makeEl("span", state.slopeDot === 0 ? "is-zero" : "is-not-zero", `x₂ᵀe = ${fmt(state.slopeDot)}`);
    checks.append(intercept, slope);
    panel.append(checks);

    const controls = makeEl("div", "orthogonal-demo__controls");
    const wrongButton = makeEl("button", stateIndex === 0 ? "active" : "", "틀린 직선");
    const bestButton = makeEl("button", stateIndex === 1 ? "active" : "", "최적 직선");
    wrongButton.type = "button";
    bestButton.type = "button";
    wrongButton.addEventListener("click", () => render(container, 0));
    bestButton.addEventListener("click", () => render(container, 1));
    controls.append(wrongButton, bestButton);
    panel.append(controls);

    stage.append(panel);
    shell.append(header, stage);
    container.append(shell);
  }

  window.initOrthogonalResidualDemos = function initOrthogonalResidualDemos(root = document) {
    root.querySelectorAll("[data-orthogonal-residual-demo]").forEach((container) => {
      render(container, 0);
    });
  };
})();

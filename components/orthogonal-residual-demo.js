(function () {
  const steps = [
    {
      title: "1. 가능한 예측값들의 공간",
      caption: "Col(X)는 X의 열벡터들을 선형결합해서 만들 수 있는 모든 예측값 Xβ의 집합이다.",
      active: "space",
    },
    {
      title: "2. y를 가장 가까운 곳으로 내린다",
      caption: "실제 반응벡터 y가 열공간 밖에 있으면, least squares는 y에 가장 가까운 Xβ를 찾는다.",
      active: "projection",
    },
    {
      title: "3. 남은 부분이 잔차 e",
      caption: "잔차 e = y - Xβ̂ 는 열공간 밖으로 남은 부분이고, X의 모든 열벡터와 직교한다.",
      active: "residual",
    },
  ];

  function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function svgEl(tag, attrs = {}, text) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function arrow(id, color) {
    return svgEl("marker", {
      id,
      markerWidth: "10",
      markerHeight: "10",
      refX: "8",
      refY: "5",
      orient: "auto",
      markerUnits: "strokeWidth",
    }, undefined).appendChild(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color })).parentNode;
  }

  function render(container, stepIndex) {
    const step = steps[stepIndex];
    container.innerHTML = "";

    const shell = makeEl("section", `orthogonal-demo orthogonal-demo--${step.active}`);
    const header = makeEl("div", "orthogonal-demo__header");
    header.append(makeEl("h3", "", "열공간 투영으로 보는 least squares"));
    header.append(makeEl("p", "", "회귀는 y를 가능한 예측값들의 공간 Col(X)에 가장 가깝게 투영하는 문제다."));

    const stage = makeEl("div", "orthogonal-demo__stage");
    const svg = svgEl("svg", {
      viewBox: "0 0 720 430",
      role: "img",
      "aria-label": "y를 X의 열공간에 투영하고 잔차가 직교하는 모습을 보여주는 애니메이션",
    });

    const defs = svgEl("defs");
    defs.append(arrow("orth-arrow-blue", "#2563eb"));
    defs.append(arrow("orth-arrow-red", "#ef4444"));
    defs.append(arrow("orth-arrow-slate", "#475569"));
    svg.append(defs);

    const plane = svgEl("polygon", {
      class: "orthogonal-plane",
      points: "145,292 415,185 620,258 350,365",
    });
    svg.append(plane);

    const planeGrid = svgEl("g", { class: "orthogonal-plane-grid" });
    [
      "190,274 394,347",
      "235,256 439,329",
      "280,238 484,311",
      "325,220 529,293",
      "370,202 574,275",
      "210,318 480,211",
      "260,336 530,229",
      "310,354 580,247",
    ].forEach((points) => {
      const [a, b] = points.split(" ");
      const [x1, y1] = a.split(",");
      const [x2, y2] = b.split(",");
      planeGrid.append(svgEl("line", { x1, y1, x2, y2 }));
    });
    svg.append(planeGrid);

    const x1 = svgEl("line", {
      class: "orthogonal-basis orthogonal-basis--x1",
      x1: "350",
      y1: "365",
      x2: "548",
      y2: "287",
      markerEnd: "url(#orth-arrow-slate)",
    });
    const x2 = svgEl("line", {
      class: "orthogonal-basis orthogonal-basis--x2",
      x1: "350",
      y1: "365",
      x2: "206",
      y2: "312",
      markerEnd: "url(#orth-arrow-slate)",
    });
    svg.append(x1, x2);
    svg.append(svgEl("text", { class: "orthogonal-svg-label", x: "552", y: "282" }, "x₁"));
    svg.append(svgEl("text", { class: "orthogonal-svg-label", x: "181", y: "311" }, "x₂"));

    const yPoint = { x: 430, y: 82 };
    const projection = { x: 390, y: 275 };
    const origin = { x: 350, y: 365 };

    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--y",
      x1: origin.x,
      y1: origin.y,
      x2: yPoint.x,
      y2: yPoint.y,
      markerEnd: "url(#orth-arrow-blue)",
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--projection",
      x1: origin.x,
      y1: origin.y,
      x2: projection.x,
      y2: projection.y,
      markerEnd: "url(#orth-arrow-blue)",
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-drop",
      x1: yPoint.x,
      y1: yPoint.y,
      x2: projection.x,
      y2: projection.y,
    }));
    svg.append(svgEl("line", {
      class: "orthogonal-vector orthogonal-vector--residual",
      x1: projection.x,
      y1: projection.y,
      x2: yPoint.x,
      y2: yPoint.y,
      markerEnd: "url(#orth-arrow-red)",
    }));

    const rightAngle = svgEl("path", {
      class: "orthogonal-right-angle",
      d: "M 391 254 L 413 260 L 408 282",
    });
    svg.append(rightAngle);

    svg.append(svgEl("circle", { class: "orthogonal-dot orthogonal-dot--y", cx: yPoint.x, cy: yPoint.y, r: "8" }));
    svg.append(svgEl("circle", { class: "orthogonal-dot orthogonal-dot--projection", cx: projection.x, cy: projection.y, r: "8" }));
    svg.append(svgEl("text", { class: "orthogonal-svg-label orthogonal-svg-label--large", x: "438", y: "83" }, "y"));
    svg.append(svgEl("text", { class: "orthogonal-svg-label orthogonal-svg-label--large", x: "402", y: "285" }, "Xβ̂"));
    svg.append(svgEl("text", { class: "orthogonal-svg-label orthogonal-svg-label--red", x: "443", y: "185" }, "e = y - Xβ̂"));
    svg.append(svgEl("text", { class: "orthogonal-plane-title", x: "260", y: "235" }, "Col(X) = { Xβ : β ∈ ℝᵖ }"));

    const ghost = svgEl("g", { class: "orthogonal-ghosts" });
    [
      [245, 313, "Xβ"],
      [308, 287, "Xβ"],
      [485, 268, "Xβ"],
      [425, 334, "Xβ"],
    ].forEach(([cx, cy, label]) => {
      ghost.append(svgEl("circle", { cx, cy, r: "5" }));
      ghost.append(svgEl("text", { x: cx + 8, y: cy + 4 }, label));
    });
    svg.append(ghost);

    stage.append(svg);

    const panel = makeEl("div", "orthogonal-demo__panel");
    panel.append(makeEl("strong", "", step.title));
    panel.append(makeEl("p", "", step.caption));

    const formulas = makeEl("div", "orthogonal-demo__formula-list");
    [
      "Col(X) = { Xβ : β ∈ Rᵖ }",
      "Xβ̂ = projection of y onto Col(X)",
      "e = y - Xβ̂",
      "Xᵀe = 0",
    ].forEach((item, index) => {
      const row = makeEl("span", index <= stepIndex ? "active" : "", item);
      formulas.append(row);
    });
    panel.append(formulas);

    const controls = makeEl("div", "orthogonal-demo__controls orthogonal-demo__controls--three");
    steps.forEach((item, index) => {
      const button = makeEl("button", index === stepIndex ? "active" : "", String(index + 1));
      button.type = "button";
      button.title = item.title;
      button.addEventListener("click", () => render(container, index));
      controls.append(button);
    });
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

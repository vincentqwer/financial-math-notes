const DEFAULT_NOTE = "notes/linear-algebra/affine-transformation.md";

const catalogItems = [
  {
    id: "matrix-algebra",
    number: "01",
    name: "행렬대수학",
    description: "벡터, 행렬, 선형변환, 고윳값, 분해를 정리합니다.",
    notes: [
      {
        title: "아핀 변환",
        href: "notes/linear-algebra/affine-transformation.md",
        summary: "선형 변환에 평행이동을 더한 변환을 동차 좌표로 이해합니다.",
      },
    ],
  },
  {
    id: "statistics-intro",
    number: "02",
    name: "통계학원론",
    description: "기술통계, 확률분포, 추정, 검정의 기본기를 정리합니다.",
    notes: [],
  },
  {
    id: "r-programming",
    number: "03",
    name: "R프로그래밍",
    description: "R 문법, 데이터프레임, 시각화, 분석 워크플로를 정리합니다.",
    notes: [],
  },
  {
    id: "time-series",
    number: "04",
    name: "시계열분석",
    description: "추세, 계절성, 정상성, ARIMA 같은 시계열 개념을 정리합니다.",
    notes: [],
  },
  {
    id: "financial-statistics",
    number: "05",
    name: "금융통계학",
    description: "수익률, 리스크, 포트폴리오, 금융 데이터 분석을 정리합니다.",
    notes: [],
  },
  {
    id: "nonparametric-statistics",
    number: "06",
    name: "비모수통계",
    description: "분포 가정이 약한 검정과 순위 기반 방법을 정리합니다.",
    notes: [],
  },
  {
    id: "sqld",
    number: "07",
    name: "SQLD 자격증",
    description: "데이터 모델링, SQL 기본, SQL 활용 문제를 정리합니다.",
    notes: [],
  },
  {
    id: "machine-learning-basics",
    number: "08",
    name: "머신러닝 기초",
    description: "AI 시대의 데이터 분석, 데이터마이닝, 머신러닝, 통계적 학습의 기본 개념을 정리합니다.",
    sections: [
      {
        number: "1",
        title: "기초",
        notes: [
          {
            title: "AI 시대의 데이터 분석과 머신러닝 개요",
            href: "notes/machine-learning-basics/foundation.md",
            summary: "DM_Lecure1.pdf의 핵심 내용을 바탕으로 데이터마이닝, 머신러닝, 통계적 학습의 관계를 정리합니다.",
          },
        ],
      },
    ],
    notes: [],
  },
];

const noteEl = document.querySelector("#note");
const prerequisitesEl = document.querySelector("#prerequisites");
const reviewEl = document.querySelector("#review");
const relatedEl = document.querySelector("#related");

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { data: {}, body: markdown };
  }

  const end = markdown.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: markdown };
  }

  const raw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const data = {};
  let currentKey = null;

  raw.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("- ") && currentKey) {
      data[currentKey] = data[currentKey] || [];
      data[currentKey].push(trimmed.slice(2).trim());
      return;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    currentKey = key;
    data[key] = value || [];
  });

  return { data, body };
}

function renderList(target, items) {
  target.innerHTML = "";
  const values = Array.isArray(items) ? items : [];

  if (!values.length) {
    const empty = document.createElement("span");
    empty.textContent = "아직 없음";
    target.append(empty);
    return;
  }

  values.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item.replace(/^\[\[(.*)\]\]$/, "$1");
    target.append(span);
  });
}

function renderMeta(data) {
  const meta = document.createElement("div");
  meta.className = "note-meta";

  const fields = [
    data.level && `수준: ${data.level}`,
    data.date && data.date,
    ...(Array.isArray(data.tags) ? data.tags.map((tag) => `#${tag}`) : []),
  ].filter(Boolean);

  fields.forEach((field) => {
    const chip = document.createElement("span");
    chip.className = "note-chip";
    chip.textContent = field;
    meta.append(chip);
  });

  return meta;
}

function clearRightRail() {
  renderList(prerequisitesEl, []);
  renderList(reviewEl, []);
  renderList(relatedEl, []);
}

function renderCatalog() {
  noteEl.className = "catalog-view";
  noteEl.innerHTML = `
    <p class="catalog-kicker">Vincent's Math Notes</p>
    <h1 class="catalog-title">학습 목차</h1>
    <p class="catalog-description">
      과목별로 Markdown 노트를 쌓아가는 구조입니다. 과목을 클릭하면 해당 과목의 노트 목록으로 이동합니다.
    </p>
    <div class="catalog-grid">
      ${catalogItems
        .map(
          (item) => `
            <a class="catalog-card" href="#category/${item.id}">
              <span class="catalog-number">${item.number}</span>
              <span class="catalog-name">${item.name}</span>
            </a>
          `,
        )
        .join("")}
    </div>
  `;

  clearRightRail();
  document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-category-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.add("active"));
}

function renderCategory(categoryId) {
  const category = catalogItems.find((item) => item.id === categoryId);
  if (!category) {
    renderCatalog();
    return;
  }

  noteEl.className = "catalog-view";
  const sections = Array.isArray(category.sections) ? category.sections : [];
  const flatNotes = Array.isArray(category.notes) ? category.notes : [];
  const hasContent = sections.length || flatNotes.length;

  noteEl.innerHTML = `
    <div class="category-header">
      <p class="catalog-kicker">${category.number}</p>
      <h1 class="catalog-title">${category.name}</h1>
      <p class="catalog-description">${category.description}</p>
    </div>
    ${
      hasContent
        ? `${sections
            .map(
              (section) => `
                <section class="category-section">
                  <h2>${section.number}. ${section.title}</h2>
                  <div class="note-list">
                    ${section.notes
                      .map(
                        (note) => `
                          <a class="note-list-item" href="#${note.href}">
                            <strong>${note.title}</strong>
                            <span>${note.summary}</span>
                          </a>
                        `,
                      )
                      .join("")}
                  </div>
                </section>
              `,
            )
            .join("")}
          ${
            flatNotes.length
              ? `<div class="note-list">
                  ${flatNotes
                    .map(
                      (note) => `
                        <a class="note-list-item" href="#${note.href}">
                          <strong>${note.title}</strong>
                          <span>${note.summary}</span>
                        </a>
                      `,
                    )
                    .join("")}
                </div>`
              : ""
          }`
        : `<div class="empty-note">아직 노트가 없습니다. 이 과목의 첫 글을 나에게 부탁하면 여기에 연결해둘 수 있어요.</div>`
    }
  `;

  clearRightRail();
  document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-note-link]").forEach((link) => link.classList.remove("active"));
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.categoryLink === categoryId);
  });
}

function enhanceMarkdownLinks(container) {
  container.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(".md")) {
      link.setAttribute("href", `#${href}`);
    }
  });
}

async function loadNote(path) {
  const notePath = path || DEFAULT_NOTE;
  noteEl.className = "note-article";
  noteEl.innerHTML = "<p>노트를 불러오는 중입니다...</p>";

  try {
    const response = await fetch(notePath);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const markdown = await response.text();
    const { data, body } = parseFrontmatter(markdown);
    const html = marked.parse(body, { mangle: false, headerIds: true });

    noteEl.innerHTML = "";
    noteEl.append(renderMeta(data));
    noteEl.insertAdjacentHTML("beforeend", html);

    renderList(prerequisitesEl, data.prerequisites);
    renderList(reviewEl, data.review);
    renderList(relatedEl, data.related);
    enhanceMarkdownLinks(noteEl);

    document.querySelectorAll("[data-note-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.noteLink === notePath);
    });
    document.querySelectorAll("[data-home-link]").forEach((link) => link.classList.remove("active"));
    document.querySelectorAll("[data-category-link]").forEach((link) => link.classList.remove("active"));

    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([noteEl]);
    }

    window.initAffineDemos?.(noteEl);
  } catch (error) {
    noteEl.innerHTML = `
      <div class="callout">
        노트를 불러오지 못했습니다. 로컬 파일을 직접 열었다면
        <code>python3 -m http.server</code>로 서버를 켠 뒤 접속해 주세요.
        <br />
        오류: ${error.message}
      </div>
    `;
  }
}

function currentNoteFromHash() {
  const value = decodeURIComponent(window.location.hash.slice(1));
  return value.endsWith(".md") ? value : "";
}

function route() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  const note = currentNoteFromHash();

  if (note) {
    loadNote(note);
    return;
  }

  if (hash.startsWith("category/")) {
    renderCategory(hash.replace("category/", ""));
    return;
  }

  renderCatalog();
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

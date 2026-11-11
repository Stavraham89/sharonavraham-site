// Mycelium navigation shared by every page.
// trail(): where you are, as knots joined by small hand-drawn hyphae; every knot but the last takes you back to that level.
// rootList(): a living root down the left of a project list, with one branch per project that lights on hover.
const MYC_DOOR = { see: "--see", build: "--build", gather: "--gather", tell: "--tell" };
const MYC_DOORS = [["see", "See", "see.html"], ["build", "Build", "see.html?door=build"], ["gather", "Gather", "see.html?door=gather"], ["tell", "Tell", "see.html?door=tell"]];
const mycRnd = (a, b) => a + Math.random() * (b - a);

function mycSquiggle(w = 34, h = 14) {
  let d = `M0 ${h / 2}`;
  for (let i = 1; i <= 4; i++) d += ` Q${(w * (i - .5) / 4).toFixed(1)} ${(h / 2 + mycRnd(-h * .55, h * .55)).toFixed(1)} ${(w * i / 4).toFixed(1)} ${(i === 4 ? h / 2 : h / 2 + mycRnd(-h * .25, h * .25)).toFixed(1)}`;
  return `<svg class="hy" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path pathLength="1" d="${d}"/></svg>`;
}

// steps: [{ label, href, door }]; the first step is home, the last is the current page
function trail(el, steps, current) {
  const k = s => `<i class="knot" style="--dc:var(${MYC_DOOR[s.door] || "--ink"})"></i>`;
  // each step carries the hypha that leads to it; middle steps fold away on phones
  const nav = steps.map((s, i) => `<span class="step${i && i < steps.length - 1 ? " mid" : ""}">` + (i ? mycSquiggle() : "") + (i === steps.length - 1 && i
    ? `<span aria-current="page">${k(s)}${s.label}</span>` : `<a href="${s.href}">${k(s)}${s.label}</a>`) + `</span>`).join("");
  const menu = MYC_DOORS.map(([d, n, u]) => `<a data-d="${d}" href="${u}"${current === d ? ' aria-current="page"' : ""}>${n}</a>`).join("")
    + `<span class="sep"></span><a href="about.html"${current === "about" ? ' aria-current="page"' : ""}>About</a><a href="press.html"${current === "press" ? ' aria-current="page"' : ""}>Press</a>`
    + `<a class="write" href="contact.html"${current === "contact" ? ' aria-current="page"' : ""}>Write to me</a>`;
  el.classList.add("trailbar");
  el.innerHTML = `<nav class="trail" aria-label="You are here">${nav}</nav><nav class="qmenu" aria-label="Main">${menu}</nav>`;
  mycSmartHeader(el);
}
// The header slides away while you read down the page and glides back as soon as you scroll up
function mycSmartHeader(el) {
  if (el.dataset.smart) return; el.dataset.smart = "1"; el.classList.add("smart");
  let last = scrollY;
  addEventListener("scroll", () => { const y = scrollY, d = y - last;
    if (y + innerHeight >= document.documentElement.scrollHeight - 4) { last = y; return; }   // iOS bottom bounce is not a scroll up
    if (y < 120 || d < -6) el.classList.remove("away"); else if (d > 6) el.classList.add("away");
    el.classList.toggle("lifted", y > 10); last = y; }, { passive: true });
  el.addEventListener("focusin", () => el.classList.remove("away"));   // keyboard users always see where focus is
}

function rootList(list, color) {
  const rows = [...list.children].filter(r => r.matches("a, article, li"));
  if (!rows.length) return;
  list.classList.add("rooted");
  const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
  svg.classList.add("root"); svg.setAttribute("aria-hidden", "true"); list.prepend(svg);
  const draw = () => {
    svg.innerHTML = "";
    const L = list.getBoundingClientRect(), W = parseFloat(getComputedStyle(list).paddingLeft) || 34, x0 = W * .3;
    const ys = rows.map(r => { const b = r.getBoundingClientRect(); return b.top - L.top + Math.min(b.height / 2, 34); });
    // the trunk wanders gently from the first branch to the last
    let d = `M${x0} ${ys[0] - 20}`, x = x0;
    for (let y = ys[0] - 20; y < ys[ys.length - 1]; y += 40) { x = x0 + mycRnd(-W * .18, W * .18); d += ` S${x.toFixed(1)} ${(y + 20).toFixed(1)} ${x0.toFixed(1)} ${(y + 40).toFixed(1)}`; }
    const trunk = document.createElementNS(NS, "path"); trunk.setAttribute("d", d); trunk.classList.add("trunk"); svg.appendChild(trunk);
    rows.forEach((r, i) => {
      const p = document.createElementNS(NS, "path"), y = ys[i], yA = y - mycRnd(10, 22);
      p.setAttribute("d", `M${x0} ${yA.toFixed(1)} C${(x0 + W * .3).toFixed(1)} ${yA.toFixed(1)} ${(W * .6).toFixed(1)} ${y.toFixed(1)} ${(W - 4).toFixed(1)} ${y.toFixed(1)}`);
      p.style.setProperty("--dc", `var(${MYC_DOOR[color] || "--ink"})`); svg.appendChild(p);
      r.addEventListener("pointerenter", () => p.classList.add("on")); r.addEventListener("pointerleave", () => p.classList.remove("on"));
      r.addEventListener("focusin", () => p.classList.add("on")); r.addEventListener("focusout", () => p.classList.remove("on"));
    });
  };
  draw(); let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 150); });
}

// Shared drawing helpers (the same hyphae as the homepage): a wandering path pinned at both ends, smoothed into an SVG curve
function mycHypha(a, b, n = 12, wander = .14, bow = 0) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  let off = 0, v = 0; const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; v += mycRnd(-1, 1) * len * wander * .25; v *= .82; off += v;
    const k = Math.sin(Math.PI * t), o = off * k + bow * len * k; pts.push({ x: a.x + dx * t + nx * o, y: a.y + dy * t + ny * o }); }
  return pts;
}
function mycSmooth(pts) {
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

// A project without photographs yet: a drawn thread in its door colour, never a borrowed image
function mycDrawn(door) {
  const c = { see: "#ff7a64", build: "#f0b245", gather: "#5cc9a9", tell: "#8b9bff" }[door] || "#ecece8";
  return "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 1000"><rect width="400" height="1000" fill="#171715"/><path d="M200 0 C150 180 260 320 190 480 S240 760 200 1000 M190 480 C120 520 80 560 40 640 M214 300 C280 340 320 360 370 420" fill="none" stroke="${c}" stroke-width="2" opacity=".7"/></svg>`);
}

// Touch screens have no hover: photos that turn to colour under the mouse turn to colour as they reach the middle of the screen
if (matchMedia("(hover: none)").matches) addEventListener("DOMContentLoaded", () => {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("inview", e.isIntersecting)), { rootMargin: "-30% 0px -30% 0px" });
  const watch = () => document.querySelectorAll(".comms a, .yt").forEach(el => { if (!el.dataset.io) { el.dataset.io = 1; io.observe(el); } });
  watch(); new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
});

// Rotating a phone changes every height on the page: keep the thing you were looking at in the same place on screen
(() => {
  let mark = null, w = innerWidth, busy = 0;
  const pick = () => { if (busy) return; const el = document.elementFromPoint(innerWidth / 2, innerHeight / 3)?.closest("section, figure, article, li, p, h1, h2, .acc, .row");
    if (el) { const r = el.getBoundingClientRect(); mark = { el, k: (innerHeight / 3 - r.top) / (r.height || 1) }; } };
  addEventListener("scroll", () => { clearTimeout(pick.t); pick.t = setTimeout(pick, 120); }, { passive: true });
  addEventListener("resize", () => { if (innerWidth === w || !mark) return; w = innerWidth; clearTimeout(busy);
    const put = () => { if (!mark.el.isConnected) return; const r = mark.el.getBoundingClientRect(); scrollBy(0, r.top + mark.k * r.height - innerHeight / 3); };
    requestAnimationFrame(put); busy = setTimeout(() => { put(); busy = 0; }, 450); });   // again once the page has re-laid itself out
})();

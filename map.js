// The mycelium map: the four doors fruit above the ground; underground, fine hyphae grow
// between every project, up to each door it feeds, and down to the one root question.
// Seeded randomness, so the drawing is the same on every visit.
function drawMycelium(svg, { onOpen, compact } = {}) {
  const W = 1200, H = 840, GROUND = 200, ROOT = { x: 600, y: 752 };
  const NS = "http://www.w3.org/2000/svg";
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = `<defs><linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--soil1)"/><stop offset="1" stop-color="var(--soil2)"/></linearGradient>
    <clipPath id="underground"><rect x="0" y="${GROUND}" width="${W}" height="${H - GROUND}"/></clipPath><radialGradient id="rootglow"><stop offset="0" stop-color="var(--ink)" stop-opacity=".18"/><stop offset="1" stop-color="var(--ink)" stop-opacity="0"/></radialGradient></defs>`;
  el("rect", { x: 0, y: GROUND, width: W, height: H - GROUND, fill: "url(#soil)" });

  const colX = { see: 230, build: 540, gather: 815, tell: 1065 };
  const col = d => `var(--${d})`;

  // Place projects between the doors they feed (home door counts double), then push labels apart
  // Sharon's photo series join What I see as smaller nodes, tied to their family and to each other
  const FAMILY = { "Artivism": ["heroes"], "Personal projects": ["series"], "Photo stories": ["series"], "ToGather": ["togather", "series"] };
  const ALSO = { burners: ["midburn"], "small-farm": ["farm"] };
  const walks = typeof SERIES_TEXT === "undefined" ? [] : SERIES_TEXT.filter(t => FAMILY[t.group]);
  const extra = walks.map(t => ({ id: "s:" + t.id, title: t.title, doors: ["see"], small: true, href: `series.html#${t.id}`, links: [...FAMILY[t.group], ...(ALSO[t.id] || [])] }));
  for (const g of Object.keys(FAMILY)) { const k = extra.filter((e, i) => walks[i].group === g); k.forEach((e, i) => k[i + 1] && e.links.push(k[i + 1].id)); }
  if (walks.length) extra.push({ id: "s:portraits", title: "Portraits", doors: ["see"], small: true, href: "see.html", links: ["series"] });
  const ALL = PROJECTS.concat(extra);
  const nodes = ALL.map(p => {
    const w = p.doors.map((d, i) => [colX[d], i ? 1 : 2.2]);
    const x = w.reduce((s, [v, k]) => s + v * k, 0) / w.reduce((s, [, k]) => s + k, 0);
    return p.small ? { p, x: x + (rnd() - .5) * 320, y: GROUND + 50 + rnd() * 440 } : { p, x: x + (rnd() - .5) * 120, y: GROUND + 90 + rnd() * 360 };
  });
  for (let it = 0; it < 260; it++) for (const a of nodes) for (const b of nodes) {
    if (a === b) continue;
    const dx = (b.x - a.x) / (a.p.small && b.p.small ? 110 : 150), dy = (b.y - a.y) / 48, d2 = dx * dx + dy * dy;
    if (d2 < 1) { const f = (1 - Math.sqrt(d2)) * 6, s = Math.sign(dy || rnd() - .5); a.y -= f * s; a.x -= f * Math.sign(dx || rnd() - .5) * .6; }
    a.x = Math.max(40, Math.min(W - 80, a.x)); a.y = Math.max(GROUND + 80, Math.min(ROOT.y - 70, a.y));
  }
  const at = Object.fromEntries(nodes.map(n => [n.p.id, n]));

  // A hypha: a random walk that bends toward its target, smoothed, with fine side branches
  function hypha(a, b, g, width, opacity, branchy = .3) {
    const pts = [[a.x, a.y]]; let [x, y] = [a.x, a.y], ph = rnd() * 9, ang = Math.atan2(b.y - y, b.x - x);
    for (let i = 0; i < 400; i++) {
      const dx = b.x - x, dy = b.y - y, dist = Math.hypot(dx, dy);
      if (dist < 16) break;
      const want = Math.atan2(dy, dx); let diff = want - ang; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      ang += diff * (dist < 80 ? .45 : .13) + Math.sin(ph + i * .32) * .17 + (rnd() - .5) * .22;
      x += Math.cos(ang) * 9; y += Math.sin(ang) * 9; pts.push([x, y]);
      if (rnd() < branchy * .22 && i > 1) tendril(x, y, ang + (rnd() < .5 ? 1 : -1) * (.6 + rnd() * .9), 3 + rnd() * 6, g, width * .6, opacity * .7, 2);
    }
    pts.push([b.x, b.y]);
    return el("path", { d: smooth(pts), stroke: g.dataset.c, "stroke-width": width, opacity, fill: "none", "stroke-linecap": "round" }, g);
  }
  function tendril(x, y, ang, steps, g, width, opacity, depth) {
    const pts = [[x, y]];
    for (let i = 0; i < steps; i++) { ang += (rnd() - .5) * .7; x += Math.cos(ang) * 8; y += Math.sin(ang) * 8; pts.push([x, y]);
      if (depth && rnd() < .25) tendril(x, y, ang + (rnd() < .5 ? .9 : -.9), steps * .6, g, width * .7, opacity * .8, depth - 1); }
    el("path", { d: smooth(pts), stroke: g.dataset.c, "stroke-width": Math.max(.35, width), opacity, fill: "none", "stroke-linecap": "round" }, g);
  }
  const smooth = pts => pts.reduce((d, p, i) => i === 0 ? `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` :
    d + ` Q${pts[i - 1][0].toFixed(1)} ${pts[i - 1][1].toFixed(1)} ${((pts[i - 1][0] + p[0]) / 2).toFixed(1)} ${((pts[i - 1][1] + p[1]) / 2).toFixed(1)}`, "");

  // Ambient threads give the soil its texture
  const amb = el("g", { class: "amb", "clip-path": "url(#underground)", "data-c": "var(--ink)" }); amb.dataset.c = "var(--ink)";
  for (let i = 0; i < (compact ? 40 : 90); i++) tendril(rnd() * W, GROUND + 20 + rnd() * (H - GROUND - 30), rnd() * 6.28, 6 + rnd() * 18, amb, .5, .1 + rnd() * .12, 2);

  // Roots down to the question
  const roots = el("g", { class: "roots", "clip-path": "url(#underground)" }); roots.dataset.c = "var(--muted)";
  el("circle", { cx: ROOT.x, cy: ROOT.y, r: 70, fill: "url(#rootglow)" });
  const edges = [];
  for (const n of nodes) if (!n.p.small) edges.push({ ids: [n.p.id], a: n.p.id, b: "root", path: hypha(n, ROOT, roots, .8, .35, .5) });

  // Threads to the doors (home door strong, others fainter) and between linked projects
  const threads = el("g", { class: "threads", "clip-path": "url(#underground)" });
  for (const n of nodes) n.p.doors.forEach((d, i) => {
    const g = el("g", {}, threads); g.dataset.c = col(d);
    edges.push({ ids: [n.p.id], door: d, a: n.p.id, b: "door:" + d, path: hypha(n, { x: colX[d] + (rnd() - .5) * 14, y: GROUND }, g, n.p.small ? .6 : i ? .9 : 1.5, n.p.small ? .35 : i ? .45 : .8, n.p.small ? .2 : .45) });
  });
  const seen = new Set();
  for (const n of nodes) for (const id of n.p.links || []) {
    const m = at[id], key = [n.p.id, id].sort().join(); if (!m || seen.has(key)) continue; seen.add(key);
    const g = el("g", {}, threads); g.dataset.c = n.p.small && m.p.small ? col("see") : "var(--ink)";
    edges.push({ ids: [n.p.id, id], a: n.p.id, b: id, path: hypha(n, m, g, n.p.small ? .55 : .7, .38, .25) });
  }

  // Ground line, the doors as fruiting bodies, the nodes, the root
  el("path", { d: smooth(Array.from({ length: 61 }, (_, i) => [i * 20, GROUND + Math.sin(i * .7) * 1.5 + (rnd() - .5) * 2])), stroke: "var(--muted)", "stroke-width": 1, fill: "none", opacity: .6 });
  for (const [d, x] of Object.entries(colX)) {
    const g = el("a", { href: DOORS[d].url, class: "door-node", "data-door": d });
    fungus(x, col(d), g);
    el("text", { x, y: GROUND - 152, "text-anchor": "middle", class: "door-label", fill: col(d) }, g).textContent = DOORS[d].title;
  }
  // A fine-line fruiting body: sun halo, gilled cap with contour lines and spots, ringed stem, two young caps, leaves and grass
  function fungus(x, c, g) {
    const line = (d, w = .8, o = 1, fill = "none") => el("path", { d, stroke: c, "stroke-width": w, opacity: o, fill, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    const yb = GROUND - 64;
    for (let i = 0; i <= 18; i++) { const a = Math.PI + i * Math.PI / 18, r1 = 48, r2 = i % 2 ? 56 : 62;
      line(`M${(x + Math.cos(a) * r1).toFixed(1)} ${(yb - 8 + Math.sin(a) * r1).toFixed(1)} L${(x + Math.cos(a) * r2).toFixed(1)} ${(yb - 8 + Math.sin(a) * r2).toFixed(1)}`, .6, .35); }
    line(`M${x - 44} ${yb - 8} A44 44 0 0 1 ${x + 44} ${yb - 8}`, .5, .3);
    mush(x, yb, 1, 0);
    mush(x - 27, GROUND - 22, .42, -.18);
    mush(x + 24, GROUND - 14, .3, .22);
    const leaf = (bx, by, ang, len) => { const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len, nx = -Math.sin(ang) * len * .28, ny = Math.cos(ang) * len * .28,
        mx = (bx + ex) / 2, my = (by + ey) / 2;
      line(`M${bx} ${by} Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx - nx).toFixed(1)} ${(my - ny).toFixed(1)} ${bx} ${by} Z`, .7, .9, "var(--soil1)");
      line(`M${bx} ${by} L${((bx + ex * 3) / 4).toFixed(1)} ${((by + ey * 3) / 4).toFixed(1)}`, .4, .7); };
    leaf(x - 8, GROUND, -2.4, 20); leaf(x + 9, GROUND, -.75, 17); leaf(x + 34, GROUND, -1.1, 11);
    for (let i = 0; i < 9; i++) { const bx = x - 44 + i * 11 + rnd() * 5, h = 5 + rnd() * 9, lean = (rnd() - .5) * 8;
      line(`M${bx.toFixed(1)} ${GROUND} Q${(bx + lean * .3).toFixed(1)} ${(GROUND - h * .6).toFixed(1)} ${(bx + lean).toFixed(1)} ${(GROUND - h).toFixed(1)}`, .5, .6); }
    function mush(mx, base, k, tilt) {
      const s = el("g", { transform: `rotate(${(tilt * 57.3).toFixed(1)} ${mx} ${GROUND})` }, g), L = (d, w, o, f) => { const p = line(d, w, o, f); s.appendChild(p); return p; };
      const r = 37 * k, top = base - 30 * k, stemTop = base + 3 * k;
      // stem with a hanging ring
      L(`M${mx - 4 * k} ${stemTop} C${mx - 5 * k} ${(stemTop + GROUND) / 2} ${mx - 7 * k} ${GROUND - 6} ${mx - 6 * k} ${GROUND} L${mx + 6 * k} ${GROUND} C${mx + 7 * k} ${GROUND - 6} ${mx + 5 * k} ${(stemTop + GROUND) / 2} ${mx + 4 * k} ${stemTop} Z`, .9 * Math.max(k, .6), 1, "var(--soil1)");
      for (let i = 1; i < 4; i++) L(`M${mx - 3 * k + i * 1.5 * k} ${stemTop + 4 * k} L${mx - 4 * k + i * 2 * k} ${GROUND - 3}`, .35, .5);
      if (k > .5) { const ry = stemTop + 12; L(`M${mx - 9} ${ry} Q${mx} ${ry - 5} ${mx + 9} ${ry} Q${mx + 7} ${ry + 5} ${mx + 4} ${ry + 3} Q${mx} ${ry + 7} ${mx - 4} ${ry + 3} Q${mx - 7} ${ry + 5} ${mx - 9} ${ry} Z`, .7, 1, "var(--soil1)"); }
      // gills fanning out under the cap
      for (let i = 0; i <= 16; i++) { const t = i / 16, gx = mx - r * .94 + t * r * 1.88;
        L(`M${mx.toFixed(1)} ${stemTop.toFixed(1)} Q${((mx + gx) / 2).toFixed(1)} ${(base + 4 * k).toFixed(1)} ${gx.toFixed(1)} ${(base + .5).toFixed(1)}`, .35, .75); }
      // the cap: filled softly, outlined, contour lines and spots
      L(`M${mx - r} ${base} C${mx - r * .98} ${top - 6 * k} ${mx + r * .98} ${top - 6 * k} ${mx + r} ${base} Q${mx} ${base + 5 * k} ${mx - r} ${base} Z`, 1.1 * Math.max(k, .6), 1, "var(--soil1)");
      L(`M${mx - r} ${base} C${mx - r * .98} ${top - 6 * k} ${mx + r * .98} ${top - 6 * k} ${mx + r} ${base} Q${mx} ${base + 5 * k} ${mx - r} ${base} Z`, 0, .22, c);
      for (const f of [.78, .55, .32]) L(`M${mx - r * f} ${base - 1 - (1 - f) * 8 * k} C${mx - r * f * .9} ${base - (30 * k + 6 * k) * f - (1 - f) * 10 * k} ${mx + r * f * .9} ${base - (30 * k + 6 * k) * f - (1 - f) * 10 * k} ${mx + r * f} ${base - 1 - (1 - f) * 8 * k}`, .4, .55);
      if (k > .35) for (const [u, v, rr] of [[-.5, .45, 2.4], [-.1, .75, 1.8], [.35, .5, 2.6], [.62, .25, 1.5], [-.75, .18, 1.4], [.12, .3, 1.3]])
        { const cc = el("circle", { cx: mx + u * r, cy: base - v * 30 * k - 2, r: rr * k * 1.4, fill: "none", stroke: c, "stroke-width": .5 }, s); }
    }
  }
  const hls = [el("g", { class: "hl", "clip-path": "url(#underground)" }), el("g", { class: "hl", "clip-path": "url(#underground)" })];   // the hovered project's strands, copied on top; two layers crossfade
  const nodeG = el("g", { class: "nodes" });
  svg.addEventListener("pointerdown", e => { if (e.pointerType === "touch" && !e.target.closest(".node")) focus(null); });
  for (const n of nodes) {
    const a = el("a", { href: n.p.href || `project.html#${n.p.ref || n.p.id}`, class: "node" + (n.p.small ? " small" : ""), "data-id": n.p.id }, nodeG);
    n.hit = el("rect", { fill: "transparent" }, a);   // one hit area covering dot and label, so moving between them never flickers
    el("circle", { cx: n.x, cy: n.y, r: 11, fill: "none", stroke: col(n.p.doors[0]), "stroke-width": 1, class: "ring" }, a);
    el("circle", { cx: n.x, cy: n.y, r: n.p.small ? 3.2 : 4.5, fill: col(n.p.doors[0]), class: "core" }, a);
    const t = el("text", { x: n.x + 9, y: n.y - 8, class: "node-label" }, a); t.textContent = n.p.title; n.label = t; n.a = a;
    a.addEventListener("pointerenter", e => e.pointerType !== "touch" && focus(n.p.id)); a.addEventListener("pointerleave", e => e.pointerType !== "touch" && focus(null, 160));
    a.addEventListener("focus", () => tapped !== n.p.id && focus(n.p.id)); a.addEventListener("blur", () => focus(null));
    a.addEventListener("pointerdown", e => { tapped = e.pointerType === "touch" ? n.p.id : null; });
    a.addEventListener("click", e => { if (tapped === n.p.id && focused !== n.p.id) { e.preventDefault(); focus(n.p.id); } });
  }
  el("circle", { cx: ROOT.x, cy: ROOT.y, r: 6, fill: "var(--ink)" });
  const q = el("text", { x: ROOT.x, y: ROOT.y + 44, "text-anchor": "middle", class: "root-label" }); q.textContent = "…and what keeps them there?";

  placeLabels();
  document.fonts?.ready.then(placeLabels);

  // Labels: try eight spots around each dot, keep the first that touches no other label, dot, door name or the question
  function placeLabels() {
    const cv = placeLabels.cv || (placeLabels.cv = document.createElement("canvas").getContext("2d"));
    const boxes = Object.entries(colX).map(([d, x]) => { const w = DOORS[d].title.length * 13; return [x - w / 2, GROUND - 180, x + w / 2, GROUND - 142]; });
    boxes.push([ROOT.x - 150, ROOT.y + 20, ROOT.x + 150, ROOT.y + 54]);
    for (const n of nodes) boxes.push([n.x - 6, n.y - 6, n.x + 6, n.y + 6]);
    const hit = (b, c) => Math.max(0, Math.min(b[2], c[2]) - Math.max(b[0], c[0])) * Math.max(0, Math.min(b[3], c[3]) - Math.max(b[1], c[1]));
    for (const n of [...nodes].sort((a, b) => a.y - b.y)) {
      cv.font = `${n.p.small ? 11 : 12.5}px 'Hanken Grotesk', sans-serif`;
      const w = cv.measureText(n.p.title).width + 4, h = n.p.small ? 12 : 14;
      const spots = [[9, -18, "start"], [9, 4, "start"], [-9, -18, "end"], [-9, 4, "end"], [0, -24, "middle"], [0, 10, "middle"], [14, -7, "start"], [-14, -7, "end"]];
      let best, bestCost = Infinity;
      for (const [dx, dy, anchor] of spots) {
        const x0 = anchor === "start" ? n.x + dx : anchor === "end" ? n.x + dx - w : n.x - w / 2, y0 = n.y + dy;
        const b = [x0, y0, x0 + w, y0 + h];
        let cost = boxes.reduce((s, c) => s + hit(b, c), 0) + (x0 < 4 || x0 + w > W - 4 ? 1e5 : 0);
        if (cost < bestCost) { bestCost = cost; best = { b, anchor, x: anchor === "middle" ? n.x : n.x + dx }; }
        if (!cost) break;
      }
      n.label.setAttribute("x", best.x); n.label.setAttribute("y", best.b[1] + 11); n.label.setAttribute("text-anchor", best.anchor);
      boxes.push(best.b);
      const hb = [Math.min(best.b[0], n.x - 11), Math.min(best.b[1], n.y - 11), Math.max(best.b[2], n.x + 11), Math.max(best.b[3], n.y + 11)];
      n.hit.setAttribute("x", hb[0]); n.hit.setAttribute("y", hb[1]); n.hit.setAttribute("width", hb[2] - hb[0]); n.hit.setAttribute("height", hb[3] - hb[1]);
    }
  }

  // Hover: the project's threads light up, everything else steps back
  // Hover: its strands light up, the projects and doors it feeds come forward, the rest steps back.
  // Leaving waits a moment, so passing between neighbours doesn't flash the whole map.
  let focused = null, leaveT, tapped = null;
  function focus(id, wait) {
    clearTimeout(leaveT);
    if (!id && wait) { leaveT = setTimeout(() => focus(null), wait); return; }
    if (id === focused) return;
    focused = id;
    const mine = id ? edges.filter(e => e.ids.includes(id)) : [], near = new Set(mine.flatMap(e => [e.a, e.b]));
    hls.reverse(); hls[1].classList.remove("show");
    if (id) { hls[0].replaceChildren(...mine.map(e => { const c = e.path.cloneNode(); c.removeAttribute("style");
      c.setAttribute("stroke-width", e.b === "root" ? 1.4 : 2.2); c.setAttribute("opacity", 1); return c; })); hls[0].classList.add("show"); }
    svg.classList.toggle("focusing", !!id);
    nodeG.querySelectorAll(".node").forEach(n => { n.classList.toggle("lit", near.has(n.dataset.id)); n.classList.toggle("on", n.dataset.id === id); });
    svg.querySelectorAll(".door-node").forEach(d => d.classList.toggle("lit", near.has("door:" + d.dataset.door)));
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Grow like a living network: roots rise from the question, then threads reach up to the doors and across to each other
  let grown = false;
  svg.classList.add("pre");   // stay hidden until first seen, so the growth isn't missed or flashed
  function growIn() {
  svg.classList.remove("pre");
  const grow = "cubic-bezier(.22,.61,.36,1)", fade = (e, delay, dur = 900) => e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay, easing: "ease-out", fill: "backwards" });
  roots.querySelectorAll("path").forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`;
    p.animate([{ strokeDashoffset: -L }, { strokeDashoffset: 0 }], { duration: 2200 + rnd() * 1200, delay: 300 + rnd() * 700, easing: grow, fill: "backwards" }); });
  threads.querySelectorAll("path").forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`;
    p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 2400 + rnd() * 1600, delay: 1800 + rnd() * 1400, easing: grow, fill: "backwards" }); });
  fade(amb, 200, 3000);
  nodes.forEach(n => { fade(n.a.querySelector(".core"), 1500 + (ROOT.y - n.y) * 2, 700); fade(n.label, 2600 + (ROOT.y - n.y) * 2, 900); });
  svg.querySelectorAll(".door-node").forEach((d, i) => d.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 1200, delay: 3200 + i * 120, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" }));
  setTimeout(() => { ready = true; wake(); }, 4200);
  }
  const spores = [];

  // Spores: a few specks rise from each cap and fade
  for (const [d, x] of Object.entries(colX)) for (let i = 0; i < 6; i++) {
    const sp = el("circle", { class: "spore",  cx: x + (rnd() - .5) * 50, cy: GROUND - 70 - rnd() * 10, r: .9 + rnd() * .9, fill: col(d) });
    sp.animate([{ transform: "translate(0,0)", opacity: 0 }, { opacity: .8, offset: .3 }, { transform: `translate(${((rnd() - .5) * 30).toFixed(1)}px,-${(30 + rnd() * 30).toFixed(1)}px)`, opacity: 0 }],
      { duration: 5000 + rnd() * 4000, delay: 4000 + rnd() * 5000, iterations: Infinity, easing: "cubic-bezier(.37,0,.63,1)", fill: "backwards" });
    spores.push(sp.getAnimations()[0]);
  }

  // Pulses: soft points of light that drift along a strand, and sometimes carry on into a connected one
  const pulseG = el("g", { class: "pulses" }), live = [];
  const ends = k => edges.filter(e => e.a === k || e.b === k);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // ease-in-out, so a pulse eases off and settles in
  function spawn(e, from, hops, t0) {
    const g = el("g", {}, pulseG), c = e.path.getAttribute("stroke");
    const halo = el("circle", { r: 7, fill: c, opacity: .16 }, g), core = el("circle", { r: 2.1, fill: c }, g), L = e.path.getTotalLength();
    // each pulse keeps its own pace (a slow drift to a gentle walk) and its own breath
    live.push({ e, g, halo, core, fwd: from === e.a, L, t0, dur: Math.max(3500, L * (14 + rnd() * 22)), beat: 2600 + rnd() * 2200, dim: 1, ph: rnd() * 6.28, hops });
  }
  function seedPulse(now) {
    const pool = focused ? edges.filter(e => e.ids.includes(focused)) : edges;
    const e = pool[Math.floor(rnd() * pool.length)];
    spawn(e, focused && e.ids.includes(focused) ? focused : (rnd() < .5 ? e.a : e.b), 3, now);
  }
  let last = 0, running = false, visible = false, ready = false;
  function tick(now) {
    if (!visible || document.hidden) { running = false; return; }
    if (now - last > (focused ? 300 : 700) && live.length < (focused ? 14 : 12)) { seedPulse(now); last = now; }
    for (let i = live.length - 1; i >= 0; i--) {
      const p = live[i], t = Math.min(1, (now - p.t0) / p.dur), k = ease(t);
      const pt = p.e.path.getPointAtLength(p.L * (p.fwd ? k : 1 - k));
      p.g.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      const br = .5 + .5 * Math.sin(p.ph + now / p.beat * 6.283);   // the breath: swell and soften
      p.halo.setAttribute("r", (5 + br * 4).toFixed(2)); p.halo.setAttribute("opacity", (.08 + br * .2).toFixed(3)); p.core.setAttribute("r", (1.5 + br * 1.3).toFixed(2));
      p.dim += ((focused && !p.e.ids.includes(focused) ? .15 : 1) - p.dim) * .08;
      p.g.style.opacity = Math.sin(Math.PI * t) ** .6 * p.dim;
      if (t >= 1) {
        live.splice(i, 1); p.g.remove();
        const at = p.fwd ? p.e.b : p.e.a, next = ends(at).filter(x => x !== p.e);
        if (p.hops > 0 && next.length && rnd() < .7) spawn(next[Math.floor(rnd() * next.length)], at, p.hops - 1, now);
      }
    }
    requestAnimationFrame(tick);
  }
  const wake = () => { if (ready && visible && !running && !document.hidden) { running = true; requestAnimationFrame(tick); } };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !grown) { grown = true; growIn(); }
    spores.forEach(a => visible ? a.play() : a.pause());
    wake();
  }).observe(svg);
  document.addEventListener("visibilitychange", wake);
}

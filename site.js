// Shared chrome (menu, footer) and the two templates: a door page and a project page.
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const here = location.pathname.split("/").pop() || "index.html";
const projUrl = p => p.link && !p.link.startsWith("http") && p.link !== "#" ? p.link : `project.html#${p.ref || p.id}`;
const dots = p => p.doors.map((d, i) => `<i class="dot ${d}${i ? " hollow" : ""}" title="${DOORS[d].name}"></i>`).join("");

const HOME = { label: "Sharon Avraham", href: "./" };
function chrome() {
  const top = document.querySelector("header.top"), page = document.body.dataset.page;
  const names = { about: "About", press: "Press", map: "Mycelium" };
  if (top && DOORS[page]) trail(top, [HOME, { label: DOORS[page].title, door: page }], page);
  else if (top && names[page]) trail(top, [HOME, { label: names[page] }], page);
  const foot = document.querySelector("footer.foot");
  if (foot) foot.innerHTML = `<q>${esc(THROUGHLINE)}</q>
    <nav><a href="about.html">About</a><a href="press.html">Press</a>
    <a href="https://www.instagram.com/sharon.avraham_/" target="_blank" rel="noopener">Instagram</a><a href="https://jointogatherproject.substack.com" target="_blank" rel="noopener">Substack</a><a href="contact.html">Write to me</a></nav>`;
}

// Door page: header, accordion of the projects that have photos, then every project as a row
const INVITE = {
  see: ["Curating a show, or looking for prints?", "Write to me about the work"],
  build: ["Building something people will gather in?", "Let's talk about partnering"],
  gather: ["Hosting a group, a programme or a festival?", "Invite me to hold the space"],
  tell: ["Doing good work that nobody sees yet?", "Let's tell your story"],
};
const DOOR_ORDER = { build: ["midburn", "fugara", "farm", "elham", "togather", "lighthouse"],
  gather: ["midburn", "futureplay", "mjc", "alqarya", "synesthesia", "healing", "lab", "forbidden", "kamelz", "compass", "elham", "falahi", "somewhere"],
  tell: ["togather", "tamera", "arava", "reel"] };
// the projects whose home is this door, in the door page's own order
const doorProjects = d => { const ord = (DOOR_ORDER[d] || []).map(id => P[id]).filter(p => p && p.doors[0] === d);
  return [...ord, ...PROJECTS.filter(p => p.doors[0] === d && !ord.includes(p))]; };
function doorPage(d) {
  // each door lists its projects in a deliberate order (Sharon's priorities), then whatever else grows there
  const ORDER = DOOR_ORDER;
  const door = DOORS[d], ord = (ORDER[d] || []).map(id => P[id]).filter(Boolean);
  const home = ord.length ? ord : PROJECTS.filter(p => p.doors[0] === d), also = PROJECTS.filter(p => p.doors.includes(d) && !home.includes(p));
  const withImg = [...home, ...also].filter(p => p.img).slice(0, 7);
  const row = p => `<a class="row" href="${projUrl(p)}"${p.link?.startsWith("http") ? "" : ""}>
      <span class="yr">${esc(p.years)}</span><h3>${esc(p.title)}</h3>
      <p class="ess">${p.role ? `<span class="role">${esc(p.role)}</span>` : ""}${esc(p.essence)}</p><span class="dots">${dots(p)}</span></a>`;
  document.querySelector("main").innerHTML = `
    <section class="door-head"><h1>${door.title}</h1><p class="lede">${esc(door.text || door.line)}</p>
      <p class="proof">${PROOF[d]}</p></section>
    <div class="acc">${withImg.map(p => `<a href="${projUrl(p)}"><img src="${p.img}" alt="" loading="lazy"><span class="cap"><b>${esc(p.title)}</b><span>${esc(p.years)}</span></span></a>`).join("")}</div>
    <div class="legend"><span><i class="dot ${d}"></i>${door.name}</span><span>Hollow dots show the other doors a project grows into.</span></div>
    <div class="list">${home.map(row).join("")}</div>
    ${also.length ? `<h2 class="sub">Also growing here</h2><div class="list">${also.map(row).join("")}</div>` : ""}
    <section class="invite"><p>${INVITE[d][0]}</p><a class="btn" href="contact.html#${d}">${INVITE[d][1]}</a></section>`;
  document.querySelectorAll("main .list").forEach(l => rootList(l, d));
}
// One quiet sentence of proof per door, instead of big numbers
const PROOF = {
  see: "Twenty years of photography, forty-three galleries, and one image that became the symbol of the Balfour protest.",
  build: "Three NGOs co-founded, eleven years of an open farm, and an archive of 35 communities.",
  gather: "Burners from eight countries in one camp, young Muslim and Jewish leaders in France, festivals in the Portuguese hills.",
  tell: "Six Tamera reels, about 1.13 million views (my own report). Sixteen ToGather conversations on YouTube.",
};

// Project page: same template for everything, filled from data.js
function projectPage() {
  const p = P[location.hash.slice(1)];
  if (!p) { trail(document.querySelector("header.top"), [HOME, { label: "Not found" }]);
    document.querySelector("main").innerHTML = `<section class="case-head"><div><h1>This project isn't here.</h1><p class="ess">The link may be old. <a href="./">Go to the homepage</a> or <a href="contact.html">write to me</a>.</p></div></section>`; return; }
  const d = p.doors[0];
  trail(document.querySelector("header.top"), [HOME, { label: DOORS[d].title, href: DOORS[d].url, door: d }, { label: p.title, door: d }], d);
  // photos from the old-site harvest when the project has a folder, otherwise the mockup photos
  const DIM = {};   // width and height per photo, so the page reserves space before images load
  const media = (p.media || []).flatMap(f => ((typeof MEDIA !== "undefined" && MEDIA[f]) || []).map(([file, w, h]) => { const u = `img/w/${f}/${file}`; DIM[u] = [w, h]; return u; })).filter(u => !(p.skip || []).some(k => u.endsWith(k)));
  const pics = (media.length ? media : (p.photos || [])).slice(0, p.reel ? 5 : 13), hero = p.hero || media[0] || p.img || (p.nophoto ? "" : mycDrawn(d));   // a drawn mycelium stands in until Sharon sends photos
  document.body.dataset.door = d;
  document.title = `${p.title}, Sharon Avraham`;
  const links = (p.links || []).map(id => P[id]).filter(Boolean);
  const st = typeof STORY !== "undefined" && STORY[p.id];   // a written journey replaces the plain text and photo wall
  document.querySelector("main").innerHTML = `
    <section class="case-head"><div><h1>${esc(p.title)}</h1><p class="ess">${esc(p.essence)}</p></div>
      <dl class="facts">${[["Role", p.role], ["Years", p.years], ["Where", p.place]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}
        <dt>Doors</dt><dd class="sites">${p.doors.map(x => `<a href="${DOORS[x].url}"><i class="dot ${x}"></i> ${DOORS[x].title}</a>`).join("")}</dd>
        ${(p.site || []).length ? `<dt>Links</dt><dd class="sites">${p.site.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</dd>` : ""}</dl></section>
    ${p.film ? `<video class="hero film" controls playsinline preload="none" poster="${p.film[1]}" aria-label="${esc(p.film[2])}"><source src="${p.film[0]}" type="video/mp4"></video>`
      : hero ? `<img class="hero" src="${hero}" alt="${esc(p.title)}">` : ""}
    ${st ? journeyHTML(p, st, p.film ? "" : hero) : `<section class="body">
            <div class="text">${(p.text || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>
      ${p.quote ? `<blockquote class="pull">“${esc(p.quote[0])}”<cite>${esc(p.quote[1])}</cite></blockquote>` : ""}
      ${p.src === "self" ? `<p class="flag">Mockup note: some facts here come only from your own materials. We add a source before publishing.</p>` : ""}
    </section>`}
    ${p.list ? `<section class="follow"><h2 class="sub">${esc(p.list[0])}</h2><ul>${p.list[1].map(([n, sub, u]) => { const ext = u && u.startsWith("http");
      return `<li>${u ? `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}>` : '<div class="li">'}<b>${esc(n)}</b><span>${esc(sub)}</span>${u ? "</a>" : "</div>"}</li>`; }).join("")}</ul></section>` : ""}
    ${(p.reel || []).length ? `<section class="films reel"><h2 class="sub">Conversations</h2><div class="vids">${p.reel.map(([id, t, w]) =>
      `<figure><button class="yt" data-yt="${id}" aria-label="Play: ${esc(t)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></button><figcaption><b>${esc(t)}</b>${esc(w)}</figcaption></figure>`).join("")}</div></section>` : ""}
    ${!st && pics.filter(s => s !== hero).length ? `<div class="photos">${pics.filter(s => s !== hero).map(s => `<img src="${s}" alt="${esc(p.title)}" loading="lazy"${DIM[s] ? ` width="${DIM[s][0]}" height="${DIM[s][1]}"` : ""}>`).join("")}</div>` : ""}
    ${p.search ? `<section class="search"><h2 class="sub">${esc(p.search[0])}</h2><p>${esc(p.search[1])} <a href="contact.html#build">write to me</a>.</p><div class="photos">${((typeof MEDIA !== "undefined" && MEDIA[p.search[2]]) || []).map(([f, w, h]) => `<img src="img/w/${p.search[2]}/${f}" alt="A candidate site in Catalonia, seen from the air" loading="lazy" width="${w}" height="${h}">`).join("")}</div></section>` : ""}
    ${(p.series || []).length && typeof SER !== "undefined" ? `<section class="comms"><h2 class="sub">Communities</h2><div>${p.series.map(id => SER[id]).filter(Boolean).map(t => { const m = (MEDIA[t.folders[0]] || [])[0];
      return `<a href="series.html#${t.id}">${m ? `<img src="img/t/${t.folders[0]}/${m[0]}" alt="" loading="lazy">` : ""}<b>${esc(t.title)}</b><span>${esc(t.place)}</span></a>`; }).join("")}</div></section>` : ""}
    ${(p.follow || []).length ? `<section class="follow"><h2 class="sub">Follow the research</h2><ul>${p.follow.map(([t, sub, u]) =>
      `<li><a href="${u}" target="_blank" rel="noopener"><b>${esc(t)}</b><span>${esc(sub)}</span></a></li>`).join("")}</ul></section>` : ""}
    ${(p.reads || []).length ? `<section class="reads"><h2 class="sub">From the Substack</h2><div>${p.reads.map(([t, ex, u]) =>
      `<article><h3><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></h3><p>“${esc(ex)}”</p><a class="more" href="${u}" target="_blank" rel="noopener">Read on Substack</a></article>`).join("")}</div></section>` : ""}
    ${(p.videos || []).length ? `<section class="films"><h2 class="sub">Films</h2><div class="vids">${p.videos.map(([id, t]) =>
      `<figure><button class="yt" data-yt="${id}" aria-label="Play: ${esc(t)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></button><figcaption>${esc(t)}</figcaption></figure>`).join("")}</div></section>` : ""}
    <section class="grows"><h2 class="sub">Grows into</h2><ul>${links.map(l =>
      `<li class="${l.doors[0]}"><a href="${projUrl(l)}"><span><b>${esc(l.title)}</b><span>${DOORS[l.doors[0]].title}</span></span></a></li>`).join("")}</ul></section>
    <section class="invite"><p>${INVITE[d][0]}</p><a class="btn" href="contact.html#${d}">${INVITE[d][1]}</a></section>`;
  // the contact page opens on this project, so a curator does not have to name it again
  document.querySelectorAll('main a[href^="contact.html#"]').forEach(a => a.href = a.getAttribute("href").replace("contact.html#", `contact.html?w=${p.id}#`));
  scrollTo(0, 0);
  intro();
  const j = document.querySelector(".journey"); if (j) { growJourney(j); lightbox(j); phones(j); }
  projNav(p, d);
}
// Moving between projects: a quiet rail in the right margin on wide screens, a small bar at the bottom on phones.
// The thread from this project to the next grows as you read.
function projNav(p, d) {
  const ae = document.activeElement, had = ae?.closest?.(".pbar") ? ae.dataset.step : ae?.closest?.(".pnav") ? "rail" : null;   // keyboard users keep their place
  document.querySelectorAll(".pnav, .pbar").forEach(e => e.remove());
  projNav.ac?.abort(); const sig = { signal: (projNav.ac = new AbortController()).signal };   // listeners from the last project go with it
  const list = doorProjects(d).filter(q => projUrl(q).startsWith("project.html")), i = list.indexOf(p), door = DOORS[d];
  if (i < 0) return;
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length], many = list.length > 1;
  const item = q => `<li${q === p ? ' class="here"' : ""}><a href="${projUrl(q)}"${q === p ? ' aria-current="page"' : ""}><i></i><span>${esc(q.title)}</span></a></li>`;
  const rail = document.createElement("nav"); rail.className = "pnav"; rail.setAttribute("aria-label", `Projects in ${door.title}`);
  rail.innerHTML = `<a class="pn-door" href="${door.url}">${esc(door.name)}</a><ol>${list.map(item).join("")}</ol><b class="pn-read" aria-hidden="true"></b>`;
  const bar = document.createElement("nav"); bar.className = "pbar"; bar.setAttribute("aria-label", "Move between projects");
  bar.innerHTML = many ? `<a class="pb-step" data-step="prev" href="${projUrl(prev)}" aria-label="Previous project: ${esc(prev.title)}">Prev</a>
    <button class="pb-mid" type="button" aria-expanded="false" aria-controls="pb-sheet" aria-label="Projects in ${esc(door.title)}, ${i + 1} of ${list.length}"><i></i><span>${esc(door.name)}</span><small>${i + 1} of ${list.length}</small></button>
    <div class="pb-sheet" id="pb-sheet" hidden><a class="pn-door" href="${door.url}">${esc(door.title)}</a><ol>${list.map(item).join("")}</ol></div>
    <a class="pb-step" data-step="next" href="${projUrl(next)}" aria-label="Next project: ${esc(next.title)}">Next</a>`
    : `<a class="pb-mid" href="${door.url}"><i></i><span>${esc(door.title)}</span></a>`;   // a door of one: just the way back
  document.body.append(rail, bar);
  if (had === "rail") rail.querySelector("li.here a").focus({ preventScroll: true });
  else if (had) bar.querySelector(`[data-step="${had}"]`)?.focus({ preventScroll: true });
  // the bar opens its list in place
  const mid = bar.querySelector("button.pb-mid"), sheet = bar.querySelector(".pb-sheet");
  const open = on => { if (!sheet) return; sheet.hidden = !on; mid.setAttribute("aria-expanded", on); bar.classList.toggle("open", on);
    if (on) sheet.querySelector(".here a")?.scrollIntoView({ block: "nearest" }); };   // the list opens on where you are
  mid?.addEventListener("click", () => open(sheet.hidden));
  addEventListener("keydown", e => { if (e.key === "Escape" && sheet && !sheet.hidden) { open(false); mid.focus(); } }, sig);
  document.addEventListener("click", e => { if (!bar.contains(e.target)) open(false); }, sig);
  bar.addEventListener("focusout", e => { if (!bar.contains(e.relatedTarget)) open(false); }, sig);
  // a playing film keeps the screen to itself
  const film = e => e.target.matches?.("video[controls]") && e.target.closest("main");
  document.addEventListener("play", e => { if (film(e)) bar.classList.add("film"); }, { capture: true, ...sig });
  document.addEventListener("pause", e => { if (film(e)) bar.classList.remove("film"); }, { capture: true, ...sig });
  document.addEventListener("ytplay", e => { bar.classList.add("film");
    new IntersectionObserver(([en], o) => { if (!en.isIntersecting) { bar.classList.remove("film"); o.disconnect(); } }).observe(e.detail); }, sig);
  // the rail's thread fills from the first project to this one, then on toward the next as you read
  const read = rail.querySelector(".pn-read"), dots = [...rail.querySelectorAll("li")], ol = rail.querySelector("ol");
  const thread = f => { const top = ol.offsetTop + dots[0].offsetTop + dots[0].offsetHeight / 2, here = ol.offsetTop + dots[i].offsetTop + dots[i].offsetHeight / 2,
      to = dots[i + 1] ? ol.offsetTop + dots[i + 1].offsetTop + dots[i + 1].offsetHeight / 2 : here; read.style.top = top + "px"; read.style.height = Math.max(0, here - top + (to - here) * f) + "px"; };
  // the bar steps aside while you read down, and comes back when you scroll up or reach the end
  let last = scrollY, ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight, f = max > 0 ? Math.min(1, scrollY / max) : 1;
      if (rail.getClientRects().length) thread(f);   // only while the rail is shown
      const y = scrollY, end = y > max - 200, busy = bar.classList.contains("open") || bar.contains(document.activeElement);
      if (y > last + 4 && y > 300 && !end && !busy) bar.classList.add("away");
      else if (y < last - 4 || end || y < 300) bar.classList.remove("away");   // tiny moves change nothing
      last = y; }); };
  addEventListener("scroll", onScroll, { passive: true, ...sig }); addEventListener("resize", onScroll, sig); onScroll();
}
// Phone mockups: each feed glides to its next photo on its own clock, only while on screen; a tap moves it on by hand
function phones(root) {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.querySelectorAll(".phone").forEach((ph, n) => {
    const v = ph.querySelector(".ph-feed video");
    if (v) {   // a reel: plays silently while on screen, a tap turns the sound on or off
      ph.querySelector(".ph-feed").addEventListener("click", () => { v.muted = !v.muted; ph.classList.toggle("loud", !v.muted); if (v.paused) v.play().catch(() => {}); });
      new IntersectionObserver(([en]) => { if (en.isIntersecting && !calm) v.play().catch(() => {}); else if (!en.isIntersecting) { v.pause(); v.muted = true; ph.classList.remove("loud"); } }, { threshold: .5 }).observe(ph);
      return; }
    const imgs = [...ph.querySelectorAll(".ph-feed img")], bars = [...ph.querySelectorAll(".ph-bars i")]; let i = 0, t = 0, seen = false;
    const go = k => { imgs[i].classList.remove("on"); i = (k + imgs.length) % imgs.length; imgs[i].classList.add("on");
      bars.forEach((b, x) => { b.classList.toggle("done", x < i); b.classList.remove("run"); }); void bars[i].offsetWidth; if (!calm && seen) bars[i].classList.add("run"); };
    const tick = () => { clearTimeout(t); if (!calm && seen && !document.hidden) t = setTimeout(() => { go(i + 1); tick(); }, 4200); };
    ph.querySelector(".ph-feed").addEventListener("click", e => { const r = e.currentTarget.getBoundingClientRect(); go(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1); tick(); });
    new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen) { setTimeout(() => { go(i); tick(); }, n * 700); } else clearTimeout(t); }, { threshold: .35 }).observe(ph);
    document.addEventListener("visibilitychange", tick);
  });
}
// The journey: a project told as text and photographs in turn, joined by a mycelium thread that grows as you read (stories.js)
function journeyHTML(p, st, hero) {
  const top = (hero || "").replace(/^img\/w\//, "");   // the photo already shown at the top of the page
  const dim = s => { const [f, n] = s.split("/"), m = ((typeof MEDIA !== "undefined" && MEDIA[f]) || []).find(r => r[0] === n); return m ? ` width="${m[1]}" height="${m[2]}"` : ""; };
  // other projects named in the text become links, so the story shows how the work binds together (first mention per block)
  const names = PROJECTS.filter(o => o.id !== p.id && o.title.length > 4 && !["series", "instagram", "substack", "reel"].includes(o.id)).sort((a, b) => b.title.length - a.title.length);
  const linked = t => { let h = esc(t).replace(/\[([^\]]+)\]\(((?:https?:\/\/|[\w-]+\.html)[^)\s]*)\)/g, (m, x, u) => `<a class="jl" href="${u}"${u.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${x}</a>`);   // [text](link)
    const used = new Set();
    for (const o of names) { const n = esc(o.title), i = h.indexOf(n); if (i < 0 || used.has(o.id) || /<a [^>]*$/.test(h.slice(0, i))) continue;
      used.add(o.id); h = h.slice(0, i) + `<a class="jl ${o.doors[0]}" href="${projUrl(o)}">${n}</a>` + h.slice(i + n.length); }
    return h; };
  let k = 0;
  const pic = (s, cap) => `<button class="jp" type="button" data-i="${k++}" data-cap="${esc(cap || "")}" aria-label="Enlarge photo${cap ? `: ${esc(cap)}` : ""}"><img src="img/w/${s}" alt="${esc(cap || p.title)}" loading="lazy"${dim(s)}></button>`;
  const B = {
    text: b => `${b.h ? `<h2>${esc(b.h)}</h2>` : ""}${(b.p || []).map(t => `<p>${linked(t)}</p>`).join("")}`,
    photos: b => `<figure class="n${Math.min(3, b.s.length)}"><div class="grid">${b.s.slice(0, 3).map(s => pic(s, b.cap)).join("")}</div>${b.cap ? `<figcaption>${esc(b.cap)}</figcaption>` : ""}</figure>`,
    quote: b => `<blockquote>“${esc(b.q)}”${b.by ? `<cite>${esc(b.by)}</cite>` : ""}</blockquote>`,
    film: b => `<figure>${b.yt ? `<button class="yt" data-yt="${b.yt}" aria-label="Play: ${esc(b.cap || p.title)}"><img src="https://i.ytimg.com/vi/${b.yt}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></button>`
      : `<video controls playsinline preload="none" aria-label="${esc(b.cap || p.title)}"${b.poster ? ` poster="${b.poster}"` : ""}><source src="${b.src}" type="video/mp4"></video>`}${b.cap ? `<figcaption>${esc(b.cap)}</figcaption>` : ""}</figure>`,
    steps: b => `${b.h ? `<h2>${esc(b.h)}</h2>` : ""}<ol>${(b.items || []).map(([t, v]) => `<li><b>${esc(t)}</b><span>${linked(v)}</span></li>`).join("")}</ol>`,
    cards: b => `${b.h ? `<h2>${esc(b.h)}</h2>` : ""}<div class="cards">${(b.items || []).map(c => { const ext = /^https?:/.test(c.href || ""), src = c.img ? (/^https?:/.test(c.img) ? c.img : `img/w/${c.img}`) : "";
      const tag = c.href ? "a" : "div";
      return `<${tag} class="card${c.href ? "" : " still"}"${c.href ? ` href="${esc(c.href)}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${src ? `<span class="ci"><img src="${esc(src)}" alt="" loading="lazy"></span>` : ""}<span class="ct">${c.tag ? `<i>${esc(c.tag)}</i>` : ""}<b>${esc(c.title)}</b>${c.text ? `<span>${esc(c.text)}</span>` : ""}</span></${tag}>`; }).join("")}</div>`,
    phones: b => `${b.h ? `<h2>${esc(b.h)}</h2>` : ""}<div class="phones">${(b.items || []).map(a => `<figure class="phone">
      <div class="phx${a.v ? " reel" : ""}">${a.v ? "" : `<div class="ph-bars">${a.s.map(() => "<i></i>").join("")}</div>`}
        <div class="ph-top"><span class="ph-av"><img src="${a.av ? esc(a.av) : `img/t/${a.s[0]}`}" alt=""></span><b>${esc(a.handle)}</b>${a.views ? `<span class="ph-views">${esc(a.views)}</span>` : ""}</div>
        ${a.v ? `<button class="ph-feed" type="button" aria-label="Sound on or off: ${esc(a.name)}"><video src="${esc(a.v)}"${a.poster ? ` poster="${esc(a.poster)}"` : ""} muted loop playsinline preload="none"></video><span class="ph-snd" aria-hidden="true"></span></button>`
        : `<button class="ph-feed" type="button" aria-label="Next photo from ${esc(a.handle)}">${a.s.map((s, i) => `<img src="img/w/${s}" alt="" loading="lazy"${i ? "" : ' class="on"'}>`).join("")}</button>`}
        <div class="ph-icons" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/></svg><svg viewBox="0 0 24 24"><path d="M21 4 10 14M21 4l-7 17-4-7-7-4z"/></svg></div>
        <p class="ph-cap"><b>${esc(a.handle)}</b> ${esc(a.cap || "")}</p></div>
      <figcaption><b>${esc(a.name)}</b><span>${esc(a.note || "")}</span>${a.href ? `<a href="${esc(a.href)}" target="_blank" rel="noopener">${esc(a.link || "Open on Instagram")}</a>` : ""}</figcaption></figure>`).join("")}</div>`,
    cta: b => `<h2>${esc(b.h)}</h2>${b.p ? `<p>${linked(b.p)}</p>` : ""}<div class="go">${(b.btn || []).map(([t, u]) => `<a class="btn" href="${u}"${u.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(t)}</a>`).join("")}</div>`,
  };
  let side = 0;   // photos and text step left and right down the page, so the thread has somewhere to wander
  const blocks = st.blocks.map(b => b.t === "photos" ? { ...b, s: b.s.filter(x => x !== top) } : b).filter(b => B[b.t] && !(b.t === "photos" && !b.s.length));
  return `<section class="journey"><svg class="jthread" aria-hidden="true"></svg>${blocks.map(b =>
    `<div class="jb jb-${b.t}${b.t === "photos" || b.t === "text" ? ((side++ % 2) ? " alt" : "") : ""}">${B[b.t](b)}</div>`).join("")}
    ${p.src === "self" ? `<p class="jsrc">Some of the facts on this page come from my own records and have not been published elsewhere.</p>` : ""}</section>`;
}
function growJourney(j) {
  const svg = j.querySelector(".jthread"), NS = "http://www.w3.org/2000/svg", still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let main = null, L = 0, knots = [];
  const draw = () => {
    if (!j.isConnected) return;   // a page re-rendered: this thread's journey is gone
    const W = j.offsetWidth, H = j.offsetHeight, x0 = Math.max(10, parseFloat(getComputedStyle(j).paddingLeft) * .42);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.height = H + "px"; svg.innerHTML = "";
    const el = (n, a, parent = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); parent.appendChild(e); return e; };
    let x = x0, y = 0, d = `M${x0} 0`; knots = [];
    [...j.querySelectorAll(".jb")].forEach(b => {
      const ky = b.offsetTop + Math.min(34, b.offsetHeight / 2), nx = x0 + mycRnd(-x0 * .5, x0 * .5);
      // wander on the way: a sideways drift halfway between knots, then settle at the knot
      const my = (y + ky) / 2, mx = x0 + mycRnd(-x0 * .7, x0 * .7);
      d += ` S${mx.toFixed(1)} ${(my - (ky - y) * .18).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)} S${nx.toFixed(1)} ${(ky - (ky - y) * .2).toFixed(1)} ${nx.toFixed(1)} ${ky.toFixed(1)}`; x = nx; y = ky;
      const g = el("g", { class: "knot" }); g.dataset.y = ky;
      el("circle", { cx: nx, cy: ky, r: b.classList.contains("jb-cta") ? 5 : 3.2 }, g);
      // a fine root reaches from the thread to each photograph and quote
      if (/jb-(photos|quote|film|steps|cta|cards)/.test(b.className)) { const tx = b.firstElementChild.getBoundingClientRect().left - j.getBoundingClientRect().left - 8, ty = ky + mycRnd(8, 26);
        el("path", { d: `M${nx} ${ky} C${nx + (tx - nx) * .3} ${ky + 26} ${tx - (tx - nx) * .35} ${ty - 18} ${tx} ${ty}`, class: "twig", pathLength: 1 }, g); }
      knots.push(g);
    });
    d += ` S${x} ${H - 20} ${x0} ${H}`;
    main = el("path", { d, class: "trunk" }); svg.prepend(main);
    L = main.getTotalLength(); main.style.strokeDasharray = L;
    // fine hyphae fork off the trunk all the way down, so it reads as mycelium rather than a line
    for (let at = 60; at < L - 40; at += mycRnd(70, 140)) {
      const p0 = main.getPointAtLength(at), p1 = main.getPointAtLength(at + 4), ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) + (Math.random() < .5 ? -1 : 1) * mycRnd(.6, 1.3), len = mycRnd(14, 46);
      const ex = p0.x + Math.cos(ang) * len, ey = p0.y + Math.sin(ang) * len, cx = p0.x + Math.cos(ang - .4) * len * .5, cy = p0.y + Math.sin(ang - .4) * len * .5;
      const g = el("g", { class: "knot hy" }); g.dataset.y = p0.y; el("path", { d: `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, class: "twig", pathLength: 1 }, g);
      if (Math.random() < .45) el("circle", { cx: ex.toFixed(1), cy: ey.toFixed(1), r: 1.2, class: "spore" }, g);
      knots.push(g); }
    grow();
  };
  const grow = () => { if (!main) return;
    const r = j.getBoundingClientRect(), reach = still ? Infinity : innerHeight * .78 - r.top;
    main.style.strokeDashoffset = Math.max(0, L * (1 - Math.max(0, reach) / j.offsetHeight));
    knots.forEach(g => g.classList.toggle("on", reach >= +g.dataset.y)); };
  addEventListener("scroll", () => requestAnimationFrame(grow), { passive: true });
  new ResizeObserver(() => { clearTimeout(draw.t); draw.t = setTimeout(draw, 150); }).observe(j);
  // blocks rise in softly as they arrive
  if (!still) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    j.querySelectorAll(".jb").forEach(b => { b.classList.add("rise"); io.observe(b); }); }
  draw();
}
// Lightbox: a photo grows out of its place on the page to fill the screen; swipe, arrows or keys move through the story
function lightbox(root) {
  const pics = [...root.querySelectorAll(".jp")];
  if (!pics.length) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches, ease = "cubic-bezier(.2,.7,.2,1)";
  let box, img, cap, count, i = 0, from = null;
  const build = () => {
    box = document.createElement("div"); box.className = "lbx"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Photo");
    box.innerHTML = `<div class="bg"></div><img alt=""><p class="cap"></p><span class="count"></span>
      <button class="x" type="button" aria-label="Close">Close</button><button class="prev" type="button" aria-label="Previous photo">&larr;</button><button class="next" type="button" aria-label="Next photo">&rarr;</button>`;
    document.body.appendChild(box); img = box.querySelector("img"); cap = box.querySelector(".cap"); count = box.querySelector(".count");
    box.querySelector(".x").onclick = close; box.querySelector(".bg").onclick = close;
    box.querySelector(".prev").onclick = () => go(-1); box.querySelector(".next").onclick = () => go(1);
    addEventListener("keydown", e => { if (!box.classList.contains("on")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") { const f = [...box.querySelectorAll("button")]; const at = f.indexOf(document.activeElement);   // keep focus inside
        e.preventDefault(); f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } });
    let sx = null; img.addEventListener("pointerdown", e => sx = e.clientX); img.addEventListener("pointerup", e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); else close(); });
  };
  const fit = el => { const t = el.querySelector("img"), w = t.naturalWidth || +t.getAttribute("width") || 4, h = t.naturalHeight || +t.getAttribute("height") || 3;
    const s = Math.min(innerWidth * .92 / w, (innerHeight - 120) / h); return { w: w * s, h: h * s }; };
  const show = () => { const el = pics[i], t = el.querySelector("img"), f = fit(el);
    img.src = t.currentSrc || t.src; img.alt = t.alt; img.style.width = f.w + "px"; img.style.height = f.h + "px";
    cap.textContent = el.dataset.cap || ""; count.textContent = `${i + 1} / ${pics.length}`; };
  const flip = (el, reverse) => { const a = el.getBoundingClientRect(), b = img.getBoundingClientRect();
    const k = [{ transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width}, ${a.height / b.height})` }, { transform: "none" }];
    return img.animate(reverse ? k.reverse() : k, { duration: still ? 1 : reverse ? 380 : 520, easing: ease, fill: "both" }); };
  function open(n) { if (!box) build(); i = n; from = document.activeElement; show(); box.classList.add("on"); document.documentElement.classList.add("lbx-open");
    flip(pics[i]); box.querySelector(".x").focus({ preventScroll: true }); }
  function close() { const el = pics[i], r = el.getBoundingClientRect(), seen = r.bottom > 0 && r.top < innerHeight;
    box.classList.remove("on"); document.documentElement.classList.remove("lbx-open");
    const a = seen ? flip(el, true) : img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "both" });
    a.onfinish = () => { img.getAnimations().forEach(x => x.cancel()); img.removeAttribute("src"); };
    from?.focus?.({ preventScroll: true }); }
  function go(d) { i = (i + d + pics.length) % pics.length; img.getAnimations().forEach(x => x.cancel());
    show(); if (!still) img.animate([{ opacity: 0, transform: `translateX(${d * 30}px)` }, { opacity: 1, transform: "none" }], { duration: 380, easing: ease }); }
  pics.forEach((el, n) => el.addEventListener("click", () => open(n)));
}

// Press play: swap the still for the video (nothing loads from YouTube until then)
document.addEventListener("click", e => { const b = e.target.closest(".yt"); if (!b) return;
  const box = b.parentElement;
  b.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="Film" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  document.dispatchEvent(new CustomEvent("ytplay", { detail: box })); });

// The one orchestrated moment: the headline rises line by line out of a mask (the colour thread draws down in CSS)
function intro(ready) {
  if (!ready) return document.fonts.ready.then(() => intro(true));   // SplitText measures lines, so wait for the real font
  const h = document.querySelector("main h1");
  if (!h || !window.gsap || !window.SplitText) return;
  gsap.registerPlugin(SplitText);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const split = SplitText.create(h, { type: "lines", mask: "lines" });
    gsap.from(split.lines, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.09, delay: 0.1 });
    gsap.from(h.parentElement.querySelectorAll(":scope > :not(h1)"), { opacity: 0, duration: 0.9, ease: "power2.out", delay: 0.45 });
    return () => split.revert();
  });
}

chrome();
const door = document.body.dataset.page;
if (DOORS[door]) doorPage(door);
if (door !== "project" && door !== "map") intro();
if (door === "project") { projectPage(); addEventListener("hashchange", projectPage); }

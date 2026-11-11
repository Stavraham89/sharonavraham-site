// Shared chrome (menu, footer) and the two templates: a door page and a project page.
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const here = location.pathname.split("/").pop() || "index.html";
const projUrl = p => p.link && !p.link.startsWith("http") && p.link !== "#" ? p.link : `project.html#${p.ref || p.id}`;
const dots = p => p.doors.map((d, i) => `<i class="dot ${d}${i ? " hollow" : ""}" title="${DOORS[d].name}"></i>`).join("");

const HOME = { label: "Sharon Avraham", href: "home.html" };
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
  gather: ["Hosting a group, a program or a festival?", "Invite me to hold the space"],
  tell: ["Doing good work that nobody sees yet?", "Let's tell your story"],
};
function doorPage(d) {
  // each door lists its projects in a deliberate order (Sharon's priorities), then whatever else grows there
  const ORDER = { build: ["midburn", "fugara", "farm", "elham", "togather", "lighthouse"],
    gather: ["midburn", "futureplay", "mjc", "alqarya", "synesthesia", "healing", "lab", "forbidden", "kamelz", "compass", "elham", "falahi", "somewhere"],
    tell: ["togather", "tamera", "arava", "reel"] };
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
    document.querySelector("main").innerHTML = `<section class="case-head"><div><h1>This project isn't here.</h1><p class="ess">The link may be old. <a href="home.html">Go to the homepage</a> or <a href="contact.html">write to me</a>.</p></div></section>`; return; }
  const d = p.doors[0];
  trail(document.querySelector("header.top"), [HOME, { label: DOORS[d].title, href: DOORS[d].url, door: d }, { label: p.title, door: d }], d);
  // photos from the old-site harvest when the project has a folder, otherwise the mockup photos
  const DIM = {};   // width and height per photo, so the page reserves space before images load
  const media = (p.media || []).flatMap(f => ((typeof MEDIA !== "undefined" && MEDIA[f]) || []).map(([file, w, h]) => { const u = `img/w/${f}/${file}`; DIM[u] = [w, h]; return u; })).filter(u => !(p.skip || []).some(k => u.endsWith(k)));
  const pics = (media.length ? media : (p.photos || [])).slice(0, p.reel ? 5 : 13), hero = p.hero || media[0] || p.img || (p.nophoto ? "" : mycDrawn(d));   // a drawn mycelium stands in until Sharon sends photos
  document.body.dataset.door = d;
  document.title = `${p.title}, Sharon Avraham`;
  const links = (p.links || []).map(id => P[id]).filter(Boolean);
  document.querySelector("main").innerHTML = `
    <section class="case-head"><div><h1>${esc(p.title)}</h1><p class="ess">${esc(p.essence)}</p></div>
      <dl class="facts">${[["Role", p.role], ["Years", p.years], ["Where", p.place]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}
        <dt>Doors</dt><dd class="sites">${p.doors.map(x => `<a href="${DOORS[x].url}"><i class="dot ${x}"></i> ${DOORS[x].title}</a>`).join("")}</dd>
        ${(p.site || []).length ? `<dt>Links</dt><dd class="sites">${p.site.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</dd>` : ""}</dl></section>
    ${p.film ? `<video class="hero film" controls playsinline preload="none" poster="${p.film[1]}" aria-label="${esc(p.film[2])}"><source src="${p.film[0]}" type="video/mp4"></video>`
      : hero ? `<img class="hero" src="${hero}" alt="${esc(p.title)}">` : ""}
    <section class="body">
            <div class="text">${(p.text || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>
      ${p.quote ? `<blockquote class="pull">“${esc(p.quote[0])}”<cite>${esc(p.quote[1])}</cite></blockquote>` : ""}
      ${p.src === "self" ? `<p class="flag">Mockup note: some facts here come only from your own materials. We add a source before publishing.</p>` : ""}
    </section>
    ${p.list ? `<section class="follow"><h2 class="sub">${esc(p.list[0])}</h2><ul>${p.list[1].map(([n, sub, u]) => { const ext = u && u.startsWith("http");
      return `<li>${u ? `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ""}>` : '<div class="li">'}<b>${esc(n)}</b><span>${esc(sub)}</span>${u ? "</a>" : "</div>"}</li>`; }).join("")}</ul></section>` : ""}
    ${(p.reel || []).length ? `<section class="films reel"><h2 class="sub">Conversations</h2><div class="vids">${p.reel.map(([id, t, w]) =>
      `<figure><button class="yt" data-yt="${id}" aria-label="Play: ${esc(t)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="play"></span></button><figcaption><b>${esc(t)}</b>${esc(w)}</figcaption></figure>`).join("")}</div></section>` : ""}
    ${pics.filter(s => s !== hero).length ? `<div class="photos">${pics.filter(s => s !== hero).map(s => `<img src="${s}" alt="${esc(p.title)}" loading="lazy"${DIM[s] ? ` width="${DIM[s][0]}" height="${DIM[s][1]}"` : ""}>`).join("")}</div>` : ""}
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
  scrollTo(0, 0);
  intro();
}
// Press play: swap the still for the video (nothing loads from YouTube until then)
document.addEventListener("click", e => { const b = e.target.closest(".yt"); if (!b) return;
  b.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="Film" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; });

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

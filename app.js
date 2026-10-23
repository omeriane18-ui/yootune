(() => {
  const C = window.BILAL, $ = (i) => document.getElementById(i);
  const API = "https://www.googleapis.com/youtube/v3/";
  const rowsEl = $("rows"), heroEl = $("hero"), resEl = $("results"), msg = $("msg"), modal = $("modal");
  let current = null, heroSet = false;
  $("y").textContent = new Date().getFullYear();

  // ---------- أدوات ----------
  const decode = (s = "") => { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; };
  const setMsg = (t, err) => { msg.textContent = t; msg.className = err ? "err" : ""; };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const norm = (it) => {
    const s = it.snippet || {};
    const id = typeof it.id === "string" ? it.id : it.id?.videoId || s.resourceId?.videoId;
    const th = s.thumbnails || {};
    const pick = th.maxres || th.standard || th.high || th.medium || th.default;
    if (!id || !pick || /^(Private|Deleted) video$/i.test(s.title)) return null;
    return { id, title: decode(s.title), channel: decode(s.channelTitle || ""), desc: decode(s.description || ""),
             thumb: (th.high || pick).url, big: pick.url };
  };

  async function api(endpoint, params) {
    if (!C.API_KEY || C.API_KEY.startsWith("ضع_")) throw new Error("أضف مفتاح API في ملف config.js");
    const p = new URLSearchParams({ ...params, key: C.API_KEY, part: "snippet" });
    const ck = "bilal:" + endpoint + p.toString().replace(/key=[^&]+&?/, "");
    const hit = store.get(ck);
    if (hit && Date.now() - hit.t < C.CACHE_HOURS * 36e5) return hit.v;
    const r = await fetch(API + endpoint + "?" + p);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "تعذّر الاتصال");
    const v = d.items.map(norm).filter(Boolean);
    store.set(ck, { t: Date.now(), v });
    return v;
  }

  const load = (row) =>
    row.chart ? api("videos", { chart: row.chart, regionCode: C.REGION, maxResults: 20 })
    : row.playlistId ? api("playlistItems", { playlistId: row.playlistId, maxResults: 20 })
    : api("search", { type: "video", q: row.query, maxResults: 16, videoEmbeddable: "true", relevanceLanguage: "ar", safeSearch: "moderate" });

  // ---------- واجهة ----------
  function card(v) {
    const b = document.createElement("button");
    b.className = "card";
    b.innerHTML = '<div class="th"><img loading="lazy" alt=""></div><p class="t"></p><p class="c"></p>';
    b.querySelector("img").src = v.thumb;
    b.querySelector(".t").textContent = v.title;
    b.querySelector(".c").textContent = v.channel;
    b.onclick = () => open(v);
    return b;
  }

  function makeRow(title, id) {
    const sec = document.createElement("section");
    sec.className = "row"; if (id) sec.id = id;
    sec.innerHTML = '<h2></h2><div class="wrap"><button class="arr p" aria-label="السابق">›</button><div class="track"></div><button class="arr n" aria-label="التالي">‹</button></div>';
    sec.querySelector("h2").textContent = title;
    const tr = sec.querySelector(".track");
    tr.innerHTML = '<div class="sk"></div>'.repeat(8);
    sec.querySelector(".p").onclick = () => tr.scrollBy({ left: tr.clientWidth * .8, behavior: "smooth" });
    sec.querySelector(".n").onclick = () => tr.scrollBy({ left: -tr.clientWidth * .8, behavior: "smooth" });
    rowsEl.appendChild(sec);
    return { sec, tr };
  }

  function setHero(v) {
    heroEl.style.backgroundImage = "url(" + v.big + ")";
    heroEl.innerHTML = '<div class="hc"><h1></h1><p></p><button class="btn" id="hp">▶ تشغيل</button><button class="btn ghost" id="hl"></button></div>';
    heroEl.querySelector("h1").textContent = v.title;
    heroEl.querySelector("p").textContent = v.desc || v.channel;
    $("hp").onclick = () => open(v);
    const sync = () => $("hl").textContent = isFav(v.id) ? "✓ في قائمتي" : "+ قائمتي";
    sync(); $("hl").onclick = () => { toggleFav(v); sync(); };
  }

  async function build() {
    renderMyList();
    for (const row of C.ROWS) {
      const { sec, tr } = makeRow(row.title);
      try {
        const items = await load(row);
        if (!items.length) { sec.remove(); continue; }
        tr.innerHTML = ""; items.forEach((v) => tr.appendChild(card(v)));
        if (!heroSet) { setHero(items[0]); heroSet = true; }
      } catch (e) { sec.remove(); setMsg("خطأ: " + e.message, true); if (!heroSet) heroEl.style.minHeight = "30vh"; if (/مفتاح/.test(e.message)) break; }
    }
  }

  // ---------- قائمتي ----------
  const favs = () => store.get("bilal:list", []);
  const isFav = (id) => favs().some((v) => v.id === id);
  function toggleFav(v) {
    const l = favs(), i = l.findIndex((x) => x.id === v.id);
    i > -1 ? l.splice(i, 1) : l.unshift(v);
    store.set("bilal:list", l); renderMyList();
  }
  function renderMyList() {
    let sec = $("mylist-row"); if (sec) sec.remove();
    const l = favs(); if (!l.length) return;
    const { sec: s, tr } = makeRow("قائمتي", "mylist-row");
    rowsEl.prepend(s); tr.innerHTML = ""; l.forEach((v) => tr.appendChild(card(v)));
  }

  // ---------- المشغّل ----------
  function open(v) {
    current = v;
    $("mt").textContent = v.title; $("mc").textContent = v.channel; $("md").textContent = v.desc;
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?autoplay=1&rel=0&modestbranding=1";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.title = v.title;
    $("player").replaceChildren(f);
    syncFav(); modal.showModal();
  }
  const syncFav = () => $("fav").textContent = isFav(current.id) ? "✓ في قائمتي" : "+ أضف إلى قائمتي";
  $("fav").onclick = () => { toggleFav(current); syncFav(); };
  $("x").onclick = () => modal.close();
  modal.addEventListener("close", () => $("player").replaceChildren());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  // ---------- البحث ----------
  $("sf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = $("q").value.trim(); if (!q) return showHome();
    setMsg("جارٍ البحث…"); heroEl.hidden = rowsEl.hidden = true; resEl.hidden = false;
    try {
      const items = await load({ query: q });
      resEl.innerHTML = "<h2></h2><div class='grid'></div>";
      resEl.querySelector("h2").textContent = items.length ? "نتائج: " + q : "لا توجد نتائج لـ " + q;
      const g = resEl.querySelector(".grid"); items.forEach((v) => g.appendChild(card(v)));
      setMsg("");
    } catch (er) { setMsg("خطأ: " + er.message, true); }
    scrollTo(0, 0);
  });
  function showHome() { heroEl.hidden = rowsEl.hidden = false; resEl.hidden = true; setMsg(""); }
  document.querySelector(".logo").addEventListener("click", (e) => { e.preventDefault(); $("q").value = ""; showHome(); scrollTo(0, 0); });
  $("to-list").addEventListener("click", (e) => { e.preventDefault(); showHome(); ($("mylist-row") || rowsEl).scrollIntoView({ behavior: "smooth" }); });
  addEventListener("scroll", () => $("nav").classList.toggle("solid", scrollY > 40), { passive: true });

  build();
})();

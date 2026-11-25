/* Clearing — app
   Vanilla JS, no build step. All data lives in this browser (see Store).
   Architecture note: Store talks to an adapter with read/write/clear. Swap LocalAdapter
   for a sync adapter (e.g. authenticated cloud storage) later; records carry ids and timestamps. */
(() => {
  "use strict";
  const C = window.CONTENT;
  const DAYS = C.DAYS;

  /* ---------------- utilities ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = (n) => String(n).padStart(2, "0");
  const clone = (o) => JSON.parse(JSON.stringify(o || {}));
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const r1 = (v) => (v == null ? "–" : (Math.round(v * 10) / 10).toString());
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + "s"}`;
  const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const diff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const today = () => { try { const o = localStorage.getItem("clearing.debugToday"); if (o && /^\d{4}-\d\d-\d\d$/.test(o)) return o; } catch (e) {} return ymd(new Date()); };
  const fmt = (s, o) => parse(s).toLocaleDateString("en-AU", o);
  const fmtLong = (s) => fmt(s, { weekday: "long", day: "numeric", month: "long" });
  const fmtShort = (s) => fmt(s, { weekday: "short", day: "numeric", month: "short" });
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
  const money = (v) => (v < 0 ? "−" : "") + "$" + Math.abs(Math.round(v)).toLocaleString("en-AU");
  const getP = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
  const setP = (o, p, v) => { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach((k, i) => { if (a[k] == null || typeof a[k] !== "object") a[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[k]; }); a[ks[ks.length - 1]] = v; };
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const labelOf = (list, id) => C.labelFrom(list, id);

  /* ---------------- icons ---------------- */
  const sv = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const ic = {
    today: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
    days: sv('<circle cx="12" cy="8.5" r="2"/><path d="M12 6.5c0-2.6 3.4-2.6 2.6 0M14 8.5c2.6 0 2.6 3.4 0 2.6M12 10.5c0 2.6-3.4 2.6-2.6 0M10 8.5c-2.6 0-2.6-3.4 0-2.6"/><path d="M12 10.5V21M12 17c-2-2.4-4.5-2.6-6-1.6 1.6 1.8 4 2 6 1.6M12 15.5c1.8-2 4-2.2 5.4-1.3-1.5 1.6-3.6 1.8-5.4 1.3"/>'),
    beliefs: sv('<path d="M7 9.5h10M7 13h6"/><path d="M4 5.5h16v10H11l-4 3.5v-3.5H4z"/>'),
    journal: sv('<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M6 3.5v17M9.5 8h5.5M9.5 11.5h5.5"/>'),
    insights: sv('<path d="M4 19.5h16"/><path d="M5 15l4.5-5 3.5 3 6-7"/>'),
    wave: sv('<path d="M2.5 14c2.2 0 2.2-3 4.4-3s2.2 3 4.4 3 2.2-6 4.4-6 2.2 6 4.4 6"/><path d="M2.5 19c2.2 0 2.2-1.6 4.4-1.6s2.2 1.6 4.4 1.6 2.2-1.6 4.4-1.6 2.2 1.6 4.4 1.6" opacity=".55"/>'),
    glass: sv('<path d="M7 3.5h10l-1.2 6.4a3.9 3.9 0 0 1-7.6 0z"/><path d="M12 14v6M8.5 20.5h7"/>'),
    pen: sv('<path d="M4 20l1-4.5L15.5 5a2 2 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>'),
    x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
    user: sv('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.3 7-5.3s5.8 1.7 7 5.3"/>'),
    star: sv('<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'),
    starOn: sv('<path fill="currentColor" d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'),
    trash: sv('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>'),
    arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'width="16" height="16"'),
    leaf: sv('<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l8-8"/>'),
  };

  /* ---------------- store ---------------- */
  const KEY = "clearing.v1";
  const mem = { v: null };
  const LocalAdapter = {
    name: "This device only",
    read() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : mem.v; } catch (e) { return mem.v; } },
    write(d) { mem.v = d; try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } },
    clear() { mem.v = null; try { localStorage.removeItem(KEY); } catch (e) {} },
  };
  const blank = () => ({
    schema: 1, createdAt: Date.now(), updatedAt: Date.now(), profile: null,
    settings: { theme: "auto", readAhead: false, reminders: { morning: "07:30", evening: "20:30" } },
    days: {}, photos: {}, status: {}, checkins: {}, drinks: [], cravings: [], journal: [], beliefs: {}, beliefNotes: {}, lists: {}, kept: {},
    future: { letter: null, reasons: [], feel: { words: [], text: "" } },
    next: { choice: null, rules: { days: 2, perDay: 2, skip: "" }, extendedTo: 30, goals: [], finalAt: null },
  });
  function migrate(r) {
    if (!r || typeof r !== "object" || r.schema !== 1) return null;
    const b = blank();
    for (const k of Object.keys(b)) if (r[k] == null) r[k] = b[k];
    for (const k of Object.keys(b.settings)) if (r.settings[k] == null) r.settings[k] = b.settings[k];
    for (const k of Object.keys(b.future)) if (r.future[k] == null) r.future[k] = b.future[k];
    for (const k of Object.keys(b.next)) if (r.next[k] == null) r.next[k] = b.next[k];
    return r;
  }
  const S = {
    adapter: LocalAdapter, d: null, ok: true, t: 0,
    load() { this.d = migrate(this.adapter.read()) || blank(); },
    save() { clearTimeout(this.t); this.d.updatedAt = Date.now(); this.ok = this.adapter.write(this.d); },
    soon() { clearTimeout(this.t); this.t = setTimeout(() => this.save(), 350); },
  };

  /* ---------------- photos ----------------
     Daily photos live in IndexedDB on this device (too big for localStorage).
     S.d.photos keeps a small index { date: { ts, day } } so views can render synchronously. */
  const PhotoDB = {
    p: null,
    open() { if (!this.p) this.p = new Promise((res, rej) => { try { const r = indexedDB.open("clearing-photos", 1); r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "date" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); return this.p; },
    async run(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction("photos", mode); const st = t.objectStore("photos"); const q = fn(st); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
    put(rec) { return this.run("readwrite", (s) => s.put(rec)); },
    get(date) { return this.run("readonly", (s) => s.get(date)); },
    all() { return this.run("readonly", (s) => s.getAll()); },
    del(date) { return this.run("readwrite", (s) => s.delete(date)); },
    clear() { return this.run("readwrite", (s) => s.clear()); },
  };
  const urlCache = new Map();
  async function photoURL(date) { if (urlCache.has(date)) return urlCache.get(date); const r = await PhotoDB.get(date); if (!r || !r.blob) return null; const u = URL.createObjectURL(r.blob); urlCache.set(date, u); return u; }
  function forgetURL(date) { if (urlCache.has(date)) { URL.revokeObjectURL(urlCache.get(date)); urlCache.delete(date); } }
  function hydratePhotos(root = document) { $$("[data-photo]", root).forEach(async (el) => { try { const u = await photoURL(el.dataset.photo); if (u) el.src = u; } catch (e) {} }); }
  async function compressImage(file) {
    const url = URL.createObjectURL(file); const img = new Image(); img.src = url;
    try { await img.decode(); } catch (e) { URL.revokeObjectURL(url); throw e; }
    const max = 1280, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82)); if (!blob) throw new Error("encode");
    return { blob, w: c.width, h: c.height };
  }
  async function savePhoto(date, file) {
    toast("Saving your photo…");
    try {
      const { blob, w, h } = await compressImage(file);
      await PhotoDB.put({ date, blob, w, h, ts: Date.now() });
      S.d.photos[date] = { ts: Date.now(), day: P().startDate ? diff(P().startDate, date) + 1 : null }; S.save(); forgetURL(date);
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
      closeDialog(); toast("Photo saved"); render();
    } catch (e) { toast(window.indexedDB ? "Couldn’t read that photo. Try a JPEG or PNG." : "Photos can’t be saved in this browser. Use the installed app."); }
  }
  const blobToDataURL = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
  const photoDates = () => Object.keys(S.d.photos || {}).sort();
  const photoInput = (date) => `<input type="file" accept="image/*" class="sr" data-act-change="photo" data-date="${date}">`;
  let photoCmp = { a: null, b: null, mode: "slide" };

  /* ---------------- domain ---------------- */
  const P = () => S.d.profile || {};
  const name = () => (P().name || "").trim();
  const curDay = () => (P().startDate ? diff(P().startDate, today()) + 1 : 0);
  const maxDay = () => S.d.next.extendedTo || 30;
  const dateOf = (n) => addDays(P().startDate, n - 1);
  const dayData = (n) => (S.d.days[n] = S.d.days[n] || {});
  const mDone = (n) => !!(S.d.days[n] && S.d.days[n].morning && S.d.days[n].morning.done);
  const eDone = (n) => !!(S.d.days[n] && S.d.days[n].evening && S.d.days[n].evening.done);
  const unlocked = (n) => n <= curDay() || (S.d.settings.readAhead && n <= 30);
  const lastBelief = (id) => { const h = S.d.beliefs[id]; return h && h.length ? h[h.length - 1].v : null; };
  const firstBelief = (id) => { const h = S.d.beliefs[id]; return h && h.length ? h[0].v : null; };
  const drinksOn = (date) => S.d.drinks.filter((x) => x.date === date);
  function greet() {
    const h = new Date().getHours();
    const g = h < 5 ? "Hello" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return name() ? `${g}, ${esc(name())}.` : `${g}.`;
  }
  function personal(d) { try { return d.personal ? d.personal(P()) : ""; } catch (e) { return ""; } }
  function expDates() {
    if (!P().startDate) return [];
    const out = []; const last = Math.min(curDay(), maxDay());
    for (let i = 1; i <= last; i++) out.push(dateOf(i));
    return out;
  }
  function baseline() {
    const p = P(); const std = (+p.daysPerWeek || 0) * (+p.drinksPerDay || 0); const spend = +p.weeklySpend || 0;
    return { perDayStd: std / 7, perDaySpend: spend / 7, costPerStd: std ? spend / std : 0, weekStd: std };
  }
  function spentOn(date) { const b = baseline(); return drinksOn(date).reduce((a, x) => a + (x.spent != null && x.spent !== "" ? +x.spent : (+x.std || 0) * b.costPerStd), 0); }
  function gains() {
    const b = baseline(); let saved = 0, std = 0, logged = 0, af = 0, drank = 0, stdHad = 0;
    for (const d of expDates()) {
      const s = S.d.status[d]; if (!s) continue; logged++;
      if (s === "af") af++; else drank++;
      const had = drinksOn(d).reduce((a, x) => a + (+x.std || 0), 0); stdHad += had;
      saved += b.perDaySpend - spentOn(d); std += b.perDayStd - had;
    }
    return { saved, std, logged, af, drank, stdHad };
  }
  function listsFor(kind) { return (S.d.lists[kind] || []).filter((r) => r && Object.values(r).some((v) => String(v || "").trim())); }

  /* ---------------- the garden ----------------
     A raised bed against a red brick wall, a timber screen and a gum canopy.
     Each experiment day plants one dahlia or peony. Alcohol-free days bloom in
     their own colour, days with a drink bloom amber, days not yet logged stay in bud. */
  const rnd = (i, k = 0) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  const ORDER = (() => { const a = Array.from({ length: 30 }, (_, i) => i); for (let i = 29; i > 0; i--) { const j = Math.floor(rnd(i, 7) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
  const FL = {
    dahlia: [["#fffaf3", "#f6e7d3", "#d9b99a"], ["#fbeeb0", "#f2da7d", "#c9a64a"]],
    peony: [["#ffffff", "#f7eee8", "#dcc3bb"], ["#fff3c9", "#f6e3a1", "#cfb06a"]],
    amber: ["#f490a6", "#e2607d", "#b23f5c"],
  };
  const f1 = (v) => (+v).toFixed(1);
  const petal = (R, w) => `M0 0C${f1(R * 0.3)} ${f1(-w)} ${f1(R * 0.78)} ${f1(-w * 0.8)} ${f1(R)} 0C${f1(R * 0.78)} ${f1(w * 0.8)} ${f1(R * 0.3)} ${f1(w)} 0 0Z`;
  function dahlia(cx, cy, r, c, rot = 0) {
    let s = "";
    for (let i = 0; i < 14; i++) s += `<path d="${petal(r, r * 0.23)}" fill="${c[0]}" stroke="${c[2]}" stroke-width=".35" stroke-opacity=".35" transform="rotate(${f1(rot + (i * 360) / 14)})"/>`;
    for (let i = 0; i < 10; i++) s += `<path d="${petal(r * 0.68, r * 0.19)}" fill="${c[1]}" transform="rotate(${f1(rot + i * 36 + 18)})"/>`;
    for (let i = 0; i < 7; i++) s += `<path d="${petal(r * 0.38, r * 0.13)}" fill="${c[2]}" opacity=".75" transform="rotate(${f1(rot + i * 51)})"/>`;
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(1 .84)">${s}<circle r="${f1(r * 0.14)}" fill="${c[2]}"/></g>`;
  }
  function peony(cx, cy, r, c) {
    let s = "";
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; s += `<circle cx="${f1(Math.cos(a) * r * 0.46)}" cy="${f1(Math.sin(a) * r * 0.46)}" r="${f1(r * 0.54)}" fill="${c[0]}" stroke="${c[2]}" stroke-width=".35" stroke-opacity=".4"/>`; }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.4; s += `<circle cx="${f1(Math.cos(a) * r * 0.22)}" cy="${f1(Math.sin(a) * r * 0.22)}" r="${f1(r * 0.38)}" fill="${c[1]}" stroke="${c[2]}" stroke-width=".3" stroke-opacity=".35"/>`; }
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; s += `<circle cx="${f1(Math.cos(a) * r * 0.1)}" cy="${f1(Math.sin(a) * r * 0.1)}" r="${f1(r * 0.2)}" fill="${c[2]}" opacity=".55"/>`; }
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(1 .86)">${s}</g>`;
  }
  const gleaf = (x, y, a, L) => `<path d="M0 0C${f1(L * 0.3)} ${f1(-L * 0.28)} ${f1(L * 0.72)} ${f1(-L * 0.24)} ${f1(L)} 0C${f1(L * 0.7)} ${f1(L * 0.18)} ${f1(L * 0.3)} ${f1(L * 0.22)} 0 0Z" fill="#8fab7a" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})"/>`;
  function plant(slot, status, isNew) {
    const back = slot % 2 === 0;
    const x = 84 + (slot / 29) * 302 + (rnd(slot, 1) - 0.5) * 6;
    const base = back ? 152 : 161; const h = (back ? 66 : 46) + rnd(slot, 2) * 24; const top = base - h; const sway = (rnd(slot, 3) - 0.5) * 12;
    const type = rnd(slot, 4) < 0.5 ? "dahlia" : "peony"; const cols = status === "drank" ? FL.amber : FL[type][rnd(slot, 5) < 0.55 ? 0 : 1];
    const tx = x + sway;
    let s = `<path d="M${f1(x)} ${base}Q${f1(x + sway * 0.2)} ${f1((base + top) / 2)} ${f1(tx)} ${f1(top)}" fill="none" stroke="#7f9a6b" stroke-width="1.5" stroke-linecap="round"/>`;
    const lt = (t) => [x + sway * t * t, base - h * t];
    const [ax, ay] = lt(0.38); const [bx, by] = lt(0.62);
    s += gleaf(ax, ay, -150 + rnd(slot, 6) * 30, 11 + rnd(slot, 8) * 4) + gleaf(bx, by, -40 + rnd(slot, 9) * 30, 10 + rnd(slot, 10) * 4);
    let bloom;
    if (!status) bloom = `<g transform="translate(${f1(tx)} ${f1(top)})"><ellipse rx="3.2" ry="4.8" fill="#8fab7a"/><path d="M-1.6 -3.4Q0 -6.4 1.6 -3.4Z" fill="${cols[1]}"/></g>`;
    else { const r = (back ? 12.5 : 10.5) + rnd(slot, 11) * 3; bloom = type === "dahlia" ? dahlia(tx, top, r, cols, rnd(slot, 12) * 30) : peony(tx, top, r, cols); }
    return `<g${isNew ? ' class="grow"' : ""}>${s}<g${isNew ? ' class="pop"' : ""}>${bloom}</g></g>`;
  }
  function garden({ upto = 0, st = [], newBloom = -1, label = "", cls = "garden" } = {}) {
    const id = "gd" + uid();
    let s = `<svg viewBox="0 0 400 200" class="${cls}" role="img" aria-label="${esc(label)}"><defs>
      <pattern id="${id}b" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#f4d6d9"/><path d="M0 5.7H18M0 11.7H18M0.4 0V5.7M9.4 6V11.7" stroke="#fbeaec" stroke-width=".6" opacity=".9"/></pattern>
      <linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f2ee"/><stop offset="1" stop-color="#e7ddd6"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2a3a" stop-opacity="0"/><stop offset="1" stop-color="#7a2a3a" stop-opacity=".12"/></linearGradient></defs>`;
    // gum canopy
    s += `<g fill="#f6dadd"><circle cx="356" cy="50" r="40"/><circle cx="398" cy="66" r="40"/><circle cx="318" cy="78" r="26"/><circle cx="280" cy="76" r="16"/><circle cx="384" cy="30" r="24"/></g><g fill="#fbe0e3" opacity=".9"><circle cx="346" cy="40" r="16"/><circle cx="388" cy="52" r="13"/><circle cx="310" cy="72" r="10"/></g><rect x="371" y="70" width="9" height="80" fill="#c99a96"/>`;
    // brick wall, stepped like the photo
    s += `<path d="M64 74H290V90H402V150H64Z" fill="url(#${id}b)"/>`;
    for (let k = 0; k < 60; k++) { const col = Math.floor(rnd(k, 21) * 19), row = Math.floor(rnd(k, 22) * 13); const bx = 64 + col * 18 + (row % 2 ? 9 : 0) + 0.8, by = 74 + row * 6 + 0.4; if (bx > 392 || (bx > 286 && by < 90)) continue; s += `<rect x="${f1(bx)}" y="${f1(by)}" width="8" height="5" fill="${rnd(k, 23) < 0.6 ? "#eebfc4" : "#f8e1e3"}" opacity=".55"/>`; }
    s += `<path d="M64 73.5H290V89.5H402" fill="none" stroke="#e9b8be" stroke-width="1.6"/><rect x="64" y="74" width="338" height="76" fill="url(#${id}w)"/>`;
    // timber screen
    s += `<rect x="-2" y="40" width="72" height="140" fill="#eadbd4"/>`;
    for (let x = 2; x < 70; x += 5) s += `<line x1="${x}" y1="40" x2="${x}" y2="180" stroke="#dccabf" stroke-width="1"/>`;
    s += `<rect x="-2" y="40" width="72" height="3" fill="#e6c6bd"/>`;
    // soil and future mounds
    s += `<rect x="66" y="144" width="336" height="16" fill="#c9a49e"/>`;
    for (let i = upto; i < 30; i++) { const sl = ORDER[i]; if (sl % 2 === 0) { const x = 84 + (sl / 29) * 302; s += `<ellipse cx="${f1(x)}" cy="152" rx="4" ry="1.6" fill="#b98680"/>`; } }
    // plants: back row first
    const planted = []; for (let i = 0; i < Math.min(upto, 30); i++) planted.push({ i, slot: ORDER[i] });
    planted.sort((a, b) => (a.slot % 2) - (b.slot % 2) || a.slot - b.slot);
    planted.forEach(({ i, slot }) => (s += plant(slot, st[i] || (i === newBloom ? "af" : null), i === newBloom)));
    // concrete bed and lawn
    s += `<rect x="64" y="157" width="340" height="21" fill="url(#${id}c)"/><rect x="64" y="157" width="340" height="1.8" fill="#ffffff"/><rect x="64" y="157" width="2" height="21" fill="#fbf8f5"/>`;
    for (let k = 0; k < 26; k++) s += `<circle cx="${f1(70 + rnd(k, 31) * 330)}" cy="${f1(161 + rnd(k, 32) * 15)}" r=".55" fill="#cbbfb7" opacity=".7"/>`;
    s += `<rect x="-2" y="177" width="406" height="25" fill="#dfe8cf"/><path d="M-2 177H404" stroke="#b5c69a" stroke-width="1.2"/>`;
    for (let k = 0; k < 7; k++) s += `<ellipse cx="${f1(rnd(k, 41) * 400)}" cy="${f1(186 + rnd(k, 42) * 12)}" rx="${f1(14 + rnd(k, 43) * 20)}" ry="2.5" fill="#bccb9f" opacity=".6"/>`;
    return s + "</svg>";
  }
  function dayStatuses() { const out = []; for (let i = 1; i <= 30; i++) out.push(P().startDate ? S.d.status[dateOf(i)] || null : null); return out; }
  function gardenLabel(upto) { const st = dayStatuses().slice(0, upto); return `A garden bed of dahlias and peonies with ${upto} of 30 plants: ${st.filter((x) => x === "af").length} in white or butter bloom for alcohol-free days, ${st.filter((x) => x === "drank").length} pink blooms for days with a drink, ${st.filter((x) => !x).length} in bud, not yet logged.`; }

  const MOTIFS = [
    '<path d="M50 86C52 60 48 38 56 8" stroke="var(--ink3)" stroke-width="1.6" fill="none"/><path d="M53 58C36 54 26 42 24 30c14 2 26 12 29 28z" fill="var(--sage)"/><path d="M54 40c14-6 26-4 34 4-12 8-24 6-34-4z" fill="var(--leaf)"/><path d="M55 22c-10-6-14-14-12-20 10 4 13 12 12 20z" fill="var(--sage)"/>',
    '<path d="M48 88c2-24 6-46 2-72M50 46c10-6 18-14 22-24M50 62c-12-4-20-12-24-22" stroke="var(--ink3)" stroke-width="1.4" fill="none"/><g fill="var(--ochre)"><circle cx="50" cy="14" r="6"/><circle cx="73" cy="20" r="5.5"/><circle cx="26" cy="38" r="5.5"/><circle cx="62" cy="10" r="4"/><circle cx="80" cy="30" r="4"/><circle cx="20" cy="28" r="4"/></g>',
    '<path d="M50 88C50 60 46 34 54 6" stroke="var(--sage)" stroke-width="1.6" fill="none"/>' + Array.from({ length: 9 }, (_, i) => { const y = 78 - i * 8; const L = 30 - i * 2.6; return `<path d="M${50 + i * 0.35} ${y}q${-L / 2} -4 ${-L} -2M${50 + i * 0.35} ${y}q${L / 2} -4 ${L} -2" stroke="var(--sage)" stroke-width="1.4" fill="none"/>`; }).join(""),
    '<path d="M50 88V40M50 40c-14-4-22-12-24-22M50 40c14-4 22-12 24-22" stroke="var(--ink3)" stroke-width="1.4" fill="none"/><g fill="var(--clay)" opacity=".85"><path d="M18 18c0-8 16-8 16 0v4c0 6-16 6-16 0z"/><path d="M66 18c0-8 16-8 16 0v4c0 6-16 6-16 0z"/><path d="M42 30c0-8 16-8 16 0v4c0 6-16 6-16 0z"/></g>',
    '<g stroke="var(--sage)" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M40 88C38 60 30 34 18 10"/><path d="M50 88C50 58 52 32 56 6"/><path d="M60 88c4-26 14-48 26-66"/><path d="M45 88c-2-20-10-34-22-44" opacity=".6"/></g>',
  ];
  MOTIFS.push('<path d="M50 88C50 66 48 46 50 30" stroke="#7f9a6b" stroke-width="1.6" fill="none"/>' + gleaf(50, 64, -150, 18) + gleaf(50, 52, -35, 16) + dahlia(50, 26, 20, FL.dahlia[0]));
  MOTIFS.push('<path d="M50 88C50 66 52 46 50 32" stroke="#7f9a6b" stroke-width="1.6" fill="none"/>' + gleaf(50, 66, -145, 18) + gleaf(51, 54, -30, 15) + peony(50, 28, 20, FL.peony[0]));
  const motif = (i) => `<svg viewBox="0 0 100 90" aria-hidden="true">${MOTIFS[i % MOTIFS.length]}</svg>`;

  /* ---------------- UI primitives ---------------- */
  const SC = { sleep: ["Badly", "Very well"], mood: ["Low", "Good"], energy: ["Drained", "Full"], conf: ["Shaky", "Steady"] };
  function scale(path, val, ends, label, n = 5, start = 1) {
    const id = "s" + uid();
    let b = "";
    for (let i = start; i < start + n; i++) b += `<button type="button" role="radio" aria-checked="${val === i}" data-scale="${path}" data-v="${i}" aria-label="${i}${i === start ? " – " + ends[0] : i === start + n - 1 ? " – " + ends[1] : ""}">${i}</button>`;
    return `<div class="field"><span class="q" id="${id}">${label}</span><div class="scale" role="radiogroup" aria-labelledby="${id}" style="--n:${n}">${b}</div><div class="scale-ends" aria-hidden="true"><span>${ends[0]}</span><span>${ends[1]}</span></div></div>`;
  }
  function chips(path, options, val, multi = true, label = "") {
    const arr = Array.isArray(val) ? val : val != null ? [val] : [];
    const role = multi ? "" : 'role="radio"';
    const b = options.map(([id, l]) => `<button type="button" class="chip" ${role} ${multi ? `aria-pressed="${arr.includes(id)}"` : `aria-checked="${arr.includes(id)}"`} data-chip="${path}" data-v="${esc(id)}" ${multi ? 'data-multi="1"' : ""}>${esc(l)}</button>`).join("");
    return `<div class="field">${label ? `<span class="q">${label}</span>` : ""}<div class="chips" ${multi ? 'role="group"' : 'role="radiogroup"'} ${label ? `aria-label="${esc(label)}"` : ""}>${b}</div></div>`;
  }
  function opts(path, options, val, label = "") {
    const b = options.map(([id, t, s]) => `<button type="button" class="option" role="radio" aria-checked="${val === id}" data-chip="${path}" data-v="${esc(id)}"><b>${t}</b>${s ? `<span>${s}</span>` : ""}</button>`).join("");
    return `<div class="field">${label ? `<span class="q">${label}</span>` : ""}<div class="options" role="radiogroup" ${label ? `aria-label="${esc(label)}"` : ""}>${b}</div></div>`;
  }
  function ta(path, val, label, ph = "", rows = 3) {
    const id = "t" + uid();
    return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" rows="${rows}" data-k="${path}" placeholder="${esc(ph)}">${esc(val || "")}</textarea></div>`;
  }
  function inp(path, val, label, ph = "", type = "text", extra = "") {
    const id = "i" + uid();
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" data-k="${path}" value="${esc(val == null ? "" : val)}" placeholder="${esc(ph)}" ${extra}></div>`;
  }
  function slider(path, val, label, was = null, ends = ["Not at all", "Completely"]) {
    const v = val == null ? 50 : val; const id = "r" + uid();
    return `<div class="slider"><div class="top"><b id="${id}l">${label}</b><output for="${id}" class="num">${v}</output></div>${was != null ? `<span class="was" style="left:calc(14px + (100% - 28px) * ${was / 100})" title="Day one: ${was}"></span>` : ""}<input id="${id}" type="range" min="0" max="100" step="1" value="${v}" data-k="${path}" data-num="1" aria-labelledby="${id}l" style="--p:${v}%"><div class="scale-ends" aria-hidden="true"><span>${ends[0]}</span><span>${ends[1]}</span></div></div>`;
  }
  function stepper(path, val, label, min, max, step = 1, suffix = "") {
    return `<div class="field"><span class="q">${label}</span><div class="stepper" role="group" aria-label="${esc(label)}"><button type="button" data-step="${path}" data-d="${-step}" data-min="${min}" data-max="${max}" aria-label="Decrease">−</button><output aria-live="polite" class="num">${val}${suffix}</output><button type="button" data-step="${path}" data-d="${step}" data-min="${min}" data-max="${max}" aria-label="Increase">+</button></div></div>`;
  }
  function evidenceTag(level) { const e = C.EVIDENCE[level]; return e ? `<details class="refs" style="margin-top:0"><summary><span class="evidence" data-l="${level}"><i></i>${e.label}</span></summary><p class="small" style="margin-top:6px">${e.note}</p></details>` : ""; }
  function refsBlock(keys) { if (!keys || !keys.length) return ""; return `<details class="refs"><summary>References (${keys.length})</summary><ol>${keys.map((k) => `<li>${esc(C.REFS[k])}</li>`).join("")}</ol></details>`; }

  let toastT = 0;
  function toast(msg) { let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2800); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast("Copied"); return; } catch (e) {}
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); toast("Copied"); } catch (e) { toast("Couldn’t copy. Select and copy manually."); } t.remove();
  }
  function download(filename, mime, text) {
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast(framed ? "If nothing downloaded, use Copy instead" : "Downloaded"); }
    catch (e) { toast("Download isn’t available here. Use Copy instead."); }
  }

  /* dialogs */
  let dlgCb = null;
  function dialog({ title, body, actions }) {
    closeDialog();
    const d = document.createElement("div"); d.className = "dlg-back"; d.id = "dlg";
    d.innerHTML = `<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgt"><h2 id="dlgt">${title}</h2><div class="dlg-body">${body}</div><div class="row" style="justify-content:flex-end">${actions.map((a, i) => `<button class="${a.primary ? "btn" + (a.clay ? " clay" : "") : "btn ghost"}" data-dlg="${i}">${a.label}</button>`).join("")}</div></div>`;
    document.body.appendChild(d);
    dlgCb = actions;
    d.addEventListener("click", (e) => { if (e.target === d) closeDialog(); });
    setTimeout(() => { const f = $("input, textarea, [data-dlg]", d); f && f.focus(); }, 30);
  }
  function closeDialog() { const d = $("#dlg"); if (d) d.remove(); dlgCb = null; }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dlg]"); if (!b || !dlgCb) return;
    const a = dlgCb[+b.dataset.dlg]; const keep = a.act && a.act($("#dlg")) === false; if (!keep) closeDialog();
  });

  /* ---------------- scopes & binding ---------------- */
  const scopes = {};
  function scope(id, obj, change) { scopes[id] = { obj, change }; return `data-scope="${id}"`; }
  function scopeOf(el) { const s = el.closest("[data-scope]"); return s ? scopes[s.dataset.scope] : null; }
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.ba) { const ba = el.parentElement.querySelector(".ba"); if (ba) ba.style.setProperty("--pos", el.value + "%"); el.style.setProperty("--p", el.value + "%"); return; }
    if (!el.dataset || !el.dataset.k) return; const sc = scopeOf(el); if (!sc) return;
    let v = el.value; if (el.dataset.num || el.type === "range") v = el.value === "" ? null : Number(el.value);
    setP(sc.obj, el.dataset.k, v);
    if (el.type === "range") { const mn = +el.min || 0, mx = +el.max || 100; el.style.setProperty("--p", ((v - mn) / (mx - mn)) * 100 + "%"); const o = el.closest(".slider") && el.closest(".slider").querySelector("output"); if (o) o.textContent = v; }
    sc.change && sc.change(el.dataset.k, el);
  });
  function handleBind(e) {
    const ch = e.target.closest("[data-chip]");
    if (ch) {
      const sc = scopeOf(ch); if (!sc) return true; const path = ch.dataset.chip; const v = ch.dataset.v;
      if (ch.dataset.multi) {
        const arr = Array.isArray(getP(sc.obj, path)) ? getP(sc.obj, path).slice() : [];
        const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); setP(sc.obj, path, arr); ch.setAttribute("aria-pressed", i < 0);
      } else {
        setP(sc.obj, path, v);
        $$(`[data-chip="${path}"]`, ch.closest("[data-scope]")).forEach((b) => b.setAttribute("aria-checked", b === ch));
      }
      sc.change && sc.change(path, ch); return true;
    }
    const s = e.target.closest("[data-scale]");
    if (s) {
      const sc = scopeOf(s); if (!sc) return true; const path = s.dataset.scale;
      setP(sc.obj, path, +s.dataset.v); $$(`[data-scale="${path}"]`, s.parentElement).forEach((b) => b.setAttribute("aria-checked", b === s));
      sc.change && sc.change(path, s); return true;
    }
    const st = e.target.closest("[data-step]");
    if (st) {
      const sc = scopeOf(st); if (!sc) return true; const path = st.dataset.step;
      const v = clamp(Math.round(((+getP(sc.obj, path) || 0) + +st.dataset.d) * 10) / 10, +st.dataset.min, +st.dataset.max);
      setP(sc.obj, path, v); const o = st.parentElement.querySelector("output"); if (o) o.textContent = v;
      sc.change && sc.change(path, st); return true;
    }
    return false;
  }
  // keyboard arrows for radiogroups
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if ($("#dlg")) return closeDialog(); if (flow && !flow.def.noClose) return closeFlow(); }
    const r = e.target.closest && e.target.closest('[role="radio"]'); if (!r) return;
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const g = $$('[role="radio"]', r.parentElement); const i = g.indexOf(r); const n = g[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : g.length - 1)) % g.length];
    e.preventDefault(); n.focus(); n.click();
  });

  /* ---------------- flows ---------------- */
  let flow = null, lastFocus = null;
  function openFlow(def) {
    if (flow) closeFlow(true);
    lastFocus = document.activeElement; flow = { def, i: 0, state: def.state || {}, timers: [] };
    const first = def.steps.findIndex((s) => !s.skip || !s.skip(flow.state)); flow.i = Math.max(0, first);
    renderFlow();
  }
  function visibleSteps() { return flow.def.steps.filter((s) => !s.skip || !s.skip(flow.state)); }
  function clearTimers() { if (!flow) return; flow.timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); flow.timers = []; }
  function renderFlow(keepScroll) {
    let root = $("#flow"); const sc = keepScroll && root ? $(".flow-body", root).scrollTop : 0;
    if (!root) { root = document.createElement("div"); root.id = "flow"; document.body.appendChild(root); document.body.style.overflow = "hidden"; $(".app").setAttribute("aria-hidden", "true"); }
    const { def, state } = flow; const step = def.steps[flow.i]; const vis = visibleSteps(); const idx = vis.indexOf(step);
    root.className = "flow " + (step.theme || def.theme || "");
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", def.title);
    scopes.flow = { obj: state, change: (p) => { const l = $("[data-live]", root); if (step.live && l && (!step.liveOn || step.liveOn.includes(p))) l.innerHTML = step.live(state); if (step.onChange) step.onChange(state, p); } };
    const nextLabel = typeof step.next === "function" ? step.next(state) : step.next || "Continue";
    root.innerHTML = `<div class="flow-top">${def.noClose ? "<span></span>" : `<button class="x" data-act="flow-close" aria-label="Close">${ic.x}</button>`}<div class="prog" role="progressbar" aria-valuemin="1" aria-valuemax="${vis.length}" aria-valuenow="${idx + 1}" aria-label="Step ${idx + 1} of ${vis.length}"><span style="width:${((idx + 1) / vis.length) * 100}%"></span></div><span></span></div>
      <div class="flow-body" data-scope="flow">${step.full ? step.html(state) : `<div class="flow-inner ${keepScroll ? "" : "step-in"}">${step.html(state)}<div class="err" id="flowerr" role="alert"></div></div>`}</div>
      ${step.hideFoot ? "" : `<div class="flow-foot">${idx > 0 && !step.noBack ? `<button class="link" data-act="flow-back">Back</button>` : "<span></span>"}<button class="btn" data-act="flow-next">${nextLabel}</button></div>`}`;
    const body = $(".flow-body", root); body.scrollTop = sc;
    if (step.onEnter && !keepScroll) step.onEnter(state, root);
    if (!keepScroll) { const h = $("h2", root); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
  }
  function flowNext() {
    const step = flow.def.steps[flow.i];
    const err = step.valid ? step.valid(flow.state) : null;
    if (err) { const e = $("#flowerr"); if (e) e.textContent = err; return; }
    clearTimers();
    if (step.onLeave) step.onLeave(flow.state);
    let j = flow.i + 1; while (j < flow.def.steps.length && flow.def.steps[j].skip && flow.def.steps[j].skip(flow.state)) j++;
    if (j >= flow.def.steps.length) { const f = flow; closeFlow(true); f.def.onDone && f.def.onDone(f.state); render(); return; }
    flow.i = j; renderFlow();
  }
  function flowBack() { clearTimers(); let j = flow.i - 1; while (j >= 0 && flow.def.steps[j].skip && flow.def.steps[j].skip(flow.state)) j--; if (j >= 0) { flow.i = j; renderFlow(); } }
  function closeFlow(silent) {
    clearTimers(); const r = $("#flow"); if (r) r.remove(); document.body.style.overflow = ""; const a = $(".app"); a && a.removeAttribute("aria-hidden");
    const f = flow; flow = null;
    if (!silent) { f && f.def.onClose && f.def.onClose(f.state); render(); }
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  /* ---------------- exercises ---------------- */
  const LIST_KIND = { 10: "relax", 17: "ifthen", 19: "rewards" };
  function exInit(n, ex) {
    const d = DAYS[n - 1]; const x = clone(ex);
    if (d && d.exercise.type === "beliefs") { x.b = x.b || {}; C.BELIEFS.forEach((b) => { if (x.b[b.id] == null) x.b[b.id] = lastBelief(b.id) != null ? lastBelief(b.id) : 50; }); }
    if (d && d.exercise.type === "sliders") { x.s = x.s || {}; d.exercise.items.forEach((it) => { if (x.s[it.id] == null) x.s[it.id] = 50; }); }
    if (d && d.exercise.type === "list" && !Array.isArray(x.rows)) { x.rows = (listsFor(LIST_KIND[n]) || []).map((r) => ({ ...r })); while (x.rows.length < (d.exercise.min || 1)) x.rows.push({}); }
    return x;
  }
  function exHTML(n, x, pre, opt = {}) {
    const d = DAYS[n - 1]; const ex = d.exercise; let h = `<h3>${ex.title}</h3><p class="small">${ex.intro}</p>`;
    if (ex.type === "beliefs") {
      if (opt.readonly) h += C.BELIEFS.map((b) => `<div class="slider"><div class="top"><b>${b.statement}</b><output class="num">${x.b && x.b[b.id] != null ? x.b[b.id] : "–"}</output></div></div>`).join("") + `<p class="small" style="margin-top:12px">Re-rate any belief in the <a href="#beliefs">belief library</a>.</p>`;
      else h += C.BELIEFS.map((b) => slider(`${pre}b.${b.id}`, x.b && x.b[b.id], b.statement, ex.compare ? firstBelief(b.id) : null)).join("") + (ex.compare ? `<p class="small" style="margin-top:12px"><span style="display:inline-block;width:2px;height:12px;background:var(--clay);vertical-align:middle;margin-right:8px"></span>Your day-one rating</p>` : "");
    }
    if (ex.type === "prompts" || ex.type === "review" || ex.type === "timer") {
      if (ex.type === "review") h = `<h3>${ex.title}</h3><div class="summary-prose">${weekSummaryHTML(ex.week)}</div><p class="small">${ex.intro}</p>`;
      if (ex.type === "timer") h += `<div class="field" data-timerbox><div class="breath" style="width:180px;margin:10px auto 24px" aria-hidden="true"><div class="ring"></div><div class="count" data-timer>${ex.seconds}</div></div><div class="row" style="justify-content:center"><button class="btn ghost" data-act="timer" data-sec="${ex.seconds}">Start the minute</button></div></div>`;
      if (ex.showMoney) { const g = gains(); h += `<p class="note">Estimated so far: <b class="num">${money(g.saved)}</b> not spent, and about <b class="num">${Math.max(0, Math.round(g.std))}</b> standard drinks not had, based on the numbers you gave at the start and what you’ve logged.</p>`; }
      h += ex.prompts.map((p) => ta(`${pre}a.${p.id}`, x.a && x.a[p.id], p.q, p.ph)).join("");
    }
    if (ex.type === "sliders") h += ex.items.map((it) => slider(`${pre}s.${it.id}`, x.s && x.s[it.id], it.label, null, [ex.left, ex.right])).join("");
    if (ex.type === "chips") {
      h += ex.multi ? chips(`${pre}c`, ex.options.map((o) => [o, o]), x.c, true) : opts(`${pre}c`, ex.options.map((o) => [o, o]), x.c);
      if (ex.followup) h += ta(`${pre}f`, x.f, ex.followup.q, ex.followup.ph);
    }
    if (ex.type === "list") {
      const rows = x.rows || [];
      h += `<div>${rows.map((r, i) => `<div class="listrow"><div class="cells">${ex.fields.map((f) => `<label class="lr"><span>${esc(f.label)}</span><input type="text" placeholder="${esc(f.ph)}" data-k="${pre}rows.${i}.${f.id}" value="${esc(r[f.id] || "")}"></label>`).join("")}</div><button class="x" data-act="list-rm" data-path="${pre}rows" data-i="${i}" aria-label="Remove row ${i + 1}">×</button></div>`).join("")}</div>
        <button class="link" data-act="list-add" data-path="${pre}rows">+ Add another</button>`;
      if (ex.examples && ex.examples.length) h += `<div class="examples"><span class="label">Ideas to borrow</span><div class="chips">${ex.examples.map((e) => `<button class="chip" data-act="list-ex" data-path="${pre}rows" data-f="${ex.fields[0].id}" data-v="${esc(e)}">${esc(e)}</button>`).join("")}</div></div>`;
    }
    if (ex.type === "final") h = finalHTML(x, pre);
    return h;
  }
  function exSide(n, x, fromFlow) {
    const d = DAYS[n - 1]; if (!d) return;
    if (d.exercise.type === "beliefs" && fromFlow) C.BELIEFS.forEach((b) => { const v = x.b && x.b[b.id]; if (v != null) (S.d.beliefs[b.id] = S.d.beliefs[b.id] || []).push({ ts: Date.now(), date: today(), day: n, v }); });
    if (LIST_KIND[n]) S.d.lists[LIST_KIND[n]] = (x.rows || []).filter((r) => r && Object.values(r).some((v) => String(v || "").trim()));
  }
  function exValid(n, x) {
    const ex = DAYS[n - 1].exercise;
    if (ex.type === "final" && !x.next) return "Choose what you’d like to do next. You can change it later.";
    return null;
  }

  /* ---------------- summaries & analysis ---------------- */
  function cravingsIn(dates) { const set = new Set(dates); return S.d.cravings.filter((c) => set.has(c.date)); }
  function mostCommon(arr) { const m = {}; arr.forEach((v) => v && (m[v] = (m[v] || 0) + 1)); const e = Object.entries(m).sort((a, b) => b[1] - a[1]); return e.length ? e[0] : null; }
  function weekStats(k) {
    const s = (k - 1) * 7 + 1, e = k === 5 ? 30 : k * 7;
    const dates = []; for (let i = s; i <= e; i++) if (i <= curDay()) dates.push(dateOf(i));
    const st = dates.map((d) => S.d.status[d]);
    const cr = cravingsIn(dates);
    const moodOf = (ds) => avg(ds.map((d) => S.d.checkins[d] && S.d.checkins[d].mood).filter((v) => v != null));
    const prevDates = []; for (let i = s - 7; i < s; i++) if (i >= 1) prevDates.push(dateOf(i));
    return {
      s, e, dates, len: dates.length, af: st.filter((x) => x === "af").length, drank: st.filter((x) => x === "drank").length,
      cr, avgB: avg(cr.map((c) => c.before)), avgA: avg(cr.filter((c) => c.after != null).map((c) => c.after)), passed: cr.filter((c) => c.outcome === "passed" || c.outcome === "quieter").length,
      mood: moodOf(dates), prevMood: moodOf(prevDates), sleep: avg(dates.map((d) => S.d.checkins[d] && S.d.checkins[d].sleep).filter((v) => v != null)),
      trig: mostCommon(cr.map((c) => c.trigger)), need: mostCommon(cr.map((c) => c.need)),
      disc: S.d.journal.filter((j) => j.type === "discovery" && dates.includes(j.date)).slice(-1)[0],
    };
  }
  function weekSummaryHTML(k) {
    if (!P().startDate) return "";
    const w = weekStats(k); const ps = [];
    const logged = w.af + w.drank;
    if (!logged) ps.push(`You didn’t log many days in this stretch, which is fine. Summaries get richer the more you record, and you can log past days from the Days screen.`);
    else ps.push(`Across days ${w.s} to ${Math.min(w.e, curDay())}, you logged ${logged} of ${plural(w.len, "day")}: ${w.af} alcohol-free${w.drank ? ` and ${w.drank} with a drink` : ""}.${w.drank ? " Those days are part of the data, not a mark against you." : ""}`);
    if (w.cr.length) {
      let t = `You recorded ${plural(w.cr.length, "craving")}.`;
      if (w.avgA != null) t += ` On average they started at ${r1(w.avgB)} out of 10 and settled to ${r1(w.avgA)}.`;
      if (w.passed) t += ` ${w.passed} passed or quietened without a drink.`;
      if (w.trig) t += ` The most common trigger was ${labelOf(C.TRIGGERS, w.trig[0]).toLowerCase()}.`;
      ps.push(t);
    } else ps.push("No cravings were logged in this stretch. Either they were quiet, or they slipped past unrecorded. Both are worth knowing.");
    if (w.mood != null) ps.push(`Your average morning mood was ${r1(w.mood)} out of 5${w.prevMood != null ? `, compared with ${r1(w.prevMood)} the week before` : ""}${w.sleep != null ? `, and sleep averaged ${r1(w.sleep)}` : ""}.`);
    const shift = C.BELIEFS.map((b) => ({ b, d: (lastBelief(b.id) ?? 0) - (firstBelief(b.id) ?? 0), has: (S.d.beliefs[b.id] || []).length > 1 })).filter((x) => x.has).sort((a, b) => a.d - b.d)[0];
    if (shift && shift.d < 0) ps.push(`The belief that has moved most so far: “${shift.b.statement}”, down ${Math.abs(shift.d)} points since you first rated it.`);
    let h = ps.map((p) => `<p>${p}</p>`).join("");
    if (w.disc) h += `<p class="pull" style="font-size:21px">“${esc(w.disc.text)}”<br><span class="small" style="font-style:normal">A discovery you wrote on ${fmtShort(w.disc.date)}</span></p>`;
    return h;
  }
  function patterns() {
    const out = []; const dates = expDates();
    const after = { af: { sleep: [], mood: [] }, drank: { sleep: [], mood: [] } };
    dates.forEach((d) => { const prev = S.d.status[addDays(d, -1)]; const c = S.d.checkins[d]; if (!prev || !c) return; if (c.sleep != null) after[prev].sleep.push(c.sleep); if (c.mood != null) after[prev].mood.push(c.mood); });
    if (after.af.sleep.length >= 3 && after.drank.sleep.length >= 3) out.push({ t: `After alcohol-free days, you rated your sleep ${r1(avg(after.af.sleep))} on average. After days with a drink, ${r1(avg(after.drank.sleep))}.`, n: `Based on ${after.af.sleep.length} and ${after.drank.sleep.length} mornings.` });
    if (after.af.mood.length >= 3 && after.drank.mood.length >= 3) out.push({ t: `Your morning mood averaged ${r1(avg(after.af.mood))} after alcohol-free days and ${r1(avg(after.drank.mood))} after days with a drink.`, n: `Based on ${after.af.mood.length} and ${after.drank.mood.length} mornings.` });
    const cr = S.d.cravings.filter((c) => c.after != null);
    if (cr.length >= 6) { const h = Math.floor(cr.length / 2); const a = cr.slice(0, h), b = cr.slice(h); out.push({ t: `Your first ${a.length} cravings eased by ${r1(avg(a.map((c) => c.before - c.after)))} points on average. Your most recent ${b.length} eased by ${r1(avg(b.map((c) => c.before - c.after)))}.`, n: "Measured from the start to the end of each craving check-in." }); }
    if (S.d.cravings.length >= 4) { const bk = mostCommon(S.d.cravings.map((c) => bucket(new Date(c.ts).getHours()))); if (bk) out.push({ t: `Most of your cravings have shown up ${bk[0]}.`, n: `${bk[1]} of ${S.d.cravings.length} cravings.` }); }
    const conf = dates.map((d) => S.d.checkins[d] && S.d.checkins[d].conf).filter((v) => v != null);
    if (conf.length >= 8) { const a = conf.slice(0, 4), b = conf.slice(-4); out.push({ t: `Your evening confidence averaged ${r1(avg(a))} in your first four check-ins and ${r1(avg(b))} in your latest four.`, n: "Out of 5." }); }
    const md = dates.filter((d, i) => S.d.status[d]); const withM = md.filter((d) => mDone(diff(P().startDate, d) + 1)), noM = md.filter((d) => !mDone(diff(P().startDate, d) + 1));
    if (withM.length >= 3 && noM.length >= 3) { const af = (ds) => ds.filter((d) => S.d.status[d] === "af").length / ds.length; out.push({ t: `On days you opened the morning session, ${Math.round(af(withM) * 100)}% were alcohol-free. On days you didn’t, ${Math.round(af(noM) * 100)}%.`, n: `${withM.length} and ${noM.length} days.` }); }
    return out;
  }
  const bucket = (h) => (h < 6 ? "late at night" : h < 12 ? "in the morning" : h < 15 ? "in the early afternoon" : h < 17 ? "mid-afternoon" : h < 20 ? "between 5 and 8pm" : "later in the evening");
  function milestones() {
    const m = []; const add = (id, label, ts) => m.push({ id, label, ts: ts || null });
    add("start", "Set up your experiment", P().onboardedAt);
    const firstM = Object.values(S.d.days).map((d) => d.morning && d.morning.ts).filter(Boolean).sort()[0]; add("m1", "Opened your first morning", firstM);
    add("c1", "Logged your first craving", S.d.cravings[0] && S.d.cravings[0].ts);
    const cp = S.d.cravings.find((c) => c.outcome === "passed" || c.outcome === "quieter"); add("cp", "Watched a craving pass", cp && cp.ts);
    const afDates = expDates().filter((d) => S.d.status[d] === "af");
    const wk = afDates.find((d) => parse(d).getDay() === 5 && S.d.status[addDays(d, 1)] === "af"); add("wknd", "An alcohol-free weekend", wk && parse(addDays(wk, 1)).getTime());
    add("af10", "Ten alcohol-free days", afDates[9] && parse(afDates[9]).getTime());
    add("w1", "Completed week one", S.d.days[7] && S.d.days[7].morning && S.d.days[7].morning.ts);
    add("half", "Reached halfway", S.d.days[15] && S.d.days[15].morning && S.d.days[15].morning.ts);
    let bs = null; C.BELIEFS.forEach((b) => { const h = S.d.beliefs[b.id] || []; const e = h.find((x) => h[0] && h[0].v - x.v >= 20); if (e && (!bs || e.ts < bs)) bs = e.ts; }); add("belief", "A belief moved 20 points", bs);
    add("letter", "Wrote to your future self", S.d.future.letter && S.d.future.letter.ts);
    add("reasons", "Collected five reasons", S.d.future.reasons[4] && S.d.future.reasons[4].ts);
    add("d30", "Closed the experiment", S.d.next.finalAt);
    return m;
  }

  /* photography: one image per phase, generated for Clearing */

  /* ---------------- views ---------------- */
  const VIEWS = {};
  function mast(n, sub, title, cta = "") {
    const dt = today(); const max = n > 30 ? maxDay() : 30;
    const big = n >= 1 ? `${pad2(n)}<span class="grey">/${max}</span>` : `${fmt(dt, { day: "numeric" })}<span class="grey">${fmt(dt, { month: "short" })}</span>`;
    return `<section class="daycard"><div class="orb" aria-hidden="true"></div>
      <div class="panel"><p class="big" ${n >= 1 ? `aria-label="Day ${n} of ${max}"` : ""}>${big}</p><p class="meta">${fmt(dt, { weekday: "long", day: "numeric", month: "long" })}<br>${esc(sub)}${title ? `<br><b style="font-weight:500;color:var(--ink)">${esc(title)}</b>` : ""}</p><p class="mark">Clearing</p></div>
      <div class="side"><div class="top"><button data-act="go" data-to="you">${ic.user}<span>You</span></button></div><h1 class="greet">${greet()}</h1><div class="cta">${cta}</div></div></section>`;
  }
  function gardenCard(n) { const up = Math.min(Math.max(n, 0), 30); return `<section class="gardencard"><span class="label">Your garden · ${up} of 30 planted</span>${garden({ upto: up, st: dayStatuses(), label: gardenLabel(up) })}</section>`; }
  function photoCard(n) {
    const d = today(); const has = S.d.photos && S.d.photos[d]; const count = photoDates().length;
    if (has) return `<section class="section photocard"><div class="pc-row"><img class="thumb" data-photo="${d}" alt="Your photo for today"><div><span class="label" style="margin-bottom:4px">Today’s photo</span><p class="small" style="margin:0 0 6px">Saved for day ${n}. ${count > 1 ? `You have ${count} photos so far.` : "Add one tomorrow to start comparing."}</p><div class="row" style="gap:14px"><a class="link" href="#photos">${count > 1 ? "Compare" : "Your photos"}</a><label class="link quiet" style="cursor:pointer">Replace${photoInput(d)}</label></div></div></div></section>`;
    return `<section class="section photocard"><span class="label">Today’s photo</span><p class="small" style="margin-bottom:16px">One photo a day, same spot, same light. In a few weeks you’ll see the difference for yourself.</p><div class="row"><label class="btn" style="cursor:pointer">Add today’s photo${photoInput(d)}</label>${count ? `<a class="link quiet" href="#photos">See all</a>` : ""}</div></section>`;
  }
  const promo = () => `<button class="promo" data-act="crave"><b>Having a craving?</b><span>Let’s ride it out together</span><em>Start ${ic.arrow.replace("<svg", '<svg width="18" height="18"')}</em></button>`;
  const toolsRow = () => `<div class="tools"><button data-act="drink">${ic.glass}Log a drink</button><button data-act="entry">${ic.pen}Write</button><button data-act="go" data-to="resources">${ic.user}Support</button></div>`;

  VIEWS.today = () => {
    const p = P();
    if (!p.startDate) return vNotStarted();
    const n = curDay();
    if (n < 1) return vPreStart();
    if (n > maxDay()) return vComplete(n);
    if (n > 30) return vPractice(n);
    const d = DAYS[n - 1]; const dd = dayData(n); const pn = personal(d);
    const cta = !mDone(n) ? `<button class="btn" data-act="morning" data-n="${n}">Open day</button>` : `<span class="done">${ic.check} Morning done</span>`;
    let h = mast(n, `Day ${n} of 30 · ${d.phase}`, "", cta) + promo() + photoCard(n) + gardenCard(n);
    if (!mDone(n)) {
      h += `<section class="section"><span class="label">Today’s lesson</span><h2>${d.title}</h2><p class="lede" style="margin-bottom:6px">${esc(d.kicker)}</p><p class="small" style="margin:0">Check-in, intention, a short lesson and today’s experiment. About eight minutes.</p></section>`;
    } else {
      h += `<section class="section"><span class="label">Today’s intention</span><p class="intention">${esc(dd.morning.intention || d.intentions[0])}</p></section>
        <section class="section"><span class="label">Today’s experiment</span><h3>${d.experiment.title}</h3><p>${d.experiment.body}</p><div class="row"><a class="link" href="#day-${n}">Revisit today’s lesson</a></div></section>`;
    }
    h += `<section class="section" style="padding-bottom:18px"><span class="label">Through the day</span><p class="note">${d.tip}</p>${pn && mDone(n) ? `<p class="note clay" style="margin-top:12px">${esc(pn)}</p>` : ""}</section>${toolsRow()}`;
    if (!eDone(n)) {
      const early = new Date().getHours() < 17;
      h += `<section class="section"><span class="label">Evening</span><h3>Reflect on today</h3><p class="small">Mood, energy, what you noticed and one discovery. About four minutes${early ? ". Best after 5pm, but whenever suits" : ""}.</p><button class="btn ghost" data-act="evening" data-n="${n}">Begin evening reflection</button></section>`;
    } else {
      const ev = dd.evening; const disc = S.d.journal.filter((j) => j.type === "discovery" && j.date === today()).slice(-1)[0];
      h += `<section class="section"><span class="label">Evening</span><p class="done-mark">${ic.check} Reflection saved${ev.alcohol === "drank" ? " · drink logged, nothing resets" : ev.alcohol === "af" ? " · alcohol-free" : ""}</p>${disc ? `<p class="intention" style="font-size:20px;margin-top:10px">“${esc(disc.text)}”</p>` : ""}<div class="row"><button class="link quiet" data-act="evening" data-n="${n}">Edit reflection</button></div></section>`;
    }
    if (n < 30) { const t = DAYS[n]; h += `<section class="section"><span class="label">Tomorrow</span><div class="preview"><span class="n" aria-hidden="true">${n + 1}</span><div><h3>${t.title}</h3><p class="small" style="margin:0">${t.kicker}</p></div></div></section>`; }
    else if (S.d.next.finalAt) h += `<section class="section"><span class="label">What’s next</span><p>You’ve closed the experiment. Choose how to carry it forward.</p><a class="btn" href="#next">See your options</a></section>`;
    const waiting = []; for (let i = 1; i < n; i++) if (!mDone(i)) waiting.push(i);
    if (waiting.length) h += `<section class="section"><span class="label">Earlier days</span><p class="small">${waiting.length === 1 ? `Day ${waiting[0]} hasn’t been opened yet.` : `${waiting.length} earlier days haven’t been opened yet.`} Catch up whenever suits, or don’t. Nothing is lost and nothing resets.</p><a class="link" href="#day-${waiting[0]}">Open day ${waiting[0]}</a></section>`;
    const y = addDays(today(), -1);
    if (n > 1 && !S.d.status[y]) h += `<section class="section"><span class="label">Yesterday</span><p class="small">Yesterday isn’t logged yet. Was it alcohol-free?</p><div class="row"><button class="chip" data-act="mark" data-date="${y}" data-v="af">Alcohol-free</button><button class="chip" data-act="drink" data-date="${y}">I had a drink</button></div></section>`;
    return h;
  };
  function vNotStarted() {
    return `${mast(0, "Ready when you are", "")}<section class="section"><h2>Your experiment is saved and waiting.</h2><p>You chose to speak with a doctor or support line first. That’s a sound decision. When you have a plan, set your start date and Day 1 will be here.</p><div class="row"><button class="btn" data-act="setstart">Set a start date</button><a class="link" href="#resources">Support and resources</a></div></section>
    <section class="section"><span class="label">While you wait</span><p>You can explore the <a href="#beliefs">belief library</a>, write to your <a href="#future">future self</a>, or start a <a href="#journal">journal</a>. None of it requires changing anything yet.</p></section>`;
  }
  function vPreStart() {
    const s = P().startDate; const days = diff(today(), s);
    return `${mast(0, days === 1 ? "Your experiment begins tomorrow" : `Begins ${fmtLong(s)}`, "")}<section class="section"><h2>${days === 1 ? "Tomorrow, Day 1." : `${days} days to go.`}</h2><p>A few things worth doing before you start, if you like.</p></section>
    <div class="daylist"><a class="dayrow" href="#future"><span class="n">a</span><span><span class="t">Write to your future self</span><br><span class="s">Sealed until day 30</span></span>${ic.arrow.replace("<svg", '<svg width="20" height="20"')}</a>
    <a class="dayrow" href="#beliefs"><span class="n">b</span><span><span class="t">Read the belief library</span><br><span class="s">Eight common ideas about drinking</span></span>${ic.arrow.replace("<svg", '<svg width="20" height="20"')}</a>
    <a class="dayrow" href="#you"><span class="n">c</span><span><span class="t">Set your reminders</span><br><span class="s">Add morning and evening check-ins to your calendar</span></span>${ic.arrow.replace("<svg", '<svg width="20" height="20"')}</a></div>
    <section class="section"><button class="link quiet" data-act="setstart">Change start date</button></section>`;
  }
  function vPractice(n) {
    const dd = dayData(n); const prompt = C.PRACTICE[(n - 31) % C.PRACTICE.length]; const rv = ((n - 31) % 30) + 1; const rd = DAYS[rv - 1];
    let h = mast(n, `Extended to day ${maxDay()}`, "Practice", !mDone(n) ? `<button class="btn" data-act="pmorning" data-n="${n}">Begin</button>` : "") + promo() + gardenCard(30);
    h += !mDone(n) ? `<section class="cta-block"><p class="lede" style="margin:0">No new lesson today. A check-in, an intention and one question to sit with.</p><button class="btn" data-act="pmorning" data-n="${n}">Begin the morning</button></section>`
      : `<section class="section"><span class="label">Today’s intention</span><p class="intention">${esc(dd.morning.intention || "Notice.")}</p><p class="small" style="margin-top:12px">${esc(prompt)}</p></section>`;
    h += toolsRow();
    h += `<section class="section"><span class="label">Revisit</span><h3>Day ${rv}: ${rd.title}</h3><p class="small">${rd.kicker}</p><a class="link" href="#day-${rv}">Read it again</a></section>`;
    h += !eDone(n) ? `<section class="section"><span class="label">Evening</span><button class="btn ghost" data-act="evening" data-n="${n}">Begin evening reflection</button></section>` : `<section class="section"><p class="done-mark">${ic.check} Evening reflection saved</p></section>`;
    h += goalsHTML();
    return h;
  }
  function vComplete() {
    return `${mast(30, "Experiment complete", "", `<a class="btn" href="#next">What’s next</a>`)}${gardenCard(30)}<section class="section"><h2>Thirty days, recorded.</h2><p>Your data, journal and insights are all still here. You can extend the experiment, keep journaling, or simply check in when it helps.</p><div class="row"><a class="btn" href="#next">What’s next</a><a class="link" href="#report">Your report</a></div></section>${toolsRow()}${goalsHTML()}`;
  }
  function goalsHTML() {
    const g = S.d.next.goals;
    return `<section class="section"><span class="label">Your goals</span>${g.length ? `<ul class="miles">${g.map((x) => `<li class="${x.done ? "" : "no"}"><i></i><span>${esc(x.text)}</span><span><button class="link quiet" data-act="goal-toggle" data-id="${x.id}">${x.done ? "Undo" : "Done"}</button></span></li>`).join("")}</ul>` : `<p class="small">No goals yet.</p>`}<div class="row" style="margin-top:10px"><a class="link" href="#next">Add or edit goals</a></div></section>`;
  }

  VIEWS.days = () => {
    if (!P().startDate) return `<div class="page-head"><h1>The thirty days</h1><p>Your days open once you set a start date.</p></div>${daysList(0)}`;
    const n = curDay();
    return `<div class="page-head"><h1>The thirty days</h1><p>${n > 30 ? "All thirty days are open to revisit." : `You’re on day ${Math.max(n, 0)}. Earlier days stay open; nothing is lost if you miss one.`}</p></div>${daysList(n)}<section class="section"><p class="small">${S.d.settings.readAhead ? "Read ahead is on." : "Prefer to read ahead?"} <button class="link" data-act="readahead">${S.d.settings.readAhead ? "Turn off" : "Turn on read ahead"}</button></p></section>`;
  };
  function daysList(n) {
    let h = ""; const wk = [[1, 7, "Curiosity and awareness"], [8, 14, "Understanding"], [15, 21, "Challenging and confidence"], [22, 30, "Change and autonomy"]];
    wk.forEach(([a, b, t], k) => {
      h += `<div class="weekhead"><h3>Week ${k + 1}</h3><span class="small">${t}</span></div><div class="daylist">`;
      for (let i = a; i <= b; i++) {
        const d = DAYS[i - 1]; const open = P().startDate && unlocked(i); const st = P().startDate ? S.d.status[dateOf(i)] : null;
        const sub = !P().startDate ? d.kicker : !open ? `Opens ${fmtShort(dateOf(i))}` : `${fmtShort(dateOf(i))}${st === "af" ? " · alcohol-free" : st === "drank" ? " · had a drink" : ""}`;
        const inner = `<span class="n">${i}</span><span><span class="t">${d.title}</span><br><span class="s">${sub}</span></span><span class="st" aria-label="${mDone(i) ? "Morning done" : "Morning not done"}, ${eDone(i) ? "evening done" : "evening not done"}"><i class="dot ${mDone(i) ? "on" : ""}"></i><i class="dot ${eDone(i) ? "on" : ""}"></i></span>`;
        h += open ? `<a class="dayrow ${i === n ? "current" : ""}" href="#day-${i}" ${i === n ? 'aria-current="date"' : ""}>${inner}</a>` : `<div class="dayrow locked">${inner}</div>`;
      }
      h += `</div>`;
    });
    return h;
  }

  function vDay(n) {
    const d = DAYS[n - 1]; if (!d) return VIEWS.days();
    if (!P().startDate || !unlocked(n)) return `<div class="page-head"><a class="link quiet" href="#days">← All days</a><p class="kicker" style="margin-top:10px">Day ${n}</p><h1>${d.title}</h1><p>${P().startDate ? `This day opens on ${fmtLong(dateOf(n))}.` : "This day opens once your experiment starts."}</p></div>`;
    const dd = dayData(n); const x = exInit(n, dd.exercise); dd.exercise = x;
    const date = dateOf(n); const past = date < today(); const st = S.d.status[date]; const pn = personal(d);
    let h = `<div class="page-head"><a class="link quiet" href="#days">← All days</a><p class="daynum" aria-hidden="true">${pad2(n)}<span class="grey">/30</span></p><p class="kicker">Day ${n} · ${d.phase} · ${fmtShort(date)}</p><h1>${d.title}</h1><p class="lede">${d.kicker}</p>
      ${!mDone(n) && n <= Math.min(curDay(), 30) ? `<button class="btn" data-act="morning" data-n="${n}" style="margin-top:8px">Open the morning session</button>` : ""}</div>`;
    h += `<section class="section white lesson">${d.lesson.map((p) => `<p>${p}</p>`).join("")}<p class="pull">${d.pull}</p>${pn ? `<p class="note clay">${esc(pn)}</p>` : ""}<div style="margin-top:16px">${evidenceTag(d.evidence)}${refsBlock(d.refs)}</div></section>`;
    h += `<section class="section" ${scope("ex" + n, x, () => { exSide(n, x, false); S.soon(); })}>${exHTML(n, x, "", { readonly: d.exercise.type === "beliefs" && mDone(n) })}</section>`;
    h += `<section class="section"><span class="label">The experiment</span><h3>${d.experiment.title}</h3><p>${d.experiment.body}</p></section>`;
    const ev = dd.evening;
    h += `<section class="section"><span class="label">Evening reflection</span>${d.evening.map((q, i) => `<p class="q" style="margin-top:12px">${q}</p>${ev && ev.answers && ev.answers[i] ? `<p class="serif" style="font-size:18px">${esc(ev.answers[i])}</p>` : ""}`).join("")}
      ${n <= curDay() ? `<button class="btn ghost" data-act="evening" data-n="${n}" style="margin-top:12px">${eDone(n) ? "Edit reflection" : "Reflect on this day"}</button>` : ""}</section>`;
    if (past && !st) h += `<section class="section"><span class="label">This day isn’t logged</span><div class="row"><button class="chip" data-act="mark" data-date="${date}" data-v="af">It was alcohol-free</button><button class="chip" data-act="drink" data-date="${date}">I had a drink</button></div></section>`;
    if (st && date <= today()) h += `<section class="section"><p class="small">Logged as ${st === "af" ? "alcohol-free" : "a day with a drink"}. <button class="link quiet" data-act="unmark" data-date="${date}">Change</button></p></section>`;
    return h;
  }

  VIEWS.beliefs = () => {
    let h = `<div class="page-head"><h1>The belief library</h1><p>Eight ideas about drinking that most of us absorbed without choosing. Explore them, answer the questions, and re-rate how true each feels whenever you like.</p></div>`;
    C.BELIEFS.forEach((b) => {
      const l = lastBelief(b.id), f = firstBelief(b.id), cnt = (S.d.beliefs[b.id] || []).length;
      h += `<a class="belief" href="#belief-${b.id}"><q>${b.statement}</q><span class="small">${b.short}</span>${l != null ? `<div class="meter" aria-hidden="true"><b style="width:${l}%"></b>${cnt > 1 ? `<i style="left:${f}%"></i>` : ""}</div><div class="meter-l"><span>${cnt > 1 ? `First: ${f}` : "Rated once"}</span><span>Now: ${l}</span></div>` : `<div class="meter-l"><span>Not rated yet</span></div>`}</a>`;
    });
    return h;
  };
  function vBelief(id) {
    const b = C.BELIEFS.find((x) => x.id === id); if (!b) return VIEWS.beliefs();
    const hist = S.d.beliefs[id] || []; const notes = (S.d.beliefNotes[id] = S.d.beliefNotes[id] || {});
    const tmp = { v: lastBelief(id) != null ? lastBelief(id) : 50 }; scopes["bel"] = { obj: tmp };
    let h = `<div class="page-head"><a class="link quiet" href="#beliefs">← All beliefs</a><h1 style="margin-top:14px">“${b.statement.replace(/\.$/, "")}.”</h1><p class="lede">${b.short}</p></div>`;
    h += `<section class="section lesson">${b.body.map((p) => `<p>${p}</p>`).join("")}${refsBlock(b.refs)}</section>`;
    h += `<section class="section" ${scope("bn" + id, notes, () => S.soon())}><span class="label">Questions to sit with</span>${b.questions.map((q, i) => ta(String(i), notes[i], q)).join("")}<p class="small">Your answers save as you type and appear in your journal.</p></section>`;
    h += `<section class="section"><span class="label">Try this</span><p>${b.test}</p></section>`;
    h += `<section class="section" data-scope="bel"><span class="label">How true does this feel now?</span>${slider("v", tmp.v, b.statement, firstBelief(id))}<div class="row" style="margin-top:14px"><button class="btn" data-act="belief-save" data-id="${id}">Save rating</button></div>
      ${hist.length ? `<div style="margin-top:22px"><span class="label">Your ratings over time</span><div class="fig" style="min-height:160px" data-chart="belief" data-id="${id}"></div><p class="small">${hist.map((x) => `${x.day ? "Day " + x.day : fmtShort(x.date)}: ${x.v}`).join(" · ")}</p></div>` : ""}</section>`;
    return h;
  }

  /* Journal */
  let jState = { q: "", f: "all" };
  function timeline() {
    const items = [];
    S.d.journal.forEach((j) => items.push({ kind: j.type, id: j.id, date: j.date, ts: j.ts, text: j.text, mood: j.mood, kept: !!j.kept, own: true }));
    Object.entries(S.d.days).forEach(([n, d]) => {
      n = +n; const def = DAYS[n - 1]; const date = P().startDate ? dateOf(n) : null; if (!date) return;
      if (d.evening && d.evening.answers) Object.entries(d.evening.answers).forEach(([i, t]) => { if (t && String(t).trim()) { const qs = def ? def.evening : [C.PRACTICE[(n - 31 + 5) % C.PRACTICE.length], "What did you notice today?"]; const key = `e${n}.${i}`; items.push({ kind: "reflection", key, date, ts: d.evening.ts, q: qs[i], text: t, kept: !!S.d.kept[key], day: n }); } });
      if (d.exercise && def) { const a = d.exercise.a || {}; const ps = def.exercise.prompts || []; ps.forEach((p) => { if (a[p.id] && String(a[p.id]).trim()) { const key = `x${n}.${p.id}`; items.push({ kind: "reflection", key, date, ts: (d.morning && d.morning.ts) || 0, q: `Day ${n} · ${p.q}`, text: a[p.id], kept: !!S.d.kept[key], day: n }); } }); if (d.exercise.f && String(d.exercise.f).trim()) { const key = `x${n}.f`; items.push({ kind: "reflection", key, date, ts: (d.morning && d.morning.ts) || 0, q: `Day ${n} · ${def.exercise.followup.q}`, text: d.exercise.f, kept: !!S.d.kept[key], day: n }); } }
      if (d.morning && d.morning.practice) { const key = `p${n}`; items.push({ kind: "reflection", key, date, ts: d.morning.ts, q: C.PRACTICE[(n - 31) % C.PRACTICE.length], text: d.morning.practice, kept: !!S.d.kept[key] }); }
    });
    Object.entries(S.d.beliefNotes).forEach(([id, notes]) => { const b = C.BELIEFS.find((x) => x.id === id); Object.entries(notes || {}).forEach(([i, t]) => { if (t && String(t).trim()) { const key = `b${id}.${i}`; items.push({ kind: "reflection", key, date: notes._date || today(), ts: notes._ts || 0, q: `${b.statement} · ${b.questions[i]}`, text: t, kept: !!S.d.kept[key] }); } }); });
    S.d.cravings.forEach((c) => items.push({ kind: "craving", id: c.id, date: c.date, ts: c.ts, c }));
    S.d.drinks.forEach((x) => items.push({ kind: "drink", id: x.id, date: x.date, ts: x.ts, x }));
    return items.sort((a, b) => (a.date === b.date ? (b.ts || 0) - (a.ts || 0) : a.date < b.date ? 1 : -1));
  }
  VIEWS.journal = () => {
    const F = [["all", "All"], ["entry", "Entries"], ["reflection", "Reflections"], ["discovery", "Discoveries"], ["gratitude", "Gratitude"], ["craving", "Cravings"], ["kept", "Kept"]];
    return `<div class="page-head"><nav class="seg" aria-label="Journal sections"><a href="#journal" aria-current="page">Journal</a><a href="#future">Future self</a></nav><h1 style="margin-top:22px">Your journal</h1><p>Private to this device. Everything you write in Clearing gathers here.</p><div class="row" style="margin-top:14px"><button class="btn" data-act="entry">${ic.pen.replace("<svg", '<svg width="18" height="18"')} New entry</button></div></div>
      <div class="wrap searchbar" data-scope="js"><label class="sr" for="jsq">Search your journal</label><input id="jsq" type="search" placeholder="Search everything you’ve written" value="${esc(jState.q)}" data-k="q"><div class="chips" role="radiogroup" aria-label="Filter">${F.map(([id, l]) => `<button class="chip" role="radio" aria-checked="${jState.f === id}" data-chip="f" data-v="${id}">${l}</button>`).join("")}</div></div>
      <div id="tl" aria-live="polite">${tlHTML()}</div>`;
  };
  function tlHTML() {
    const q = jState.q.trim().toLowerCase(); const f = jState.f;
    const items = timeline().filter((it) => {
      if (f === "kept" && !it.kept) return false;
      if (f !== "all" && f !== "kept" && it.kind !== f) return false;
      if (q) { const hay = [it.text, it.q, it.c && [labelOf(C.TRIGGERS, it.c.trigger), it.c.note, it.c.altText].join(" "), it.x && it.x.note].join(" ").toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
    if (!items.length) return `<div class="empty"><p class="serif">${q || f !== "all" ? "Nothing matches that yet." : "Nothing here yet."}</p><p class="small">${q || f !== "all" ? "Try another word or filter." : "Your morning answers, evening reflections, cravings and entries will gather here."}</p></div>`;
    let h = "", last = "";
    items.forEach((it) => {
      if (it.date !== last) { last = it.date; const n = P().startDate ? diff(P().startDate, it.date) + 1 : 0; h += `<div class="tl-day"><h3>${fmtLong(it.date)}</h3><span class="small">${n >= 1 ? `Day ${n}` : ""}</span></div>`; }
      const keepBtn = (on, act, ref) => `<button class="iconbtn" aria-pressed="${on}" data-act="${act}" data-ref="${esc(ref)}" aria-label="${on ? "Remove from kept" : "Keep this"}">${on ? ic.starOn : ic.star}</button>`;
      if (it.own) h += `<article class="entry"><div class="k"><span>${{ entry: "Entry", discovery: "Discovery", gratitude: "Gratitude" }[it.kind]}${it.mood && it.mood.length ? " · " + it.mood.map(esc).join(", ") : ""} · ${fmtTime(it.ts)}</span><span>${keepBtn(it.kept, "keep-own", it.id)}<button class="iconbtn" data-act="entry" data-id="${it.id}" aria-label="Edit entry">${ic.pen}</button></span></div><p class="txt">${esc(it.text)}</p></article>`;
      else if (it.kind === "reflection") h += `<article class="entry"><div class="k"><span>Reflection</span>${keepBtn(it.kept, "keep-ref", it.key)}</div><p class="q">${esc(it.q)}</p><p class="txt">${esc(it.text)}</p></article>`;
      else if (it.kind === "craving") { const c = it.c; h += `<article class="entry"><div class="k"><span>Craving · ${fmtTime(c.ts)}</span><span class="num">${c.before}${c.after != null ? " → " + c.after : ""} / 10</span></div><p class="compact">${esc(labelOf(C.TRIGGERS, c.trigger) || "Unsure")}${c.need ? " · needed " + esc((C.NEEDS.find((x) => x.id === c.need) || {}).label || "").toLowerCase() : ""}${c.alt || c.altText ? " · tried: " + esc(c.altText || c.alt) : ""}${c.outcome ? " · " + { passed: "it passed", quieter: "it quietened", still: "still strong", drank: "had a drink" }[c.outcome] : ""}</p></article>`; }
      else if (it.kind === "drink") { const x = it.x; h += `<article class="entry"><div class="k"><span>Drink logged · ${fmtTime(x.ts)}</span><button class="iconbtn" data-act="drink-del" data-id="${x.id}" aria-label="Delete this drink record">${ic.trash}</button></div><p class="compact">${x.std} standard drink${x.std === 1 ? "" : "s"}${x.context && x.context.length ? " · " + x.context.map(esc).join(", ") : ""}</p>${x.note ? `<p class="txt">${esc(x.note)}</p>` : ""}${x.expect ? `<p class="q">Expected versus actual</p><p class="txt">${esc(x.expect)}</p>` : ""}</article>`; }
    });
    return h;
  }

  /* Future self */
  const FEEL = ["Calm", "Clear", "Present", "Energetic", "Free", "Connected", "Steady", "Proud", "Light", "Rested", "Playful", "Honest", "In control", "Curious"];
  VIEWS.future = () => {
    const f = S.d.future; const L = f.letter; const n = curDay(); const canOpen = L && (L.openedAt || n >= 30 || S.d.next.finalAt);
    let h = `<div class="page-head"><nav class="seg" aria-label="Journal sections"><a href="#journal">Journal</a><a href="#future" aria-current="page">Future self</a></nav><h1 style="margin-top:22px">Your future self</h1><p>Reasons, hopes and a letter to the person finishing this experiment.</p></div>`;
    h += `<section class="section"><span class="label">A letter to day 30</span>`;
    if (!L) h += `<p>Write to the version of you who will finish this. What do you hope they’ll know? What do you want them to remember about why you started? It stays sealed until day 30.</p><button class="btn" data-act="letter">Write your letter</button>`;
    else if (!canOpen) h += `<div class="envelope" aria-label="Sealed letter"><svg viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L80 56L160 0" fill="none" stroke="var(--rule)" stroke-width="1"/></svg><span class="seal">C</span></div><p class="small" style="margin-top:14px">Sealed ${fmtShort(ymd(new Date(L.ts)))}. Opens on day 30${P().startDate ? `, ${fmtLong(dateOf(30))}` : ""}.</p><button class="link quiet" data-act="letter-open">Open it early</button>`;
    else h += `<div class="letter">${esc(L.text)}</div><p class="small" style="margin-top:12px">Written ${fmtLong(ymd(new Date(L.ts)))}.</p><button class="link quiet" data-act="letter">Write a new letter</button>`;
    h += `</section>`;
    h += `<section class="section"><span class="label">Reasons for change</span><p class="small">A collection of reasons, each pressed like a specimen. Add one whenever something matters.</p>
      <div class="herb">${f.reasons.map((r) => `<div class="card">${motif(r.motif)}<p>${esc(r.text)}</p><button class="iconbtn" data-act="reason-del" data-id="${r.id}" aria-label="Remove reason">${ic.x}</button></div>`).join("")}</div>
      <div style="margin-top:18px" data-scope="rs">${inp("text", reasonDraft.text, "Add a reason", "So I’m present on Saturday mornings")}<div class="row between"><div class="motifs" role="radiogroup" aria-label="Choose a specimen">${MOTIFS.map((_, i) => `<button role="radio" aria-checked="${i === reasonDraft.motif}" data-act="motif" data-i="${i}" aria-label="Specimen ${i + 1}">${motif(i)}</button>`).join("")}</div><button class="btn" data-act="reason-add">Add</button></div></div></section>`;
    scopes.rs = { obj: reasonDraft };
    h += `<section class="section" ${scope("feel", f.feel, () => S.soon())}><span class="label">What you want life to feel like</span>${chips("words", FEEL.map((w) => [w, w]), f.feel.words)}${ta("text", f.feel.text, "In a sentence or two:", "Mornings that start slowly, with a clear head…")}</section>`;
    const p = P();
    if (p.onboardedAt) h += `<section class="section"><span class="label">Where you started · ${fmtLong(ymd(new Date(p.onboardedAt)))}</span>
      ${p.motivation ? `<p class="intention" style="font-size:21px">“${esc(p.motivation)}”</p>` : ""}
      ${p.motivations && p.motivations.length ? `<p class="small" style="margin-top:12px">Why: ${p.motivations.map((m) => labelOf(C.MOTIVATIONS, m)).join(", ")}</p>` : ""}
      ${p.hopes && p.hopes.length ? `<p class="small">Hoping for: ${p.hopes.map((m) => labelOf(C.HOPES, m)).join(", ").toLowerCase()}</p>` : ""}
      ${p.hopesText ? `<p class="small">In your words: “${esc(p.hopesText)}”</p>` : ""}
      ${p.concerns && p.concerns.length ? `<p class="small">Worried about: ${p.concerns.map((m) => labelOf(C.CONCERNS, m)).join(", ").toLowerCase()}</p>` : ""}</section>`;
    return h;
  };
  const reasonDraft = { text: "", motif: 0 };

  /* Insights */
  VIEWS.insights = () => {
    if (!P().startDate || curDay() < 1) return `<div class="page-head"><h1>Insights</h1><p>Insights appear once your experiment has started and you’ve logged a few days.</p></div>`;
    const g = gains(); const cr = S.d.cravings; const crA = cr.filter((c) => c.after != null);
    const up = Math.min(curDay(), 30);
    const pd = photoDates();
    let h = `<div class="page-head"><h1>What your data says</h1><p>Everything here comes from what you’ve recorded. Estimates are labelled as estimates.</p></div>
      <a class="section photolink" href="#photos"><div class="pl-thumbs">${pd.length ? [pd[0], pd[pd.length - 1]].filter((x, i, a) => a.indexOf(x) === i).map((d) => `<img data-photo="${d}" alt="">`).join("") : `<span class="pl-empty">+</span>`}</div><div><span class="label" style="margin:0">Your photos</span><p style="margin:2px 0 0;font-size:17px">${pd.length >= 2 ? `Day ${S.d.photos[pd[0]].day} and day ${S.d.photos[pd[pd.length - 1]].day}, side by side` : pd.length ? "One photo so far" : "Add a photo each day to see the change"}</p></div></a>
      <div class="stats"><div class="stat"><div class="v num">${g.af}</div><div class="l">alcohol-free days, of ${g.logged} logged</div></div>
      <div class="stat"><div class="v num">${P().weeklySpend ? money(g.saved) : "–"}</div><div class="l">${P().weeklySpend ? "estimated not spent" : "add your usual spend in You to estimate savings"}</div></div>
      <div class="stat"><div class="v num">${cr.length}</div><div class="l">cravings logged${cr.length ? `, ${cr.filter((c) => c.outcome === "passed" || c.outcome === "quieter").length} passed or eased` : ""}</div></div>
      <div class="stat"><div class="v num">${baseline().weekStd ? Math.max(0, Math.round(g.std)) : "–"}</div><div class="l">standard drinks not had (estimate)</div></div></div>`;
    h += `<section class="section"><span class="label">Your garden</span><p class="small">One dahlia or peony for each day of the experiment so far. Every day plants something, whatever happened.</p></section><div class="garden-wide">${garden({ upto: up, st: dayStatuses(), label: gardenLabel(up) })}</div><section class="section" style="border-top:0;padding-top:16px"><div class="legend"><span><i class="c" style="background:#f2da7d"></i>White or butter: alcohol-free</span><span><i class="c" style="background:#e2607d"></i>Pink: had a drink</span><span><i class="c" style="background:#8fab7a"></i>In bud: not yet logged</span></div></section>`;
    h += `<section class="section"><span class="label">Sleep, mood and energy</span><p class="small">From your morning and evening check-ins, out of 5.</p><div class="fig" data-chart="lines"></div><div class="legend"><span><i style="background:#1f1f21"></i>Sleep</span><span><i style="background:#e88b9b"></i>Mood</span><span><i style="background:#a6a6a9"></i>Energy</span></div></section>`;
    h += `<section class="section"><span class="label">Cravings</span>${cr.length ? `<div class="fig" style="min-height:150px" data-chart="cravings"></div><p class="small">Cravings logged per day.</p>
      ${crA.length ? `<div class="dumb" style="margin:18px 0"><div class="r"><span class="s">Average intensity, start to end of a check-in</span><div class="line"><span class="seg2" style="left:${avg(crA.map((c) => c.after)) * 10}%;width:${Math.max(0, (avg(crA.map((c) => c.before)) - avg(crA.map((c) => c.after))) * 10)}%"></span><span class="a" style="left:${avg(crA.map((c) => c.before)) * 10}%"></span><span class="b" style="left:${avg(crA.map((c) => c.after)) * 10}%"></span></div><span class="vals">${r1(avg(crA.map((c) => c.before)))} → ${r1(avg(crA.map((c) => c.after)))} out of 10</span></div></div>` : ""}
      ${barsFor("Most common triggers", cr.map((c) => c.trigger), (id) => labelOf(C.TRIGGERS, id) || "Unsure")}
      ${barsFor("What you needed", cr.map((c) => c.need), (id) => (C.NEEDS.find((x) => x.id === id) || {}).label || id, "clay")}` : `<p class="small">No cravings logged yet. When one shows up, tap Craving. Over time you’ll see your own patterns here.</p>`}</section>`;
    const bel = C.BELIEFS.filter((b) => (S.d.beliefs[b.id] || []).length);
    h += `<section class="section"><span class="label">Beliefs, first rating to latest</span>${bel.length ? `<div class="dumb">${bel.map((b) => { const f = firstBelief(b.id), l = lastBelief(b.id); return `<div class="r"><span class="s">${b.statement}</span><div class="line" aria-hidden="true"><span class="seg2" style="left:${Math.min(f, l)}%;width:${Math.abs(f - l)}%"></span><span class="a" style="left:${f}%"></span><span class="b" style="left:${l}%"></span></div><span class="vals">${f} → ${l}</span></div>`; }).join("")}</div><div class="legend" style="margin-top:14px"><span><i class="c" style="border:2px solid var(--ink3)"></i>First</span><span><i class="c" style="background:var(--sage)"></i>Latest</span></div>` : `<p class="small">Rate your beliefs on day one, or in the <a href="#beliefs">library</a>.</p>`}</section>`;
    const pt = patterns();
    h += `<section class="section"><span class="label">Patterns in your records</span>${pt.length ? pt.map((p) => `<div class="pattern"><p>${p.t}</p><p class="small">${p.n}</p></div>`).join("") + `<p class="small" style="margin-top:14px">These are patterns, not proof. Life changes in lots of ways at once, so treat them as questions worth asking.</p>` : `<p class="small">Patterns appear once there are a few days in each group to compare, for example several mornings after alcohol-free days and several after drinking days.</p>`}</section>`;
    const weeks = [1, 2, 3, 4].filter((k) => curDay() >= k * 7);
    h += `<section class="section"><span class="label">Weekly summaries</span>${weeks.length ? weeks.map((k) => `<details class="week" ${k === weeks[weeks.length - 1] ? "open" : ""}><summary>Week ${k}<span class="small">Days ${(k - 1) * 7 + 1}–${k * 7}</span></summary><div class="summary-prose">${weekSummaryHTML(k)}</div></details>`).join("") : `<p class="small">Your first weekly summary arrives on day 7.</p>`}</section>`;
    const ms = milestones();
    h += `<section class="section"><span class="label">Milestones</span><ul class="miles">${ms.map((m) => `<li class="${m.ts ? "" : "no"}"><i></i><span>${m.label}</span><span class="small num">${m.ts ? fmtShort(ymd(new Date(m.ts))) : ""}</span></li>`).join("")}</ul></section>`;
    h += `<section class="section"><a class="btn ghost" href="#report">Your experiment report</a></section>`;
    return h;
  };
  function barsFor(title, vals, lab, cls = "") {
    const m = {}; vals.forEach((v) => v && (m[v] = (m[v] || 0) + 1)); const e = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5); if (!e.length) return "";
    const max = e[0][1];
    return `<div style="margin-top:20px"><span class="label">${title}</span><div class="bars">${e.map(([k, v]) => `<div class="bar ${cls}"><span>${esc(lab(k))}</span><span class="num small">${v}</span><span class="track"><b style="width:${(v / max) * 100}%"></b></span></div>`).join("")}</div></div>`;
  }

  /* charts */
  let ros = [];
  function drawCharts() {
    ros.forEach((r) => r.disconnect()); ros = [];
    $$("[data-chart]").forEach((el) => {
      const kind = el.dataset.chart;
      const draw = () => { const W = el.clientWidth, H = el.clientHeight; if (!W) return; el.innerHTML = kind === "lines" ? chartLines(W, H) : kind === "cravings" ? chartCravings(W, H) : chartBelief(W, H, el.dataset.id); };
      const ro = new ResizeObserver(draw); ro.observe(el); ros.push(ro);
    });
  }
  function chartLines(W, H) {
    const dates = expDates(); const L = 26, R = 8, T = 10, B = 26; const iw = W - L - R, ih = H - T - B;
    const x = (i) => L + (dates.length < 2 ? iw / 2 : (i * iw) / (dates.length - 1)); const y = (v) => T + ih - ((v - 1) / 4) * ih;
    const ser = [
      ["#1f1f21", (d) => S.d.checkins[d] && S.d.checkins[d].sleep],
      ["#e88b9b", (d) => { const c = S.d.checkins[d]; if (!c) return null; const v = [c.mood, c.eMood].filter((z) => z != null); return v.length ? avg(v) : null; }],
      ["#a6a6a9", (d) => { const c = S.d.checkins[d]; if (!c) return null; const v = [c.energy, c.eEnergy].filter((z) => z != null); return v.length ? avg(v) : null; }],
    ];
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of sleep, mood and energy by day">`;
    [1, 3, 5].forEach((v) => (s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule2)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="var(--ink3)">${v}</text>`));
    const step = W < 520 ? 7 : 5;
    dates.forEach((d, i) => { if (i % step === 0) s += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="12" fill="var(--ink3)">${i + 1}</text>`; });
    let any = false;
    ser.forEach(([c, f]) => {
      let path = "", pen = false; dates.forEach((d, i) => { const v = f(d); if (v == null) { pen = false; return; } any = true; path += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`; pen = true; });
      s += `<path d="${path}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      dates.forEach((d, i) => { const v = f(d); if (v != null) s += `<circle cx="${x(i)}" cy="${y(v)}" r="2.6" fill="${c}"/>`; });
    });
    if (!any) s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="14" fill="var(--ink3)">Your check-ins will draw here</text>`;
    return s + `<text x="${L}" y="${H - 6}" font-size="11" fill="var(--ink3)" opacity="0">Day</text></svg>`;
  }
  function chartCravings(W, H) {
    const dates = expDates(); const L = 22, R = 6, T = 8, B = 24; const iw = W - L - R, ih = H - T - B;
    const counts = dates.map((d) => S.d.cravings.filter((c) => c.date === d).length); const max = Math.max(1, ...counts);
    const bw = Math.max(2, iw / Math.max(dates.length, 1) - 3);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of cravings per day"><line x1="${L}" x2="${W - R}" y1="${T + ih}" y2="${T + ih}" stroke="var(--rule)"/><text x="${L - 6}" y="${T + 10}" text-anchor="end" font-size="12" fill="var(--ink3)">${max}</text>`;
    counts.forEach((c, i) => { const x = L + (i * iw) / Math.max(dates.length, 1) + 1.5; const h = (c / max) * ih; if (c) s += `<rect x="${x}" y="${T + ih - h}" width="${bw}" height="${h}" rx="2" fill="var(--clay)" opacity=".8"/>`; if (i % (W < 520 ? 7 : 5) === 0) s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="var(--ink3)">${i + 1}</text>`; });
    return s + "</svg>";
  }
  function chartBelief(W, H, id) {
    const h = S.d.beliefs[id] || []; const L = 26, R = 10, T = 10, B = 20; const iw = W - L - R, ih = H - T - B;
    const x = (i) => L + (h.length < 2 ? iw / 2 : (i * iw) / (h.length - 1)); const y = (v) => T + ih - (v / 100) * ih;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Your ratings of this belief over time">`;
    [0, 50, 100].forEach((v) => (s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule2)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--ink3)">${v}</text>`));
    s += `<path d="${h.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.v)}`).join("")}" fill="none" stroke="var(--sage)" stroke-width="2.2"/>`;
    h.forEach((p, i) => (s += `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="${i === h.length - 1 ? "var(--sage)" : "var(--paper)"}" stroke="var(--sage)" stroke-width="2"/>`));
    return s + "</svg>";
  }

  /* What's next */
  VIEWS.next = () => {
    const nx = S.d.next; const g = nx.goals;
    const CH = [["af", "Keep going alcohol-free", "Extend the experiment and keep the daily rhythm."], ["rules", "Drink occasionally, with my own guidelines", "Set clear limits you chose, and keep noticing."], ["extend", "Extend before deciding", "More time, more data."], ["later", "Decide later", "Keep journaling and checking in."]];
    let h = `<div class="page-head"><h1>What comes next</h1><p>Your call, made with better information than you had on day one. You can change it anytime.</p></div>`;
    h += `<section class="section" ${scope("nx", nx, (p) => { S.soon(); if (p === "choice") { const l = $("[data-live-next]"); if (l) l.innerHTML = rulesHTML(); } })}>${opts("choice", CH.map(([a, b, c]) => [a, b, c]), nx.choice, "Your choice")}<div data-live-next>${rulesHTML()}</div></section>`;
    h += `<section class="section"><span class="label">Extend the experiment</span><p class="small">Currently running to day ${nx.extendedTo}. Days beyond 30 have check-ins, a question to sit with and a lesson to revisit.</p><div class="row">${[60, 90, 120].map((v) => `<button class="chip" aria-pressed="${nx.extendedTo === v}" data-act="extend" data-v="${v}">To day ${v}</button>`).join("")}${nx.extendedTo > 30 ? `<button class="link quiet" data-act="extend" data-v="30">End at 30</button>` : ""}</div></section>`;
    h += `<section class="section" data-scope="goal"><span class="label">Your goals</span>${g.length ? `<ul class="miles">${g.map((x) => `<li class="${x.done ? "" : "no"}"><i></i><span>${esc(x.text)}</span><span class="row" style="gap:0"><button class="link quiet" data-act="goal-toggle" data-id="${x.id}">${x.done ? "Undo" : "Done"}</button><button class="iconbtn" data-act="goal-del" data-id="${x.id}" aria-label="Remove goal">${ic.x}</button></span></li>`).join("")}</ul>` : ""}${inp("text", goalDraft.text, "Add a goal", "Alcohol-free weeknights through January")}<button class="btn ghost" data-act="goal-add">Add goal</button></section>`;
    scopes.goal = { obj: goalDraft };
    h += `<section class="section"><span class="label">Keep what you’ve learned</span><div class="row"><a class="btn" href="#report">Export your report</a><a class="link" href="#journal">Review discoveries</a></div></section>`;
    return h;
  };
  const goalDraft = { text: "" };
  function rulesHTML() {
    const nx = S.d.next; if (nx.choice !== "rules") return "";
    return `<div class="field" style="margin-top:6px"><p class="small">For reference, Australia’s guidelines for healthy adults are no more than 10 standard drinks a week and no more than 4 on any one day. The less you drink, the lower the risk. Your own guidelines can be stricter.</p></div>
      ${stepper("rules.days", nx.rules.days, "Drinking days per week, at most", 0, 7)}${stepper("rules.perDay", nx.rules.perDay, "Standard drinks on those days, at most", 0, 4, 0.5)}${ta("rules.skip", nx.rules.skip, "Situations where I’ll skip it anyway", "Weeknights, when I’m stressed, work events")}`;
  }

  /* Report */
  VIEWS.report = () => {
    const p = P(); if (!p.startDate) return `<div class="page-head"><h1>Report</h1><p>Your report becomes available once your experiment starts.</p></div>`;
    const g = gains(); const ms = milestones().filter((m) => m.ts); const disc = S.d.journal.filter((j) => j.type === "discovery");
    const crA = S.d.cravings.filter((c) => c.after != null);
    return `<div class="report"><div class="page-head"><a class="link quiet noprint" href="#insights">← Insights</a><p class="kicker" style="margin-top:10px">Clearing · personal experiment report</p><h1>${name() ? esc(name()) + "’s" : "Your"} thirty days</h1><p>${fmtLong(p.startDate)} to ${fmtLong(dateOf(Math.min(30, Math.max(1, curDay()))))}. Generated ${fmtLong(today())}.</p>
      <div class="row noprint" style="margin-top:14px"><button class="btn" data-act="print">Print or save as PDF</button><button class="btn ghost" data-act="report-dl">Download</button><button class="link" data-act="report-copy">Copy as text</button></div>${framed ? `<p class="small noprint" style="margin-top:8px">In this preview, printing and downloads may be blocked by the viewer. Copy works everywhere, and everything works in the installed app.</p>` : ""}</div>
      <section class="section"><h3>At a glance</h3><table><tbody>
        <tr><td>Days logged</td><td class="r num">${g.logged}</td></tr><tr><td>Alcohol-free days</td><td class="r num">${g.af}</td></tr><tr><td>Days with a drink</td><td class="r num">${g.drank}</td></tr>
        <tr><td>Standard drinks logged</td><td class="r num">${r1(g.stdHad)}</td></tr><tr><td>Usual week before starting (your estimate)</td><td class="r num">${r1(baseline().weekStd)} standard drinks</td></tr>
        ${p.weeklySpend ? `<tr><td>Estimated not spent</td><td class="r num">${money(g.saved)}</td></tr>` : ""}
        <tr><td>Cravings logged</td><td class="r num">${S.d.cravings.length}</td></tr>${crA.length ? `<tr><td>Average craving, start → end</td><td class="r num">${r1(avg(crA.map((c) => c.before)))} → ${r1(avg(crA.map((c) => c.after)))}</td></tr>` : ""}
      </tbody></table></section>
      <section class="section"><h3>Why you started</h3>${p.motivation ? `<p class="serif" style="font-size:19px">“${esc(p.motivation)}”</p>` : ""}<p class="small">${(p.motivations || []).map((m) => labelOf(C.MOTIVATIONS, m)).join(" · ")}</p></section>
      <section class="section"><h3>Beliefs</h3><table><thead><tr><th>Belief</th><th class="r">First</th><th class="r">Latest</th></tr></thead><tbody>${C.BELIEFS.map((b) => `<tr><td>${b.statement}</td><td class="r num">${firstBelief(b.id) ?? "–"}</td><td class="r num">${lastBelief(b.id) ?? "–"}</td></tr>`).join("")}</tbody></table></section>
      <section class="section"><h3>Patterns</h3>${patterns().map((x) => `<p>${x.t} <span class="small">${x.n}</span></p>`).join("") || `<p class="small">Not enough data for patterns yet.</p>`}<p class="small">Patterns in personal records, not proof of cause.</p></section>
      <section class="section"><h3>Discoveries</h3>${disc.length ? disc.map((d) => `<p><span class="small">${fmtShort(d.date)}</span><br><span class="serif" style="font-size:18px">${esc(d.text)}</span></p>`).join("") : `<p class="small">None recorded.</p>`}</section>
      <section class="section"><h3>Milestones</h3>${ms.map((m) => `<p>${m.label} <span class="small">${fmtShort(ymd(new Date(m.ts)))}</span></p>`).join("")}</section>
      ${S.d.next.choice ? `<section class="section"><h3>What’s next</h3><p>${{ af: "Keep going alcohol-free", rules: "Drink occasionally, with my own guidelines", extend: "Extend before deciding", later: "Decide later" }[S.d.next.choice]}</p>${S.d.next.choice === "rules" ? `<p class="small">At most ${S.d.next.rules.days} drinking days a week, ${S.d.next.rules.perDay} standard drinks on those days.${S.d.next.rules.skip ? " Skipping: " + esc(S.d.next.rules.skip) : ""}</p>` : ""}</section>` : ""}
      <section class="section"><p class="small">Clearing is a self-reflection tool, not medical advice or treatment. If you have concerns about your drinking or health, speak with your GP or call the National Alcohol and Other Drug Hotline on 1800 250 015.</p></section></div>`;
  };
  function reportText() {
    const p = P(); const g = gains();
    const lines = [`Clearing — personal experiment report`, `${name() || "Me"} · started ${fmtLong(p.startDate)} · generated ${fmtLong(today())}`, ``, `Days logged: ${g.logged}`, `Alcohol-free days: ${g.af}`, `Days with a drink: ${g.drank}`, `Standard drinks logged: ${r1(g.stdHad)}`, `Usual week before (estimate): ${r1(baseline().weekStd)} standard drinks`];
    if (p.weeklySpend) lines.push(`Estimated not spent: ${money(g.saved)}`);
    lines.push(`Cravings logged: ${S.d.cravings.length}`, ``, `Beliefs (first → latest):`);
    C.BELIEFS.forEach((b) => lines.push(`  ${b.statement} ${firstBelief(b.id) ?? "–"} → ${lastBelief(b.id) ?? "–"}`));
    const pt = patterns(); if (pt.length) { lines.push(``, `Patterns (not proof of cause):`); pt.forEach((x) => lines.push(`  ${x.t}`)); }
    const disc = S.d.journal.filter((j) => j.type === "discovery"); if (disc.length) { lines.push(``, `Discoveries:`); disc.forEach((d) => lines.push(`  ${d.date}: ${d.text}`)); }
    return lines.join("\n");
  }

  /* Photos */
  VIEWS.photos = () => {
    let h = `<div class="page-head"><a class="link quiet" href="#insights">← Insights</a><h1 style="margin-top:12px">Your photos</h1><p>Same spot, same light, roughly the same time each day. Your photos stay on this device.</p></div>`;
    if (!P().startDate || curDay() < 1) return h + `<section class="section"><p class="small" style="margin:0">Photos start with day 1 of your experiment.</p></section>`;
    const pd = photoDates(); const n = Math.min(curDay(), maxDay());
    if (!pd.includes(photoCmp.a)) photoCmp.a = pd[0] || null;
    if (!pd.includes(photoCmp.b) || photoCmp.b === photoCmp.a) photoCmp.b = pd.length > 1 ? pd[pd.length - 1] : null;
    const dl = (d) => `Day ${S.d.photos[d].day || diff(P().startDate, d) + 1}`;
    if (pd.length >= 2 && photoCmp.a && photoCmp.b) {
      const [a, b] = photoCmp.a < photoCmp.b ? [photoCmp.a, photoCmp.b] : [photoCmp.b, photoCmp.a];
      h += `<section class="section white"><div class="row between" style="margin-bottom:14px"><span class="label" style="margin:0">Compare</span><div class="seg mini" role="radiogroup" aria-label="Compare style"><a href="#photos" role="radio" aria-checked="${photoCmp.mode === "slide"}" ${photoCmp.mode === "slide" ? 'aria-current="page"' : ""} data-act="cmp-mode" data-v="slide">Slide</a><a href="#photos" role="radio" aria-checked="${photoCmp.mode === "side"}" ${photoCmp.mode === "side" ? 'aria-current="page"' : ""} data-act="cmp-mode" data-v="side">Side by side</a></div></div>`;
      h += photoCmp.mode === "slide"
        ? `<div class="ba" style="--pos:50%"><img class="ba-after" data-photo="${b}" alt="${dl(b)}"><img class="ba-before" data-photo="${a}" alt="${dl(a)}"><span class="ba-handle" aria-hidden="true"></span><span class="ba-tag l">${dl(a)}</span><span class="ba-tag r">${dl(b)}</span></div><input type="range" min="0" max="100" value="50" data-ba="1" aria-label="Slide between ${dl(a)} and ${dl(b)}" style="--p:50%;margin-top:10px">`
        : `<div class="sbs"><figure><img data-photo="${a}" alt="${dl(a)}"><figcaption>${dl(a)} · ${fmtShort(a)}</figcaption></figure><figure><img data-photo="${b}" alt="${dl(b)}"><figcaption>${dl(b)} · ${fmtShort(b)}</figcaption></figure></div>`;
      h += `<div class="field" style="margin:18px 0 10px"><span class="q">Before</span><div class="chips scrollrow">${pd.map((d) => `<button class="chip" role="radio" aria-checked="${d === photoCmp.a}" data-act="cmp-a" data-v="${d}">${dl(d)}</button>`).join("")}</div></div>
        <div class="field" style="margin:0"><span class="q">After</span><div class="chips scrollrow">${pd.map((d) => `<button class="chip" role="radio" aria-checked="${d === photoCmp.b}" data-act="cmp-b" data-v="${d}">${dl(d)}</button>`).join("")}</div></div></section>`;
    } else h += `<section class="section"><p class="small" style="margin:0">${pd.length ? "One photo saved. Add another on a different day and you can compare them here." : "No photos yet. Tap a day below, or add today’s from the Today screen."}</p></section>`;
    let g = "";
    for (let i = 1; i <= n; i++) { const d = dateOf(i); const has = S.d.photos[d];
      g += has ? `<button class="ptile" data-act="photo-open" data-date="${d}" aria-label="Day ${i} photo"><img data-photo="${d}" alt=""><span>Day ${i}</span></button>`
        : `<label class="ptile empty" aria-label="Add a photo for day ${i}"><b aria-hidden="true">+</b><span>Day ${i}</span>${photoInput(d)}</label>`; }
    h += `<section class="section"><span class="label">Every day</span><div class="pgrid">${g}</div><p class="small" style="margin:16px 0 0">Photos are saved only in this browser on this device. Use the installed app so your phone keeps them, and include photos when you download your data.</p></section>`;
    return h;
  };

  /* You / settings */
  VIEWS.you = () => {
    const p = P(); const s = S.d.settings;
    const size = (() => { try { return Math.round(JSON.stringify(S.d).length / 1024); } catch (e) { return 0; } })();
    let h = `<div class="page-head"><h1>You</h1><p>Your details, reminders and data.</p></div>`;
    if (p.safety && p.safety.flagged) h += `<section class="section"><div class="warn"><h3>A note on safety</h3><p class="small" style="margin:0">Your answers at the start suggested stopping suddenly could carry some risk. If you haven’t already, please check in with your GP. If you notice shaking, sweating, a racing heart, confusion or hallucinations, seek medical help. In an emergency call 000.</p></div></section>`;
    h += `<section class="section" ${scope("prof", p, () => S.soon())}><span class="label">Your details</span>${inp("name", p.name, "What we call you", "Your name")}
      <div class="setrow"><div><b>Start date</b><div class="d">${p.startDate ? fmtLong(p.startDate) : "Not set"}</div></div><button class="btn ghost" data-act="setstart">Change</button></div>
      <div class="setrow"><div><b>Experiment style</b><div class="d">${p.mode === "mindful" ? "Observe and cut back" : "Alcohol-free for 30 days"}</div></div><button class="btn ghost" data-act="mode">Change</button></div>
      ${inp("weeklySpend", p.weeklySpend, "Usual weekly spend on alcohol before starting ($)", "e.g. 80", "number", 'data-num="1" inputmode="decimal" min="0"')}</section>`;
    h += `<section class="section" ${scope("rem", s.reminders, () => S.soon())}><span class="label">Reminders</span><p class="small">Browsers can’t reliably send scheduled notifications without a server, so Clearing adds your check-ins to your calendar instead. Your calendar app will remind you.</p>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px">${inp("morning", s.reminders.morning, "Morning", "", "time")}${inp("evening", s.reminders.evening, "Evening", "", "time")}</div><button class="btn ghost" data-act="ics">Add to my calendar</button></section>`;
    h += `<section class="section"><span class="label">Preferences</span>
      <div class="setrow"><div><b>Read ahead</b><div class="d">Open future days early. Most people find the daily pace works better.</div></div><button class="toggle" role="switch" aria-checked="${s.readAhead}" aria-label="Read ahead" data-act="readahead"></button></div></section>`;
    h += `<section class="section"><span class="label">Your data</span><h3>How your data is stored</h3><p class="small">Everything you enter, including your journal, stays in this browser on this device (about ${size} KB). Nothing is sent to a server, there are no accounts and no analytics. That also means clearing your browser data, or using another device, won’t carry it across. Daily photos are kept in this browser’s own storage on this device. Export a copy now and then to keep it all safe; downloads include your photos.${S.ok ? "" : " <b>Your browser is blocking storage right now, so data will be lost when you close this page. Export before leaving.</b>"}</p>
      <div class="row" style="margin-top:12px"><button class="btn ghost" data-act="export">Download my data</button><button class="link" data-act="export-copy">Copy my data</button><label class="link" style="display:inline-flex;align-items:center;cursor:pointer">Import<input type="file" accept="application/json,.json" data-act-change="import" class="sr"></label></div>
      <div class="row" style="margin-top:6px"><a class="link" href="#report">Printable report</a></div>
      <div class="setrow" style="margin-top:16px;border-top:1px solid var(--rule2)"><div><b>Delete everything</b><div class="d">Permanently removes all your data from this device.</div></div><button class="btn ghost" data-act="wipe" style="color:var(--clay);border-color:var(--clay)">Delete</button></div></section>`;
    h += `<section class="section"><span class="label">Install</span>${installHTML()}</section>`;
    h += `<section class="section"><div class="row"><a class="link" href="#resources">Support and resources</a><a class="link" href="#about">About, evidence and references</a></div></section>`;
    return h;
  };
  let deferredInstall = null;
  function installHTML() {
    if (window.matchMedia && matchMedia("(display-mode: standalone)").matches) return `<p class="small">Clearing is installed on this device. It works offline.</p>`;
    if (deferredInstall) return `<p class="small">Install Clearing for a full-screen app that works offline.</p><button class="btn ghost" data-act="install">Install Clearing</button>`;
    return `<p class="small">To install on iPhone or iPad, open Clearing in Safari, tap Share, then “Add to Home Screen”. On Android, use the browser menu and choose “Install app”. Once installed it works offline.</p>`;
  }
  VIEWS.resources = () => `<div class="page-head"><a class="link quiet" href="#you">← You</a><h1 style="margin-top:14px">Support</h1><p>Clearing is a self-reflection tool. It isn’t treatment, and it can’t help in an emergency. These services can.</p></div>
    <section class="section"><div class="warn"><h3>If you drink heavily or daily</h3><p class="small" style="margin:0">Stopping suddenly after regular heavy drinking can cause alcohol withdrawal, which can be dangerous and, in severe cases, life-threatening (including seizures). Talk to your GP before stopping. They can help you cut back safely, sometimes with medication.</p></div></section>
    <section class="section">${C.RESOURCES.map((r) => `<div class="res"><b>${r.name}</b><span class="small">${r.detail}${r.hours ? ` · ${r.hours}` : ""}</span>${r.tel ? `<a class="tel num" href="tel:${r.tel.replace(/[^\d]/g, "")}">${r.tel}</a>` : ""}${r.url ? `<a class="link" href="${r.url}" target="_blank" rel="noopener">${r.url.replace("https://www.", "")}</a>` : ""}</div>`).join("")}<p class="small" style="margin-top:14px">Numbers checked November 2026. Services can change, so check the provider’s website if a number doesn’t connect.</p></section>`;
  VIEWS.about = () => `<div class="page-head"><a class="link quiet" href="#you">← You</a><h1 style="margin-top:14px">About Clearing</h1><p class="lede">A thirty-day experiment in looking closely at alcohol, built on curiosity rather than rules.</p></div>
    <section class="section"><h3>What this is, and isn’t</h3><p>Clearing helps you observe and reflect on your relationship with alcohol. It is not medical advice, diagnosis or treatment, and it doesn’t measure your health. It doesn’t label you, and logging a drink never resets your progress.</p><p>Clearing is an original programme. It is inspired by the broader idea of a time-limited, curiosity-led alcohol experiment, and is not affiliated with, endorsed by or derived from the text of any book, author or organisation.</p></section>
    <section class="section"><h3>How we label evidence</h3>${Object.entries(C.EVIDENCE).map(([k, e]) => `<p><span class="evidence" data-l="${k}"><i></i>${e.label}</span><br><span class="small">${e.note}</span></p>`).join("")}<p class="small">Each lesson carries one of these tags, with its references underneath.</p></section>
    <section class="section"><h3>References</h3><ol class="small" style="padding-left:20px">${Object.values(C.REFS).map((r) => `<li style="margin-bottom:8px">${esc(r)}</li>`).join("")}</ol></section>
    <section class="section"><h3>Privacy</h3><p class="small">No accounts, servers, cookies or analytics. Your data stays in this browser. Export it from You → Your data. The app is structured so secure sync can be added later without changing how your data is organised.</p></section>`;

  /* ---------------- flows: onboarding ---------------- */
  function onboarding(resume) {
    const st = { resume: !!resume, name: "", age: false, safety: {}, motivations: [], motivation: "", daysPerWeek: 4, drinksPerDay: 3, weeklySpend: null, time: null, benefits: [], triggers: [], concerns: [], concernsText: "", hopes: [], hopesText: "", mode: "af", start: "today", customDate: addDays(today(), 1), ack: null, rem: { morning: "07:30", evening: "20:30" } };
    const flagged = (s) => ["q1", "q2", "q3", "q4"].some((k) => s.safety[k] === "yes");
    const paused = (s) => s.ack === "gp";
    if (resume) { const p = P(); Object.assign(st, { name: p.name || "", age: true, safety: { ...(p.safety || {}) }, ack: "plan", mode: "mindful" }); }
    const R = (s) => s.resume;
    const SQ = [
      ["q1", "When you’ve gone a day or more without alcohol, have you had shaking, sweating, nausea, a racing heart or bad anxiety that eased when you drank?"],
      ["q2", "Do you sometimes have a drink in the morning to steady yourself or get going?"],
      ["q3", "Have you ever had a seizure, hallucinations or severe confusion after stopping or cutting down?"],
      ["q4", "Do you drink heavily every day, or almost every day?"],
      ["q5", "Are you pregnant or breastfeeding, taking regular medication, or managing a health condition affected by alcohol?"],
    ];
    openFlow({
      title: "Set up your experiment", noClose: !resume, theme: "", state: st,
      steps: [
        { skip: R, theme: "moss", noBack: true, full: true, next: "Begin", html: () => `<div class="hero"><div class="hero-in"><p class="brandmark">Clearing<br><span>30 days</span></p><h2 style="margin-top:18px;color:var(--ink);font-size:22px;letter-spacing:-0.02em">Thirty days of looking closely at alcohol.</h2><p class="lede" style="color:var(--ink2);margin-top:8px;max-width:34ch;font-size:16px">Not a vow and not a programme. An experiment, run by you, on you, with curiosity instead of rules.</p><p class="small" style="margin-top:22px"><label class="link" style="cursor:pointer;color:var(--ink)">Restore from a backup<input type="file" accept="application/json,.json" data-act-change="import" class="sr"></label></p></div></div>` },
        { skip: R, html: (s) => `<p class="kicker">Before we start</p><h2>Three promises</h2><div class="stack" style="margin-top:18px"><div><h3>Curiosity over rules</h3><p class="small">You’re a scientist here, not a student being graded.</p></div><div><h3>Nothing resets</h3><p class="small">If you drink, you log it and carry on. Every day counts as data.</p></div><div><h3>Your data stays with you</h3><p class="small">Everything lives on this device. No accounts, no tracking.</p></div></div><label class="check" style="margin-top:22px"><input type="checkbox" ${s.age ? "checked" : ""} data-act-change="age"><span>I’m 18 or older</span></label>`, valid: (s) => (s.age ? null : "Clearing is for adults 18 and over.") },
        { skip: R, html: (s) => `<p class="kicker">Hello</p><h2>What should we call you?</h2>${inp("name", s.name, "Your first name or a nickname", "", "text", 'autocomplete="given-name"')}<p class="small">Optional. It’s only used to greet you.</p>` },
        { skip: R, html: (s) => `<p class="kicker">Safety first</p><h2>A few quick health questions</h2><p class="small">For most people, stopping drinking for a month is safe. For some, stopping suddenly can be dangerous. These questions help us point you to the right support. Your answers stay on this device.</p>${SQ.map(([k, q]) => `<div class="field" style="margin-top:18px"><span class="q">${q}</span><div class="chips" role="radiogroup" aria-label="${esc(q)}">${[["yes", "Yes"], ["no", "No"]].map(([v, l]) => `<button class="chip" role="radio" aria-checked="${s.safety[k] === v}" data-chip="safety.${k}" data-v="${v}">${l}</button>`).join("")}</div></div>`).join("")}`, valid: (s) => (SQ.every(([k]) => s.safety[k]) ? null : "Please answer each question.") },
        {
          skip: (s) => s.resume || (!flagged(s) && s.safety.q5 !== "yes"),
          html: (s) => flagged(s) ? `<p class="kicker">Please pause here</p><h2>Talk to a doctor before you stop.</h2><p>Your answers suggest your body may have adapted to regular alcohol. Stopping suddenly could cause withdrawal, which can be serious and, in some cases, life-threatening, including seizures.</p><p>This doesn’t mean you can’t do this experiment. It means doing it safely: your GP can help you cut back gradually or stop with medical support, sometimes with medication.</p><div class="note clay" style="margin:16px 0"><b>National Alcohol and Other Drug Hotline</b><br><span class="num">1800 250 015</span> · free, confidential, 24/7</div>${opts("ack", [["gp", "I’ll speak to my GP or a support line first", "We’ll save your answers. Come back and set a start date when you’re ready."], ["plan", "I already have medical support and a plan", "Continue setting up. We’ll suggest the ‘observe and cut back’ style."]], s.ack)}`
            : `<p class="kicker">Worth knowing</p><h2>Check in with your GP or pharmacist.</h2><p>If you’re pregnant or breastfeeding, Australia’s guidelines say not drinking is the safest choice. If you take medication or manage a health condition, your GP or pharmacist can tell you how alcohol, or stopping it, might affect you.</p><p class="small">You can continue setting up. Clearing doesn’t replace that conversation.</p>`,
          valid: (s) => (flagged(s) && !s.ack ? "Please choose one option." : null),
          onLeave: (s) => { if (s.ack === "plan") s.mode = "mindful"; },
        },
        { skip: paused, html: (s) => `<p class="kicker">Why now</p><h2>What brought you here?</h2>${chips("motivations", C.MOTIVATIONS, s.motivations, true)}${ta("motivation", s.motivation, "In your own words, why does this matter right now?", "I want to know if I actually need it…")}` },
        { skip: paused, html: (s) => `<p class="kicker">Your starting point</p><h2>A typical week, before the experiment</h2><p class="small">Rough is fine. This sets your baseline for estimates, and isn’t a judgement.</p>${stepper("daysPerWeek", s.daysPerWeek, "Days a week I usually drink", 0, 7)}${stepper("drinksPerDay", s.drinksPerDay, "Standard drinks on those days", 0, 20, 0.5)}<p class="small">A standard drink is 10 g of alcohol. Roughly: a schooner of full-strength beer is about 1.6, a 150 ml glass of wine about 1.5, a nip of spirits 1.</p>${inp("weeklySpend", s.weeklySpend, "About how much do you spend on alcohol a week? ($)", "e.g. 80", "number", 'data-num="1" inputmode="decimal" min="0"')}${chips("time", C.TIMES.map(([a, b]) => [a, b[0].toUpperCase() + b.slice(1)]), s.time, false, "When do you usually drink?")}` },
        { skip: paused, html: (s) => `<p class="kicker">Be generous</p><h2>What does alcohol do for you?</h2><p class="small">This isn’t a test. The things it genuinely helps with are exactly what we’ll explore.</p>${chips("benefits", C.BENEFITS, s.benefits, true)}` },
        { skip: paused, html: (s) => `<p class="kicker">Your moments</p><h2>When does the pull tend to show up?</h2>${chips("triggers", C.TRIGGERS, s.triggers, true)}` },
        { skip: paused, html: (s) => `<p class="kicker">Honest worries</p><h2>What might make the next thirty days hard?</h2>${chips("concerns", C.CONCERNS, s.concerns, true)}${ta("concernsText", s.concernsText, "Anything else?", "Christmas parties, my partner’s birthday…")}` },
        { skip: paused, html: (s) => `<p class="kicker">Looking ahead</p><h2>What do you hope will be different?</h2>${chips("hopes", C.HOPES, s.hopes, true)}${ta("hopesText", s.hopesText, "In your own words:", "")}` },
        { skip: paused, html: (s) => `<p class="kicker">Your experiment</p><h2>How do you want to run it?</h2>${opts("mode", [["af", "Alcohol-free for 30 days", "The clearest experiment. Most people choose this."], ["mindful", "Observe and cut back", "Drink less, notice more. Suits some people better, especially with medical advice."]], s.mode)}<p class="small">Either way, nothing resets if things don’t go to plan.</p>` },
        { skip: paused, liveOn: ["start"], live: (s) => s.start === "pick" ? inp("customDate", s.customDate, "Start date", "", "date", `min="${today()}"`) : "", html: (s) => `<p class="kicker">Timing</p><h2>When does Day 1 begin?</h2>${chips("start", [["today", "Today"], ["tomorrow", "Tomorrow"], ["pick", "Pick a date"]], s.start, false)}<div data-live>${s.start === "pick" ? inp("customDate", s.customDate, "Start date", "", "date", `min="${today()}"`) : ""}</div><p class="small">Avoid starting right before a big event if you can. Then again, there’s never a perfect week.</p>`, valid: (s) => (s.start === "pick" && (!s.customDate || s.customDate < today()) ? "Choose today or a later date." : null) },
        { skip: (s) => !paused(s), next: "Finish", html: () => `<p class="kicker">Saved</p><h2>Your answers are saved. Come back when you’re ready.</h2><p>When you’ve spoken with your GP or a support line, open Clearing and set your start date. Meanwhile, the belief library, journal and future-self letter are all open to you.</p><p class="note"><b>National Alcohol and Other Drug Hotline</b><br><span class="num">1800 250 015</span> · 24/7</p>` },
        { skip: paused, theme: "moss", next: "Start my experiment", html: () => `<p class="kicker">One last thing</p><h2>Your notes stay here.</h2><p style="color:var(--moss-ink2)">Clearing stores everything on this device only: no accounts, no servers, no analytics. Journal entries and drinking records are sensitive, so they never leave your browser unless you export them.</p><p style="color:var(--moss-ink2)">Clearing is a tool for reflection, not medical treatment. If at any point you’re worried about your drinking or your health, the Support page lists people who can help.</p>` },
      ],
      onDone: (s) => {
        const start = paused(s) ? null : s.start === "today" ? today() : s.start === "tomorrow" ? addDays(today(), 1) : s.customDate;
        S.d.profile = { name: s.name.trim(), mode: s.mode, motivations: s.motivations, motivation: s.motivation.trim(), daysPerWeek: s.daysPerWeek, drinksPerDay: s.drinksPerDay, weeklySpend: s.weeklySpend, time: s.time, benefits: s.benefits, triggers: s.triggers, concerns: s.concerns, concernsText: s.concernsText, hopes: s.hopes, hopesText: s.hopesText, safety: { ...s.safety, flagged: flagged(s), ack: s.ack }, startDate: start, partial: !start, onboardedAt: (S.d.profile && S.d.profile.onboardedAt) || Date.now() };
        S.save(); location.hash = "#today";
      },
    });
  }
  function setStartFlow() {
    openFlow({ title: "Set a start date", state: { start: "today", customDate: addDays(today(), 1) }, steps: [{ next: "Save", liveOn: ["start"], live: (s) => (s.start === "pick" ? inp("customDate", s.customDate, "Start date", "", "date") : ""), html: (s) => `<h2>When does Day 1 begin?</h2><p class="small">Moving your start date shifts which calendar day each experiment day falls on. Your notes and records are kept.</p>${chips("start", [["today", "Today"], ["tomorrow", "Tomorrow"], ["pick", "Pick a date"]], s.start, false)}<div data-live></div>`, valid: (s) => (s.start === "pick" && !s.customDate ? "Choose a date." : null) }],
      onDone: (s) => { S.d.profile.startDate = s.start === "today" ? today() : s.start === "tomorrow" ? addDays(today(), 1) : s.customDate; if (S.d.profile.safety) S.d.profile.safety.ack = S.d.profile.safety.ack || "plan"; S.save(); toast("Start date saved"); } });
  }

  /* ---------------- flows: morning ---------------- */
  function morningFlow(n) {
    const d = DAYS[n - 1]; const dd = dayData(n); const isToday = n === curDay(); const date = dateOf(n);
    const y = addDays(today(), -1); const askY = isToday && n > 1 && !S.d.status[y];
    const ci = S.d.checkins[date] || {};
    const st = { ci: { sleep: ci.sleep, mood: ci.mood, energy: ci.energy }, y: null, intent: (dd.morning && dd.morning.intention) || "", own: "", ex: exInit(n, dd.exercise) };
    if (st.intent && !d.intentions.includes(st.intent)) { st.own = st.intent; }
    const pn = personal(d); const up = Math.min(curDay(), 30); const sts = dayStatuses(); const wasDone = mDone(n);
    openFlow({
      title: `Day ${n}`, state: st,
      steps: [
        { theme: "moss", full: true, next: "Begin", html: () => `<div class="reveal-bg"><div class="reveal"><p class="kicker">${isToday ? fmtLong(today()) : `Catching up · ${fmtShort(date)}`}</p><p class="big num" aria-label="Day ${n}">${pad2(n)}<span class="grey">/30</span></p><h2>${d.title}</h2><p style="color:var(--ink2);max-width:30ch;margin:0">${d.kicker}</p><div class="garden-bleed">${garden({ upto: Math.max(up, n), st: sts, newBloom: n - 1, label: gardenLabel(Math.max(up, n)) })}</div></div></div>` },
        { skip: () => !isToday, html: (s) => `<p class="kicker">Check-in</p><h2>${greet()} How are you arriving?</h2>${scale("ci.sleep", s.ci.sleep, SC.sleep, "How did you sleep?")}${scale("ci.mood", s.ci.mood, SC.mood, "How are you feeling?")}${scale("ci.energy", s.ci.energy, SC.energy, "Energy?")}${askY ? chips("y", [["af", "Alcohol-free"], ["drank", "I had a drink"], ["skip", "Skip"]], s.y, false, "And yesterday?") : ""}` },
        { html: (s) => `<p class="kicker">Intention</p><h2>Choose an intention for today.</h2><p class="small">Something to come back to, not a rule to keep.</p>${opts("intent", d.intentions.map((t) => [t, t]), s.intent)}${inp("own", s.own, "Or write your own", "Today I want to…")}`, onLeave: (s) => { if (s.own.trim()) s.intent = s.own.trim(); } },
        { html: () => `<p class="kicker">Today’s lesson · about two minutes</p><h2>${d.title}</h2><div class="lesson">${d.lesson.map((p) => `<p>${p}</p>`).join("")}</div><p class="pull">${d.pull}</p>${pn ? `<p class="note clay">${esc(pn)}</p>` : ""}<div style="margin-top:14px">${evidenceTag(d.evidence)}${refsBlock(d.refs)}</div>` },
        { html: (s) => `<p class="kicker">Explore</p>${exHTML(n, s.ex, "ex.").replace("<h3>", "<h2>").replace("</h3>", "</h2>")}`, valid: (s) => exValid(n, s.ex) },
        { next: "I’m in", html: () => `<p class="kicker">Today’s experiment</p><h2>${d.experiment.title}</h2><p class="lede">${d.experiment.body}</p><p class="note" style="margin-top:22px">${d.tip}</p>` },
      ],
      onDone: (s) => {
        const intent = s.own.trim() || s.intent || d.intentions[0];
        dd.morning = { done: true, ts: (dd.morning && dd.morning.ts) || Date.now(), intention: intent };
        dd.exercise = s.ex; exSide(n, s.ex, !wasDone);
        if (isToday) { const c = (S.d.checkins[date] = S.d.checkins[date] || {}); ["sleep", "mood", "energy"].forEach((k) => s.ci[k] != null && (c[k] = s.ci[k])); }
        if (s.y === "af") S.d.status[y] = "af";
        if (n === 30 && d.exercise.type === "final") finishExperiment(s.ex);
        S.save();
        if (s.y === "drank") setTimeout(() => drinkFlow(y), 50); else toast(`Day ${n} is set`);
        if (n === 30) setTimeout(() => { location.hash = "#future"; }, 60);
      },
    });
  }
  function practiceMorning(n) {
    const dd = dayData(n); const date = today(); const ci = S.d.checkins[date] || {}; const prompt = C.PRACTICE[(n - 31) % C.PRACTICE.length];
    openFlow({ title: `Day ${n}`, state: { ci: { ...ci }, intent: (dd.morning && dd.morning.intention) || "", ans: (dd.morning && dd.morning.practice) || "" }, steps: [
      { html: (s) => `<p class="kicker">Day ${n} · practice</p><h2>${greet()}</h2>${scale("ci.sleep", s.ci.sleep, SC.sleep, "How did you sleep?")}${scale("ci.mood", s.ci.mood, SC.mood, "How are you feeling?")}${scale("ci.energy", s.ci.energy, SC.energy, "Energy?")}` },
      { next: "Done", html: (s) => `<p class="kicker">Intention and a question</p><h2>${esc(prompt)}</h2>${ta("ans", s.ans, "Your answer", "")}${inp("intent", s.intent, "An intention for today", "Notice before I decide")}` },
    ], onDone: (s) => { dd.morning = { done: true, ts: Date.now(), intention: s.intent.trim(), practice: s.ans }; const c = (S.d.checkins[date] = S.d.checkins[date] || {}); ["sleep", "mood", "energy"].forEach((k) => s.ci[k] != null && (c[k] = s.ci[k])); S.save(); toast("Morning saved"); } });
  }
  function finishExperiment(x) {
    S.d.next.choice = x.next === "extend" ? "extend" : x.next; S.d.next.finalAt = Date.now();
    if (x.next === "af" || x.next === "extend") S.d.next.extendedTo = Math.max(S.d.next.extendedTo, 60);
    if (S.d.future.letter && !S.d.future.letter.openedAt) S.d.future.letter.openedAt = Date.now();
    if (x.a && x.a.learned) S.d.journal.push({ id: uid(), ts: Date.now(), date: today(), type: "discovery", text: x.a.learned, mood: [] });
  }
  function finalHTML(x, pre) {
    const p = P(); const g = gains();
    const weeks = Math.max(1, Math.min(curDay(), 30) / 7);
    let h = `<h3>Then and now</h3><p class="small">Your experiment, start to finish.</p>`;
    if (p.motivation) h += `<p class="label" style="margin-top:16px">Why you started</p><p class="intention" style="font-size:21px">“${esc(p.motivation)}”</p>`;
    h += `<div class="stats" style="margin:18px calc(var(--pad) * -1)"><div class="stat"><div class="v num">${r1(baseline().weekStd)}</div><div class="l">standard drinks a week, before (your estimate)</div></div><div class="stat"><div class="v num">${r1(g.stdHad / weeks)}</div><div class="l">a week during, from what you logged</div></div><div class="stat"><div class="v num">${g.af}</div><div class="l">alcohol-free days logged</div></div><div class="stat"><div class="v num">${S.d.cravings.length}</div><div class="l">cravings examined</div></div></div>`;
    const bel = C.BELIEFS.filter((b) => (S.d.beliefs[b.id] || []).length);
    if (bel.length) h += `<p class="label">Beliefs, day one to now</p><div class="dumb">${bel.map((b) => { const f = firstBelief(b.id), l = lastBelief(b.id); return `<div class="r"><span class="s">${b.statement}</span><div class="line" aria-hidden="true"><span class="seg2" style="left:${Math.min(f, l)}%;width:${Math.abs(f - l)}%"></span><span class="a" style="left:${f}%"></span><span class="b" style="left:${l}%"></span></div><span class="vals">${f} → ${l}</span></div>`; }).join("")}</div><p class="small" style="margin-top:10px">Want to re-rate before you finish? Open the <a href="#beliefs">library</a> after this.</p>`;
    if (p.hopes && p.hopes.length) h += `<p class="label" style="margin-top:22px">What you hoped for</p>` + p.hopes.map((id) => `<div class="field"><span class="q">${labelOf(C.HOPES, id)}</span><div class="chips" role="radiogroup" aria-label="${esc(labelOf(C.HOPES, id))}">${[["yes", "Yes"], ["partly", "Partly"], ["notyet", "Not yet"], ["unsure", "Not sure"]].map(([v, l]) => `<button class="chip" role="radio" aria-checked="${x.hope && x.hope[id] === v}" data-chip="${pre}hope.${id}" data-v="${v}">${l}</button>`).join("")}</div></div>`).join("");
    if (p.concerns && p.concerns.length) h += ta(`${pre}a.worry`, x.a && x.a.worry, `You were worried about ${C.listJoin(p.concerns.map((c) => labelOf(C.CONCERNS, c).toLowerCase()))}. How did it actually go?`);
    h += ta(`${pre}a.learned`, x.a && x.a.learned, "The single most important thing you learned:", "");
    h += ta(`${pre}a.dayone`, x.a && x.a.dayone, "What would you say to yourself on day one?", "");
    h += opts(`${pre}next`, [["af", "Keep going alcohol-free", "We’ll extend your experiment to day 60."], ["rules", "Drink occasionally, with my own guidelines", "Set them on the next screen."], ["extend", "Extend before deciding", "We’ll extend to day 60."], ["later", "Decide later", "Keep journaling and checking in."]], x.next, "What’s next?");
    h += `<p class="small">${S.d.future.letter ? "When you finish, your letter will be waiting." : ""}</p>`;
    return h;
  }

  /* ---------------- flows: evening ---------------- */
  function eveningFlow(n) {
    const d = DAYS[n - 1]; const practice = n > 30; const dd = dayData(n); const isToday = n === curDay(); const date = isToday ? today() : dateOf(n);
    const logged = drinksOn(date); const ci = S.d.checkins[date] || {}; const ev = dd.evening || {};
    const qs = practice ? [C.PRACTICE[(n - 31 + 5) % C.PRACTICE.length], "What did you notice today?"] : d.evening;
    const st = { alc: S.d.status[date] || (logged.length ? "drank" : null), std: 2, before: "", mood: ci.eMood, energy: ci.eEnergy, conf: ci.conf, a: { ...(ev.answers || {}) }, disc: "", grat: "" };
    const drankLive = (s) => s.alc !== "drank" ? (s.alc === "af" ? `<p class="note" style="margin-top:8px">Noted. Another bloom in the garden.</p>` : "") : logged.length
      ? `<p class="note" style="margin-top:8px">You’ve already logged ${r1(logged.reduce((a, x) => a + x.std, 0))} standard drinks today. Thank you for being straight with yourself. Nothing resets.</p>`
      : `<p class="note" style="margin-top:8px">Thank you for being straight with yourself. That’s what makes this an experiment. Nothing resets.</p>${stepper("std", s.std, "Roughly how many standard drinks?", 0.5, 30, 0.5)}${ta("before", s.before, "What was happening just before?", "")}`;
    openFlow({
      title: `Evening, day ${n}`, state: st,
      steps: [
        { live: drankLive, liveOn: ["alc"], html: (s) => `<p class="kicker">Evening · ${isToday ? "today" : fmtShort(date)}</p><h2>How was ${isToday ? "today" : "that day"} with alcohol?</h2>${opts("alc", [["af", "Alcohol-free"], ["drank", "I had a drink"]], s.alc)}<div data-live>${drankLive(s)}</div>`, valid: (s) => (s.alc ? null : "Choose one. Either answer is useful.") },
        { skip: () => !isToday, html: (s) => `<p class="kicker">Check-in</p><h2>How are you ending the day?</h2>${scale("mood", s.mood, SC.mood, "Mood")}${scale("energy", s.energy, SC.energy, "Energy")}${scale("conf", s.conf, SC.conf, "How confident do you feel about tomorrow?")}` },
        { html: (s) => `<p class="kicker">Observations</p><h2>What did you notice?</h2>${qs.map((q, i) => ta(`a.${i}`, s.a[i], q, "", 3)).join("")}` },
        { html: (s) => `<p class="kicker">Keep one thing</p><h2>A discovery from today</h2><p class="small">Something you learned about yourself, alcohol or your day. One line is plenty. It goes into your journal.</p>${ta("disc", s.disc, "I discovered…", "That the 5:30 pull lasts about fifteen minutes", 2)}${ta("grat", s.grat, "Something you’re grateful for (optional)", "", 2)}` },
        { next: "Goodnight", html: () => practice || n >= 30 ? `<p class="kicker">That’s the day</p><h2>Well observed.</h2><p class="lede">${n >= 30 && !practice ? "Tomorrow there’s no new lesson. Just you, and whatever you decide next." : "Tomorrow: another check-in, another question."}</p>` : `<p class="kicker">Tomorrow · day ${n + 1}</p><h2>${DAYS[n].title}</h2><p class="lede">${DAYS[n].kicker}</p><p class="small" style="margin-top:20px">Sleep well. Rate how you slept in the morning check-in.</p>` },
      ],
      onDone: (s) => {
        S.d.status[date] = s.alc;
        if (s.alc === "drank" && !logged.length) S.d.drinks.push({ id: uid(), ts: Date.now(), date, std: s.std, spent: null, context: [], note: s.before, expect: "" });
        if (isToday) { const c = (S.d.checkins[date] = S.d.checkins[date] || {}); if (s.mood != null) c.eMood = s.mood; if (s.energy != null) c.eEnergy = s.energy; if (s.conf != null) c.conf = s.conf; }
        dd.evening = { done: true, ts: Date.now(), answers: s.a, alcohol: s.alc };
        if (s.disc.trim()) S.d.journal.push({ id: uid(), ts: Date.now(), date, type: "discovery", text: s.disc.trim(), mood: [] });
        if (s.grat.trim()) S.d.journal.push({ id: uid(), ts: Date.now(), date, type: "gratitude", text: s.grat.trim(), mood: [] });
        S.save(); toast("Reflection saved");
      },
    });
  }

  /* ---------------- flows: craving ---------------- */
  const IW = (v) => (v == null ? "" : v === 0 ? "Nothing" : v <= 2 ? "Faint" : v <= 4 ? "Noticeable" : v <= 6 ? "Strong" : v <= 8 ? "Very strong" : "Overwhelming");
  function cravingFlow() {
    const st = { trigger: null, before: 5, sens: [], need: null, alt: null, altText: "", after: null, outcome: null, note: "" };
    let saved = null;
    const altOptions = (s) => {
      const need = C.NEEDS.find((x) => x.id === s.need); const o = (need ? need.alts : []).map((a) => [a, a]);
      listsFor("relax").slice(0, 3).forEach((r) => r.item && o.push([r.item, r.item + " · your relax menu"]));
      listsFor("rewards").slice(0, 2).forEach((r) => r.item && o.push([r.item, r.item + " · your rewards"]));
      listsFor("ifthen").slice(0, 2).forEach((r) => r.then && o.push([r.then, `If ${r.if}, then ${r.then}`]));
      return o;
    };
    openFlow({
      title: "Craving support", state: st,
      steps: [
        { next: "Start", html: () => `<p class="kicker">Craving support</p><h2>Let’s look at it together.</h2><p class="lede">You don’t have to fight this or obey it. We’ll notice it, breathe with it for ninety seconds, and choose what to do next. About three minutes.</p>
          <p class="label" style="margin-top:28px">Or go straight to a tool</p><div class="options"><button class="option" data-act="tool" data-t="surf"><b>Just breathe</b><span>Ninety seconds of urge surfing</span></button><button class="option" data-act="tool" data-t="tape"><b>Play the tape forward</b><span>Tonight and tomorrow morning, in full</span></button><button class="option" data-act="tool" data-t="say"><b>What to say and what to drink</b><span>Lines, alternatives and your plans</span></button><button class="option" data-act="tool" data-t="talk"><b>Talk to someone</b><span>Support lines, 24/7</span></button></div>` },
        { html: (s) => `<p class="kicker">Notice</p><h2>What set it off?</h2>${chips("trigger", [...C.TRIGGERS, ["unsure", "Not sure"]], s.trigger, false)}`, valid: (s) => (s.trigger ? null : "Pick the closest, or ‘Not sure’.") },
        { liveOn: ["before"], live: (s) => `<p class="bignum num">${s.before}</p><p class="intensity-word">${IW(s.before)}</p>`, html: (s) => `<p class="kicker">Rate</p><h2>How strong is it, out of 10?</h2><div data-live><p class="bignum num">${s.before}</p><p class="intensity-word">${IW(s.before)}</p></div><input type="range" min="0" max="10" value="${s.before}" data-k="before" data-num="1" aria-label="Craving intensity, 0 to 10" style="--p:${s.before * 10}%"><div class="scale-ends" aria-hidden="true"><span>Barely there</span><span>Overwhelming</span></div>` },
        { html: (s) => `<p class="kicker">Observe</p><h2>Where do you feel it?</h2><p class="small">Notice without judging. Choose any that fit.</p>${chips("sens", C.SENSATIONS.map((x) => [x, x]), s.sens, true)}` },
        { html: (s) => `<p class="kicker">Underneath</p><h2>What do you actually need right now?</h2><div class="options" role="radiogroup">${C.NEEDS.map((x) => `<button class="option" role="radio" aria-checked="${s.need === x.id}" data-chip="need" data-v="${x.id}"><b>${x.label}</b><span>${x.hint}</span></button>`).join("")}</div>`, valid: (s) => (s.need ? null : "Pick the closest one.") },
        { theme: "moss", next: "Continue", html: () => surfHTML(), onEnter: (s, root) => startSurf(root, 90) },
        { html: (s) => `<p class="kicker">Choose</p><h2>Something that meets that need</h2>${opts("alt", altOptions(s).map(([a, b]) => [a, esc(b)]), s.alt)}${inp("altText", s.altText, "Or something else", "")}` },
        {
          liveOn: ["after"], live: (s) => `<p class="bignum num">${s.after == null ? "–" : s.after}</p><p class="intensity-word">${IW(s.after)}</p>`,
          html: (s) => `<p class="kicker">Reassess</p><h2>How strong is it now?</h2><p class="small">You started at ${s.before}.</p><div data-live><p class="bignum num">${s.after == null ? "–" : s.after}</p><p class="intensity-word">${IW(s.after)}</p></div><input type="range" min="0" max="10" value="${s.after == null ? s.before : s.after}" data-k="after" data-num="1" aria-label="Intensity now" style="--p:${(s.after == null ? s.before : s.after) * 10}%">${opts("outcome", [["passed", "It’s passed"], ["quieter", "It’s quieter"], ["still", "It’s still strong"], ["drank", "I’m going to have a drink"]], s.outcome, "Where are you at?")}`,
          valid: (s) => (s.outcome ? null : "Choose where you’re at. Any answer is fine."),
          onLeave: (s) => { if (s.after == null) s.after = s.before; saved = { id: uid(), ts: Date.now(), date: today(), trigger: s.trigger, before: s.before, sens: s.sens, need: s.need, alt: s.alt, altText: s.altText, after: s.after, outcome: s.outcome }; S.d.cravings.push(saved); S.save(); },
        },
        { next: "Close", noBack: true, html: (s) => {
          const n = S.d.cravings.length; const bk = n >= 4 ? mostCommon(S.d.cravings.map((c) => bucket(new Date(c.ts).getHours()))) : null;
          const msg = s.outcome === "drank" ? `<p class="lede">Thanks for being honest. If you do have a drink, try to stay curious: notice the first sip, how you feel an hour in, and tomorrow morning. Log it when you’re ready. Nothing resets.</p>${dayData(25).exercise && dayData(25).exercise.a && dayData(25).exercise.a.say ? `<p class="note clay">Your own words from day 25: “${esc(dayData(25).exercise.a.say)}”</p>` : ""}`
            : s.outcome === "still" ? `<p class="lede">It’s still here, and you’re still here. Try another round of breathing, or step outside. Cravings that feel permanent usually aren’t.</p>` : `<p class="lede">You watched a craving ${s.outcome === "passed" ? "pass" : "ease"}. That’s the whole skill, and it gets easier with practice.</p>`;
          return `<p class="kicker">Logged · ${fmtTime(Date.now())}</p><h2 class="num">${s.before} → ${s.after}</h2>${msg}${bk ? `<p class="note">Pattern so far: most of your cravings show up ${bk[0]}.</p>` : ""}<div class="row" style="margin-top:12px">${s.outcome === "still" ? `<button class="btn ghost" data-act="tool" data-t="surf">Breathe again</button>` : ""}${s.outcome === "drank" ? `<button class="btn ghost" data-act="drink">Log a drink</button>` : ""}</div>`;
        } },
      ],
    });
  }
  function surfHTML() { return `<p class="kicker">Urge surfing · 90 seconds</p><h2>Breathe with it.</h2><p class="small" style="max-width:36ch">In for four, out for six. Watch the urge rise and fall. You don’t need to do anything else.</p><div class="breath" aria-hidden="true"><div class="ring"></div><div class="orb"></div><div class="cue" data-cue>Breathe in slowly…</div></div><p class="sr" aria-live="polite" data-srcue></p><p class="small num" style="text-align:center;margin-top:56px" data-left>1:30 remaining</p><div class="row" style="justify-content:center;margin-top:8px"><button class="link" data-act="surf-more">Add 30 seconds</button></div>`; }
  function startSurf(root, secs) {
    let left = secs; let phase = 0; const box = $(".breath", root); const orb = $(".orb", root); const cue = $("[data-cue]", root); const l = $("[data-left]", root); const sr = $("[data-srcue]", root);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; let ci = 0;
    const breathe = () => { if (!orb) return; const inhale = phase % 2 === 0; box.classList.toggle("out", !inhale); if (!reduce) orb.style.transform = inhale ? "scale(2.1)" : "scale(1)"; phase++; const t = setTimeout(breathe, inhale ? 4000 : 6000); flow && flow.timers.push(t); };
    const t0 = setTimeout(breathe, 80); flow && flow.timers.push(t0);
    const tick = setInterval(() => {
      left--; if (l) l.textContent = left > 0 ? `${Math.floor(left / 60)}:${pad2(left % 60)} remaining` : "Done. Notice how it feels now.";
      if (left % 10 === 0 && left > 0) { ci = (ci + 1) % C.SURF_CUES.length; if (cue) cue.textContent = C.SURF_CUES[ci]; if (sr) sr.textContent = C.SURF_CUES[ci]; }
      if (left <= 0) { clearInterval(tick); if (cue) cue.textContent = "Well done."; }
    }, 1000);
    flow && flow.timers.push(tick);
    root._addSurf = () => { left += 30; };
  }
  function toolFlow(t) {
    if (t === "surf") return openFlow({ title: "Urge surfing", theme: "moss", steps: [{ next: "Done", html: surfHTML, onEnter: (s, r) => startSurf(r, 90) }] });
    if (t === "tape") return openFlow({ title: "Play the tape forward", state: {}, steps: [{ next: "Save to journal", html: (s) => `<p class="kicker">Play the tape forward</p><h2>Picture the whole film, not the trailer.</h2>${ta("a", s.a, "The first drink. How does it feel?", "")}${ta("b", s.b, "Two hours later. Where are you, how do you feel?", "")}${ta("c", s.c, "Tomorrow morning. What’s it like waking up?", "")}${ta("d", s.d, "And if you don’t drink tonight, what does tomorrow morning look like?", "")}` }],
      onDone: (s) => { const t = [["First drink", s.a], ["Two hours later", s.b], ["Tomorrow morning", s.c], ["If I don’t", s.d]].filter((x) => x[1] && x[1].trim()).map((x) => `${x[0]}: ${x[1].trim()}`).join("\n"); if (t) { S.d.journal.push({ id: uid(), ts: Date.now(), date: today(), type: "entry", text: "Played the tape forward.\n" + t, mood: [] }); S.save(); toast("Saved to your journal"); } } });
    if (t === "say") return openFlow({ title: "What to say", steps: [{ next: "Done", html: () => { const plans = listsFor("ifthen"); return `<p class="kicker">Ready-made</p><h2>What to say, and what to drink</h2><p class="label" style="margin-top:20px">Lines that work</p>${C.LINES.map((l) => `<p class="serif" style="font-size:20px;margin:0 0 8px">${l}</p>`).join("")}<p class="small">You don’t owe anyone a reason.</p><p class="label" style="margin-top:20px">Order this instead</p><ul>${C.DRINK_IDEAS.map((d) => `<li>${d}</li>`).join("")}</ul>${plans.length ? `<p class="label" style="margin-top:20px">Your if–then plans</p>${plans.map((p) => `<p><b>If</b> ${esc(p.if)}, <b>then</b> ${esc(p.then)}</p>`).join("")}` : `<p class="small">Day 17 helps you write your own if–then plans. They’ll appear here.</p>`}`; } }] });
    if (t === "talk") return openFlow({ title: "Talk to someone", steps: [{ next: "Done", html: () => `<p class="kicker">You don’t have to do this alone</p><h2>People who can help, now</h2>${C.RESOURCES.filter((r) => r.tel).slice(0, 6).map((r) => `<div class="res"><b>${r.name}</b><span class="small">${r.detail}</span><a class="tel num" href="tel:${r.tel.replace(/[^\d]/g, "")}">${r.tel}</a></div>`).join("")}<p class="small" style="margin-top:12px"><a href="#resources" data-act="flow-close">All support services</a></p>` }] });
  }

  /* ---------------- flows: drink, entry, letter ---------------- */
  function drinkFlow(date) {
    const b = baseline(); const st = { date: date || today(), std: 2, spent: null, context: [], note: "", expect: "" };
    const est = (s) => (b.costPerStd ? `Estimate from your usual spend: about ${money(s.std * b.costPerStd)}` : "Optional");
    openFlow({ title: "Log a drink", state: st, steps: [
      { next: "Save", liveOn: ["std"], live: (s) => `<p class="small">${est(s)}</p>`, html: (s) => `<p class="kicker">Log a drink</p><h2>Thanks for logging it.</h2><p class="small">This is data, not a verdict. Your progress stays exactly where it is.</p>
        ${chips("date", [[today(), "Today"], [addDays(today(), -1), "Yesterday"]].concat(s.date !== today() && s.date !== addDays(today(), -1) ? [[s.date, fmtShort(s.date)]] : []), s.date, false, "When?")}
        ${stepper("std", s.std, "Standard drinks, roughly", 0.5, 30, 0.5)}<p class="small" style="margin-top:-12px">Schooner of full-strength beer ≈ 1.6 · glass of wine (150 ml) ≈ 1.5 · nip of spirits = 1</p>
        ${inp("spent", s.spent, "Spent ($)", "", "number", 'data-num="1" inputmode="decimal" min="0"')}<div data-live><p class="small">${est(s)}</p></div>
        ${chips("context", ["Home", "Out", "With friends", "With partner", "Alone", "Work event", "Celebration", "After a hard day"].map((x) => [x, x]), s.context, true, "Context")}
        ${ta("note", s.note, "What was happening just before?", "")}${ta("expect", s.expect, "What did you expect it to do, and what did it actually do?", "I expected to relax. I did for about 20 minutes, then…")}` },
    ], onDone: (s) => {
      S.d.drinks.push({ id: uid(), ts: Date.now(), date: s.date, std: s.std, spent: s.spent, context: s.context, note: s.note, expect: s.expect }); S.d.status[s.date] = "drank"; S.save();
      const plan = dayData(25).exercise && dayData(25).exercise.a;
      dialog({ title: "Logged. Nothing resets.", body: `<p>One day with a drink doesn’t undo what you’ve learned. Every plant in your garden stays. Tomorrow is the next day of the experiment, the same as it would have been.</p>${plan && plan.say ? `<p class="note clay">Your words from day 25: “${esc(plan.say)}”</p>` : `<p class="small">Curious what led to it? The journal is a good place to think it through.</p>`}`, actions: [{ label: "Write about it", act: () => setTimeout(() => entryFlow(null, "What led to it, and what I noticed:\n"), 30) }, { label: "Done", primary: true }] });
    } });
  }
  function entryFlow(id, preset) {
    const ex = id ? S.d.journal.find((j) => j.id === id) : null;
    const st = ex ? { type: ex.type, text: ex.text, mood: (ex.mood || []).slice() } : { type: "entry", text: preset || "", mood: [] };
    const MOODS = ["Calm", "Clear", "Proud", "Hopeful", "Grateful", "Flat", "Anxious", "Tired", "Restless", "Sad"].map((x) => [x, x]);
    openFlow({ title: ex ? "Edit entry" : "New entry", state: st, steps: [{ next: "Save", html: (s) => `<p class="kicker">${ex ? fmtLong(ex.date) : fmtLong(today())}</p><h2>${ex ? "Edit entry" : "What’s on your mind?"}</h2>${chips("type", [["entry", "Entry"], ["discovery", "Discovery"], ["gratitude", "Gratitude"]], s.type, false)}${ta("text", s.text, "Write freely", "", 8)}${chips("mood", MOODS, s.mood, true, "Mood (optional)")}${ex ? `<button class="link quiet" data-act="entry-del" data-id="${ex.id}" style="color:var(--clay)">Delete this entry</button>` : ""}`, valid: (s) => (s.text.trim() ? null : "Write something first.") }],
      onDone: (s) => { if (ex) Object.assign(ex, { type: s.type, text: s.text.trim(), mood: s.mood }); else S.d.journal.push({ id: uid(), ts: Date.now(), date: today(), type: s.type, text: s.text.trim(), mood: s.mood }); S.save(); toast("Saved"); } });
  }
  function letterFlow() {
    openFlow({ title: "Letter to your future self", state: { text: "" }, steps: [{ next: "Seal it", html: (s) => `<p class="kicker">To the person finishing this</p><h2>Dear future me,</h2><p class="small">Some starting points: why you’re doing this; what you’re afraid of; what you hope they’ll have found out; what you want them to remember on a hard day.</p>${ta("text", s.text, "Your letter", "By the time you read this…", 12)}`, valid: (s) => (s.text.trim().length > 10 ? null : "Write a little more first.") }],
      onDone: (s) => { S.d.future.letter = { text: s.text.trim(), ts: Date.now(), openedAt: null }; S.save(); toast(curDay() >= 30 || S.d.next.finalAt ? "Letter saved" : "Sealed until day 30"); } });
  }

  /* ---------------- actions ---------------- */
  const ACT = {
    go: (b) => (location.hash = "#" + b.dataset.to),
    skip: () => $("#main").focus(),
    morning: (b) => morningFlow(+b.dataset.n), pmorning: (b) => practiceMorning(+b.dataset.n), evening: (b) => eveningFlow(+b.dataset.n),
    crave: () => cravingFlow(), drink: (b) => drinkFlow(b.dataset.date), entry: (b) => entryFlow(b.dataset.id),
    tool: (b) => toolFlow(b.dataset.t),
    "flow-next": () => flowNext(), "flow-back": () => flowBack(), "flow-close": () => closeFlow(),
    "surf-more": () => { const r = $("#flow"); r && r._addSurf && r._addSurf(); toast("Thirty more seconds"); },
    mark: (b) => { S.d.status[b.dataset.date] = b.dataset.v; S.save(); toast("Logged as alcohol-free"); render(); },
    unmark: (b) => { const d = b.dataset.date; dialog({ title: "Change this day?", body: `<p>This clears the log for ${fmtLong(d)} so you can record it again. Any drink records for that day stay in your journal.</p>`, actions: [{ label: "Cancel" }, { label: "Clear log", primary: true, act: () => { delete S.d.status[d]; S.save(); render(); } }] }); },
    "belief-save": (b) => { const id = b.dataset.id; const v = scopes.bel.obj.v; (S.d.beliefs[id] = S.d.beliefs[id] || []).push({ ts: Date.now(), date: today(), day: curDay() >= 1 ? curDay() : null, v }); S.save(); toast("Rating saved"); render(); },
    readahead: () => { S.d.settings.readAhead = !S.d.settings.readAhead; S.save(); render(); },
    theme: (b) => { S.d.settings.theme = b.dataset.v; S.save(); applyTheme(); render(); },
    setstart: () => (P().partial ? onboarding(true) : setStartFlow()),
    mode: () => { const p = P(); dialog({ title: "Experiment style", body: `<p class="small">You can switch at any time. Nothing you’ve recorded changes.</p>`, actions: [{ label: "Observe and cut back", primary: p.mode === "mindful", act: () => { p.mode = "mindful"; S.save(); render(); } }, { label: "Alcohol-free", primary: p.mode !== "mindful", act: () => { p.mode = "af"; S.save(); render(); } }] }); },
    "list-add": (b) => { const sc = scopeOf(b); const arr = getP(sc.obj, b.dataset.path) || []; arr.push({}); setP(sc.obj, b.dataset.path, arr); rerender(b); },
    "list-rm": (b) => { const sc = scopeOf(b); const arr = getP(sc.obj, b.dataset.path) || []; arr.splice(+b.dataset.i, 1); setP(sc.obj, b.dataset.path, arr); sc.change && sc.change(); rerender(b); },
    "list-ex": (b) => { const sc = scopeOf(b); const arr = (getP(sc.obj, b.dataset.path) || []).slice(); const empty = arr.findIndex((r) => !r || !Object.values(r).some((v) => String(v || "").trim())); const row = { [b.dataset.f]: b.dataset.v }; if (empty >= 0) arr[empty] = row; else arr.push(row); setP(sc.obj, b.dataset.path, arr); sc.change && sc.change(); rerender(b); },
    timer: (b) => { const box = b.closest("[data-timerbox]"); const out = $("[data-timer]", box); let left = +b.dataset.sec; b.disabled = true; b.textContent = "Savouring…"; const t = setInterval(() => { left--; out.textContent = left; if (left <= 0) { clearInterval(t); out.textContent = "✓"; b.textContent = "Done. Write what you noticed below."; } }, 1000); if (flow) flow.timers.push(t); },
    "keep-own": (b) => { const j = S.d.journal.find((x) => x.id === b.dataset.ref); if (j) { j.kept = !j.kept; S.save(); $("#tl").innerHTML = tlHTML(); } },
    "keep-ref": (b) => { const k = b.dataset.ref; S.d.kept[k] = !S.d.kept[k]; S.save(); $("#tl").innerHTML = tlHTML(); },
    "entry-del": (b) => { const id = b.dataset.id; dialog({ title: "Delete this entry?", body: "<p>This can’t be undone.</p>", actions: [{ label: "Cancel" }, { label: "Delete", primary: true, clay: true, act: () => { S.d.journal = S.d.journal.filter((j) => j.id !== id); S.save(); closeFlow(); toast("Deleted"); } }] }); },
    "drink-del": (b) => { const id = b.dataset.id; dialog({ title: "Delete this drink record?", body: "<p>The day stays logged as a day with a drink. Change it from the Days screen if needed.</p>", actions: [{ label: "Cancel" }, { label: "Delete", primary: true, clay: true, act: () => { S.d.drinks = S.d.drinks.filter((x) => x.id !== id); S.save(); render(); } }] }); },
    letter: () => { if (S.d.future.letter) dialog({ title: "Write a new letter?", body: "<p>Your current letter will be replaced.</p>", actions: [{ label: "Cancel" }, { label: "Write a new one", primary: true, act: () => setTimeout(letterFlow, 30) }] }); else letterFlow(); },
    "letter-open": () => dialog({ title: "Open your letter early?", body: "<p>It was meant for day 30, but it’s yours. You can open it whenever you like.</p>", actions: [{ label: "Keep it sealed" }, { label: "Open it", primary: true, act: () => { S.d.future.letter.openedAt = Date.now(); S.save(); render(); } }] }),
    motif: (b) => { reasonDraft.motif = +b.dataset.i; $$('[data-act="motif"]').forEach((x) => x.setAttribute("aria-checked", x === b)); },
    "reason-add": () => { const t = (reasonDraft.text || "").trim(); if (!t) return toast("Write a reason first"); S.d.future.reasons.push({ id: uid(), ts: Date.now(), text: t, motif: reasonDraft.motif }); reasonDraft.text = ""; reasonDraft.motif = (reasonDraft.motif + 1) % MOTIFS.length; S.save(); render(); },
    "reason-del": (b) => { S.d.future.reasons = S.d.future.reasons.filter((r) => r.id !== b.dataset.id); S.save(); render(); },
    extend: (b) => { S.d.next.extendedTo = +b.dataset.v; S.save(); toast(+b.dataset.v > 30 ? `Extended to day ${b.dataset.v}` : "Ends at day 30"); render(); },
    "goal-add": () => { const t = (goalDraft.text || "").trim(); if (!t) return toast("Write a goal first"); S.d.next.goals.push({ id: uid(), text: t, done: false, ts: Date.now() }); goalDraft.text = ""; S.save(); render(); },
    "goal-toggle": (b) => { const g = S.d.next.goals.find((x) => x.id === b.dataset.id); if (g) { g.done = !g.done; S.save(); render(); } },
    "goal-del": (b) => { S.d.next.goals = S.d.next.goals.filter((x) => x.id !== b.dataset.id); S.save(); render(); },
    print: () => { try { window.print(); } catch (e) { toast("Printing isn’t available here"); } },
    "report-dl": () => download(`clearing-report-${today()}.html`, "text/html", `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><title>Clearing report</title><style>body{font:16px/1.6 Georgia,serif;max-width:680px;margin:40px auto;padding:0 20px;color:#2a2019}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left}.r{text-align:right}.noprint{display:none}.small{color:#666;font-size:14px}</style></head><body>${$(".report").innerHTML}</body></html>`),
    "report-copy": () => copyText(reportText()),
    export: async () => { const data = clone(S.d); try { const all = await PhotoDB.all(); if (all && all.length) { toast("Packing your photos…"); data.photosData = await Promise.all(all.map(async (r) => ({ date: r.date, w: r.w, h: r.h, ts: r.ts, data: await blobToDataURL(r.blob) }))); } } catch (e) {} download(`clearing-data-${today()}.json`, "application/json", JSON.stringify(data)); },
    "cmp-mode": (b) => { photoCmp.mode = b.dataset.v; render(); },
    "cmp-a": (b) => { photoCmp.a = b.dataset.v; if (photoCmp.b === b.dataset.v) photoCmp.b = null; render(); },
    "cmp-b": (b) => { photoCmp.b = b.dataset.v; if (photoCmp.a === b.dataset.v) photoCmp.a = null; render(); },
    "photo-open": (b) => { const d = b.dataset.date; const day = S.d.photos[d] && S.d.photos[d].day;
      dialog({ title: `Day ${day || ""}`, body: `<img class="pbig" data-photo="${d}" alt="Your photo for day ${day}"><p class="small" style="margin:10px 0 0">${fmtLong(d)} · <label class="link" style="cursor:pointer">Replace${photoInput(d)}</label></p>`, actions: [
        { label: "Delete", act: () => { setTimeout(() => dialog({ title: "Delete this photo?", body: "<p>It will be removed from this device. This can’t be undone.</p>", actions: [{ label: "Cancel" }, { label: "Delete", primary: true, clay: true, act: async () => { try { await PhotoDB.del(d); } catch (e) {} delete S.d.photos[d]; forgetURL(d); S.save(); toast("Photo deleted"); render(); } }] }), 30); } },
        { label: "Compare from here", primary: true, act: () => { photoCmp.a = d; if (photoCmp.b === d) photoCmp.b = null; location.hash = "#photos"; render(); } }] });
      hydratePhotos($("#dlg")); },
    "export-copy": () => copyText(JSON.stringify(S.d)),
    ics: () => download("clearing-reminders.ics", "text/calendar", buildICS()),
    install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) {} deferredInstall = null; render(); },
    wipe: () => dialog({ title: "Delete everything?", body: `<p>This permanently removes your profile, journal, check-ins and records from this device. Consider downloading your data first.</p><div class="field"><label for="wipec">Type DELETE to confirm</label><input id="wipec" type="text" autocomplete="off"></div>`, actions: [{ label: "Cancel" }, { label: "Delete everything", primary: true, clay: true, act: (d) => { if ($("#wipec", d).value.trim().toUpperCase() !== "DELETE") { $("#wipec", d).focus(); toast("Type DELETE to confirm"); return false; } S.adapter.clear(); S.d = blank(); S.save(); S.adapter.clear(); S.d = blank(); PhotoDB.clear().catch(() => {}); urlCache.forEach((u) => URL.revokeObjectURL(u)); urlCache.clear(); toast("All data deleted"); location.hash = "#today"; render(); } }] }),
  };
  function rerender(b) { if (b.closest("#flow")) renderFlow(true); else { const y = window.scrollY; render(); window.scrollTo(0, y); } }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dlg]")) return;
    if (handleBind(e)) return;
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = ACT[b.dataset.act]; if (!a) return;
    if (b.tagName === "A" && b.dataset.act === "flow-close") { closeFlow(true); return; }
    e.preventDefault(); a(b);
  });
  document.addEventListener("change", (e) => {
    const el = e.target; const a = el.dataset && el.dataset.actChange; if (!a) return;
    if (a === "age" && flow) flow.state.age = el.checked;
    if (a === "photo" && el.files && el.files[0]) { savePhoto(el.dataset.date, el.files[0]); el.value = ""; return; }
    if (a === "import" && el.files && el.files[0]) {
      const f = el.files[0]; const r = new FileReader();
      r.onload = () => { let data; try { data = migrate(JSON.parse(r.result)); } catch (x) { data = null; } if (!data) { toast("That file doesn’t look like a Clearing backup"); return; } const photosData = data.photosData; delete data.photosData;
        dialog({ title: "Restore this backup?", body: `<p>This replaces everything currently on this device with the backup${data.profile && data.profile.name ? ` for ${esc(data.profile.name)}` : ""}.</p>`, actions: [{ label: "Cancel" }, { label: "Restore", primary: true, act: async () => { S.d = data; S.save(); if (photosData && photosData.length) { try { for (const p of photosData) { const blob = await (await fetch(p.data)).blob(); await PhotoDB.put({ date: p.date, blob, w: p.w, h: p.h, ts: p.ts }); forgetURL(p.date); } } catch (e) { toast("Some photos couldn’t be restored"); } } if (flow) closeFlow(true); toast("Backup restored"); location.hash = "#today"; render(); } }] }); };
      r.readAsText(f); el.value = "";
    }
  });
  // journal search/filter scope
  scopes.js = { obj: jState, change: () => { const t = $("#tl"); if (t) t.innerHTML = tlHTML(); } };
  // belief notes date stamping
  function buildICS() {
    const r = S.d.settings.reminders; const start = (P().startDate && P().startDate >= today() ? P().startDate : today()).replace(/-/g, "");
    const remaining = Math.max(1, maxDay() - Math.max(0, curDay() - 1));
    const ev = (t, title, desc) => { const hm = (t || "08:00").replace(":", ""); return ["BEGIN:VEVENT", `UID:${uid()}@clearing`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART:${start}T${hm}00`, "DURATION:PT10M", `RRULE:FREQ=DAILY;COUNT=${remaining}`, `SUMMARY:${title}`, `DESCRIPTION:${desc}`, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", `DESCRIPTION:${title}`, "END:VALARM", "END:VEVENT"].join("\r\n"); };
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Clearing//EN", "CALSCALE:GREGORIAN", ev(r.morning, "Clearing · morning", "Check in, set an intention and open today’s lesson."), ev(r.evening, "Clearing · evening reflection", "Mood, energy, what you noticed and one discovery."), "END:VCALENDAR"].join("\r\n");
  }

  /* ---------------- render & routing ---------------- */
  const NAV = [["today", "Today", ic.today], ["days", "Days", ic.days], ["beliefs", "Beliefs", ic.beliefs], ["journal", "Journal", ic.journal], ["insights", "Insights", ic.insights]];
  function route() { const h = (location.hash || "#today").slice(1); return h || "today"; }
  function render() {
    const r = route(); const main = $("#main"); const nav = $("#nav");
    const sect = r.startsWith("day-") ? "days" : r.startsWith("belief") ? "beliefs" : r === "future" ? "journal" : ["report", "photos"].includes(r) ? "insights" : r;
    nav.innerHTML = `<span class="brand">Clearing</span>` + NAV.map(([id, l, i]) => `<a href="#${id}" ${sect === id ? 'aria-current="page"' : ""}>${i}<span>${l}</span></a>`).join("") + `<a href="#you" class="wide" ${["you", "resources", "about"].includes(r) ? 'aria-current="page"' : ""}>${ic.user}<span>You</span></a>`;
    let html;
    if (r.startsWith("day-")) html = vDay(+r.slice(4));
    else if (r.startsWith("belief-")) html = vBelief(r.slice(7));
    else html = (VIEWS[r] || VIEWS.today)();
    main.innerHTML = html;
    drawCharts(); hydratePhotos(main);
    $(".crave-fab").hidden = (!P().startDate && !P().onboardedAt) || r === "today";
    if (!S.d.profile && !flow) onboarding();
  }
  let lastRoute = null;
  window.addEventListener("hashchange", () => { const r = route(); if (flow && !flow.def.noClose) closeFlow(true); render(); if (r !== lastRoute) { window.scrollTo(0, 0); $("#main").focus({ preventScroll: true }); } lastRoute = r; });
  // timestamp belief notes for the journal
  document.addEventListener("input", (e) => { const s = e.target.closest && e.target.closest('[data-scope^="bn"]'); if (s) { const n = scopes[s.dataset.scope].obj; n._date = today(); n._ts = Date.now(); } });

  /* theme */
  const hostTheme = document.documentElement.getAttribute("data-theme");
  function applyTheme() { const t = S.d.settings.theme; const root = document.documentElement; if (t === "auto") { if (hostTheme) root.setAttribute("data-theme", hostTheme); else root.removeAttribute("data-theme"); } else root.setAttribute("data-theme", t); const m = $('meta[name="theme-color"]'); if (m) m.setAttribute("content", getComputedStyle(root).getPropertyValue("--moss").trim() || "#f2c9cd"); }

  /* boot */
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; if (route() === "you") render(); });
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) { try { navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) {} }
  S.load(); applyTheme(); lastRoute = route(); render();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !flow) render(); });
  window.__clearing = { S, render, today, setToday: (d) => { try { d ? localStorage.setItem("clearing.debugToday", d) : localStorage.removeItem("clearing.debugToday"); } catch (e) {} render(); } };
})();

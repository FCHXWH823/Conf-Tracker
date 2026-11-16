(() => {
  "use strict";

  const SUBMIT = new Set(["abstract_deadline", "deadline"]);
  const CAT_ORDER = ["EDA", "Architecture", "AI"];
  const DAY = 864e5;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------------- state ----------------
  const state = { cat: "all", view: "list", topOnly: true, showEst: true, tz: "local", q: "" };
  try { Object.assign(state, JSON.parse(localStorage.getItem("conf-tracker") || "{}")); } catch (_) {}
  const params = new URLSearchParams(location.search);
  if (["list", "timeline"].includes(params.get("view"))) state.view = params.get("view");
  if (["all", ...["EDA", "Architecture", "AI"]].includes(params.get("cat"))) state.cat = params.get("cat");
  if (params.has("all")) state.topOnly = false;
  const save = () => { try { localStorage.setItem("conf-tracker", JSON.stringify({ ...state, q: "" })); } catch (_) {} };

  let confs = [];

  // ---------------- formatting ----------------
  function fmt(d, withTime = true) {
    const opt = { year: "numeric", month: "short", day: "numeric" };
    if (withTime) Object.assign(opt, { hour: "2-digit", minute: "2-digit", hour12: false });
    if (state.tz !== "local") opt.timeZone = state.tz;
    let s = new Intl.DateTimeFormat("en-US", opt).format(d);
    if (withTime) s += " " + tzName();
    return s;
  }
  function tzName() {
    return { "local": "local", "Etc/GMT+12": "AoE", "UTC": "UTC", "Asia/Shanghai": "UTC+8",
      "America/New_York": "ET", "America/Los_Angeles": "PT" }[state.tz] || state.tz;
  }
  function countdown(ms) {
    if (ms <= 0) return "passed";
    const d = Math.floor(ms / DAY);
    const h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    const p = (n) => String(n).padStart(2, "0");
    return `${d}<small>d</small> ${p(h)}:${p(m)}:${p(s)}`;
  }

  // ---------------- data ----------------
  function prepare(raw) {
    const now = Date.now();
    return raw.map((c) => {
      const ms = c.milestones.map((m) => ({ ...m, t: new Date(m.time) }));
      const next = ms.find((m) => SUBMIT.has(m.key) && m.t > now) || null;
      return {
        ...c, ms, next,
        estimated: c.status === "estimated",
        evStart: c.event_start ? new Date(c.event_start + "T00:00:00Z") : null,
        evEnd: c.event_end ? new Date(c.event_end + "T23:59:59Z") : null,
      };
    });
  }

  function visible() {
    const q = state.q.trim().toLowerCase();
    return confs
      .filter((c) => state.cat === "all" || c.category === state.cat)
      .filter((c) => !state.topOnly || c.tier === "top")
      .filter((c) => state.showEst || !c.estimated)
      .filter((c) => !q || `${c.title} ${c.description} ${c.place} ${c.category}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (!a.next !== !b.next) return a.next ? -1 : 1;
        if (a.next && b.next) return a.next.t - b.next.t;
        return CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category) || a.title.localeCompare(b.title);
      });
  }

  // ---------------- list view ----------------
  function card(c) {
    const now = Date.now();
    const rank = Object.entries(c.rank || {}).filter(([, v]) => v && v !== "N")
      .map(([k, v]) => `<span class="badge">${esc(k.toUpperCase())} ${esc(v)}</span>`).join("");
    const est = c.estimated ? `<span class="badge est" title="Projected from last year's dates; not announced yet">estimated</span>` : "";
    const prev = c.prev_link ? ` <a class="badge" href="${esc(c.prev_link)}" target="_blank" rel="noopener">${esc(c.prev_year)} site ↗</a>` : "";
    const title = c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener">${esc(c.title)} ${esc(c.year ?? "")}</a>` : `${esc(c.title)} ${esc(c.year ?? "")}`;

    const meta = [];
    if (c.date && c.date !== "TBD") meta.push(`<div><span>When</span> ${esc(c.date)}</div>`);
    if (c.place && c.place !== "TBD") meta.push(`<div><span>Where</span> ${esc(c.place)}</div>`);
    const last = c.history && c.history[c.history.length - 1];
    if (last && last.deadline) meta.push(`<div><span>${esc(last.year)} edition deadline</span> ${fmt(new Date(last.deadline), false)}</div>`);

    const msHtml = c.ms.map((m) => {
      const cls = m.t < now ? "done" : (c.next && m === c.next ? "next" : "");
      return `<span class="${cls}" title="${esc(m.comment || "")}">${esc(m.label)}: ${fmt(m.t, false)}</span>`;
    }).join("");

    let right;
    if (c.next) {
      const left = c.next.t - now;
      const cls = left < 7 * DAY ? "urgent" : left < 30 * DAY ? "soon" : "";
      right = `<div class="count ${cls}" data-t="${c.next.t.getTime()}">${countdown(left)}</div>
        <div class="when">${esc(c.next.label)} · ${fmt(c.next.t)}</div>
        <div class="when">official: ${esc(c.timezone)}</div>`;
    } else {
      right = `<div class="count"><small>Deadline TBA</small></div>`;
    }

    return `<article class="card ${c.next ? "" : "passed"}" data-cat="${esc(c.category)}">
      <div>
        <div class="name"><h2>${title}</h2><span class="badge cat">${esc(c.category)}</span>${rank}${est}${prev}</div>
        <div class="desc">${esc(c.description)}</div>
        ${meta.length ? `<div class="meta">${meta.join("")}</div>` : ""}
        ${msHtml ? `<div class="ms">${msHtml}</div>` : ""}
      </div>
      <div class="right">${right}</div>
    </article>`;
  }

  function renderList(list) {
    $("#list").innerHTML = list.map(card).join("");
  }

  function tick() {
    const now = Date.now();
    document.querySelectorAll(".count[data-t]").forEach((el) => {
      const left = +el.dataset.t - now;
      el.innerHTML = countdown(left);
      el.classList.toggle("urgent", left < 7 * DAY);
      el.classList.toggle("soon", left >= 7 * DAY && left < 30 * DAY);
    });
  }

  // ---------------- timeline view ----------------
  function renderTimeline(list) {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 13, 1));
    const span = end - start;
    const pos = (d) => ((d - start) / span) * 100;
    const inRange = (d) => d >= start && d <= end;

    let months = "", grid = "";
    for (let i = 0; i < 13; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const label = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }) + (d.getUTCMonth() === 0 || i === 0 ? ` ’${String(d.getUTCFullYear()).slice(2)}` : "");
      months += `<span style="left:${pos(d)}%">${label}</span>`;
      grid += `<div class="tl-grid" style="left:${pos(d)}%"></div>`;
    }
    const today = `<div class="tl-today" style="left:${pos(now)}%" title="Today"></div>`;

    const sorted = [...list].sort((a, b) =>
      CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category) ||
      ((a.next?.t ?? Infinity) - (b.next?.t ?? Infinity)));

    const rows = sorted.map((c) => {
      let marks = "";
      if (c.evStart && c.evEnd && c.evEnd >= start && c.evStart <= end) {
        const l = Math.max(0, pos(c.evStart)), r = Math.min(100, pos(c.evEnd));
        marks += `<div class="ev" style="left:${l}%;width:${r - l}%" title="${esc(c.title)} ${esc(c.year)} conference: ${esc(c.date)}${c.place ? " · " + esc(c.place) : ""}"></div>`;
      }
      for (const m of c.ms) {
        if (!inRange(m.t)) continue;
        const kind = m.key === "abstract_deadline" ? "abs" : m.key === "deadline" ? "" : "note";
        marks += `<div class="mk ${kind} ${m.estimated ? "est" : ""}" style="left:${pos(m.t)}%" title="${esc(c.title)} ${esc(c.year)} · ${esc(m.label)}${m.estimated ? " (estimated)" : ""}: ${fmt(m.t)}"></div>`;
      }
      return `<div class="tl-row" data-cat="${esc(c.category)}">
        <div class="tl-label"><i></i>${esc(c.title)}</div>
        <div class="tl-track">${grid}${today}${marks}</div>
      </div>`;
    }).join("");

    $("#timeline").innerHTML = `<div class="tl">
      <div class="tl-head"><div></div><div class="tl-months">${months}</div></div>
      ${rows}
      <div class="legend">
        <span><b class="mk abs"></b>Abstract</span>
        <span><b class="mk"></b>Paper</span>
        <span><b class="mk note"></b>Rebuttal / notification</span>
        <span><b class="mk est"></b>Estimated</span>
        <span><b class="ev" style="position:static;display:inline-block;width:22px;--c:var(--muted)"></b>Conference</span>
        <span><b style="border-left:2px solid var(--urgent);height:12px"></b>Today</span>
      </div>
    </div>`;
  }

  // ---------------- wiring ----------------
  function render() {
    const list = visible();
    $("#empty").hidden = list.length > 0;
    $("#list").hidden = state.view !== "list";
    $("#timeline").hidden = state.view !== "timeline" || !list.length;
    if (state.view === "list") renderList(list); else renderTimeline(list);
  }

  function syncControls() {
    document.querySelectorAll("#cat-filter button").forEach((b) => b.classList.toggle("on", b.dataset.cat === state.cat));
    document.querySelectorAll("#view-switch button").forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
    $("#top-only").checked = state.topOnly;
    $("#show-est").checked = state.showEst;
    $("#tz").value = state.tz;
    if ($("#tz").value !== state.tz) { state.tz = "local"; $("#tz").value = "local"; }
  }

  function bind() {
    $("#cat-filter").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { state.cat = b.dataset.cat; update(); } });
    $("#view-switch").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { state.view = b.dataset.view; update(); } });
    $("#top-only").addEventListener("change", (e) => { state.topOnly = e.target.checked; update(); });
    $("#show-est").addEventListener("change", (e) => { state.showEst = e.target.checked; update(); });
    $("#tz").addEventListener("change", (e) => { state.tz = e.target.value; update(); });
    $("#q").addEventListener("input", (e) => { state.q = e.target.value; render(); });
  }
  function update() { save(); syncControls(); render(); }

  function repoLink() {
    const m = location.hostname.match(/^([^.]+)\.github\.io$/);
    if (!m) return;
    const repo = location.pathname.split("/").filter(Boolean)[0] || `${m[1]}.github.io`;
    const a = $("#repo-link");
    a.href = `https://github.com/${m[1]}/${repo}`;
    a.hidden = false;
    $("#ics-link").title = `Subscribe: ${new URL("deadlines.ics", location.href).href}`;
  }

  async function init() {
    syncControls();
    bind();
    repoLink();
    try {
      const r = await fetch(`data/conferences.json?v=${Math.floor(Date.now() / 36e5)}`);
      const data = await r.json();
      confs = prepare(data.conferences);
      $("#updated").textContent = `Data changed ${new Date(data.updated_at).toLocaleString()}`;
    } catch (e) {
      $("#empty").hidden = false;
      $("#empty").textContent = "Could not load data/conferences.json.";
      return;
    }
    render();
    setInterval(tick, 1000);
    // Re-evaluate "next deadline" when one passes while the page is open.
    setInterval(() => { confs = prepare(confs.map(({ ms, next, ...c }) => c)); render(); }, 60e3);
  }

  init();
})();

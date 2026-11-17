(() => {
  "use strict";

  const SUBMISSION = new Set(["abstract_deadline", "deadline"]);
  const AREA_ORDER = ["EDA", "Architecture", "AI"];
  const AREA = {
    EDA: { title: "电子设计自动化", icon: "EDA", desc: "芯片设计、验证、物理实现与设计自动化" },
    Architecture: { title: "计算机体系结构", icon: "ARCH", desc: "处理器、存储、并行系统与软硬件协同" },
    AI: { title: "人工智能", icon: "AI", desc: "机器学习、视觉、语言与数据挖掘" },
  };
  const DAY = 86_400_000;
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  const state = { cat: "all", view: "list", topOnly: true, showEst: true, tz: "local", q: "" };
  try { Object.assign(state, JSON.parse(localStorage.getItem("conf-radar") || "{}")); } catch (_) { /* private mode */ }
  const params = new URLSearchParams(location.search);
  if (["list", "timeline"].includes(params.get("view"))) state.view = params.get("view");
  if (["all", ...AREA_ORDER].includes(params.get("cat"))) state.cat = params.get("cat");
  if (params.get("tier") === "all") state.topOnly = false;

  let conferences = [];
  let rawConferences = [];
  let updatedAt = null;

  function saveState() {
    try { localStorage.setItem("conf-radar", JSON.stringify({ ...state, q: "" })); } catch (_) { /* private mode */ }
    const query = new URLSearchParams();
    if (state.cat !== "all") query.set("cat", state.cat);
    if (state.view !== "list") query.set("view", state.view);
    if (!state.topOnly) query.set("tier", "all");
    history.replaceState(null, "", `${location.pathname}${query.size ? `?${query}` : ""}${location.hash}`);
  }

  function timezoneName() {
    return {
      local: "本地时间", "Etc/GMT+12": "AoE", UTC: "UTC", "Asia/Shanghai": "北京时间",
      "America/New_York": "美东时间", "America/Los_Angeles": "美西时间",
    }[state.tz] || state.tz;
  }

  function formatDate(date, withTime = true) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    if (withTime) Object.assign(options, { hour: "2-digit", minute: "2-digit", hour12: false });
    if (state.tz !== "local") options.timeZone = state.tz;
    const formatted = new Intl.DateTimeFormat("zh-CN", options).format(date);
    return withTime ? `${formatted} · ${timezoneName()}` : formatted;
  }

  function countdownMarkup(ms) {
    if (ms <= 0) return "已截止";
    const days = Math.floor(ms / DAY);
    const hours = Math.floor(ms / 3_600_000) % 24;
    const minutes = Math.floor(ms / 60_000) % 60;
    const seconds = Math.floor(ms / 1_000) % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${days}<small>d</small> ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function shortAge(date) {
    const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY));
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 30) return `${days} 天前`;
    return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(date);
  }

  function prepare(records) {
    const now = Date.now();
    return records.map((conference) => {
      const milestones = (conference.milestones || []).map((item) => ({ ...item, t: new Date(item.time) }));
      const next = milestones.find((item) => SUBMISSION.has(item.key) && item.t.getTime() > now) || null;
      return {
        ...conference,
        ms: milestones,
        next,
        estimated: conference.status === "estimated",
        evStart: conference.event_start ? new Date(`${conference.event_start}T00:00:00Z`) : null,
        evEnd: conference.event_end ? new Date(`${conference.event_end}T23:59:59Z`) : null,
      };
    });
  }

  function visibleConferences() {
    const query = state.q.trim().toLowerCase();
    return conferences
      .filter((conference) => state.cat === "all" || conference.category === state.cat)
      .filter((conference) => !state.topOnly || conference.tier === "top")
      .filter((conference) => state.showEst || !conference.estimated)
      .filter((conference) => !query || [conference.title, conference.description, conference.place, conference.category]
        .join(" ").toLowerCase().includes(query))
      .sort((a, b) => {
        if (Boolean(a.next) !== Boolean(b.next)) return a.next ? -1 : 1;
        if (a.next && b.next) return a.next.t - b.next.t;
        return AREA_ORDER.indexOf(a.category) - AREA_ORDER.indexOf(b.category) || a.title.localeCompare(b.title);
      });
  }

  function rankTags(conference) {
    return Object.entries(conference.rank || {})
      .filter(([, value]) => value && value !== "N")
      .map(([name, value]) => `<span class="tag">${esc(name)} ${esc(value)}</span>`).join("");
  }

  function statusTag(conference) {
    if (conference.estimated) {
      const from = conference.estimated_from_year ? ` · 参考 ${conference.estimated_from_year}` : "";
      return `<span class="tag estimate" title="会议尚未公布完整 CFP，日期由往届节奏推算">估算${esc(from)}</span>`;
    }
    if (conference.status === "open") return `<span class="tag official">已公布</span>`;
    return `<span class="tag">待公布</span>`;
  }

  function conferenceCard(conference) {
    const now = Date.now();
    const officialUrl = conference.link || conference.prev_link;
    const title = officialUrl
      ? `<a href="${esc(officialUrl)}" target="_blank" rel="noopener">${esc(conference.title)} ${esc(conference.year || "")}</a>`
      : `${esc(conference.title)} ${esc(conference.year || "")}`;
    const facts = [];
    if (conference.date && conference.date !== "TBD") facts.push(`<span><b>会议</b>${esc(conference.date)}</span>`);
    if (conference.place && conference.place !== "TBD") facts.push(`<span><b>地点</b>${esc(conference.place)}</span>`);
    facts.push(`<span><b>截止时区</b>${esc(conference.timezone)}</span>`);

    const milestones = conference.ms.slice(0, 8).map((milestone) => {
      const css = milestone.t.getTime() < now ? "past" : conference.next === milestone ? "next" : "";
      const estimate = milestone.estimated ? " · 估" : "";
      return `<li class="${css}" title="${esc(milestone.comment || "")}">${esc(milestone.label)} · ${esc(formatDate(milestone.t, false))}${estimate}</li>`;
    }).join("");

    let deadline;
    if (conference.next) {
      const remaining = conference.next.t.getTime() - now;
      const urgency = remaining < 7 * DAY ? "urgent" : remaining < 30 * DAY ? "soon" : "";
      deadline = `<div class="deadline-label">NEXT · ${esc(conference.next.label)}</div>
        <div class="card-countdown ${urgency}" data-t="${conference.next.t.getTime()}">${countdownMarkup(remaining)}</div>
        <div class="deadline-time">${esc(formatDate(conference.next.t))}</div>`;
    } else {
      deadline = `<div class="deadline-label">NEXT DEADLINE</div><div class="tba">等待官方公布 TBA</div>`;
    }
    const officialLink = officialUrl
      ? `<a class="official-link" href="${esc(officialUrl)}" target="_blank" rel="noopener">前往会议官网 ↗</a>` : "";

    return `<article class="conf-card" id="conf-${esc(conference.id)}" data-cat="${esc(conference.category)}">
      <div class="conf-main">
        <div class="conf-heading"><h3>${title}</h3><span class="tag area">${esc(conference.category)}</span>${rankTags(conference)}${statusTag(conference)}</div>
        <p class="conf-desc">${esc(conference.description)}</p>
        <div class="facts">${facts.join("")}</div>
        ${milestones ? `<ul class="milestones">${milestones}</ul>` : ""}
      </div>
      <div class="conf-deadline">${deadline}${officialLink}</div>
    </article>`;
  }

  function renderList(list) {
    $("#list").innerHTML = list.map(conferenceCard).join("");
  }

  function renderTimeline(list) {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 13, 1));
    const span = end - start;
    const position = (date) => ((date - start) / span) * 100;
    const inRange = (date) => date >= start && date <= end;
    let months = "";
    let grid = "";
    for (let index = 0; index < 13; index += 1) {
      const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
      const label = new Intl.DateTimeFormat("zh-CN", { month: "short", year: date.getUTCMonth() === 0 || index === 0 ? "2-digit" : undefined, timeZone: "UTC" }).format(date);
      months += `<span style="left:${position(date)}%">${esc(label)}</span>`;
      grid += `<i class="tl-grid" style="left:${position(date)}%"></i>`;
    }
    const today = inRange(now) ? `<i class="tl-today" style="left:${position(now)}%" title="今天"></i>` : "";
    const rows = [...list].sort((a, b) => AREA_ORDER.indexOf(a.category) - AREA_ORDER.indexOf(b.category)
      || ((a.next?.t ?? Infinity) - (b.next?.t ?? Infinity))).map((conference) => {
      let marks = "";
      if (conference.evStart && conference.evEnd && conference.evEnd >= start && conference.evStart <= end) {
        const left = Math.max(0, position(conference.evStart));
        const right = Math.min(100, position(conference.evEnd));
        marks += `<i class="ev" style="left:${left}%;width:${Math.max(.5, right - left)}%" title="${esc(conference.title)} ${esc(conference.year)} · ${esc(conference.date || "会议日期")}"></i>`;
      }
      conference.ms.forEach((milestone) => {
        if (!inRange(milestone.t)) return;
        const kind = milestone.key === "abstract_deadline" ? "abs" : milestone.key === "deadline" ? "" : "note";
        marks += `<i class="mk ${kind} ${milestone.estimated ? "est" : ""}" style="left:${position(milestone.t)}%" title="${esc(conference.title)} ${esc(conference.year)} · ${esc(milestone.label)}${milestone.estimated ? "（估算）" : ""} · ${esc(formatDate(milestone.t))}"></i>`;
      });
      const label = conference.link
        ? `<a href="${esc(conference.link)}" target="_blank" rel="noopener">${esc(conference.title)}</a>`
        : esc(conference.title);
      return `<div class="tl-row" data-cat="${esc(conference.category)}"><div class="tl-label"><i></i>${label}</div><div class="tl-track">${grid}${today}${marks}</div></div>`;
    }).join("");

    $("#timeline").innerHTML = `<div class="tl">
      <div class="tl-head"><div class="tl-corner">13 MONTHS</div><div class="tl-months">${months}</div></div>
      ${rows}
      <div class="legend"><span><b class="mk abs"></b>摘要</span><span><b class="mk"></b>论文</span><span><b class="mk note"></b>Rebuttal / 结果</span><span><b class="mk est"></b>估算</span><span><b class="ev"></b>会议日期</span><span><b class="today-key"></b>今天</span></div>
    </div>`;
  }

  function renderHero() {
    const next = conferences.filter((conference) => conference.tier === "top" && conference.next)
      .sort((a, b) => a.next.t - b.next.t)[0];
    $("#stat-tracked").textContent = conferences.length;
    $("#stat-open").textContent = conferences.filter((conference) => conference.status === "open").length;
    $("#stat-estimated").textContent = conferences.filter((conference) => conference.estimated).length;
    $("#stat-updated").textContent = updatedAt ? shortAge(updatedAt) : "—";
    if (!next) return;
    $("#hero-next-area").textContent = `${AREA[next.category].title} · ${next.next.label}${next.estimated ? " · 估算" : ""}`;
    $("#hero-next-name").textContent = `${next.title} ${next.year || ""}`;
    $("#hero-next-time").textContent = formatDate(next.next.t);
    $("#hero-countdown").dataset.t = next.next.t.getTime();
    $("#hero-countdown").innerHTML = countdownMarkup(next.next.t.getTime() - Date.now());
    $("#hero-next-link").href = `#conf-${next.id}`;
  }

  function renderAreas() {
    $("#area-grid").innerHTML = AREA_ORDER.map((category) => {
      const all = conferences.filter((conference) => conference.category === category);
      const top = all.filter((conference) => conference.tier === "top");
      const next = top.filter((conference) => conference.next).sort((a, b) => a.next.t - b.next.t)[0];
      const nextText = next ? `最近：${next.title} · ${Math.max(0, Math.ceil((next.next.t - Date.now()) / DAY))} 天` : "截止日期待公布";
      return `<button type="button" class="area-card" data-cat="${esc(category)}">
        <span class="area-card-top"><span class="area-icon">${AREA[category].icon}</span><span class="area-count">${top.length} TOP · ${all.length} TOTAL</span></span>
        <h3>${AREA[category].title}</h3><p>${AREA[category].desc}</p><span class="area-next"><i></i>${esc(nextText)}</span>
      </button>`;
    }).join("");
  }

  function tick() {
    const now = Date.now();
    document.querySelectorAll("[data-t]").forEach((element) => {
      const remaining = Number(element.dataset.t) - now;
      element.innerHTML = countdownMarkup(remaining);
      if (element.classList.contains("card-countdown")) {
        element.classList.toggle("urgent", remaining < 7 * DAY);
        element.classList.toggle("soon", remaining >= 7 * DAY && remaining < 30 * DAY);
      }
    });
  }

  function render() {
    const list = visibleConferences();
    $("#results-summary").textContent = `显示 ${list.length} / ${conferences.length} 场会议`;
    $("#empty").hidden = list.length > 0;
    $("#list").hidden = state.view !== "list" || !list.length;
    $("#timeline").hidden = state.view !== "timeline" || !list.length;
    if (state.view === "list") renderList(list); else renderTimeline(list);
  }

  function syncControls() {
    document.querySelectorAll("#cat-filter button").forEach((button) => {
      const active = button.dataset.cat === state.cat;
      button.classList.toggle("on", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("#view-switch button").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("on", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $("#top-only").checked = state.topOnly;
    $("#show-est").checked = state.showEst;
    $("#tz").value = state.tz;
    if ($("#tz").value !== state.tz) { state.tz = "local"; $("#tz").value = "local"; }
  }

  function update() {
    saveState();
    syncControls();
    render();
    renderHero();
  }

  function bind() {
    $("#cat-filter").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-cat]");
      if (button) { state.cat = button.dataset.cat; update(); }
    });
    $("#view-switch").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-view]");
      if (button) { state.view = button.dataset.view; update(); }
    });
    $("#top-only").addEventListener("change", (event) => { state.topOnly = event.target.checked; update(); });
    $("#show-est").addEventListener("change", (event) => { state.showEst = event.target.checked; update(); });
    $("#tz").addEventListener("change", (event) => { state.tz = event.target.value; update(); });
    $("#q").addEventListener("input", (event) => { state.q = event.target.value; render(); });
    $("#area-grid").addEventListener("click", (event) => {
      const card = event.target.closest("button[data-cat]");
      if (!card) return;
      state.cat = card.dataset.cat;
      update();
      $("#tracker").scrollIntoView({ behavior: "smooth" });
    });
  }

  function configureRepoLink() {
    const match = location.hostname.match(/^([^.]+)\.github\.io$/);
    if (!match) return;
    const repository = location.pathname.split("/").filter(Boolean)[0] || `${match[1]}.github.io`;
    const link = $("#repo-link");
    link.href = `https://github.com/${match[1]}/${repository}`;
    link.hidden = false;
    $("#ics-link").title = `订阅地址：${new URL("deadlines.ics", location.href).href}`;
  }

  async function init() {
    $("#year").textContent = new Date().getFullYear();
    syncControls();
    bind();
    configureRepoLink();
    try {
      const response = await fetch(`data/conferences.json?v=${Math.floor(Date.now() / 3_600_000)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      rawConferences = data.conferences || [];
      conferences = prepare(rawConferences);
      updatedAt = data.updated_at ? new Date(data.updated_at) : null;
      $("#updated").textContent = updatedAt ? `数据变更于 ${formatDate(updatedAt)}` : "数据更新时间未知";
    } catch (error) {
      $("#results-summary").textContent = "数据载入失败";
      $("#empty").hidden = false;
      $("#empty").innerHTML = `<div><strong>无法读取会议数据</strong><span>${esc(error.message)}</span></div>`;
      return;
    }
    renderHero();
    renderAreas();
    render();
    setInterval(tick, 1_000);
    setInterval(() => { conferences = prepare(rawConferences); render(); renderHero(); }, 60_000);
  }

  init();
})();

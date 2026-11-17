(() => {
  "use strict";

  const SUBMISSION = new Set(["abstract_deadline", "deadline"]);
  const AREA_ORDER = ["EDA", "Architecture", "AI"];
  const AREA = {
    EDA: {
      icon: "EDA",
      zh: { title: "电子设计自动化", desc: "芯片设计、验证、物理实现与设计自动化" },
      en: { title: "Electronic Design Automation", desc: "Chip design, verification, physical implementation, and design automation" },
    },
    Architecture: {
      icon: "ARCH",
      zh: { title: "计算机体系结构", desc: "处理器、存储、并行系统与软硬件协同" },
      en: { title: "Computer Architecture", desc: "Processors, memory, parallel systems, and hardware–software co-design" },
    },
    AI: {
      icon: "AI",
      zh: { title: "人工智能", desc: "机器学习、视觉、语言与数据挖掘" },
      en: { title: "Artificial Intelligence", desc: "Machine learning, vision, language, and data mining" },
    },
  };

  const I18N = {
    zh: {
      page_title: "Conf Radar — EDA · Architecture · AI 顶会时间线",
      page_description: "自动更新 EDA、计算机体系结构与 AI 顶级会议的投稿截止日期、倒计时和会议时间线。",
      skip: "跳到会议列表", brand_home: "Conf Radar 首页", main_nav: "主导航",
      nav_areas: "关注领域", nav_tracker: "会议雷达", nav_method: "数据说明",
      hero_eyebrow: '<span class="live-dot"></span> RESEARCH DEADLINE RADAR · 每 12 小时更新',
      hero_title: "把下一场顶会，<br><em>放进时间线。</em>",
      hero_intro: "聚合 EDA、计算机体系结构和 AI 领域的重要会议。一个页面查看投稿节点、官方链接、倒计时与未来 13 个月日程。",
      hero_all: "查看全部会议 <span>↓</span>", hero_calendar: "订阅日历 .ics",
      calendar_title: "订阅到 Google / Apple / Outlook Calendar", calendar_address: "订阅地址：{url}",
      next_aria: "最近的顶会截止日期", loading: "正在读取数据", hero_details: "查看会议详情 <span>↗</span>",
      stats_aria: "追踪概览", stat_tracked: "TRACKED<br>追踪会议", stat_announced: "ANNOUNCED<br>已公布日期",
      stat_forecast: "FORECAST<br>基于往届估算", stat_changed: "DATA CHANGE<br>最近数据变更",
      areas_title: "三个研究方向，一张雷达图", areas_intro: "默认聚焦领域内顶级会议，也可展开查看值得关注的专业会议。",
      tracker_title: "会议时间线", loading_conferences: "正在载入会议…", filters_aria: "会议筛选器", areas_aria: "研究领域",
      all: "全部", architecture: "体系结构", view_aria: "显示方式", list: "列表", timeline: "时间线",
      list_title: "卡片视图", timeline_title: "时间线视图", search_placeholder: "搜索会议、地点或关键词", search_aria: "搜索会议",
      top_only: "仅顶会", show_est: "显示估算", timezone: "时区", timezone_aria: "显示时区",
      tz_local: "本地时间", tz_beijing: "北京时间", tz_eastern: "美东时间", tz_pacific: "美西时间",
      conference_list: "会议列表", timeline_aria: "未来 13 个月时间线",
      empty_title: "没有匹配的会议", empty_desc: "试试清除搜索词或展开“值得关注”的会议。",
      method_title: "自动同步，但不假装确定。", method_sync: "同步",
      method_sync_desc: "GitHub Actions 每 12 小时从社区维护的数据集拉取一次最新会议信息。",
      method_calibrate: "校准", method_calibrate_desc: "规范时区和轮次；双年会按真实周期推演，官网 TBA 与历史估算分开标记。",
      method_publish: "发布", method_publish_desc: "数据变化后自动更新 GitHub Pages、README 表格和可订阅的日历。",
      source_note: '数据来源：<a href="https://github.com/ccfddl/ccf-deadlines" target="_blank" rel="noopener">ccfddl/ccf-deadlines ↗</a> 与仓库内人工校准。提交前请始终以会议官网 CFP 为准。',
      waiting_data: "等待数据", footer_tagline: "为提前规划的研究者而建。",
      local_time: "本地时间", beijing_time: "北京时间", eastern_time: "美东时间", pacific_time: "美西时间",
      passed: "已截止", today: "今天", yesterday: "昨天", days_ago: "{n} 天前",
      estimate: "估算", estimate_from: "估算 · 参考 {year}", estimate_tooltip: "会议尚未公布完整 CFP，日期由往届节奏推算",
      announced: "已公布", tba: "待公布", event: "会议", location: "地点", deadline_timezone: "截止时区",
      estimate_short: "估", next_short: "NEXT", next_deadline: "NEXT DEADLINE", waiting_official: "等待官方公布 TBA",
      official_site: "前往会议官网 ↗", event_date: "会议日期", abstract: "摘要", paper: "论文", rebuttal: "Rebuttal", notification: "结果",
      round: "第 {n} 轮", estimated_paren: "（估算）", conference_dates: "会议日期", results: "显示 {shown} / {total} 场会议",
      nearest: "最近：{name} · {days} 天", deadline_pending: "截止日期待公布", tracked_top: "{top} 顶会 · {total} 全部",
      data_changed: "数据变更于 {date}", data_unknown: "数据更新时间未知", load_failed: "数据载入失败",
      cannot_load: "无法读取会议数据", legend_abstract: "摘要", legend_paper: "论文", legend_result: "Rebuttal / 结果",
      legend_estimate: "估算", legend_event: "会议日期", legend_today: "今天",
    },
    en: {
      page_title: "Conf Radar — Top EDA, Architecture & AI Conference Timeline",
      page_description: "Automatically updated deadlines, countdowns, and timelines for top EDA, computer architecture, and AI conferences.",
      skip: "Skip to conference list", brand_home: "Conf Radar home", main_nav: "Main navigation",
      nav_areas: "Focus areas", nav_tracker: "Conference radar", nav_method: "Data notes",
      hero_eyebrow: '<span class="live-dot"></span> RESEARCH DEADLINE RADAR · UPDATED EVERY 12 HOURS',
      hero_title: "Put your next top venue<br><em>on the timeline.</em>",
      hero_intro: "Track leading conferences across EDA, computer architecture, and AI. See submission milestones, official links, live countdowns, and the next 13 months at a glance.",
      hero_all: "Explore conferences <span>↓</span>", hero_calendar: "Subscribe .ics",
      calendar_title: "Subscribe with Google, Apple, or Outlook Calendar", calendar_address: "Subscription URL: {url}",
      next_aria: "Nearest top-conference deadline", loading: "Loading data", hero_details: "View conference details <span>↗</span>",
      stats_aria: "Tracking overview", stat_tracked: "TRACKED<br>Conferences", stat_announced: "ANNOUNCED<br>Official dates",
      stat_forecast: "FORECAST<br>Historical estimate", stat_changed: "DATA CHANGE<br>Last update",
      areas_title: "Three research areas. One radar.", areas_intro: "Top venues are shown by default; expand the list to include notable specialist conferences.",
      tracker_title: "Conference timeline", loading_conferences: "Loading conferences…", filters_aria: "Conference filters", areas_aria: "Research area",
      all: "All", architecture: "Architecture", view_aria: "View mode", list: "List", timeline: "Timeline",
      list_title: "Card view", timeline_title: "Timeline view", search_placeholder: "Search conferences, places, or keywords", search_aria: "Search conferences",
      top_only: "Top-tier only", show_est: "Show estimates", timezone: "Timezone", timezone_aria: "Display timezone",
      tz_local: "Local time", tz_beijing: "Beijing (UTC+8)", tz_eastern: "US Eastern", tz_pacific: "US Pacific",
      conference_list: "Conference list", timeline_aria: "Next 13 months timeline",
      empty_title: "No matching conferences", empty_desc: "Try clearing your search or including notable conferences.",
      method_title: "Automatic updates, honest uncertainty.", method_sync: "Sync",
      method_sync_desc: "GitHub Actions pulls the latest conference data from a community-maintained dataset every 12 hours.",
      method_calibrate: "Calibrate", method_calibrate_desc: "Timezones and rounds are normalized; biennial venues follow their real cadence, and estimates stay visibly separate from official TBA dates.",
      method_publish: "Publish", method_publish_desc: "When data changes, GitHub Pages, the README table, and the subscribable calendar update automatically.",
      source_note: 'Sources: <a href="https://github.com/ccfddl/ccf-deadlines" target="_blank" rel="noopener">ccfddl/ccf-deadlines ↗</a> plus manual corrections in this repository. Always verify against the official CFP before submitting.',
      waiting_data: "Waiting for data", footer_tagline: "Built for researchers who plan ahead.",
      local_time: "Local time", beijing_time: "Beijing time", eastern_time: "US Eastern", pacific_time: "US Pacific",
      passed: "Closed", today: "Today", yesterday: "Yesterday", days_ago: "{n} days ago",
      estimate: "Estimated", estimate_from: "Estimated · from {year}", estimate_tooltip: "The full CFP is not yet available; dates are projected from the previous edition",
      announced: "Announced", tba: "TBA", event: "When", location: "Where", deadline_timezone: "Deadline zone",
      estimate_short: "est.", next_short: "NEXT", next_deadline: "NEXT DEADLINE", waiting_official: "Waiting for official dates · TBA",
      official_site: "Official conference site ↗", event_date: "Conference dates", abstract: "Abstract", paper: "Paper", rebuttal: "Rebuttal", notification: "Notification",
      round: "round {n}", estimated_paren: " (estimated)", conference_dates: "Conference dates", results: "Showing {shown} of {total} conferences",
      nearest: "Next: {name} · {days} days", deadline_pending: "Deadline TBA", tracked_top: "{top} TOP · {total} TOTAL",
      data_changed: "Data changed {date}", data_unknown: "Data update time unknown", load_failed: "Could not load data",
      cannot_load: "Conference data unavailable", legend_abstract: "Abstract", legend_paper: "Paper", legend_result: "Rebuttal / notification",
      legend_estimate: "Estimated", legend_event: "Conference", legend_today: "Today",
    },
  };

  const DAY = 86_400_000;
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  const state = { lang: "zh", cat: "all", view: "list", topOnly: true, showEst: true, tz: "local", q: "" };
  try { Object.assign(state, JSON.parse(localStorage.getItem("conf-radar") || "{}")); } catch (_) { /* private mode */ }
  if (!["zh", "en"].includes(state.lang)) state.lang = "zh";
  const params = new URLSearchParams(location.search);
  if (["zh", "en"].includes(params.get("lang"))) state.lang = params.get("lang");
  if (["list", "timeline"].includes(params.get("view"))) state.view = params.get("view");
  if (["all", ...AREA_ORDER].includes(params.get("cat"))) state.cat = params.get("cat");
  if (params.get("tier") === "all") state.topOnly = false;

  let conferences = [];
  let rawConferences = [];
  let updatedAt = null;

  function t(key, values = {}) {
    let value = I18N[state.lang][key] ?? I18N.zh[key] ?? key;
    Object.entries(values).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, replacement); });
    return value;
  }

  function areaCopy(category) { return AREA[category]?.[state.lang] || AREA[category]?.zh; }
  function locale() { return state.lang === "zh" ? "zh-CN" : "en-US"; }

  function applyTranslations() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    document.title = t("page_title");
    document.querySelector('meta[name="description"]').content = t("page_description");
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => { element.innerHTML = t(element.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => { element.title = t(element.dataset.i18nTitle); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  }

  function saveState() {
    try { localStorage.setItem("conf-radar", JSON.stringify({ ...state, q: "" })); } catch (_) { /* private mode */ }
    const query = new URLSearchParams();
    if (state.lang !== "zh") query.set("lang", state.lang);
    if (state.cat !== "all") query.set("cat", state.cat);
    if (state.view !== "list") query.set("view", state.view);
    if (!state.topOnly) query.set("tier", "all");
    history.replaceState(null, "", `${location.pathname}${query.size ? `?${query}` : ""}${location.hash}`);
  }

  function timezoneName() {
    return {
      local: t("local_time"), "Etc/GMT+12": "AoE", UTC: "UTC", "Asia/Shanghai": t("beijing_time"),
      "America/New_York": t("eastern_time"), "America/Los_Angeles": t("pacific_time"),
    }[state.tz] || state.tz;
  }

  function formatDate(date, withTime = true) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    if (withTime) Object.assign(options, { hour: "2-digit", minute: "2-digit", hour12: false });
    if (state.tz !== "local") options.timeZone = state.tz;
    const formatted = new Intl.DateTimeFormat(locale(), options).format(date);
    return withTime ? `${formatted} · ${timezoneName()}` : formatted;
  }

  function countdownMarkup(ms) {
    if (ms <= 0) return t("passed");
    const days = Math.floor(ms / DAY);
    const hours = Math.floor(ms / 3_600_000) % 24;
    const minutes = Math.floor(ms / 60_000) % 60;
    const seconds = Math.floor(ms / 1_000) % 60;
    const pad = (number) => String(number).padStart(2, "0");
    return `${days}<small>d</small> ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function shortAge(date) {
    const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY));
    if (days === 0) return t("today");
    if (days === 1) return t("yesterday");
    if (days < 30) return t("days_ago", { n: days });
    return new Intl.DateTimeFormat(locale(), { month: "short", day: "numeric" }).format(date);
  }

  function milestoneLabel(milestone) {
    const key = { abstract_deadline: "abstract", deadline: "paper", rebuttal_deadline: "rebuttal", decision_deadline: "notification" }[milestone.key];
    const base = key ? t(key) : milestone.label;
    return /\(round\s+\d+\)/i.test(milestone.label || "") ? `${base} (${t("round", { n: milestone.round })})` : base;
  }

  function prepare(records) {
    const now = Date.now();
    return records.map((conference) => {
      const milestones = (conference.milestones || []).map((item) => ({ ...item, t: new Date(item.time) }));
      const next = milestones.find((item) => SUBMISSION.has(item.key) && item.t.getTime() > now) || null;
      return {
        ...conference, ms: milestones, next, estimated: conference.status === "estimated",
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
      .filter((conference) => !query || [
        conference.title, conference.description, conference.place, conference.category,
        AREA[conference.category]?.zh.title, AREA[conference.category]?.en.title,
      ].join(" ").toLowerCase().includes(query))
      .sort((a, b) => {
        if (Boolean(a.next) !== Boolean(b.next)) return a.next ? -1 : 1;
        if (a.next && b.next) return a.next.t - b.next.t;
        return AREA_ORDER.indexOf(a.category) - AREA_ORDER.indexOf(b.category) || a.title.localeCompare(b.title);
      });
  }

  function rankTags(conference) {
    return Object.entries(conference.rank || {}).filter(([, value]) => value && value !== "N")
      .map(([name, value]) => `<span class="tag">${esc(name)} ${esc(value)}</span>`).join("");
  }

  function statusTag(conference) {
    if (conference.estimated) {
      const label = conference.estimated_from_year ? t("estimate_from", { year: conference.estimated_from_year }) : t("estimate");
      return `<span class="tag estimate" title="${esc(t("estimate_tooltip"))}">${esc(label)}</span>`;
    }
    if (conference.status === "open") return `<span class="tag official">${esc(t("announced"))}</span>`;
    return `<span class="tag">${esc(t("tba"))}</span>`;
  }

  function conferenceCard(conference) {
    const now = Date.now();
    const officialUrl = conference.link || conference.prev_link;
    const title = officialUrl
      ? `<a href="${esc(officialUrl)}" target="_blank" rel="noopener">${esc(conference.title)} ${esc(conference.year || "")}</a>`
      : `${esc(conference.title)} ${esc(conference.year || "")}`;
    const facts = [];
    if (conference.date && conference.date !== "TBD") facts.push(`<span><b>${esc(t("event"))}</b>${esc(conference.date)}</span>`);
    if (conference.place && conference.place !== "TBD") facts.push(`<span><b>${esc(t("location"))}</b>${esc(conference.place)}</span>`);
    facts.push(`<span><b>${esc(t("deadline_timezone"))}</b>${esc(conference.timezone)}</span>`);

    const milestones = conference.ms.slice(0, 8).map((milestone) => {
      const css = milestone.t.getTime() < now ? "past" : conference.next === milestone ? "next" : "";
      const estimate = milestone.estimated ? ` · ${t("estimate_short")}` : "";
      return `<li class="${css}" title="${esc(milestone.comment || "")}">${esc(milestoneLabel(milestone))} · ${esc(formatDate(milestone.t, false))}${esc(estimate)}</li>`;
    }).join("");

    let deadline;
    if (conference.next) {
      const remaining = conference.next.t.getTime() - now;
      const urgency = remaining < 7 * DAY ? "urgent" : remaining < 30 * DAY ? "soon" : "";
      deadline = `<div class="deadline-label">${esc(t("next_short"))} · ${esc(milestoneLabel(conference.next))}</div>
        <div class="card-countdown ${urgency}" data-t="${conference.next.t.getTime()}">${countdownMarkup(remaining)}</div>
        <div class="deadline-time">${esc(formatDate(conference.next.t))}</div>`;
    } else {
      deadline = `<div class="deadline-label">${esc(t("next_deadline"))}</div><div class="tba">${esc(t("waiting_official"))}</div>`;
    }
    const officialLink = officialUrl
      ? `<a class="official-link" href="${esc(officialUrl)}" target="_blank" rel="noopener">${esc(t("official_site"))}</a>` : "";
    return `<article class="conf-card" id="conf-${esc(conference.id)}" data-cat="${esc(conference.category)}">
      <div class="conf-main"><div class="conf-heading"><h3>${title}</h3><span class="tag area">${esc(areaCopy(conference.category).title)}</span>${rankTags(conference)}${statusTag(conference)}</div>
        <p class="conf-desc">${esc(conference.description)}</p><div class="facts">${facts.join("")}</div>
        ${milestones ? `<ul class="milestones">${milestones}</ul>` : ""}</div>
      <div class="conf-deadline">${deadline}${officialLink}</div></article>`;
  }

  function renderList(list) { $("#list").innerHTML = list.map(conferenceCard).join(""); }

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
      const label = new Intl.DateTimeFormat(locale(), { month: "short", year: date.getUTCMonth() === 0 || index === 0 ? "2-digit" : undefined, timeZone: "UTC" }).format(date);
      months += `<span style="left:${position(date)}%">${esc(label)}</span>`;
      grid += `<i class="tl-grid" style="left:${position(date)}%"></i>`;
    }
    const today = inRange(now) ? `<i class="tl-today" style="left:${position(now)}%" title="${esc(t("today"))}"></i>` : "";
    const rows = [...list].sort((a, b) => AREA_ORDER.indexOf(a.category) - AREA_ORDER.indexOf(b.category)
      || ((a.next?.t ?? Infinity) - (b.next?.t ?? Infinity))).map((conference) => {
      let marks = "";
      if (conference.evStart && conference.evEnd && conference.evEnd >= start && conference.evStart <= end) {
        const left = Math.max(0, position(conference.evStart));
        const right = Math.min(100, position(conference.evEnd));
        marks += `<i class="ev" style="left:${left}%;width:${Math.max(.5, right - left)}%" title="${esc(conference.title)} ${esc(conference.year)} · ${esc(conference.date || t("conference_dates"))}"></i>`;
      }
      conference.ms.forEach((milestone) => {
        if (!inRange(milestone.t)) return;
        const kind = milestone.key === "abstract_deadline" ? "abs" : milestone.key === "deadline" ? "" : "note";
        marks += `<i class="mk ${kind} ${milestone.estimated ? "est" : ""}" style="left:${position(milestone.t)}%" title="${esc(conference.title)} ${esc(conference.year)} · ${esc(milestoneLabel(milestone))}${milestone.estimated ? esc(t("estimated_paren")) : ""} · ${esc(formatDate(milestone.t))}"></i>`;
      });
      const label = conference.link ? `<a href="${esc(conference.link)}" target="_blank" rel="noopener">${esc(conference.title)}</a>` : esc(conference.title);
      return `<div class="tl-row" data-cat="${esc(conference.category)}"><div class="tl-label"><i></i>${label}</div><div class="tl-track">${grid}${today}${marks}</div></div>`;
    }).join("");
    $("#timeline").innerHTML = `<div class="tl"><div class="tl-head"><div class="tl-corner">13 MONTHS</div><div class="tl-months">${months}</div></div>${rows}
      <div class="legend"><span><b class="mk abs"></b>${esc(t("legend_abstract"))}</span><span><b class="mk"></b>${esc(t("legend_paper"))}</span>
      <span><b class="mk note"></b>${esc(t("legend_result"))}</span><span><b class="mk est"></b>${esc(t("legend_estimate"))}</span>
      <span><b class="ev"></b>${esc(t("legend_event"))}</span><span><b class="today-key"></b>${esc(t("legend_today"))}</span></div></div>`;
  }

  function renderHero() {
    const next = conferences.filter((conference) => conference.tier === "top" && conference.next).sort((a, b) => a.next.t - b.next.t)[0];
    $("#stat-tracked").textContent = conferences.length;
    $("#stat-open").textContent = conferences.filter((conference) => conference.status === "open").length;
    $("#stat-estimated").textContent = conferences.filter((conference) => conference.estimated).length;
    $("#stat-updated").textContent = updatedAt ? shortAge(updatedAt) : "—";
    if (!next) return;
    $("#hero-next-area").textContent = `${areaCopy(next.category).title} · ${milestoneLabel(next.next)}${next.estimated ? ` · ${t("estimate")}` : ""}`;
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
      const nextText = next ? t("nearest", { name: next.title, days: Math.max(0, Math.ceil((next.next.t - Date.now()) / DAY)) }) : t("deadline_pending");
      return `<button type="button" class="area-card" data-cat="${esc(category)}"><span class="area-card-top"><span class="area-icon">${AREA[category].icon}</span>
        <span class="area-count">${esc(t("tracked_top", { top: top.length, total: all.length }))}</span></span>
        <h3>${esc(areaCopy(category).title)}</h3><p>${esc(areaCopy(category).desc)}</p><span class="area-next"><i></i>${esc(nextText)}</span></button>`;
    }).join("");
  }

  function renderUpdated() {
    $("#updated").textContent = updatedAt ? t("data_changed", { date: formatDate(updatedAt) }) : t("data_unknown");
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
    $("#results-summary").textContent = t("results", { shown: list.length, total: conferences.length });
    $("#empty").hidden = list.length > 0;
    $("#list").hidden = state.view !== "list" || !list.length;
    $("#timeline").hidden = state.view !== "timeline" || !list.length;
    if (state.view === "list") renderList(list); else renderTimeline(list);
  }

  function syncControls() {
    document.querySelectorAll("#cat-filter button").forEach((button) => {
      const active = button.dataset.cat === state.cat;
      button.classList.toggle("on", active); button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("#view-switch button").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("on", active); button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".lang-switch button").forEach((button) => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle("on", active); button.setAttribute("aria-pressed", String(active));
    });
    $("#top-only").checked = state.topOnly;
    $("#show-est").checked = state.showEst;
    $("#tz").value = state.tz;
    if ($("#tz").value !== state.tz) { state.tz = "local"; $("#tz").value = "local"; }
  }

  function configureRepoLink() {
    const match = location.hostname.match(/^([^.]+)\.github\.io$/);
    if (match) {
      const repository = location.pathname.split("/").filter(Boolean)[0] || `${match[1]}.github.io`;
      const link = $("#repo-link");
      link.href = `https://github.com/${match[1]}/${repository}`; link.hidden = false;
    }
    $("#ics-link").title = t("calendar_address", { url: new URL("deadlines.ics", location.href).href });
  }

  function update() { saveState(); syncControls(); render(); renderHero(); renderUpdated(); }

  function switchLanguage(language) {
    if (!I18N[language] || language === state.lang) return;
    state.lang = language;
    applyTranslations();
    configureRepoLink();
    syncControls();
    renderAreas();
    render();
    renderHero();
    renderUpdated();
    saveState();
  }

  function bind() {
    $(".lang-switch").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-lang]");
      if (button) switchLanguage(button.dataset.lang);
    });
    $("#cat-filter").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-cat]"); if (button) { state.cat = button.dataset.cat; update(); }
    });
    $("#view-switch").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-view]"); if (button) { state.view = button.dataset.view; update(); }
    });
    $("#top-only").addEventListener("change", (event) => { state.topOnly = event.target.checked; update(); });
    $("#show-est").addEventListener("change", (event) => { state.showEst = event.target.checked; update(); });
    $("#tz").addEventListener("change", (event) => { state.tz = event.target.value; update(); });
    $("#q").addEventListener("input", (event) => { state.q = event.target.value; render(); });
    $("#area-grid").addEventListener("click", (event) => {
      const card = event.target.closest("button[data-cat]"); if (!card) return;
      state.cat = card.dataset.cat; update(); $("#tracker").scrollIntoView({ behavior: "smooth" });
    });
  }

  async function init() {
    $("#year").textContent = new Date().getFullYear();
    applyTranslations();
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
      renderUpdated();
    } catch (error) {
      $("#results-summary").textContent = t("load_failed");
      $("#empty").hidden = false;
      $("#empty").innerHTML = `<div><strong>${esc(t("cannot_load"))}</strong><span>${esc(error.message)}</span></div>`;
      return;
    }
    renderHero(); renderAreas(); render();
    setInterval(tick, 1_000);
    setInterval(() => { conferences = prepare(rawConferences); render(); renderHero(); }, 60_000);
  }

  init();
})();

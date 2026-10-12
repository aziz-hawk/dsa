(function () {
  "use strict";

  const STORAGE_KEY_PROGRESS = "dsa_reels_progress_v1";
  const STORAGE_KEY_CUSTOM = "dsa_reels_custom_cards_v1";
  const STORAGE_KEY_PREFS = "dsa_reels_prefs_v3";
  const STORAGE_KEY_GIST = "dsa_reels_gist_v1";

  // Ultra-compact short codes for sheets
  const SHEET_BADGE_NAMES = {
    babbar: "LB",
    apna_dsa: "AC",
    apna_dp: "AC-DP",
    striver: "STR",
    med_sde: "LC-M",
    hard_sde: "LC-H"
  };

  const DIFF_SHORT = {
    Easy: "EASY",
    Medium: "MED",
    Hard: "HARD"
  };

  const ICONS = {
    copy: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    edit: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    ext: `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`,
    eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    revisit: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
    check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    starOutline: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starFilled: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    chevDown: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    chevRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    play: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
  };

  // App State — quizBlur defaults to TRUE (Recall Mode ON by default!)
  const state = {
    view: "reels",           // "reels" | "explorer" | "patterns" | "stats"
    sheet: "must_do",        // "must_do" | "high_overlap" | "master" | "babbar" | "apna_dsa" | "apna_dp" | "striver" | "med_sde" | "hard_sde"
    topic: "all",            // "all" or sheet-specific topic string
    statusFilter: "all",     // "all" | "revisit" | "done" | "starred" | "unseen"
    diff: "all",             // "all" | "Easy" | "Medium" | "Hard"
    company: "",             // "" or company name
    patternFilter: "",       // "" or patternId
    search: "",
    quizBlur: true,          // DEFAULT: Recall Mode ON (Problem/Examples/Constraints visible, Solution hidden until tapped)
    theme: "dark",           // "dark" | "light"
    shuffled: false,
    reelLimit: 50,
    activeIndex: 0,
    collapsedTopics: {},
    patternSearch: "",
    patternCategory: "all",
    editingQid: null
  };

  let userProgress = {};
  let customCards = {};
  let currentList = [];

  const Q_MAP = {};
  (window.QUESTIONS_DATA || []).forEach(q => {
    Q_MAP[q.id] = q;
  });

  // ==================== STORAGE & URL SYNC ====================
  function loadState() {
    try {
      const p = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (p) userProgress = JSON.parse(p);
      const c = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (c) customCards = JSON.parse(c);
      const pr = localStorage.getItem(STORAGE_KEY_PREFS);
      if (pr) {
        const parsed = JSON.parse(pr);
        if (parsed.sheet && window.SHEETS_META[parsed.sheet]) state.sheet = parsed.sheet;
        if (typeof parsed.quizBlur === "boolean") state.quizBlur = parsed.quizBlur;
        if (parsed.theme === "light" || parsed.theme === "dark") state.theme = parsed.theme;
      }
    } catch (e) {
      console.error("Failed to load local state", e);
    }

    applyTheme();

    if (location.hash && location.hash.includes("tok=")) {
      const params = new URLSearchParams(location.hash.slice(1));
      const tok = params.get("tok");
      const gid = params.get("gist") || "";
      if (tok) {
        localStorage.setItem(STORAGE_KEY_GIST, JSON.stringify({ token: tok, gistId: gid }));
        history.replaceState(null, "", location.pathname + location.search);
        showToast("Phone sync connected. Pulling progress...");
        setTimeout(() => pullFromGist(true), 300);
      }
    }

    try {
      const g = JSON.parse(localStorage.getItem(STORAGE_KEY_GIST) || "{}");
      if (g.token) document.getElementById("gistTokenInput").value = g.token;
      if (g.gistId) document.getElementById("gistIdInput").value = g.gistId;
    } catch (_) {}
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const sun = document.getElementById("themeIconSun");
    const moon = document.getElementById("themeIconMoon");
    if (sun && moon) {
      // In dark mode, show Sun icon (click to switch to Day/Light mode)
      // In light mode, show Moon icon (click to switch to Night/Dark mode)
      sun.classList.toggle("hidden", state.theme === "light");
      moon.classList.toggle("hidden", state.theme === "dark");
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", state.theme === "light" ? "#f4f4f6" : "#09090b");
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(userProgress));
    } catch (e) {
      console.error("Save error", e);
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify({
        sheet: state.sheet,
        quizBlur: state.quizBlur,
        theme: state.theme
      }));
    } catch (_) {}
  }

  // ==================== SYNTAX HIGHLIGHTERS ====================
  function highlightCpp(code) {
    if (!code) return "";
    let esc = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const comments = [];
    esc = esc.replace(/(\/\/[^\n]*)/g, m => {
      comments.push(m);
      return `___CMT_${comments.length - 1}___`;
    });

    esc = esc.replace(/\b(int|long|double|float|bool|char|void|auto|const|static|struct|class|return|if|else|for|while|do|break|continue|swap|true|false|nullptr|new|using|size_t)\b/g, '<span class="kw">$1</span>');
    esc = esc.replace(/\b(vector|string|unordered_map|unordered_set|map|set|priority_queue|queue|stack|deque|list|pair|TreeNode|ListNode|BIT|DSU|Node|greater|INT_MIN|INT_MAX|LLONG_MAX)\b/g, '<span class="ty">$1</span>');
    esc = esc.replace(/\b(sort|reverse|max|min|minmax_element|nth_element|partition|rotate|copy|max_element|accumulate|lower_bound|upper_bound|push_back|emplace_back|pop_back|push|pop|top|front|back|begin|end|rbegin|rend|size|empty|count|erase|insert|substr|find|unite|splice|iota|move)\b/g, '<span class="fn">$1</span>');
    esc = esc.replace(/\b(\d+)\b/g, '<span class="nm">$1</span>');

    esc = esc.replace(/___CMT_(\d+)___/g, (_, idx) => `<span class="cm">${comments[Number(idx)]}</span>`);
    return esc;
  }

  function formatExampleText(exText) {
    let esc = escapeHtml(exText || "");
    esc = esc.replace(/\b(Input\s*:|Output\s*:|Explanation\s*:)/gi, '<span class="ex-kw">$1</span>');
    return esc;
  }

  // ==================== CARD DATA RESOLVER ====================
  function getCardContent(q) {
    const pat = (window.PATTERNS_CPP && window.PATTERNS_CPP[q.patternId]) || window.PATTERNS_CPP["pat-stl-essentials"];
    const spec = (window.CARDS_CPP && window.CARDS_CPP[q.id]) || null;
    const cust = customCards[q.id] || null;

    const patternName = pat ? pat.name : (q.patterns[0] || q.unifiedTopic.replace(/^\d+\.\s*/, ""));

    // Problem Statement, Examples, and Constraints (Always visible in Recall Mode!)
    const desc = q.desc || (spec && spec.gist) || `Solve ${q.title} optimally in C++17 STL.`;
    const examples = (q.examples && q.examples.length) ? q.examples : [];
    const constraints = (q.constraints && q.constraints.length) ? q.constraints : [];

    // Solution details (Hidden in Recall Mode until revealed!)
    const trigger = (cust && cust.trigger) || (spec && spec.trigger) || (pat && pat.trigger) || "";
    const intuition = (cust && cust.intuition && cust.intuition.length)
      ? cust.intuition
      : ((spec && spec.intuition) || (pat && pat.intuition) || []);
    const code = (cust && cust.code) || (spec && spec.code) || (pat && pat.code) || "";
    const tc = (spec && spec.tc) || (pat && pat.tc) || "O(N)";
    const sc = (spec && spec.sc) || (pat && pat.sc) || "O(N)";
    const trap = (spec && spec.trap) || (pat && pat.trap) || "";

    return {
      patternName,
      isProblemSpecific: Boolean(spec || cust),
      isCustom: Boolean(cust),
      desc,
      examples,
      constraints,
      trigger,
      intuition,
      code,
      tc,
      sc,
      trap
    };
  }

  // ==================== FILTERING & SORTING ENGINE ====================
  function getQuestionStatus(qid) {
    const p = userProgress[qid];
    if (!p || !p.s) return "";
    if (p.s === "done" || p.s === "solved") return "done";
    if (p.s === "revisit" || p.s === "again" || p.s === "shaky") return "revisit";
    return "";
  }

  function getQuestionTopicForSheet(q, sheetKey) {
    if (sheetKey === "master" || sheetKey === "must_do" || sheetKey === "high_overlap") {
      return q.unifiedTopic;
    }
    const pl = q.placements && q.placements[sheetKey];
    return pl ? pl.topic : null;
  }

  function doesQuestionBelongToSheet(q, sheetKey) {
    if (sheetKey === "master") return true;
    if (sheetKey === "must_do") return q.overlap >= 3;
    if (sheetKey === "high_overlap") return q.overlap >= 2;
    return Boolean(q.placements && q.placements[sheetKey]);
  }

  function getFilteredQuestions(ignoreTopic, ignoreStatus) {
    const sk = state.sheet;
    const topicFilter = ignoreTopic ? "all" : state.topic;
    const stFilter = ignoreStatus ? "all" : state.statusFilter;
    const diffFilter = state.diff;
    const compFilter = state.company.toLowerCase();
    const patFilter = state.patternFilter;
    const qSearch = state.search.trim().toLowerCase();

    const res = [];
    const allQs = window.QUESTIONS_DATA || [];

    for (let i = 0; i < allQs.length; i++) {
      const q = allQs[i];
      if (!doesQuestionBelongToSheet(q, sk)) continue;

      if (topicFilter !== "all") {
        const qt = getQuestionTopicForSheet(q, sk);
        if (qt !== topicFilter) continue;
      }

      if (diffFilter !== "all" && q.diff !== diffFilter) continue;
      if (patFilter && q.patternId !== patFilter) continue;

      if (compFilter) {
        const hasComp = (q.companies || []).some(c => c.toLowerCase() === compFilter);
        if (!hasComp) continue;
      }

      if (stFilter !== "all") {
        const prog = userProgress[q.id] || {};
        const st = getQuestionStatus(q.id);
        if (stFilter === "revisit" && st !== "revisit") continue;
        if (stFilter === "done" && st !== "done") continue;
        if (stFilter === "starred" && !prog.star) continue;
        if (stFilter === "unseen" && st === "done") continue;
      }

      if (qSearch) {
        const hay = (
          q.title + " " +
          q.unifiedTopic + " " +
          (q.patterns || []).join(" ") + " " +
          (q.companies || []).join(" ")
        ).toLowerCase();
        if (!hay.includes(qSearch)) continue;
      }

      res.push(q);
    }

    if (sk !== "master" && sk !== "must_do" && sk !== "high_overlap") {
      res.sort((a, b) => {
        const oa = (a.placements[sk] && a.placements[sk].order) || 9999;
        const ob = (b.placements[sk] && b.placements[sk].order) || 9999;
        return oa - ob;
      });
    }

    if (state.shuffled) {
      for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = res[i];
        res[i] = res[j];
        res[j] = tmp;
      }
    }

    return res;
  }

  // ==================== SIDEBAR & TOPBAR SELECTORS ====================
  const SHEET_SELECT_SHORT = {
    must_do: "3S+ (95)",
    high_overlap: "2S+ (329)",
    master: "All (1136)",
    babbar: "LB (411)",
    striver: "STR (454)",
    apna_dsa: "AC (372)",
    apna_dp: "AC-DP (119)",
    med_sde: "LC-M (497)",
    hard_sde: "LC-H (202)"
  };

  function updateStatusFilterUI() {
    const sk = state.sheet;
    const allQs = window.QUESTIONS_DATA || [];
    let cntRevisit = 0;
    let cntDone = 0;
    let cntStar = 0;
    let cntTotal = 0;
    let globalDone = 0;

    for (let i = 0; i < allQs.length; i++) {
      const q = allQs[i];
      const st = getQuestionStatus(q.id);
      if (st === "done") globalDone++;
      if (!doesQuestionBelongToSheet(q, sk)) continue;
      if (state.topic !== "all" && getQuestionTopicForSheet(q, sk) !== state.topic) continue;
      cntTotal++;
      if (st === "revisit") cntRevisit++;
      if (st === "done") cntDone++;
      if (userProgress[q.id] && userProgress[q.id].star) cntStar++;
    }

    const sbBadge = document.getElementById("sidebarSolvedBadge");
    if (sbBadge) sbBadge.textContent = `${globalDone}/${allQs.length} Done`;

    const statusSelect = document.getElementById("statusSelect");
    if (statusSelect) {
      const sf = state.statusFilter;
      statusSelect.innerHTML = [
        `<option value="all" ${sf === "all" ? "selected" : ""}>Filter</option>`,
        `<option value="revisit" ${sf === "revisit" ? "selected" : ""}>Revisit (${cntRevisit})</option>`,
        `<option value="done" ${sf === "done" ? "selected" : ""}>Done (${cntDone})</option>`,
        `<option value="starred" ${sf === "starred" ? "selected" : ""}>Star (${cntStar})</option>`,
        `<option value="unseen" ${sf === "unseen" ? "selected" : ""}>Todo (${cntTotal - cntDone})</option>`
      ].join("");
    }

    const sbRevisit = document.getElementById("sbCntRevisit");
    const sbDone = document.getElementById("sbCntDone");
    const sbStar = document.getElementById("sbCntStar");
    if (sbRevisit) sbRevisit.textContent = cntRevisit;
    if (sbDone) sbDone.textContent = cntDone;
    if (sbStar) sbStar.textContent = cntStar;

    document.querySelectorAll("#sidebarStatusFilter [data-sfilter]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sfilter === state.statusFilter);
    });

    const expBar = document.getElementById("explorerStatusPills");
    if (expBar) {
      const sf = state.statusFilter;
      expBar.innerHTML = `
        <button class="f-pill ${sf === "all" ? "active" : ""}" data-sfilter="all" type="button">All (${cntTotal})</button>
        <button class="f-pill pill-revisit ${sf === "revisit" ? "active" : ""}" data-sfilter="revisit" type="button">Revisit (${cntRevisit})</button>
        <button class="f-pill pill-done ${sf === "done" ? "active" : ""}" data-sfilter="done" type="button">Done (${cntDone})</button>
        <button class="f-pill pill-star ${sf === "starred" ? "active" : ""}" data-sfilter="starred" type="button">Star (${cntStar})</button>
      `;
    }
  }

  function populateSheetSelectors() {
    const keys = ["must_do", "high_overlap", "master", "babbar", "striver", "apna_dsa", "apna_dp", "med_sde", "hard_sde"];
    const allQs = window.QUESTIONS_DATA || [];

    const sheetSelect = document.getElementById("sheetSelect");
    sheetSelect.innerHTML = keys.map(k => {
      const m = window.SHEETS_META[k];
      const lbl = SHEET_SELECT_SHORT[k] || m.short;
      return `<option value="${k}" ${state.sheet === k ? "selected" : ""}>${lbl}</option>`;
    }).join("");

    const sbSheetList = document.getElementById("sidebarSheetList");
    if (sbSheetList) {
      sbSheetList.innerHTML = keys.map(k => {
        const m = window.SHEETS_META[k];
        const sheetQs = allQs.filter(q => doesQuestionBelongToSheet(q, k));
        const doneCnt = sheetQs.filter(q => getQuestionStatus(q.id) === "done").length;
        return `
          <button class="sb-item ${state.sheet === k ? "active" : ""}" data-sheet="${k}" type="button">
            <span class="sb-item-lbl">${escapeHtml(m.label.replace(/\s*\([\d,]+\)$/, ""))}</span>
            <span class="sb-item-cnt">${doneCnt}/${sheetQs.length}</span>
          </button>
        `;
      }).join("");
    }
  }

  function populateTopicSelectors() {
    const sk = state.sheet;
    const meta = window.SHEETS_META[sk] || window.SHEETS_META.master;
    const baseQs = getFilteredQuestions(true);

    const counts = {};
    baseQs.forEach(q => {
      const t = getQuestionTopicForSheet(q, sk);
      if (t) counts[t] = (counts[t] || 0) + 1;
    });

    const topics = meta.topics.filter(t => (counts[t] || 0) > 0 || state.topic === t);
    if (state.topic !== "all" && !topics.includes(state.topic)) {
      state.topic = "all";
    }

    const bcSheet = document.getElementById("bcSheet");
    const bcTopic = document.getElementById("bcTopic");
    if (bcSheet) bcSheet.textContent = meta.short.replace(/\s*\(\d+\)$/, "");
    if (bcTopic) {
      bcTopic.textContent = state.topic === "all"
        ? "All Topics"
        : state.topic.replace(/^\d+\.\s*/, "");
    }

    const topicSelect = document.getElementById("topicSelect");
    topicSelect.innerHTML =
      `<option value="all" ${state.topic === "all" ? "selected" : ""}>All (${baseQs.length})</option>` +
      topics.map(t => {
        const cleanT = t.replace(/^\d+\.\s*/, "").replace(/^Step \d+:\s*/, "").replace(/\s*\[.*?\]/g, "");
        return `<option value="${escapeAttr(t)}" ${state.topic === t ? "selected" : ""}>${cleanT} (${counts[t] || 0})</option>`;
      }).join("");

    const sbTopicList = document.getElementById("sidebarTopicList");
    if (sbTopicList) {
      sbTopicList.innerHTML =
        `<button class="sb-item ${state.topic === "all" ? "active" : ""}" data-topic="all" type="button">
          <span class="sb-item-lbl">All Topics</span>
          <span class="sb-item-cnt">${baseQs.length}</span>
        </button>` +
        topics.map(t => {
          const cleanT = t.replace(/^\d+\.\s*/, "");
          return `
            <button class="sb-item ${state.topic === t ? "active" : ""}" data-topic="${escapeAttr(t)}" type="button">
              <span class="sb-item-lbl">${escapeHtml(cleanT)}</span>
              <span class="sb-item-cnt">${counts[t] || 0}</span>
            </button>
          `;
        }).join("");
    }

    const explorerTopicPills = document.getElementById("explorerTopicPills");
    if (explorerTopicPills) {
      explorerTopicPills.innerHTML =
        `<button class="t-pill ${state.topic === "all" ? "active" : ""}" data-topic="all" type="button">All (${baseQs.length})</button>` +
        topics.map(t => {
          const cleanT = t.replace(/^\d+\.\s*/, "").replace(/^Step \d+:\s*/, "");
          return `<button class="t-pill ${state.topic === t ? "active" : ""}" data-topic="${escapeAttr(t)}" type="button">${cleanT} (${counts[t] || 0})</button>`;
        }).join("");
    }
  }

  // ==================== RENDER VIEW 1: FOCUS / REEL DECK ====================
  function renderReelFeed(resetScroll) {
    const feed = document.getElementById("reelFeed");
    const counter = document.getElementById("deckCounter");

    if (currentList.length === 0) {
      counter.textContent = "0/0";
      feed.innerHTML = `
        <div class="reel-card">
          <div class="rc-inner" style="justify-content:center;align-items:center;text-align:center;gap:12px;padding:32px;">
            <div style="font-size:15px;font-weight:600;">No problems match current filter</div>
            <button class="btn-primary" id="resetFiltersEmptyBtn" type="button">Reset Filters</button>
          </div>
        </div>
      `;
      const btn = document.getElementById("resetFiltersEmptyBtn");
      if (btn) btn.onclick = resetAllFilters;
      return;
    }

    const slice = currentList.slice(0, state.reelLimit);
    counter.textContent = `${Math.min(state.activeIndex + 1, currentList.length)}/${currentList.length}`;

    feed.innerHTML = slice.map((q, idx) => buildReelCardHtml(q, idx, currentList.length)).join("");

    if (resetScroll) {
      state.activeIndex = 0;
      feed.scrollTop = 0;
    }
  }

  function buildReelCardHtml(q, idx, total) {
    const card = getCardContent(q);
    const prog = userProgress[q.id] || {};
    const starred = Boolean(prog.star);
    const status = getQuestionStatus(q.id);

    // Compact short codes for sheets: LB, STR, AC, AC-DP, LC-M, LC-H
    const sheetChips = (q.sheets || []).map(sk => {
      const active = sk === state.sheet ? "active-sheet" : "";
      return `<span class="sheet-chip ${active}">${SHEET_BADGE_NAMES[sk] || sk}</span>`;
    }).join("");

    const companyChips = (q.companies || []).slice(0, 4).map(c =>
      `<span class="company-chip" data-company="${escapeAttr(c)}">${escapeHtml(c)}</span>`
    ).join("");

    const linksHtml = buildLinksHtml(q.links);
    const isMasked = state.quizBlur;

    const examplesHtml = card.examples.length
      ? card.examples.map((ex, i) => `
          <div class="prob-example-box"><div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:3px;">Example ${card.examples.length > 1 ? i + 1 : ""}</div>${formatExampleText(ex)}</div>
        `).join("")
      : "";

    const constraintsHtml = card.constraints.length
      ? `
        <div class="prob-constraints-box">
          <div class="rc-sec-hdr" style="margin-bottom:2px;"><span>Constraints</span></div>
          <div class="constraints-pills">
            ${card.constraints.map(c => `<span class="constraint-chip">${escapeHtml(c)}</span>`).join("")}
          </div>
        </div>
      `
      : "";

    return `
      <article class="reel-card" data-qid="${q.id}" data-idx="${idx}">
        <div class="rc-inner">
          <!-- STRICT 1-LINE COMPACT HEADER -->
          <div class="rc-top">
            <div class="rc-meta-row">
              <div class="rc-idx-wrap">
                <span class="rc-idx">${idx + 1}/${total}</span>
                <span class="badge-diff badge-${q.diff}">${DIFF_SHORT[q.diff] || q.diff}</span>
                ${q.overlap >= 2 ? `<span class="badge-overlap">${q.overlap}S</span>` : ""}
                ${sheetChips}
              </div>
              <div class="rc-top-actions">
                ${linksHtml}
                <button class="code-mini-btn" data-action="edit-card" data-qid="${q.id}" type="button" title="Edit solution">${ICONS.edit}</button>
              </div>
            </div>

            <div class="rc-title-row">
              <h2 class="rc-title">${escapeHtml(q.title)}</h2>
              ${companyChips ? `<div class="rc-sheets-row">${companyChips}</div>` : ""}
            </div>
          </div>

          <!-- CARD BODY: LEFT/TOP = QUESTION, EXAMPLES & CONSTRAINTS (ALWAYS VISIBLE) | RIGHT/BOTTOM = SOLUTION (REVEALABLE) -->
          <div class="rc-body">
            <!-- PROBLEM PANE (ALWAYS VISIBLE IN RECALL MODE!) -->
            <div class="rc-problem-pane">
              <div class="prob-statement-box">
                <div class="rc-sec-hdr"><span>Problem Statement</span></div>
                <div class="prob-statement-txt">${escapeHtml(card.desc)}</div>
              </div>

              ${examplesHtml}
              ${constraintsHtml}

              <!-- 3-BUTTON BAR AT END OF QUESTION BEFORE SOLUTION: REVISIT | DONE | STAR -->
              <div class="prob-action-row">
                <button class="prob-act-btn act-revisit ${status === "revisit" ? "active" : ""}" data-action="mark-status" data-status="revisit" data-qid="${q.id}" type="button">
                  ${ICONS.revisit}
                  <span>Revisit</span>
                </button>
                <button class="prob-act-btn act-done ${status === "done" ? "active" : ""}" data-action="mark-status" data-status="done" data-qid="${q.id}" type="button">
                  ${ICONS.check}
                  <span>Done</span>
                </button>
                <button class="prob-act-btn act-star ${starred ? "active" : ""}" data-action="star" data-qid="${q.id}" type="button">
                  <span class="star-ico-wrap" style="display:inline-flex;">${starred ? ICONS.starFilled : ICONS.starOutline}</span>
                  <span>Star</span>
                </button>
              </div>
            </div>

            <!-- SOLUTION PANE (MASKED BY DEFAULT IN RECALL MODE UNTIL TAPPED!) -->
            <div class="rc-solution-pane ${isMasked ? "masked" : ""}">
              <div class="reveal-solution-Prompt" data-action="reveal-solution">
                <div style="font-size:13.5px;font-weight:600;color:var(--text);">Active Recall — Think Before Revealing</div>
                <div style="font-size:11.5px;color:var(--text-muted);max-width:280px;">Identify the DSA pattern, time/space complexity, and edge cases from the constraints above.</div>
                <button class="btn-primary" type="button" style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;">${ICONS.eye} Reveal Approach &amp; C++17 STL (Space)</button>
              </div>

              <div class="solution-details">
                <div class="rc-section">
                  <div class="rc-sec-hdr">
                    <span>Pattern &amp; Complexity</span>
                    <div class="tc-trap-row">
                      <span class="tc-badge">TC: ${escapeHtml(card.tc)}</span>
                      <span class="tc-badge">SC: ${escapeHtml(card.sc)}</span>
                    </div>
                  </div>
                  <div class="pattern-name-val" style="margin-bottom:3px;">${escapeHtml(card.patternName)}</div>
                  <div class="trigger-line">${escapeHtml(card.trigger)}</div>
                </div>

                <div class="rc-section">
                  <div class="rc-sec-hdr"><span>Core Approach &amp; Intuition</span></div>
                  <ul class="intuition-list">
                    ${card.intuition.map((b, i) => `
                      <li>
                        <span class="step-num">0${i + 1}</span>
                        <span>${escapeHtml(b)}</span>
                      </li>
                    `).join("")}
                  </ul>
                </div>

                ${card.trap ? `
                  <div class="trap-box">
                    <span class="trap-lbl">Pitfall</span>${escapeHtml(card.trap)}
                  </div>
                ` : ""}

                <div class="code-box">
                  <div class="code-hdr">
                    <span>solution.cpp — ${card.isProblemSpecific ? "Problem Solution" : "Pattern Blueprint"}</span>
                    <div class="code-actions">
                      <button class="code-mini-btn" data-action="copy-code" data-qid="${q.id}" type="button">${ICONS.copy} Copy</button>
                    </div>
                  </div>
                  <pre class="cpp-pre">${highlightCpp(card.code)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function buildLinksHtml(links) {
    if (!links) return "";
    const out = [];
    if (links.LC) out.push(`<a class="ext-link lc" href="${escapeAttr(links.LC)}" target="_blank" rel="noopener">LC${ICONS.ext}</a>`);
    if (links.GFG) out.push(`<a class="ext-link gfg" href="${escapeAttr(links.GFG)}" target="_blank" rel="noopener">GFG${ICONS.ext}</a>`);
    if (links.YT) out.push(`<a class="ext-link yt" href="${escapeAttr(links.YT)}" target="_blank" rel="noopener">YT${ICONS.ext}</a>`);
    if (links.Blog) out.push(`<a class="ext-link blog" href="${escapeAttr(links.Blog)}" target="_blank" rel="noopener">Doc${ICONS.ext}</a>`);
    if (links.TUF) out.push(`<a class="ext-link" href="${escapeAttr(links.TUF)}" target="_blank" rel="noopener">TUF${ICONS.ext}</a>`);
    return out.join("");
  }

  // ==================== RENDER VIEW 2: SHEET EXPLORER ====================
  function renderExplorer() {
    const listEl = document.getElementById("explorerList");
    const swipeBtn = document.getElementById("swipeCurrentBtn");
    const compBanner = document.getElementById("companyFilterBanner");

    swipeBtn.innerHTML = `${ICONS.play} <span>Focus (${currentList.length})</span>`;

    if (state.company) {
      compBanner.classList.remove("hidden");
      document.getElementById("activeCompanyName").textContent = state.company;
    } else {
      compBanner.classList.add("hidden");
    }

    if (currentList.length === 0) {
      listEl.innerHTML = `<div class="stat-box" style="text-align:center;padding:28px;">No problems match your current filter.</div>`;
      return;
    }

    const sk = state.sheet;
    const groups = {};
    const groupOrder = [];

    currentList.forEach((q, globalIdx) => {
      const t = getQuestionTopicForSheet(q, sk) || q.unifiedTopic;
      if (!groups[t]) {
        groups[t] = [];
        groupOrder.push(t);
      }
      groups[t].push({ q, globalIdx });
    });

    listEl.innerHTML = groupOrder.map(t => {
      const items = groups[t];
      const collapseKey = `${sk}:${t}`;
      const isCollapsed = Boolean(state.collapsedTopics[collapseKey]);

      return `
        <div class="topic-group">
          <div class="topic-group-hdr" data-action="toggle-topic" data-ckey="${escapeAttr(collapseKey)}">
            <div class="tg-title">
              <span style="color:var(--text-muted);display:inline-flex;">${isCollapsed ? ICONS.chevRight : ICONS.chevDown}</span>
              <span>${escapeHtml(t.replace(/^\d+\.\s*/, ""))}</span>
            </div>
            <div class="tg-right">
              <span>${items.length} Qs</span>
              <button class="tg-swipe-btn" data-action="swipe-topic" data-topic="${escapeAttr(t)}" type="button">${ICONS.play} Practice</button>
            </div>
          </div>
          ${isCollapsed ? "" : `<div class="topic-rows">${items.map((x, idxInGroup) => buildExplorerRowHtml(x.q, x.globalIdx, idxInGroup + 1, sk)).join("")}</div>`}
        </div>
      `;
    }).join("");
  }

  function buildExplorerRowHtml(q, idxInList, numInGroup, sk) {
    const prog = userProgress[q.id] || {};
    const status = getQuestionStatus(q.id);
    const subtopic = (q.placements && q.placements[sk] && q.placements[sk].subtopic)
      ? q.placements[sk].subtopic
      : "";
    const pat = window.PATTERNS_CPP && window.PATTERNS_CPP[q.patternId];
    const patLabel = pat ? pat.name : (q.patterns[0] || "");
    const comps = (q.companies || []).slice(0, 3).join(", ");

    return `
      <div class="q-row" data-action="open-reel-at" data-idx="${idxInList}">
        <span class="q-idx-num">${numInGroup}</span>
        <div class="q-main">
          <div class="q-title-txt">${escapeHtml(q.title)}</div>
          <div class="q-sub-line">
            ${q.overlap >= 2 ? `<span style="color:var(--accent-light);font-weight:600;">${q.overlap}S ·</span>` : ""}
            ${subtopic ? `<span>${escapeHtml(subtopic)} ·</span>` : ""}
            <span>${escapeHtml(patLabel)}</span>
            ${comps ? `<span>· ${escapeHtml(comps)}</span>` : ""}
          </div>
        </div>
        <div class="q-right">
          ${status === "revisit" ? `<span class="badge-status st-revisit">REV</span>` : ""}
          ${status === "done" ? `<span class="badge-status st-done">DONE</span>` : ""}
          ${prog.star ? `<span style="color:var(--med);display:inline-flex;">${ICONS.starFilled}</span>` : ""}
          <span class="badge-diff badge-${q.diff}">${DIFF_SHORT[q.diff] || q.diff}</span>
        </div>
      </div>
    `;
  }

  // ==================== RENDER VIEW 3: C++17 STL PATTERNS ====================
  function renderPatternsView() {
    const allPatterns = Object.values(window.PATTERNS_CPP || {});
    const categories = ["all", ...Array.from(new Set(allPatterns.map(p => p.category)))];

    const pillsEl = document.getElementById("patternCategoryPills");
    pillsEl.innerHTML = categories.map(cat =>
      `<button class="f-pill ${state.patternCategory === cat ? "active" : ""}" data-pcat="${escapeAttr(cat)}" type="button">${cat === "all" ? `All (${allPatterns.length})` : escapeHtml(cat)}</button>`
    ).join("");

    const patCounts = {};
    (window.QUESTIONS_DATA || []).forEach(q => {
      patCounts[q.patternId] = (patCounts[q.patternId] || 0) + 1;
    });

    const q = state.patternSearch.trim().toLowerCase();
    const filtered = allPatterns.filter(p => {
      if (state.patternCategory !== "all" && p.category !== state.patternCategory) return false;
      if (q) {
        const hay = (p.name + " " + p.category + " " + p.trigger + " " + p.code).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const listEl = document.getElementById("patternsList");
    listEl.innerHTML = filtered.map(p => `
      <div class="pattern-card">
        <div class="pc-hdr">
          <div>
            <div class="pc-title">${escapeHtml(p.name)}</div>
            <div class="muted-xs">${escapeHtml(p.category)} · TC: ${escapeHtml(p.tc)} · SC: ${escapeHtml(p.sc)}</div>
          </div>
          <button class="tg-swipe-btn" data-action="practice-pattern" data-patid="${p.id}" type="button">${ICONS.play} Practice (${patCounts[p.id] || 0})</button>
        </div>
        <div class="trigger-line">${escapeHtml(p.trigger)}</div>
        <ul class="intuition-list">
          ${p.intuition.map((b, i) => `<li><span class="step-num">0${i + 1}</span><span>${escapeHtml(b)}</span></li>`).join("")}
        </ul>
        ${p.trap ? `<div class="trap-box"><span class="trap-lbl">Pitfall</span>${escapeHtml(p.trap)}</div>` : ""}
        <div class="code-box">
          <div class="code-hdr">
            <span>template.cpp</span>
            <button class="code-mini-btn" data-action="copy-pat-code" data-patid="${p.id}" type="button">${ICONS.copy} Copy</button>
          </div>
          <pre class="cpp-pre">${highlightCpp(p.code)}</pre>
        </div>
      </div>
    `).join("");
  }

  // ==================== RENDER VIEW 4: COMPANIES & SYNC ====================
  function renderStatsView() {
    const allQs = window.QUESTIONS_DATA || [];

    const sheetKeys = ["must_do", "high_overlap", "babbar", "striver", "apna_dsa", "apna_dp", "med_sde", "hard_sde", "master"];
    const spList = document.getElementById("sheetProgressList");
    spList.innerHTML = sheetKeys.map(sk => {
      const meta = window.SHEETS_META[sk];
      const qs = allQs.filter(q => doesQuestionBelongToSheet(q, sk));
      const doneCnt = qs.filter(q => getQuestionStatus(q.id) === "done").length;
      return `
        <div class="sp-row" data-action="jump-sheet" data-sheet="${sk}">
          <span style="font-size:12px;font-weight:500;">${escapeHtml(meta.label.replace(/\s*\([\d,]+\)$/, ""))}</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent-light);">${doneCnt}/${qs.length} Done</span>
        </div>
      `;
    }).join("");

    const compFreq = {};
    allQs.forEach(q => {
      (q.companies || []).forEach(c => {
        compFreq[c] = (compFreq[c] || 0) + 1;
      });
    });
    const topComps = Object.entries(compFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 36);

    document.getElementById("companyGrid").innerHTML = topComps.map(([c, cnt]) =>
      `<button class="comp-btn" data-action="filter-company" data-company="${escapeAttr(c)}" type="button">${escapeHtml(c)} <span style="color:var(--text-muted);font-family:var(--font-mono);">(${cnt})</span></button>`
    ).join("");
  }

  // ==================== REFRESH & VIEW SWITCH ====================
  function refreshAll(resetReelScroll = true) {
    populateSheetSelectors();
    populateTopicSelectors();
    updateStatusFilterUI();
    currentList = getFilteredQuestions(false);
    renderReelFeed(resetReelScroll);
    if (state.view === "explorer") renderExplorer();
    if (state.view === "patterns") renderPatternsView();
    if (state.view === "stats") renderStatsView();
  }

  function switchView(viewName) {
    state.view = viewName;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${viewName}`).classList.add("active");

    document.querySelectorAll(".nav-tab, .snav-btn").forEach(t => {
      t.classList.toggle("active", t.dataset.view === viewName);
    });

    if (viewName === "explorer") renderExplorer();
    else if (viewName === "patterns") renderPatternsView();
    else if (viewName === "stats") renderStatsView();
  }

  function resetAllFilters() {
    state.topic = "all";
    state.statusFilter = "all";
    state.diff = "all";
    state.company = "";
    state.patternFilter = "";
    state.search = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("diffSelect").value = "all";
    const statusSel = document.getElementById("statusSelect");
    if (statusSel) statusSel.value = "all";
    refreshAll(true);
  }

  // ==================== CUSTOM CARD MODAL ====================
  function autoFitTextarea(el, minH) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight + 4, minH) + "px";
  }

  function openEditModal(qid) {
    const q = Q_MAP[qid];
    if (!q) return;
    state.editingQid = qid;
    const card = getCardContent(q);
    document.getElementById("editModalTitle").textContent = `Customize: ${q.title}`;
    const trigEl = document.getElementById("editTriggerInput");
    const notesEl = document.getElementById("editNotesInput");
    const codeEl = document.getElementById("editCodeInput");
    trigEl.value = card.trigger;
    notesEl.value = (card.intuition || []).join("\n");
    codeEl.value = card.code;
    document.getElementById("editModal").classList.remove("hidden");

    requestAnimationFrame(() => {
      autoFitTextarea(trigEl, 42);
      autoFitTextarea(notesEl, 110);
      autoFitTextarea(codeEl, 300);
    });
  }

  function saveCustomModal() {
    const qid = state.editingQid;
    if (!qid) return;
    const trigger = document.getElementById("editTriggerInput").value.trim();
    const notesRaw = document.getElementById("editNotesInput").value.trim();
    const code = document.getElementById("editCodeInput").value;
    const intuition = notesRaw ? notesRaw.split("\n").map(s => s.trim()).filter(Boolean) : [];

    customCards[qid] = { trigger, intuition, code, t: Date.now() };
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customCards));
    document.getElementById("editModal").classList.add("hidden");
    showToast("Saved custom C++ solution");
    refreshAll(false);
  }

  // ==================== GITHUB GIST SYNC ====================
  async function pushToGist() {
    const token = document.getElementById("gistTokenInput").value.trim();
    let gistId = document.getElementById("gistIdInput").value.trim();
    if (!token) {
      showToast("Enter a GitHub token (gist scope) first");
      return;
    }

    const payload = { updatedAt: Date.now(), userProgress, customCards };
    const body = {
      description: "DSA C++ Placement Revision Progress",
      public: false,
      files: {
        "dsa_reels_state.json": { content: JSON.stringify(payload, null, 2) }
      }
    };

    try {
      const url = gistId ? `https://api.github.com/gists/${gistId}` : "https://api.github.com/gists";
      const method = gistId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      gistId = data.id;
      document.getElementById("gistIdInput").value = gistId;
      localStorage.setItem(STORAGE_KEY_GIST, JSON.stringify({ token, gistId }));
      document.getElementById("syncStatusBadge").textContent = "Synced to Gist";
      showToast("Pushed to GitHub Gist");
    } catch (e) {
      showToast(`Gist Push failed: ${e.message}`);
    }
  }

  async function pullFromGist(silent = false) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_GIST) || "{}");
    const token = document.getElementById("gistTokenInput").value.trim() || saved.token || "";
    const gistId = document.getElementById("gistIdInput").value.trim() || saved.gistId || "";
    if (!gistId) {
      if (!silent) showToast("Enter your Gist ID to pull");
      return;
    }

    try {
      const headers = { "Accept": "application/vnd.github+json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const file = data.files && data.files["dsa_reels_state.json"];
      if (!file || !file.content) throw new Error("State file not found in Gist");
      const remote = JSON.parse(file.content);

      if (remote.userProgress) {
        for (const k in remote.userProgress) {
          if (!userProgress[k] || (remote.userProgress[k].t || 0) >= (userProgress[k].t || 0)) {
            userProgress[k] = remote.userProgress[k];
          }
        }
        saveProgress();
      }
      if (remote.customCards) {
        for (const k in remote.customCards) {
          if (!customCards[k] || (remote.customCards[k].t || 0) >= (customCards[k].t || 0)) {
            customCards[k] = remote.customCards[k];
          }
        }
        localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customCards));
      }

      if (token) localStorage.setItem(STORAGE_KEY_GIST, JSON.stringify({ token, gistId }));
      document.getElementById("syncStatusBadge").textContent = "Synced";
      showToast("Pulled & merged from Gist");
      refreshAll(false);
    } catch (e) {
      if (!silent) showToast(`Gist Pull failed: ${e.message}`);
    }
  }

  // ==================== HELPERS ====================
  function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.add("hidden"), 1800);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function scrollToCardIndex(targetIdx) {
    const feed = document.getElementById("reelFeed");
    if (!feed || targetIdx < 0 || targetIdx >= currentList.length) return;
    if (targetIdx >= state.reelLimit) {
      state.reelLimit = targetIdx + 30;
      renderReelFeed(false);
    }
    const cardEl = feed.querySelector(`[data-idx="${targetIdx}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  // ==================== EVENT LISTENERS ====================
  function bindEvents() {
    document.getElementById("sheetSelect").addEventListener("change", e => {
      state.sheet = e.target.value;
      state.topic = "all";
      state.patternFilter = "";
      state.reelLimit = 50;
      savePrefs();
      refreshAll(true);
    });

    document.getElementById("topicSelect").addEventListener("change", e => {
      state.topic = e.target.value;
      state.patternFilter = "";
      state.reelLimit = 50;
      refreshAll(true);
    });

    document.getElementById("sidebarNav").addEventListener("click", e => {
      const btn = e.target.closest(".snav-btn");
      if (!btn) return;
      switchView(btn.dataset.view);
    });

    document.getElementById("sidebarSheetList").addEventListener("click", e => {
      const btn = e.target.closest("[data-sheet]");
      if (!btn) return;
      state.sheet = btn.dataset.sheet;
      state.topic = "all";
      state.patternFilter = "";
      state.reelLimit = 50;
      savePrefs();
      refreshAll(true);
    });

    document.getElementById("sidebarTopicList").addEventListener("click", e => {
      const btn = e.target.closest("[data-topic]");
      if (!btn) return;
      state.topic = btn.dataset.topic;
      state.patternFilter = "";
      state.reelLimit = 50;
      refreshAll(true);
    });

    document.getElementById("diffSelect").addEventListener("change", e => {
      state.diff = e.target.value;
      refreshAll(true);
    });

    const statusSelect = document.getElementById("statusSelect");
    if (statusSelect) {
      statusSelect.addEventListener("change", e => {
        state.statusFilter = e.target.value;
        refreshAll(true);
      });
    }

    const sbStatusFilter = document.getElementById("sidebarStatusFilter");
    if (sbStatusFilter) {
      sbStatusFilter.addEventListener("click", e => {
        const btn = e.target.closest("[data-sfilter]");
        if (!btn) return;
        const val = btn.dataset.sfilter;
        state.statusFilter = (state.statusFilter === val && val !== "all") ? "all" : val;
        refreshAll(true);
      });
    }

    const expStatusPills = document.getElementById("explorerStatusPills");
    if (expStatusPills) {
      expStatusPills.addEventListener("click", e => {
        const btn = e.target.closest("[data-sfilter]");
        if (!btn) return;
        const val = btn.dataset.sfilter;
        state.statusFilter = (state.statusFilter === val && val !== "all") ? "all" : val;
        refreshAll(true);
      });
    }

    document.getElementById("brandBtn").addEventListener("click", () => {
      resetAllFilters();
      showToast("Filters reset");
    });

    document.getElementById("shuffleBtn").addEventListener("click", e => {
      state.shuffled = !state.shuffled;
      e.currentTarget.classList.toggle("active", state.shuffled);
      refreshAll(true);
      showToast(state.shuffled ? "Deck shuffled" : "Restored sheet order");
    });

    const autoBtn = document.getElementById("autoRevealBtn");
    autoBtn.classList.toggle("active", state.quizBlur);
    autoBtn.addEventListener("click", () => {
      state.quizBlur = !state.quizBlur;
      autoBtn.classList.toggle("active", state.quizBlur);
      savePrefs();
      renderReelFeed(false);
      showToast(state.quizBlur ? "Recall Mode ON (Solutions hidden)" : "Show All Solutions ON");
    });

    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        applyTheme();
        savePrefs();
        showToast(state.theme === "light" ? "Day Mode" : "Night Mode");
      });
    }

    document.querySelector(".bottom-nav").addEventListener("click", e => {
      const tab = e.target.closest(".nav-tab");
      if (!tab) return;
      switchView(tab.dataset.view);
    });

    const reelFeed = document.getElementById("reelFeed");
    reelFeed.addEventListener("scroll", () => {
      const h = reelFeed.clientHeight || 1;
      const idx = Math.round(reelFeed.scrollTop / h);
      if (idx !== state.activeIndex && idx >= 0 && idx < currentList.length) {
        state.activeIndex = idx;
        document.getElementById("deckCounter").textContent = `${idx + 1}/${currentList.length}`;
        if (idx >= state.reelLimit - 8 && state.reelLimit < currentList.length) {
          const prevScroll = reelFeed.scrollTop;
          state.reelLimit += 40;
          renderReelFeed(false);
          reelFeed.scrollTop = prevScroll;
        }
      }
    }, { passive: true });

    // Delegated clicks inside Reel Feed
    reelFeed.addEventListener("click", e => {
      const revealBtn = e.target.closest("[data-action='reveal-solution']");
      if (revealBtn) {
        const solPane = revealBtn.closest(".rc-solution-pane");
        if (solPane) solPane.classList.remove("masked");
        return;
      }

      const compChip = e.target.closest(".company-chip");
      if (compChip) {
        state.company = compChip.dataset.company;
        state.sheet = "master";
        state.topic = "all";
        refreshAll(true);
        showToast(`Filtered by ${state.company}`);
        return;
      }

      const actBtn = e.target.closest("[data-action]");
      if (!actBtn) return;
      const action = actBtn.dataset.action;
      const qid = actBtn.dataset.qid;

      if (action === "mark-status") {
        const targetStatus = actBtn.dataset.status; // "revisit" | "done"
        const curStatus = getQuestionStatus(qid);
        const nextStatus = curStatus === targetStatus ? "" : targetStatus;
        userProgress[qid] = userProgress[qid] || {};
        userProgress[qid].s = nextStatus;
        userProgress[qid].t = Date.now();
        saveProgress();

        const cardEl = actBtn.closest(".reel-card");
        if (cardEl) {
          const revBtn = cardEl.querySelector(".act-revisit");
          const doneBtn = cardEl.querySelector(".act-done");
          if (revBtn) revBtn.classList.toggle("active", nextStatus === "revisit");
          if (doneBtn) doneBtn.classList.toggle("active", nextStatus === "done");
        }
        updateStatusFilterUI();
        populateSheetSelectors();
        showToast(nextStatus === "revisit" ? "Marked Revisit" : nextStatus === "done" ? "Marked Done" : "Status cleared");
      } else if (action === "star") {
        userProgress[qid] = userProgress[qid] || {};
        userProgress[qid].star = userProgress[qid].star ? 0 : 1;
        userProgress[qid].t = Date.now();
        saveProgress();
        const isStar = Boolean(userProgress[qid].star);
        actBtn.classList.toggle("active", isStar);
        const icoWrap = actBtn.querySelector(".star-ico-wrap");
        if (icoWrap) icoWrap.innerHTML = isStar ? ICONS.starFilled : ICONS.starOutline;
        updateStatusFilterUI();
        showToast(isStar ? "Starred" : "Removed Star");
      } else if (action === "copy-code") {
        const q = Q_MAP[qid];
        if (q) {
          navigator.clipboard.writeText(getCardContent(q).code);
          showToast("C++ code copied");
        }
      } else if (action === "edit-card") {
        openEditModal(qid);
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener("keydown", e => {
      if (e.target.matches("input, textarea, select")) return;
      if (e.key === "t" || e.key === "T") {
        state.theme = state.theme === "dark" ? "light" : "dark";
        applyTheme();
        savePrefs();
        showToast(state.theme === "light" ? "Day Mode" : "Night Mode");
        return;
      }
      if (e.key === "1") { switchView("reels"); return; }
      if (e.key === "2") { switchView("explorer"); return; }
      if (e.key === "3") { switchView("patterns"); return; }
      if (e.key === "4") { switchView("stats"); return; }

      if (state.view === "reels" && currentList.length > 0) {
        if (e.key === "ArrowDown" || e.key === "j") {
          e.preventDefault();
          scrollToCardIndex(state.activeIndex + 1);
        } else if (e.key === "ArrowUp" || e.key === "k") {
          e.preventDefault();
          scrollToCardIndex(state.activeIndex - 1);
        } else if (e.key === " ") {
          e.preventDefault();
          const feed = document.getElementById("reelFeed");
          const solPane = feed.querySelector(`[data-idx="${state.activeIndex}"] .rc-solution-pane`);
          if (solPane) solPane.classList.toggle("masked");
        } else if (e.key === "r" || e.key === "R") {
          const feed = document.getElementById("reelFeed");
          const btn = feed.querySelector(`[data-idx="${state.activeIndex}"] .act-revisit`);
          if (btn) btn.click();
        } else if (e.key === "d" || e.key === "D") {
          const feed = document.getElementById("reelFeed");
          const btn = feed.querySelector(`[data-idx="${state.activeIndex}"] .act-done`);
          if (btn) btn.click();
        } else if (e.key === "s" || e.key === "S") {
          const feed = document.getElementById("reelFeed");
          const btn = feed.querySelector(`[data-idx="${state.activeIndex}"] .act-star`);
          if (btn) btn.click();
        }
      }
    });

    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    searchInput.addEventListener("input", e => {
      state.search = e.target.value;
      clearSearchBtn.classList.toggle("hidden", !state.search);
      currentList = getFilteredQuestions(false);
      renderExplorer();
    });
    clearSearchBtn.addEventListener("click", () => {
      state.search = "";
      searchInput.value = "";
      clearSearchBtn.classList.add("hidden");
      refreshAll(true);
    });

    document.getElementById("swipeCurrentBtn").addEventListener("click", () => {
      renderReelFeed(true);
      switchView("reels");
    });

    document.getElementById("explorerTopicPills").addEventListener("click", e => {
      const btn = e.target.closest(".t-pill");
      if (!btn) return;
      state.topic = btn.dataset.topic;
      state.patternFilter = "";
      refreshAll(true);
    });

    document.getElementById("clearCompanyBtn").addEventListener("click", () => {
      state.company = "";
      refreshAll(true);
    });

    document.getElementById("explorerList").addEventListener("click", e => {
      const swipeTopicBtn = e.target.closest("[data-action='swipe-topic']");
      if (swipeTopicBtn) {
        e.stopPropagation();
        state.topic = swipeTopicBtn.dataset.topic;
        refreshAll(true);
        switchView("reels");
        return;
      }

      const toggleHdr = e.target.closest("[data-action='toggle-topic']");
      if (toggleHdr) {
        const ckey = toggleHdr.dataset.ckey;
        state.collapsedTopics[ckey] = !state.collapsedTopics[ckey];
        renderExplorer();
        return;
      }

      const row = e.target.closest("[data-action='open-reel-at']");
      if (row) {
        const idx = Number(row.dataset.idx) || 0;
        if (idx >= state.reelLimit) state.reelLimit = idx + 30;
        renderReelFeed(false);
        switchView("reels");
        const feed = document.getElementById("reelFeed");
        const targetCard = feed.querySelector(`[data-idx="${idx}"]`);
        if (targetCard) targetCard.scrollIntoView();
      }
    });

    document.getElementById("patternSearchInput").addEventListener("input", e => {
      state.patternSearch = e.target.value;
      renderPatternsView();
    });

    document.getElementById("patternCategoryPills").addEventListener("click", e => {
      const btn = e.target.closest(".f-pill");
      if (!btn) return;
      state.patternCategory = btn.dataset.pcat;
      renderPatternsView();
    });

    document.getElementById("patternsList").addEventListener("click", e => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const patId = btn.dataset.patid;
      if (btn.dataset.action === "copy-pat-code") {
        const p = window.PATTERNS_CPP[patId];
        if (p) {
          navigator.clipboard.writeText(p.code);
          showToast("C++ template copied");
        }
      } else if (btn.dataset.action === "practice-pattern") {
        state.sheet = "master";
        state.topic = "all";
        state.patternFilter = patId;
        refreshAll(true);
        switchView("reels");
      }
    });

    document.getElementById("sheetProgressList").addEventListener("click", e => {
      const row = e.target.closest("[data-action='jump-sheet']");
      if (!row) return;
      state.sheet = row.dataset.sheet;
      state.topic = "all";
      state.patternFilter = "";
      savePrefs();
      refreshAll(true);
      switchView("explorer");
    });

    document.getElementById("companyGrid").addEventListener("click", e => {
      const btn = e.target.closest("[data-action='filter-company']");
      if (!btn) return;
      state.company = btn.dataset.company;
      state.sheet = "master";
      state.topic = "all";
      state.patternFilter = "";
      refreshAll(true);
      switchView("explorer");
    });

    document.getElementById("gistPushBtn").addEventListener("click", pushToGist);
    document.getElementById("gistPullBtn").addEventListener("click", () => pullFromGist(false));

    document.getElementById("copyMagicLinkBtn").addEventListener("click", () => {
      const tok = document.getElementById("gistTokenInput").value.trim();
      const gid = document.getElementById("gistIdInput").value.trim();
      if (!tok) {
        showToast("Enter Token & push once first");
        return;
      }
      const magicUrl = `${location.origin}${location.pathname}#gist=${encodeURIComponent(gid)}&tok=${encodeURIComponent(tok)}`;
      navigator.clipboard.writeText(magicUrl);
      showToast("Phone setup link copied");
    });

    document.getElementById("exportJsonBtn").addEventListener("click", () => {
      const dataStr = JSON.stringify({ userProgress, customCards }, null, 2);
      navigator.clipboard.writeText(dataStr);
      showToast("JSON copied to clipboard");
    });

    document.getElementById("importJsonBtn").addEventListener("click", () => {
      const raw = prompt("Paste your exported JSON here:");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.userProgress) {
          Object.assign(userProgress, parsed.userProgress);
          saveProgress();
        }
        if (parsed.customCards) {
          Object.assign(customCards, parsed.customCards);
          localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customCards));
        }
        refreshAll(false);
        showToast("Imported successfully");
      } catch (e) {
        showToast("Invalid JSON format");
      }
    });

    document.getElementById("resetProgressBtn").addEventListener("click", () => {
      if (confirm("Reset all saved data on this device?")) {
        userProgress = {};
        saveProgress();
        refreshAll(false);
        showToast("Reset complete");
      }
    });

    document.getElementById("closeEditModalBtn").addEventListener("click", () => {
      document.getElementById("editModal").classList.add("hidden");
    });
    document.getElementById("saveCustomCardBtn").addEventListener("click", saveCustomModal);
    document.getElementById("resetCustomCardBtn").addEventListener("click", () => {
      if (state.editingQid && customCards[state.editingQid]) {
        delete customCards[state.editingQid];
        localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customCards));
        document.getElementById("editModal").classList.add("hidden");
        refreshAll(false);
        showToast("Restored default solution");
      }
    });
  }

  // ==================== INIT ====================
  loadState();
  bindEvents();
  refreshAll(true);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.update());
    }).catch(() => {});
  }
})();

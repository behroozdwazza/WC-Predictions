const app = document.querySelector("#app");
const state = {
  data: null,
  user: JSON.parse(localStorage.getItem("wc-user") || "null"),
  token: localStorage.getItem("wc-token") || "",
  authMode: "login",
  tab: "matches",
  adminTab: "scores",
  day: "all",
  timezone: localStorage.getItem("wc-timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  lang: localStorage.getItem("wc-lang") || "en"
};

const translations = {
  en: {
    appTitle: "World Cup 2026 Predictions",
    loginTitle: "World Cup prediction contest",
    loginIntro: "Sign in with your player account. Admin credentials open the admin area.",
    signupIntro: "Create your player account once, then sign in each day to update predictions.",
    language: "Language",
    english: "English",
    farsi: "Farsi",
    login: "Log in",
    signup: "Sign up",
    username: "Username",
    screenName: "Screen name",
    password: "Password",
    createAccount: "Create account",
    matches: "matches",
    players: "players",
    administrator: "Administrator",
    playerAccount: "Player account",
    signOut: "Sign out",
    predictions: "Predictions",
    scoringRules: "Scoring Rules",
    admin: "Admin",
    fixtureTimezone: "Fixture timezone",
    allDays: "All days",
    fullFixture: "Full fixture",
    match: "match",
    pluralMatches: "matches",
    noMatches: "No matches in this view.",
    finished: "Finished",
    inProgress: "In progress",
    onPenalties: "on penalties",
    yourLatestPrediction: "Your latest prediction",
    adminNoPredictions: "Admin accounts cannot submit predictions.",
    predictionsClosed: "Predictions are closed for this match.",
    goals: "goals",
    penaltyWinner: "Penalty winner",
    choose: "Choose",
    save: "Save",
    ranking: "Ranking",
    noPlayers: "No players yet.",
    predictionCount: "predictions",
    scoring: "Scoring",
    groupSummary: "Exact score: 10 - correct outcome and goal difference: 7 - correct winner only: 4 - wrong shape or missing prediction: 0.",
    knockoutSummary: "Points rise by round. Predict the 120-minute score; if you predict a draw, choose who wins penalties.",
    timingSummary: "You can update a prediction until kickoff. The newest saved prediction is the one that counts.",
    groupStage: "Group stage",
    knockout: "Knockout",
    timing: "Timing",
    groupStageTitle: "Group Stage",
    predictionResult: "Prediction result",
    points: "Points",
    exactScoreRule: "Exact final score is predicted correctly.",
    diffRule: "Exact score is wrong, but the winner/draw and goal difference are correct.",
    winnerOnlyRule: "Only the match winner is predicted correctly.",
    wrongOutcomeRule: "The predicted outcome is different from the real outcome.",
    noPredictionRule: "No prediction was submitted before kickoff, or the prediction contradicts the real result.",
    knockoutPlayTitle: "Knockout Stage - Winner Decided During Play",
    knockoutPlayNote: "This applies when the winner is decided before penalties, including extra time.",
    round3216: "Round of 32 / 16",
    round32Only: "Round of 32",
    round16Only: "Round of 16",
    quarterFinal: "Quarter-final",
    semiThird: "Semi-final / Third place",
    final: "Final",
    winnerDiffRule: "Winner and goal difference are correct.",
    winnerWrongNoDrawRule: "Winner prediction is wrong, but the prediction was not a draw.",
    penWinnerWhenActualInPlayRule: "Winner is predicted correctly, but as the penalty winner.",
    wrongDrawShapeRule: "Wrong winner with a draw/no prediction shape.",
    knockoutPensTitle: "Knockout Stage - Winner Decided By Penalties",
    knockoutPensNote: "Predict the score after 120 minutes. If you predict a draw, choose the penalty winner.",
    pensExactRule: "120-minute draw score and penalty winner are both correct.",
    pensWinnerRule: "120-minute draw is predicted and penalty winner is correct, but exact score is wrong.",
    pensExactWrongRule: "120-minute draw score is exact, but penalty winner is wrong.",
    pensWrongRule: "120-minute draw is predicted, but score and penalty winner are wrong.",
    pensLiveWinnerRule: "Winner is predicted correctly without predicting the 120-minute draw.",
    winnerWrongRule: "Winner is predicted wrong.",
    adminNotice: "Admin is available only when signed in with the admin username and password. Use this area to enter final scores and manage player accounts.",
    updateScore: "Update Score",
    updateFixture: "Update Fixture",
    userManagement: "User Management",
    users: "Users",
    updateFixtureNotice: "After a stage finishes, replace placeholder names in the next-stage fixtures with the real teams.",
    updateFixtureButton: "Update fixture",
    addEditMatch: "Add or edit match",
    matchNumber: "Match number",
    stage: "Stage",
    home: "Home",
    away: "Away",
    group: "Group",
    kickoff: "Kickoff",
    venue: "Venue",
    saveMatch: "Save match",
    results: "Results",
    bulkImport: "Bulk fixture import",
    jsonMatches: "JSON matches",
    replaceFixture: "Replace fixture list",
    homeTeam: "Home team",
    awayTeam: "Away team",
    newPassword: "New password",
    keepPassword: "Leave blank to keep current",
    saveUser: "Save user",
    delete: "Delete",
    none: "None",
    saveResult: "Save result",
    clear: "Clear",
    deleteUserConfirm: "Delete {name} and all their predictions?",
    clearScoreConfirm: "Clear this score and remove its points from the ranking?",
    deleteMatchConfirm: "Delete this match and all predictions submitted for it?",
    stage_group: "Group",
    stage_round32: "Round of 32",
    stage_round16: "Round of 16",
    stage_quarter: "Quarter-final",
    stage_semi: "Semi-final",
    stage_third: "Third place",
    stage_final: "Final"
  },
  fa: {
    appTitle: "پیش‌بینی جام جهانی ۲۰۲۶",
    loginTitle: "مسابقه پیش‌بینی جام جهانی",
    loginIntro: "با حساب کاربری خود وارد شوید. حساب مدیر بخش مدیریت را نمایش می‌دهد.",
    signupIntro: "یک بار حساب کاربری بسازید و هر روز برای ثبت یا ویرایش پیش‌بینی‌ها وارد شوید.",
    language: "زبان",
    english: "انگلیسی",
    farsi: "فارسی",
    login: "ورود",
    signup: "ثبت‌نام",
    username: "نام کاربری",
    screenName: "نام نمایشی",
    password: "رمز عبور",
    createAccount: "ساخت حساب",
    matches: "بازی",
    players: "بازیکن",
    administrator: "مدیر",
    playerAccount: "حساب بازیکن",
    signOut: "خروج",
    predictions: "پیش‌بینی‌ها",
    scoringRules: "قوانین امتیازدهی",
    admin: "مدیریت",
    fixtureTimezone: "منطقه زمانی بازی‌ها",
    allDays: "همه روزها",
    fullFixture: "برنامه کامل",
    match: "بازی",
    pluralMatches: "بازی",
    noMatches: "در این بخش بازی‌ای وجود ندارد.",
    finished: "تمام شده",
    inProgress: "در حال برگزاری",
    onPenalties: "در ضربات پنالتی",
    yourLatestPrediction: "آخرین پیش‌بینی شما",
    adminNoPredictions: "حساب مدیر نمی‌تواند پیش‌بینی ثبت کند.",
    predictionsClosed: "مهلت پیش‌بینی برای این بازی تمام شده است.",
    goals: "گل",
    penaltyWinner: "برنده پنالتی",
    choose: "انتخاب کنید",
    save: "ذخیره",
    ranking: "جدول رده‌بندی",
    noPlayers: "هنوز بازیکنی وجود ندارد.",
    predictionCount: "پیش‌بینی",
    scoring: "امتیازدهی",
    groupSummary: "نتیجه دقیق: ۱۰ - نتیجه و اختلاف گل درست: ۷ - فقط برنده درست: ۴ - حالت اشتباه یا عدم پیش‌بینی: ۰.",
    knockoutSummary: "امتیازها با توجه به مرحله بیشتر می‌شوند. نتیجه پس از ۱۲۰ دقیقه را پیش‌بینی کنید؛ اگر مساوی پیش‌بینی می‌کنید، برنده پنالتی را هم انتخاب کنید.",
    timingSummary: "تا قبل از شروع بازی می‌توانید پیش‌بینی را تغییر دهید. آخرین پیش‌بینی ذخیره‌شده محاسبه می‌شود.",
    groupStage: "مرحله گروهی",
    knockout: "حذفی",
    timing: "زمان‌بندی",
    groupStageTitle: "مرحله گروهی",
    predictionResult: "وضعیت پیش‌بینی",
    points: "امتیاز",
    exactScoreRule: "نتیجه نهایی بازی دقیقاً درست پیش‌بینی شود.",
    diffRule: "نتیجه دقیق اشتباه باشد، اما برنده/مساوی و اختلاف گل درست باشد.",
    winnerOnlyRule: "فقط برنده بازی درست پیش‌بینی شود.",
    wrongOutcomeRule: "حالت پیش‌بینی‌شده با نتیجه واقعی متفاوت باشد.",
    noPredictionRule: "قبل از شروع بازی پیش‌بینی ثبت نشده باشد، یا پیش‌بینی خلاف نتیجه واقعی باشد.",
    knockoutPlayTitle: "مرحله حذفی - برنده در جریان بازی مشخص شود",
    knockoutPlayNote: "این حالت زمانی است که برنده قبل از ضربات پنالتی، از جمله در وقت اضافه، مشخص شود.",
    round3216: "یک‌سی‌ودوم / یک‌هشتم نهایی",
    round32Only: "یک‌سی‌ودوم نهایی",
    round16Only: "یک‌هشتم نهایی",
    quarterFinal: "یک‌چهارم نهایی",
    semiThird: "نیمه‌نهایی / رده‌بندی",
    final: "فینال",
    winnerDiffRule: "برنده و اختلاف گل درست باشد.",
    winnerWrongNoDrawRule: "برنده اشتباه باشد، اما پیش‌بینی مساوی نبوده باشد.",
    penWinnerWhenActualInPlayRule: "برنده درست پیش‌بینی شود، اما به عنوان برنده ضربات پنالتی.",
    wrongDrawShapeRule: "برنده اشتباه با حالت مساوی یا عدم پیش‌بینی.",
    knockoutPensTitle: "مرحله حذفی - برنده در ضربات پنالتی مشخص شود",
    knockoutPensNote: "نتیجه پس از ۱۲۰ دقیقه را پیش‌بینی کنید. اگر مساوی پیش‌بینی می‌کنید، برنده پنالتی را انتخاب کنید.",
    pensExactRule: "نتیجه مساوی پس از ۱۲۰ دقیقه و برنده پنالتی هر دو درست باشد.",
    pensWinnerRule: "مساوی پس از ۱۲۰ دقیقه و برنده پنالتی درست باشد، اما نتیجه دقیق اشتباه باشد.",
    pensExactWrongRule: "نتیجه مساوی پس از ۱۲۰ دقیقه دقیق باشد، اما برنده پنالتی اشتباه باشد.",
    pensWrongRule: "مساوی پیش‌بینی شود، اما نتیجه و برنده پنالتی اشتباه باشد.",
    pensLiveWinnerRule: "برنده درست پیش‌بینی شود، بدون اینکه مساوی پس از ۱۲۰ دقیقه پیش‌بینی شده باشد.",
    winnerWrongRule: "برنده اشتباه پیش‌بینی شود.",
    adminNotice: "بخش مدیریت فقط با حساب مدیر نمایش داده می‌شود. در این بخش می‌توانید نتایج را ثبت کنید و حساب کاربران را مدیریت کنید.",
    updateScore: "به‌روزرسانی نتیجه",
    updateFixture: "به‌روزرسانی برنامه",
    userManagement: "مدیریت کاربران",
    users: "کاربران",
    updateFixtureNotice: "پس از پایان هر مرحله، نام‌های جایگزین مرحله بعد را با نام تیم‌های واقعی عوض کنید.",
    updateFixtureButton: "به‌روزرسانی برنامه",
    addEditMatch: "افزودن یا ویرایش بازی",
    matchNumber: "شماره بازی",
    stage: "مرحله",
    home: "میزبان",
    away: "مهمان",
    group: "گروه",
    kickoff: "زمان شروع",
    venue: "ورزشگاه",
    saveMatch: "ذخیره بازی",
    results: "نتایج",
    bulkImport: "ورود گروهی برنامه",
    jsonMatches: "بازی‌ها با فرمت JSON",
    replaceFixture: "جایگزینی برنامه بازی‌ها",
    homeTeam: "تیم اول",
    awayTeam: "تیم دوم",
    newPassword: "رمز عبور جدید",
    keepPassword: "برای حفظ رمز فعلی خالی بگذارید",
    saveUser: "ذخیره کاربر",
    delete: "حذف",
    none: "هیچ‌کدام",
    saveResult: "ذخیره نتیجه",
    clear: "پاک کردن",
    deleteUserConfirm: "آیا {name} و همه پیش‌بینی‌هایش حذف شود؟",
    clearScoreConfirm: "این نتیجه پاک شود و امتیازهای مربوط به آن از جدول حذف شود؟",
    deleteMatchConfirm: "این بازی و همه پیش‌بینی‌های ثبت‌شده برای آن حذف شود؟",
    stage_group: "گروهی",
    stage_round32: "یک‌سی‌ودوم نهایی",
    stage_round16: "یک‌هشتم نهایی",
    stage_quarter: "یک‌چهارم نهایی",
    stage_semi: "نیمه‌نهایی",
    stage_third: "رده‌بندی",
    stage_final: "فینال"
  }
};

const timezones = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Mexico_City",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Tehran",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney"
];

const trophyImage = "https://commons.wikimedia.org/wiki/Special:Redirect/file/FIFA%20World%20Cup%20Trophy%20%28Ank%20Kumar%2C%20Infosys%20Limited%29%2002.jpg?width=160";
const logoImage = "https://commons.wikimedia.org/wiki/Special:Redirect/file/2026%20FIFA%20World%20Cup%20emblem%20%28with%20wordmark%29.svg?width=220";

const flags = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Canada: "ca",
  "Cape Verde": "cv",
  Colombia: "co",
  Croatia: "hr",
  Curacao: "cw",
  Czechia: "cz",
  "DR Congo": "cd",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  Iran: "ir",
  Iraq: "iq",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkiye: "tr",
  Uruguay: "uy",
  "United States": "us",
  Uzbekistan: "uz"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function t(key, values = {}) {
  const template = translations[state.lang]?.[key] || translations.en[key] || key;
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function stageLabel(stage) {
  return t(`stage_${stage}`);
}

function locale() {
  return state.lang === "fa" ? "fa-IR-u-ca-gregory" : undefined;
}

function applyLanguageDirection() {
  document.documentElement.lang = state.lang === "fa" ? "fa" : "en";
  document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", state.lang === "fa");
}

function languageSelector(id = "language-select") {
  return `
    <label class="language-control">${t("language")}
      <select id="${id}">
        <option value="en" ${state.lang === "en" ? "selected" : ""}>${t("english")}</option>
        <option value="fa" ${state.lang === "fa" ? "selected" : ""}>${t("farsi")}</option>
      </select>
    </label>
  `;
}

function wireLanguageSelector(selector = "#language-select") {
  document.querySelector(selector)?.addEventListener("change", event => {
    state.lang = event.target.value;
    localStorage.setItem("wc-lang", state.lang);
    render();
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { "X-Auth-Token": state.token } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

async function load() {
  if (state.token) {
    const payload = await api("/api/me");
    state.user = payload.user;
    state.data = payload.state;
    if (!state.user) {
      state.token = "";
      localStorage.removeItem("wc-token");
      localStorage.removeItem("wc-user");
    }
  } else {
    state.data = await api("/api/state");
  }
  render();
}

function formatKickoff(value) {
  return new Intl.DateTimeFormat(locale(), {
    timeZone: state.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function dateKey(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: state.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const get = type => parts.find(part => part.type === type).value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  return `${year}-${month}-${day}`;
}

function formatDay(value) {
  return new Intl.DateTimeFormat(locale(), {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function statusPill(match) {
  if (match.status === "finished") return `<span class="pill done">${t("finished")}</span>`;
  if (match.status === "live") return `<span class="pill live">${t("inProgress")}</span>`;
  return `<span class="pill">${formatKickoff(match.kickoff)}</span>`;
}

function latestPrediction(matchId) {
  if (!state.user || state.user.isAdmin) return null;
  return state.data.predictions[`${state.user.id}:${matchId}`] || null;
}

function isLocked(match) {
  return Date.now() >= new Date(match.kickoff).getTime();
}

function penaltyNote(match) {
  if (!match.penaltyWinner) return "";
  return `${match.penaltyWinner === "home" ? match.home : match.away} ${t("onPenalties")}`;
}

function teamLabel(team) {
  const code = flags[team] || "";
  const flag = code ? `<img class="flag" src="https://flagcdn.com/w40/${code}.png" alt="" loading="lazy">` : "";
  return `<span class="team-name">${flag}<span>${escapeHtml(team)}</span></span>`;
}

function brandImages() {
  return `
    <div class="brand-media" aria-label="FIFA World Cup 2026">
      <img class="brand-trophy" src="${trophyImage}" alt="World Cup trophy" loading="lazy">
      <img class="brand-logo" src="${logoImage}" alt="FIFA World Cup 2026 logo" loading="lazy">
    </div>
  `;
}

function renderLogin() {
  applyLanguageDirection();
  const isSignup = state.authMode === "signup";
  app.innerHTML = `
    <main class="login">
      ${brandImages()}
      ${languageSelector()}
      <h1>${t("loginTitle")}</h1>
      <p>${isSignup ? t("signupIntro") : t("loginIntro")}</p>
      <div class="auth-tabs">
        <button class="tab ${!isSignup ? "active" : ""}" data-auth-mode="login">${t("login")}</button>
        <button class="tab ${isSignup ? "active" : ""}" data-auth-mode="signup">${t("signup")}</button>
      </div>
      <form id="auth-form">
        <label>${t("username")}<input name="username" autocomplete="username" pattern="[a-z0-9_]{3,24}" required></label>
        ${isSignup ? `<label>${t("screenName")}<input name="screenName" autocomplete="nickname" maxlength="40" required></label>` : ""}
        <label>${t("password")}<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" required></label>
        <button>${isSignup ? t("createAccount") : t("login")}</button>
        <div class="error" id="auth-error"></div>
      </form>
    </main>
  `;
  wireLanguageSelector();
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      renderLogin();
    });
  });
  document.querySelector("#auth-form").addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.querySelector("#auth-error");
    error.textContent = "";
    try {
      const payload = await api(`/api/auth/${state.authMode}`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
      });
      state.token = payload.token;
      state.user = payload.user;
      state.data = payload.state;
      state.tab = state.user.isAdmin ? "admin" : "matches";
      localStorage.setItem("wc-token", state.token);
      localStorage.setItem("wc-user", JSON.stringify(state.user));
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function render() {
  if (!state.data) return;
  if (!state.user) return renderLogin();
  applyLanguageDirection();
  if (!state.user.isAdmin && state.tab === "admin") state.tab = "matches";
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand">
          ${brandImages()}
          <div>
            <h1>${t("appTitle")}</h1>
            <p>${state.data.matches.length} ${t("matches")} - ${state.data.players.length} ${t("players")}</p>
          </div>
        </div>
        <div class="userbar">
          ${languageSelector("language-select-header")}
          <div><strong>${escapeHtml(state.user.name)}</strong><p>${state.user.isAdmin ? t("administrator") : t("playerAccount")}</p></div>
          <button class="ghost" id="sign-out">${t("signOut")}</button>
        </div>
      </header>
      <section class="content">
        <div>
          <nav class="tabs">
            ${tabButton("matches", t("predictions"))}
            ${tabButton("rules", t("scoringRules"))}
            ${state.user.isAdmin ? tabButton("admin", t("admin")) : ""}
          </nav>
          ${state.tab === "matches" ? renderMatches() : ""}
          ${state.tab === "rules" ? renderRulesPage() : ""}
          ${state.tab === "admin" ? renderAdmin() : ""}
        </div>
        <aside class="side">
          ${renderRanking()}
          ${renderRules()}
        </aside>
      </section>
    </main>
  `;
  wireCommon();
  if (state.tab === "matches") wireMatches();
  if (state.tab === "admin") wireAdmin();
}

function tabButton(tab, label) {
  return `<button class="tab ${state.tab === tab ? "active" : ""}" data-tab="${tab}">${label}</button>`;
}

function renderMatches() {
  const days = [...new Set(state.data.matches.map(match => dateKey(match.kickoff)))];
  const activeDay = state.day === "all" || days.includes(state.day) ? state.day : days[0];
  state.day = activeDay;
  const matches = state.data.matches.filter(match => activeDay === "all" || dateKey(match.kickoff) === activeDay);
  return `
    <div class="panel timezone-panel">
      <label>${t("fixtureTimezone")}
        <select id="timezone-select">
          ${timezoneOptions()}
        </select>
      </label>
    </div>
    <div class="tabs">
      <button class="tab ${activeDay === "all" ? "active" : ""}" data-day="all">${t("allDays")}</button>
      ${days.map(day => `<button class="tab ${activeDay === day ? "active" : ""}" data-day="${day}">${formatDay(day)}</button>`).join("")}
    </div>
    <div class="panel day-summary">
      <strong>${activeDay === "all" ? t("fullFixture") : formatDay(activeDay)}</strong>
      <span>${matches.length} ${matches.length === 1 ? t("match") : t("pluralMatches")}</span>
    </div>
    <div class="match-list">
      ${matches.length ? matches.map(renderMatch).join("") : `<div class="panel empty">${t("noMatches")}</div>`}
    </div>
  `;
}

function timezoneOptions() {
  const zones = [...new Set([state.timezone, ...timezones])];
  return zones.map(zone => `<option value="${escapeHtml(zone)}" ${zone === state.timezone ? "selected" : ""}>${escapeHtml(zone)}</option>`).join("");
}

function renderMatch(match) {
  const prediction = latestPrediction(match.id);
  const locked = isLocked(match);
  const canSubmit = !state.user.isAdmin && !locked;
  return `
    <article class="match">
      <div class="match-head">
        <div>
          <div class="meta">${t("matchNumber")} ${match.number} - ${stageLabel(match.stage) || match.stage}${match.group ? ` - ${t("group")} ${escapeHtml(match.group)}` : ""}</div>
          <div class="teams">
            <div class="team-row"><span class="team">${teamLabel(match.home)}</span><span class="scoreline">${Number.isFinite(match.homeScore) ? match.homeScore : ""}</span></div>
            <div class="team-row"><span class="team">${teamLabel(match.away)}</span><span class="scoreline">${Number.isFinite(match.awayScore) ? match.awayScore : "vs"}</span></div>
          </div>
          ${penaltyNote(match) ? `<div class="meta">${escapeHtml(penaltyNote(match))}</div>` : ""}
          <div class="meta">${escapeHtml(match.venue || "")}</div>
        </div>
        ${statusPill(match)}
      </div>
      ${prediction ? `<div class="notice">${t("yourLatestPrediction")}: ${prediction.homeScore}-${prediction.awayScore}${prediction.penaltyWinner ? `, ${prediction.penaltyWinner === "home" ? escapeHtml(match.home) : escapeHtml(match.away)} ${t("onPenalties")}` : ""}</div>` : ""}
      ${canSubmit ? renderPredictionForm(match) : `<div class="locked">${state.user.isAdmin ? t("adminNoPredictions") : t("predictionsClosed")}</div>`}
    </article>
  `;
}

function renderPredictionForm(match) {
  return `
    <form class="prediction-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <label>${escapeHtml(match.home)} ${t("goals")}<input name="homeScore" type="number" min="0" max="99" required></label>
      <label>${escapeHtml(match.away)} ${t("goals")}<input name="awayScore" type="number" min="0" max="99" required></label>
      <label class="penalty-choice">${t("penaltyWinner")}
        <select name="penaltyWinner">
          <option value="">${t("choose")}</option>
          <option value="home">${escapeHtml(match.home)}</option>
          <option value="away">${escapeHtml(match.away)}</option>
        </select>
      </label>
      <button>${t("save")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderRanking() {
  return `
    <section class="side-section">
      <h2>${t("ranking")}</h2>
      <div class="ranking">
        ${state.data.standings.map((player, index) => `
          <div class="rank-row">
            <span class="rank">${index + 1}</span>
            <span>${escapeHtml(player.name)}<br><span class="meta">${player.predicted} ${t("predictionCount")}</span></span>
            <span class="points">${player.points}</span>
          </div>
        `).join("") || `<div class="empty">${t("noPlayers")}</div>`}
      </div>
    </section>
  `;
}

function renderRules() {
  return `
    <section class="side-section">
      <h2>${t("scoring")}</h2>
      <div class="rules">
        <div><strong>${t("groupStage")}</strong><br>${t("groupSummary")}</div>
        <div><strong>${t("knockout")}</strong><br>${t("knockoutSummary")}</div>
        <div><strong>${t("timing")}</strong><br>${t("timingSummary")}</div>
      </div>
    </section>
  `;
}

function renderRulesPage() {
  return `
    <section class="panel rules-page">
      <h2>${t("groupStageTitle")}</h2>
      <table class="rules-table">
        <thead>
          <tr><th>${t("predictionResult")}</th><th>${t("points")}</th></tr>
        </thead>
        <tbody>
          <tr><td>${t("exactScoreRule")}</td><td>10</td></tr>
          <tr><td>${t("diffRule")}</td><td>7</td></tr>
          <tr><td>${t("winnerOnlyRule")}</td><td>4</td></tr>
          <tr><td>${t("wrongOutcomeRule")}</td><td>0</td></tr>
          <tr><td>${t("noPredictionRule")}</td><td>0</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>${t("knockoutPlayTitle")}</h2>
      <p class="meta">${t("knockoutPlayNote")}</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>${t("predictionResult")}</th>
            <th>${t("round32Only")}</th>
            <th>${t("round16Only")}</th>
            <th>${t("quarterFinal")}</th>
            <th>${t("semiThird")}</th>
            <th>${t("final")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>${t("exactScoreRule")}</td><td>15</td><td>20</td><td>25</td><td>30</td><td>35</td></tr>
          <tr><td>${t("winnerDiffRule")}</td><td>11</td><td>15</td><td>19</td><td>23</td><td>27</td></tr>
          <tr><td>${t("winnerOnlyRule")}</td><td>7</td><td>10</td><td>13</td><td>16</td><td>19</td></tr>
          <tr><td>${t("penWinnerWhenActualInPlayRule")}</td><td>3</td><td>5</td><td>7</td><td>9</td><td>11</td></tr>
          <tr><td>${t("winnerWrongRule")}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>${t("knockoutPensTitle")}</h2>
      <p class="meta">${t("knockoutPensNote")}</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>${t("predictionResult")}</th>
            <th>${t("round32Only")}</th>
            <th>${t("round16Only")}</th>
            <th>${t("quarterFinal")}</th>
            <th>${t("semiThird")}</th>
            <th>${t("final")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>${t("pensExactRule")}</td><td>15</td><td>19.5</td><td>25.35</td><td>30</td><td>35</td></tr>
          <tr><td>${t("pensExactWrongRule")}</td><td>11</td><td>15</td><td>19</td><td>23</td><td>27</td></tr>
          <tr><td>${t("pensWinnerRule")}</td><td>9</td><td>11.7</td><td>15.21</td><td>18</td><td>21</td></tr>
          <tr><td>${t("pensWrongRule")}</td><td>6</td><td>7.8</td><td>10.14</td><td>12</td><td>14</td></tr>
          <tr><td>${t("pensLiveWinnerRule")}</td><td>3</td><td>3.9</td><td>5.07</td><td>6</td><td>7</td></tr>
          <tr><td>${t("winnerWrongRule")}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="panel">
      <h2>${t("admin")}</h2>
      <div class="notice">${t("adminNotice")}</div>
      <div class="error" id="admin-error"></div>
    </section>
    <nav class="tabs admin-tabs">
      ${adminTabButton("scores", t("updateScore"))}
      ${adminTabButton("fixture", t("updateFixture"))}
      ${adminTabButton("users", t("userManagement"))}
    </nav>
    ${state.adminTab === "scores" ? renderScoreAdmin() : ""}
    ${state.adminTab === "fixture" ? renderFixtureAdmin() : ""}
    ${state.adminTab === "users" ? renderUserAdmin() : ""}
  `;
}

function adminTabButton(tab, label) {
  return `<button class="tab ${state.adminTab === tab ? "active" : ""}" data-admin-tab="${tab}">${label}</button>`;
}

function renderUserAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("users")}</h2>
      ${state.data.players.length ? state.data.players.map(renderUserForm).join("") : `<div class="empty">${t("noPlayers")}</div>`}
    </section>
  `;
}

function renderFixtureAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("updateFixture")}</h2>
      <div class="notice">${t("updateFixtureNotice")}</div>
      <form id="fixture-form">
        ${renderFixtureEditor()}
        <button class="wide">${t("updateFixtureButton")}</button>
        <div class="error wide" id="fixture-error"></div>
      </form>
    </section>
  `;
}

function renderScoreAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("addEditMatch")}</h2>
      <form id="match-form" class="admin-grid">
        <label>${t("matchNumber")}<input name="number" type="number" min="1" required></label>
        <label>${t("stage")}<select name="stage">${["group", "round32", "round16", "quarter", "semi", "third", "final"].map(key => `<option value="${key}">${stageLabel(key)}</option>`).join("")}</select></label>
        <label>${t("home")}<input name="home" required></label>
        <label>${t("away")}<input name="away" required></label>
        <label>${t("group")}<input name="group" placeholder="A"></label>
        <label>${t("kickoff")}<input name="kickoff" type="datetime-local" required></label>
        <label class="wide">${t("venue")}<input name="venue"></label>
        <button class="wide">${t("saveMatch")}</button>
      </form>
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>${t("results")}</h2>
      ${state.data.matches.map(renderScoreForm).join("")}
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>${t("bulkImport")}</h2>
      <form id="import-form" class="admin-grid">
        <label class="wide">${t("jsonMatches")}<textarea name="matches" placeholder='[{"number":1,"stage":"group","group":"A","home":"Mexico","away":"South Africa","kickoff":"2026-06-11T19:00:00.000Z","venue":"Estadio Azteca"}]'></textarea></label>
        <button class="wide">${t("replaceFixture")}</button>
      </form>
    </section>
  `;
}

function renderFixtureEditor() {
  const knockoutMatches = state.data.matches.filter(match => match.stage !== "group");
  return knockoutMatches.map(match => `
    <div class="fixture-row" data-match-id="${match.id}">
      <div>
        <strong>${t("matchNumber")} ${match.number}</strong><br>
        <span class="meta">${stageLabel(match.stage)} - ${formatKickoff(match.kickoff)}</span>
      </div>
      <label>${t("homeTeam")}<input name="home" value="${escapeHtml(match.home)}"></label>
      <label>${t("awayTeam")}<input name="away" value="${escapeHtml(match.away)}"></label>
    </div>
  `).join("");
}

function renderUserForm(player) {
  return `
    <form class="user-form" data-player-id="${player.id}">
      <label>${t("username")}<input name="username" value="${escapeHtml(player.username || "")}" required></label>
      <label>${t("screenName")}<input name="screenName" value="${escapeHtml(player.name || "")}" required></label>
      <label>${t("newPassword")}<input name="password" type="password" placeholder="${t("keepPassword")}"></label>
      <button>${t("saveUser")}</button>
      <button type="button" class="ghost delete-user">${t("delete")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderScoreForm(match) {
  const hasScore = Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
  return `
    <form class="score-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <div><strong>${match.number}. ${teamLabel(match.home)} vs ${teamLabel(match.away)}</strong><br><span class="meta">${stageLabel(match.stage)} - ${formatKickoff(match.kickoff)}</span></div>
      <label>${escapeHtml(match.home)}<input name="homeScore" type="number" min="0" max="99" value="${Number.isFinite(match.homeScore) ? match.homeScore : ""}" required></label>
      <label>${escapeHtml(match.away)}<input name="awayScore" type="number" min="0" max="99" value="${Number.isFinite(match.awayScore) ? match.awayScore : ""}" required></label>
      <label>${t("penaltyWinner")}<select name="penaltyWinner">
        <option value="">${t("none")}</option>
        <option value="home" ${match.penaltyWinner === "home" ? "selected" : ""}>${escapeHtml(match.home)}</option>
        <option value="away" ${match.penaltyWinner === "away" ? "selected" : ""}>${escapeHtml(match.away)}</option>
      </select></label>
      <button>${t("saveResult")}</button>
      <button type="button" class="ghost clear-score" ${hasScore ? "" : "disabled"}>${t("clear")}</button>
      <button type="button" class="ghost delete-match">${t("delete")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function wireCommon() {
  wireLanguageSelector("#language-select-header");
  document.querySelector("#sign-out")?.addEventListener("click", () => {
    localStorage.removeItem("wc-token");
    localStorage.removeItem("wc-user");
    state.token = "";
    state.user = null;
    state.tab = "matches";
    render();
  });
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      render();
    });
  });
}

function wireMatches() {
  document.querySelectorAll("[data-day]").forEach(button => {
    button.addEventListener("click", () => {
      state.day = button.dataset.day;
      render();
    });
  });
  document.querySelector("#timezone-select")?.addEventListener("change", event => {
    state.timezone = event.target.value;
    state.day = "all";
    localStorage.setItem("wc-timezone", state.timezone);
    render();
  });
  document.querySelectorAll(".prediction-form").forEach(form => {
    const updatePenalty = () => {
      const home = Number(form.elements.homeScore.value);
      const away = Number(form.elements.awayScore.value);
      form.classList.toggle("show-penalty", form.dataset.stage !== "group" && Number.isFinite(home) && Number.isFinite(away) && home === away);
    };
    form.elements.homeScore.addEventListener("input", updatePenalty);
    form.elements.awayScore.addEventListener("input", updatePenalty);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/predictions", {
          method: "POST",
          body: JSON.stringify({
            matchId: form.dataset.matchId,
            homeScore: form.elements.homeScore.value,
            awayScore: form.elements.awayScore.value,
            penaltyWinner: form.elements.penaltyWinner?.value || ""
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });
}

function wireAdmin() {
  document.querySelectorAll("[data-admin-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      render();
    });
  });

  document.querySelectorAll(".user-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({
            playerId: form.dataset.playerId,
            username: form.elements.username.value,
            screenName: form.elements.screenName.value,
            password: form.elements.password.value
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".delete-user").addEventListener("click", async () => {
      const screenName = form.elements.screenName.value || "this user";
      if (!confirm(t("deleteUserConfirm", { name: screenName }))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/users/delete", {
          method: "POST",
          body: JSON.stringify({ playerId: form.dataset.playerId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });

  document.querySelector("#match-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    state.data = await api("/api/admin/matches", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    render();
  });

  document.querySelector("#fixture-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.querySelector("#fixture-error");
    error.textContent = "";
    const matches = [...document.querySelectorAll(".fixture-row")].map(row => ({
      id: row.dataset.matchId,
      home: row.querySelector('input[name="home"]').value,
      away: row.querySelector('input[name="away"]').value
    }));
    try {
      state.data = await api("/api/admin/fixture", {
        method: "POST",
        body: JSON.stringify({ matches })
      });
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  document.querySelectorAll(".score-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/results", {
          method: "POST",
          body: JSON.stringify({
            matchId: form.dataset.matchId,
            homeScore: form.elements.homeScore.value,
            awayScore: form.elements.awayScore.value,
            penaltyWinner: form.elements.penaltyWinner.value,
            status: "finished"
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".clear-score").addEventListener("click", async () => {
      if (!confirm(t("clearScoreConfirm"))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/results/clear", {
          method: "POST",
          body: JSON.stringify({ matchId: form.dataset.matchId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".delete-match").addEventListener("click", async () => {
      if (!confirm(t("deleteMatchConfirm"))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/matches/delete", {
          method: "POST",
          body: JSON.stringify({ matchId: form.dataset.matchId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });

  document.querySelector("#import-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const matches = JSON.parse(form.elements.matches.value);
      state.data = await api("/api/admin/import", {
        method: "POST",
        body: JSON.stringify({ matches })
      });
      render();
    } catch (err) {
      alert(err.message);
    }
  });
}

load();

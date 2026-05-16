const app = document.querySelector("#app");
const state = {
  data: null,
  user: JSON.parse(localStorage.getItem("wc-user") || "null"),
  token: localStorage.getItem("wc-token") || "",
  authMode: "login",
  tab: "matches",
  adminTab: "scores",
  day: "all",
  timezone: localStorage.getItem("wc-timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
};

const stageLabels = {
  group: "Group",
  round32: "Round of 32",
  round16: "Round of 16",
  quarter: "Quarter-final",
  semi: "Semi-final",
  third: "Third place",
  final: "Final"
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
  return new Intl.DateTimeFormat(undefined, {
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
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function statusPill(match) {
  if (match.status === "finished") return `<span class="pill done">Finished</span>`;
  if (match.status === "live") return `<span class="pill live">In progress</span>`;
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
  return `${match.penaltyWinner === "home" ? match.home : match.away} on penalties`;
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
  const isSignup = state.authMode === "signup";
  app.innerHTML = `
    <main class="login">
      ${brandImages()}
      <h1>World Cup prediction contest</h1>
      <p>${isSignup ? "Create your player account once, then sign in each day to update predictions." : "Sign in with your player account. Admin credentials open the admin area."}</p>
      <div class="auth-tabs">
        <button class="tab ${!isSignup ? "active" : ""}" data-auth-mode="login">Log in</button>
        <button class="tab ${isSignup ? "active" : ""}" data-auth-mode="signup">Sign up</button>
      </div>
      <form id="auth-form">
        <label>Username<input name="username" autocomplete="username" pattern="[a-z0-9_]{3,24}" required></label>
        ${isSignup ? `<label>Screen name<input name="screenName" autocomplete="nickname" maxlength="40" required></label>` : ""}
        <label>Password<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" required></label>
        <button>${isSignup ? "Create account" : "Log in"}</button>
        <div class="error" id="auth-error"></div>
      </form>
    </main>
  `;
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
  if (!state.user.isAdmin && state.tab === "admin") state.tab = "matches";
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand">
          ${brandImages()}
          <div>
            <h1>World Cup 2026 Predictions</h1>
            <p>${state.data.matches.length} matches - ${state.data.players.length} players</p>
          </div>
        </div>
        <div class="userbar">
          <div><strong>${escapeHtml(state.user.name)}</strong><p>${state.user.isAdmin ? "Administrator" : "Player account"}</p></div>
          <button class="ghost" id="sign-out">Sign out</button>
        </div>
      </header>
      <section class="content">
        <div>
          <nav class="tabs">
            ${tabButton("matches", "Predictions")}
            ${tabButton("rules", "Scoring Rules")}
            ${state.user.isAdmin ? tabButton("admin", "Admin") : ""}
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
      <label>Fixture timezone
        <select id="timezone-select">
          ${timezoneOptions()}
        </select>
      </label>
    </div>
    <div class="tabs">
      <button class="tab ${activeDay === "all" ? "active" : ""}" data-day="all">All days</button>
      ${days.map(day => `<button class="tab ${activeDay === day ? "active" : ""}" data-day="${day}">${formatDay(day)}</button>`).join("")}
    </div>
    <div class="panel day-summary">
      <strong>${activeDay === "all" ? "Full fixture" : formatDay(activeDay)}</strong>
      <span>${matches.length} match${matches.length === 1 ? "" : "es"}</span>
    </div>
    <div class="match-list">
      ${matches.length ? matches.map(renderMatch).join("") : `<div class="panel empty">No matches in this view.</div>`}
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
          <div class="meta">Match ${match.number} - ${stageLabels[match.stage] || match.stage}${match.group ? ` - Group ${escapeHtml(match.group)}` : ""}</div>
          <div class="teams">
            <div class="team-row"><span class="team">${teamLabel(match.home)}</span><span class="scoreline">${Number.isFinite(match.homeScore) ? match.homeScore : ""}</span></div>
            <div class="team-row"><span class="team">${teamLabel(match.away)}</span><span class="scoreline">${Number.isFinite(match.awayScore) ? match.awayScore : "vs"}</span></div>
          </div>
          ${penaltyNote(match) ? `<div class="meta">${escapeHtml(penaltyNote(match))}</div>` : ""}
          <div class="meta">${escapeHtml(match.venue || "")}</div>
        </div>
        ${statusPill(match)}
      </div>
      ${prediction ? `<div class="notice">Your latest prediction: ${prediction.homeScore}-${prediction.awayScore}${prediction.penaltyWinner ? `, ${prediction.penaltyWinner === "home" ? escapeHtml(match.home) : escapeHtml(match.away)} on penalties` : ""}</div>` : ""}
      ${canSubmit ? renderPredictionForm(match) : `<div class="locked">${state.user.isAdmin ? "Admin accounts cannot submit predictions." : "Predictions are closed for this match."}</div>`}
    </article>
  `;
}

function renderPredictionForm(match) {
  return `
    <form class="prediction-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <label>${escapeHtml(match.home)} goals<input name="homeScore" type="number" min="0" max="99" required></label>
      <label>${escapeHtml(match.away)} goals<input name="awayScore" type="number" min="0" max="99" required></label>
      <label class="penalty-choice">Penalty winner
        <select name="penaltyWinner">
          <option value="">Choose</option>
          <option value="home">${escapeHtml(match.home)}</option>
          <option value="away">${escapeHtml(match.away)}</option>
        </select>
      </label>
      <button>Save</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderRanking() {
  return `
    <section class="side-section">
      <h2>Ranking</h2>
      <div class="ranking">
        ${state.data.standings.map((player, index) => `
          <div class="rank-row">
            <span class="rank">${index + 1}</span>
            <span>${escapeHtml(player.name)}<br><span class="meta">${player.predicted} predictions</span></span>
            <span class="points">${player.points}</span>
          </div>
        `).join("") || `<div class="empty">No players yet.</div>`}
      </div>
    </section>
  `;
}

function renderRules() {
  return `
    <section class="side-section">
      <h2>Scoring</h2>
      <div class="rules">
        <div><strong>Group stage</strong><br>Exact score: 10 - correct outcome and goal difference: 7 - correct winner only: 4 - wrong shape: 0 - missing prediction after full time: -2.</div>
        <div><strong>Knockout</strong><br>Points rise by round. Predict the 120-minute score; if you predict a draw, choose who wins penalties.</div>
        <div><strong>Timing</strong><br>You can update a prediction until kickoff. The newest saved prediction is the one that counts.</div>
      </div>
    </section>
  `;
}

function renderRulesPage() {
  return `
    <section class="panel rules-page">
      <h2>Group Stage</h2>
      <table class="rules-table">
        <thead>
          <tr><th>Prediction result</th><th>Points</th></tr>
        </thead>
        <tbody>
          <tr><td>Exact final score is predicted correctly.</td><td>10</td></tr>
          <tr><td>Exact score is wrong, but the winner/draw and goal difference are correct.</td><td>7</td></tr>
          <tr><td>Only the match winner is predicted correctly.</td><td>4</td></tr>
          <tr><td>The predicted outcome is different from the real outcome.</td><td>0</td></tr>
          <tr><td>No prediction was submitted before kickoff.</td><td>-2</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>Knockout Stage - Winner Decided During Play</h2>
      <p class="meta">This applies when the winner is decided before penalties, including extra time.</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>Prediction result</th>
            <th>Round of 32 / 16</th>
            <th>Quarter-final</th>
            <th>Semi-final / Third place</th>
            <th>Final</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Exact final score is predicted correctly.</td><td>15</td><td>20</td><td>25</td><td>30</td></tr>
          <tr><td>Winner and goal difference are correct.</td><td>11</td><td>15</td><td>19</td><td>23</td></tr>
          <tr><td>Only the winner is predicted correctly.</td><td>7</td><td>10</td><td>13</td><td>16</td></tr>
          <tr><td>Winner prediction is wrong, but the prediction was not a draw.</td><td>3</td><td>5</td><td>7</td><td>9</td></tr>
          <tr><td>Wrong winner with a draw/no prediction shape.</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>Knockout Stage - Winner Decided By Penalties</h2>
      <p class="meta">Predict the score after 120 minutes. If you predict a draw, choose the penalty winner.</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>Prediction result</th>
            <th>Round of 32 / 16</th>
            <th>Quarter-final</th>
            <th>Semi-final / Third place</th>
            <th>Final</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>120-minute draw score and penalty winner are both correct.</td><td>15</td><td>20</td><td>25</td><td>30</td></tr>
          <tr><td>120-minute draw is predicted and penalty winner is correct, but exact score is wrong.</td><td>11</td><td>15</td><td>19</td><td>23</td></tr>
          <tr><td>120-minute draw score is exact, but penalty winner is wrong.</td><td>9</td><td>12</td><td>15</td><td>18</td></tr>
          <tr><td>120-minute draw is predicted, but score and penalty winner are wrong.</td><td>6</td><td>8</td><td>10</td><td>12</td></tr>
          <tr><td>Winner is predicted correctly without predicting the 120-minute draw.</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
          <tr><td>Winner is predicted wrong.</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="panel">
      <h2>Admin</h2>
      <div class="notice">Admin is available only when signed in with the admin username and password. Use this area to enter final scores and manage player accounts.</div>
      <div class="error" id="admin-error"></div>
    </section>
    <nav class="tabs admin-tabs">
      ${adminTabButton("scores", "Update Score")}
      ${adminTabButton("fixture", "Update Fixture")}
      ${adminTabButton("users", "User Management")}
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
      <h2>Users</h2>
      ${state.data.players.length ? state.data.players.map(renderUserForm).join("") : `<div class="empty">No player accounts yet.</div>`}
    </section>
  `;
}

function renderFixtureAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>Update Fixture</h2>
      <div class="notice">After a stage finishes, replace placeholder names in the next-stage fixtures with the real teams.</div>
      <form id="fixture-form">
        ${renderFixtureEditor()}
        <button class="wide">Update fixture</button>
        <div class="error wide" id="fixture-error"></div>
      </form>
    </section>
  `;
}

function renderScoreAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>Add or edit match</h2>
      <form id="match-form" class="admin-grid">
        <label>Match number<input name="number" type="number" min="1" required></label>
        <label>Stage<select name="stage">${Object.entries(stageLabels).map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}</select></label>
        <label>Home<input name="home" required></label>
        <label>Away<input name="away" required></label>
        <label>Group<input name="group" placeholder="A"></label>
        <label>Kickoff<input name="kickoff" type="datetime-local" required></label>
        <label class="wide">Venue<input name="venue"></label>
        <button class="wide">Save match</button>
      </form>
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>Results</h2>
      ${state.data.matches.map(renderScoreForm).join("")}
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>Bulk fixture import</h2>
      <form id="import-form" class="admin-grid">
        <label class="wide">JSON matches<textarea name="matches" placeholder='[{"number":1,"stage":"group","group":"A","home":"Mexico","away":"South Africa","kickoff":"2026-06-11T19:00:00.000Z","venue":"Estadio Azteca"}]'></textarea></label>
        <button class="wide">Replace fixture list</button>
      </form>
    </section>
  `;
}

function renderFixtureEditor() {
  const knockoutMatches = state.data.matches.filter(match => match.stage !== "group");
  return knockoutMatches.map(match => `
    <div class="fixture-row" data-match-id="${match.id}">
      <div>
        <strong>Match ${match.number}</strong><br>
        <span class="meta">${stageLabels[match.stage]} - ${formatKickoff(match.kickoff)}</span>
      </div>
      <label>Home team<input name="home" value="${escapeHtml(match.home)}"></label>
      <label>Away team<input name="away" value="${escapeHtml(match.away)}"></label>
    </div>
  `).join("");
}

function renderUserForm(player) {
  return `
    <form class="user-form" data-player-id="${player.id}">
      <label>Username<input name="username" value="${escapeHtml(player.username || "")}" required></label>
      <label>Screen name<input name="screenName" value="${escapeHtml(player.name || "")}" required></label>
      <label>New password<input name="password" type="password" placeholder="Leave blank to keep current"></label>
      <button>Save user</button>
      <button type="button" class="ghost delete-user">Delete</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderScoreForm(match) {
  const hasScore = Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
  return `
    <form class="score-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <div><strong>${match.number}. ${teamLabel(match.home)} vs ${teamLabel(match.away)}</strong><br><span class="meta">${stageLabels[match.stage]} - ${formatKickoff(match.kickoff)}</span></div>
      <label>${escapeHtml(match.home)}<input name="homeScore" type="number" min="0" max="99" value="${Number.isFinite(match.homeScore) ? match.homeScore : ""}" required></label>
      <label>${escapeHtml(match.away)}<input name="awayScore" type="number" min="0" max="99" value="${Number.isFinite(match.awayScore) ? match.awayScore : ""}" required></label>
      <label>Penalty winner<select name="penaltyWinner">
        <option value="">None</option>
        <option value="home" ${match.penaltyWinner === "home" ? "selected" : ""}>${escapeHtml(match.home)}</option>
        <option value="away" ${match.penaltyWinner === "away" ? "selected" : ""}>${escapeHtml(match.away)}</option>
      </select></label>
      <button>Save result</button>
      <button type="button" class="ghost clear-score" ${hasScore ? "" : "disabled"}>Clear</button>
      <div class="error wide"></div>
    </form>
  `;
}

function wireCommon() {
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
      if (!confirm(`Delete ${screenName} and all their predictions?`)) return;
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
      if (!confirm("Clear this score and remove its points from the ranking?")) return;
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

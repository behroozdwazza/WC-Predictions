const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const seedMatches = require("./fixtures");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "worldcup-admin";

const STAGE_POINTS = {
  round32: { exact: 15, diff: 11, winner: 7, penWinnerWhenActualInPlay: 3, penExact: 15, penDrawWinner: 9, penExactWrongWinner: 11, penDrawWrongWinner: 6, liveWinner: 3 },
  round16: { exact: 20, diff: 15, winner: 10, penWinnerWhenActualInPlay: 5, penExact: 19.5, penDrawWinner: 11.7, penExactWrongWinner: 15, penDrawWrongWinner: 7.8, liveWinner: 3.9 },
  quarter: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25.35, penDrawWinner: 15.21, penExactWrongWinner: 19, penDrawWrongWinner: 10.14, liveWinner: 5.07 },
  third: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25.35, penDrawWinner: 15.21, penExactWrongWinner: 19, penDrawWrongWinner: 10.14, liveWinner: 5.07 },
  semi: { exact: 30, diff: 23, winner: 16, penWinnerWhenActualInPlay: 9, penExact: 30, penDrawWinner: 18, penExactWrongWinner: 23, penDrawWrongWinner: 12, liveWinner: 6 },
  final: { exact: 35, diff: 27, winner: 19, penWinnerWhenActualInPlay: 11, penExact: 35, penDrawWinner: 21, penExactWrongWinner: 27, penDrawWrongWinner: 14, liveWinner: 7 }
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

async function loadDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const db = JSON.parse(raw);
    return normalizeDb(db);
  } catch {
    const db = normalizeDb({
      players: [],
      matches: seedMatches,
      predictions: [],
      sessions: [],
      settings: {}
    });
    await saveDb(db);
    return db;
  }
}

function normalizeDb(db) {
  const existingMatches = Array.isArray(db.matches) ? db.matches : [];
  const matches = existingMatches.length < seedMatches.length ? seedMatches : existingMatches;
  return {
    players: Array.isArray(db.players) ? db.players : [],
    matches,
    predictions: Array.isArray(db.predictions) ? db.predictions : [],
    sessions: Array.isArray(db.sessions) ? db.sessions : [],
    settings: db.settings || {}
  };
}

async function saveDb(db) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
  });
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function safePlayer(player) {
  return {
    id: player.id,
    username: player.username,
    screenName: player.screenName || player.name || player.username,
    name: player.screenName || player.name || player.username,
    createdAt: player.createdAt
  };
}

function publicState(db) {
  const latest = latestPredictions(db.predictions);
  const standings = db.players.map(player => {
    const rows = db.matches.map(match => {
      const prediction = latest.get(`${player.id}:${match.id}`) || null;
      return {
        matchId: match.id,
        prediction,
        points: scorePrediction(match, prediction)
      };
    });
    const safe = safePlayer(player);
    return {
      ...safe,
      points: roundPoints(rows.reduce((sum, row) => sum + row.points, 0)),
      exacts: rows.filter(row => row.points >= 10 && row.prediction).length,
      predicted: rows.filter(row => row.prediction).length
    };
  }).sort((a, b) => b.points - a.points || b.exacts - a.exacts || a.name.localeCompare(b.name));

  return {
    players: db.players.map(safePlayer),
    matches: db.matches.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
    predictions: Object.fromEntries(latest),
    standings,
    rules: { group: "10 exact, 7 outcome and goal difference, 4 winner only, 0 wrong shape or missing.", knockout: "Points scale by stage and whether the winner is decided in play or penalties." },
    settings: { ...db.settings }
  };
}

function roundPoints(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function latestPredictions(predictions) {
  const map = new Map();
  for (const prediction of predictions) {
    const key = `${prediction.playerId}:${prediction.matchId}`;
    const previous = map.get(key);
    if (!previous || new Date(prediction.createdAt) > new Date(previous.createdAt)) map.set(key, prediction);
  }
  return map;
}

function matchOutcome(home, away) {
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function winnerFromPrediction(prediction) {
  const outcome = matchOutcome(prediction.homeScore, prediction.awayScore);
  if (outcome === "draw") return prediction.penaltyWinner || "draw";
  return outcome;
}

function winnerFromMatch(match) {
  const outcome = matchOutcome(match.homeScore, match.awayScore);
  if (outcome === "draw") return match.penaltyWinner || "draw";
  return outcome;
}

function isFinished(match) {
  return match.status === "finished" && Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
}

function scorePrediction(match, prediction) {
  if (!isFinished(match)) return 0;
  if (!prediction) return 0;
  if (match.stage === "group") return scoreGroup(match, prediction);
  return scoreKnockout(match, prediction);
}

function scoreGroup(match, prediction) {
  const actualOutcome = matchOutcome(match.homeScore, match.awayScore);
  const predictedOutcome = matchOutcome(prediction.homeScore, prediction.awayScore);
  const actualDiff = match.homeScore - match.awayScore;
  const predictedDiff = prediction.homeScore - prediction.awayScore;

  if (match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore) return 10;
  if (actualOutcome === predictedOutcome && actualDiff === predictedDiff) return 7;
  if (actualOutcome === predictedOutcome && actualOutcome !== "draw") return 4;
  return 0;
}

function scoreKnockout(match, prediction) {
  const table = STAGE_POINTS[match.stage] || STAGE_POINTS.round32;
  const actualOutcome = matchOutcome(match.homeScore, match.awayScore);
  const predictedOutcome = matchOutcome(prediction.homeScore, prediction.awayScore);
  const actualWinner = winnerFromMatch(match);
  const predictedWinner = winnerFromPrediction(prediction);
  const exactScore = match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore;
  const sameDiff = (match.homeScore - match.awayScore) === (prediction.homeScore - prediction.awayScore);

  if (match.penaltyWinner) {
    if (predictedOutcome === "draw" && exactScore && predictedWinner === actualWinner) return table.penExact;
    if (predictedOutcome === "draw" && predictedWinner === actualWinner) return table.penDrawWinner;
    if (predictedOutcome === "draw" && exactScore && predictedWinner !== actualWinner) return table.penExactWrongWinner;
    if (predictedOutcome === "draw") return table.penDrawWrongWinner;
    if (predictedWinner === actualWinner) return table.liveWinner;
    return 0;
  }

  if (exactScore) return table.exact;
  if (actualOutcome === predictedOutcome && sameDiff) return table.diff;
  if (predictedOutcome === "draw" && predictedWinner === actualWinner) return table.penWinnerWhenActualInPlay;
  if (actualWinner === predictedWinner) return table.winner;
  return 0;
}

function usernameKey(username) {
  return String(username || "").trim().toLowerCase();
}

function validateUsername(username) {
  return /^[a-z0-9_]{3,24}$/.test(username);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = hashPassword(password, salt).split(":")[1];
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function makeSession(db, user) {
  const session = {
    token: id("session"),
    playerId: user.id || null,
    isAdmin: Boolean(user.isAdmin),
    createdAt: new Date().toISOString()
  };
  db.sessions.push(session);
  return session.token;
}

function resolveUser(req, db) {
  const token = String(req.headers["x-auth-token"] || "");
  const session = db.sessions.find(item => item.token === token);
  if (!session) return null;
  if (session.isAdmin) return { id: "admin", username: ADMIN_USERNAME, screenName: "Admin", name: "Admin", isAdmin: true };
  const player = db.players.find(item => item.id === session.playerId);
  return player ? { ...safePlayer(player), isAdmin: false } : null;
}

function requireAdmin(req, db) {
  const user = resolveUser(req, db);
  return Boolean(user && user.isAdmin);
}

function canPredict(match) {
  return Date.now() < new Date(match.kickoff).getTime();
}

function cleanScore(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 99) throw new Error("Scores must be whole numbers from 0 to 99.");
  return number;
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["finished", "full_time", "ft", "completed"].includes(value)) return "finished";
  if (["live", "in_play", "playing", "1h", "2h", "ht", "extra_time"].includes(value)) return "live";
  return "scheduled";
}

async function handleApi(req, res, pathname) {
  const db = await loadDb();

  if (req.method === "GET" && pathname === "/api/state") return json(res, 200, publicState(db));

  if (req.method === "GET" && pathname === "/api/me") {
    const user = resolveUser(req, db);
    return json(res, 200, { user, state: publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const password = String(body.password || "");
    const screenName = String(body.screenName || "").trim().slice(0, 40);
    if (!validateUsername(username)) return json(res, 400, { error: "Use 3-24 lowercase letters, numbers, or underscores for the username." });
    if (password.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
    if (!screenName) return json(res, 400, { error: "Please enter a screen name." });
    if (username === usernameKey(ADMIN_USERNAME) || db.players.some(item => usernameKey(item.username) === username)) {
      return json(res, 409, { error: "That username is already taken." });
    }
    const player = {
      id: id("player"),
      username,
      screenName,
      name: screenName,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    db.players.push(player);
    const token = makeSession(db, player);
    await saveDb(db);
    return json(res, 200, { token, user: { ...safePlayer(player), isAdmin: false }, state: publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const password = String(body.password || "");
    if (username === usernameKey(ADMIN_USERNAME) && password === ADMIN_PASSWORD) {
      const token = makeSession(db, { id: "admin", isAdmin: true });
      await saveDb(db);
      return json(res, 200, { token, user: { id: "admin", username: ADMIN_USERNAME, screenName: "Admin", name: "Admin", isAdmin: true }, state: publicState(db) });
    }
    const player = db.players.find(item => usernameKey(item.username) === username);
    if (!player || !verifyPassword(password, player.passwordHash)) return json(res, 401, { error: "Username or password is incorrect." });
    const token = makeSession(db, player);
    await saveDb(db);
    return json(res, 200, { token, user: { ...safePlayer(player), isAdmin: false }, state: publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/predictions") {
    const body = await readBody(req);
    const user = resolveUser(req, db);
    if (!user || user.isAdmin) return json(res, 401, { error: "Please sign in with a player account." });
    const match = db.matches.find(item => item.id === body.matchId);
    const player = db.players.find(item => item.id === user.id);
    if (!match || !player) return json(res, 404, { error: "Player or match was not found." });
    if (!canPredict(match)) return json(res, 409, { error: "Predictions are closed for this match." });
    const homeScore = cleanScore(body.homeScore);
    const awayScore = cleanScore(body.awayScore);
    const penaltyWinner = homeScore === awayScore && match.stage !== "group" ? String(body.penaltyWinner || "") : "";
    if (homeScore === awayScore && match.stage !== "group" && !["home", "away"].includes(penaltyWinner)) {
      return json(res, 400, { error: "Choose a penalty winner for a knockout draw." });
    }
    db.predictions.push({
      id: id("pred"),
      playerId: player.id,
      matchId: match.id,
      homeScore,
      awayScore,
      penaltyWinner,
      createdAt: new Date().toISOString()
    });
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/matches") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const match = {
      id: body.id || id("match"),
      number: Number(body.number || db.matches.length + 1),
      stage: String(body.stage || "group"),
      group: String(body.group || ""),
      home: String(body.home || "").trim(),
      away: String(body.away || "").trim(),
      kickoff: new Date(body.kickoff).toISOString(),
      venue: String(body.venue || ""),
      status: String(body.status || "scheduled"),
      sourceId: String(body.sourceId || body.number || "")
    };
    if (!match.home || !match.away || Number.isNaN(new Date(match.kickoff).getTime())) {
      return json(res, 400, { error: "Home team, away team, and kickoff are required." });
    }
    const index = db.matches.findIndex(item => item.id === match.id);
    if (index >= 0) db.matches[index] = { ...db.matches[index], ...match };
    else db.matches.push(match);
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/matches/delete") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const match = db.matches.find(item => item.id === body.matchId);
    if (!match) return json(res, 404, { error: "Match was not found." });
    db.matches = db.matches.filter(item => item.id !== match.id);
    db.predictions = db.predictions.filter(item => item.matchId !== match.id);
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/results") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const match = db.matches.find(item => item.id === body.matchId);
    if (!match) return json(res, 404, { error: "Match was not found." });
    match.homeScore = cleanScore(body.homeScore);
    match.awayScore = cleanScore(body.awayScore);
    match.status = String(body.status || "finished");
    match.penaltyWinner = match.homeScore === match.awayScore && match.stage !== "group" ? String(body.penaltyWinner || "") : "";
    if (match.homeScore === match.awayScore && match.stage !== "group" && !["home", "away"].includes(match.penaltyWinner)) {
      return json(res, 400, { error: "Choose the penalty winner for a knockout draw." });
    }
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/results/clear") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const match = db.matches.find(item => item.id === body.matchId);
    if (!match) return json(res, 404, { error: "Match was not found." });
    delete match.homeScore;
    delete match.awayScore;
    delete match.penaltyWinner;
    match.status = "scheduled";
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/import") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    if (!Array.isArray(body.matches)) return json(res, 400, { error: "Send { matches: [...] }." });
    db.matches = body.matches.map((match, index) => ({
      id: String(match.id || `m${match.number || index + 1}`),
      number: Number(match.number || index + 1),
      stage: String(match.stage || "group"),
      group: String(match.group || ""),
      home: String(match.home || ""),
      away: String(match.away || ""),
      kickoff: new Date(match.kickoff).toISOString(),
      venue: String(match.venue || ""),
      status: String(match.status || "scheduled"),
      sourceId: String(match.sourceId || match.number || "")
    }));
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/fixture") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    if (!Array.isArray(body.matches)) return json(res, 400, { error: "Send { matches: [...] }." });

    for (const update of body.matches) {
      const match = db.matches.find(item => item.id === update.id);
      if (!match) continue;
      const home = String(update.home || "").trim();
      const away = String(update.away || "").trim();
      if (home) match.home = home.slice(0, 60);
      if (away) match.away = away.slice(0, 60);
    }

    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/users") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const player = db.players.find(item => item.id === body.playerId);
    if (!player) return json(res, 404, { error: "User was not found." });

    const username = usernameKey(body.username);
    const screenName = String(body.screenName || "").trim().slice(0, 40);
    const password = String(body.password || "");
    if (!validateUsername(username)) return json(res, 400, { error: "Use 3-24 lowercase letters, numbers, or underscores for the username." });
    if (!screenName) return json(res, 400, { error: "Please enter a screen name." });
    if (username === usernameKey(ADMIN_USERNAME) || db.players.some(item => item.id !== player.id && usernameKey(item.username) === username)) {
      return json(res, 409, { error: "That username is already taken." });
    }

    player.username = username;
    player.screenName = screenName;
    player.name = screenName;
    if (password) {
      if (password.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
      player.passwordHash = hashPassword(password);
      db.sessions = db.sessions.filter(item => item.playerId !== player.id);
    }
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/users/delete") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const player = db.players.find(item => item.id === body.playerId);
    if (!player) return json(res, 404, { error: "User was not found." });
    db.players = db.players.filter(item => item.id !== player.id);
    db.predictions = db.predictions.filter(item => item.playerId !== player.id);
    db.sessions = db.sessions.filter(item => item.playerId !== player.id);
    await saveDb(db);
    return json(res, 200, publicState(db));
  }

  return json(res, 404, { error: "Not found." });
}

async function serveStatic(req, res, pathname) {
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    const fallback = await fs.readFile(path.join(PUBLIC_DIR, "index.html"));
    res.writeHead(200, { "Content-Type": MIME[".html"] });
    res.end(fallback);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) await handleApi(req, res, url.pathname);
    else await serveStatic(req, res, url.pathname);
  } catch (error) {
    json(res, 500, { error: error.message || "Something went wrong." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`World Cup prediction contest running on ${HOST}:${PORT}`);
});

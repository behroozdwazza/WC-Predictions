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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESET_FROM_EMAIL = process.env.RESET_FROM_EMAIL || "World Cup Predictions <onboarding@resend.dev>";

const STAGE_POINTS = {
  round32: { exact: 15, diff: 11, winner: 7, penWinnerWhenActualInPlay: 3, penExact: 15, penDrawWinner: 9, penExactWrongWinner: 11, penDrawWrongWinner: 6, liveWinner: 3 },
  round16: { exact: 20, diff: 15, winner: 10, penWinnerWhenActualInPlay: 5, penExact: 20, penDrawWinner: 12, penExactWrongWinner: 15, penDrawWrongWinner: 8, liveWinner: 4 },
  quarter: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25, penDrawWinner: 15, penExactWrongWinner: 19, penDrawWrongWinner: 10, liveWinner: 5 },
  third: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25, penDrawWinner: 15, penExactWrongWinner: 19, penDrawWrongWinner: 10, liveWinner: 5 },
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
      passwordResets: [],
      reports: [],
      preMatchReports: [],
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
    passwordResets: Array.isArray(db.passwordResets) ? db.passwordResets : [],
    reports: Array.isArray(db.reports) ? db.reports : [],
    preMatchReports: Array.isArray(db.preMatchReports) ? db.preMatchReports : [],
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

function safePlayer(player, options = {}) {
  const safe = {
    id: player.id,
    username: player.username,
    screenName: player.screenName || player.name || player.username,
    name: player.screenName || player.name || player.username,
    favoriteTeam: player.favoriteTeam || "",
    avatarDataUrl: player.avatarDataUrl || "",
    approved: player.approved !== false,
    createdAt: player.createdAt
  };
  if (options.includePrivate) safe.email = player.email || "";
  return safe;
}

function isApprovedPlayer(player) {
  return player.approved !== false;
}

function cleanAvatarDataUrl(value) {
  const avatar = String(value || "");
  if (!avatar) return "";
  if (avatar.length > 350_000) throw new Error("Profile picture is too large.");
  if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(avatar)) {
    throw new Error("Profile picture must be a PNG, JPG, WEBP, or GIF image.");
  }
  return avatar;
}

function publicState(db, options = {}) {
  const latest = latestPredictions(db.predictions);
  const standings = calculateStandings(db, db.matches);
  const players = options.includePending ? db.players : db.players.filter(isApprovedPlayer);

  return {
    players: players.map(player => safePlayer(player, { includePrivate: options.includePrivate })),
    matches: db.matches.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
    predictions: Object.fromEntries(latest),
    reports: db.reports.sort((a, b) => b.date.localeCompare(a.date) || new Date(b.createdAt) - new Date(a.createdAt)),
    preMatchReports: db.preMatchReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    standings,
    rules: { group: "10 exact, 7 outcome and goal difference, 4 winner only, 0 wrong shape or missing.", knockout: "Points scale by stage and whether the winner is decided in play or penalties." },
    settings: { ...db.settings }
  };
}

function adminState(db) {
  return publicState(db, { includePending: true, includePrivate: true });
}

function calculateStandings(db, matches) {
  const latest = latestPredictions(db.predictions);
  return db.players.filter(isApprovedPlayer).map(player => {
    const rows = matches.map(match => {
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

function cleanEmail(value, required = false) {
  const email = String(value || "").trim().toLowerCase().slice(0, 254);
  if (!email) {
    if (required) throw new Error("Please enter an email address.");
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
  return email;
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

async function sendPasswordResetEmail(to, code) {
  if (!RESEND_API_KEY) throw new Error("Password reset email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESET_FROM_EMAIL,
      to: [to],
      subject: "World Cup Predictions password reset",
      text: `Your World Cup Predictions password reset code is ${code}.\n\nThis code expires in 15 minutes. If you did not request it, you can ignore this email.`
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email request failed: ${response.status} ${text.slice(0, 200)}`);
  }
}

function resolveUser(req, db) {
  const token = String(req.headers["x-auth-token"] || "");
  const session = db.sessions.find(item => item.token === token);
  if (!session) return null;
  if (session.isAdmin) return { id: "admin", username: ADMIN_USERNAME, screenName: "Admin", name: "Admin", isAdmin: true };
  const player = db.players.find(item => item.id === session.playerId);
  if (player && !isApprovedPlayer(player)) return null;
  return player ? { ...safePlayer(player, { includePrivate: true }), isAdmin: false } : null;
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

function reportDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function rankMap(standings) {
  return new Map(standings.map((player, index) => [player.id, index + 1]));
}

function resultWinner(match) {
  return winnerFromMatch(match);
}

function predictionWinner(prediction) {
  return winnerFromPrediction(prediction);
}

function exactPrediction(match, prediction) {
  return prediction && match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore;
}

function buildFunFactsContext(db, date) {
  const dayMatches = db.matches
    .filter(match => reportDateKey(match.kickoff) === date && isFinished(match))
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  if (!dayMatches.length) throw new Error("No finished matches found for that day.");

  const beforeMatches = db.matches.filter(match => isFinished(match) && reportDateKey(match.kickoff) < date);
  const afterMatches = db.matches.filter(match => isFinished(match) && reportDateKey(match.kickoff) <= date);
  const before = calculateStandings(db, beforeMatches);
  const after = calculateStandings(db, afterMatches);
  const beforeRanks = rankMap(before);
  const afterRanks = rankMap(after);
  const latest = latestPredictions(db.predictions);

  const approvedPlayers = db.players.filter(isApprovedPlayer);
  const playerSummaries = approvedPlayers.map(player => {
    const safe = safePlayer(player);
    const beforeStanding = before.find(item => item.id === player.id);
    const afterStanding = after.find(item => item.id === player.id);
    const predictions = dayMatches.map(match => {
      const prediction = latest.get(`${player.id}:${match.id}`) || null;
      const points = scorePrediction(match, prediction);
      return { match, prediction, points };
    });
    return {
      id: player.id,
      name: safe.name,
      beforeRank: beforeRanks.get(player.id) || null,
      afterRank: afterRanks.get(player.id) || null,
      rankChange: (beforeRanks.get(player.id) || approvedPlayers.length + 1) - (afterRanks.get(player.id) || approvedPlayers.length + 1),
      beforePoints: beforeStanding?.points || 0,
      afterPoints: afterStanding?.points || 0,
      dayPoints: roundPoints((afterStanding?.points || 0) - (beforeStanding?.points || 0)),
      submitted: predictions.filter(item => item.prediction).length,
      exact: predictions.filter(item => exactPrediction(item.match, item.prediction)).length,
      positive: predictions.filter(item => item.points > 0).length,
      zero: predictions.filter(item => item.prediction && item.points === 0).length,
      missing: predictions.filter(item => !item.prediction).length
    };
  });

  const oddPredictions = [];
  for (const match of dayMatches) {
    const predictions = approvedPlayers.map(player => {
      const prediction = latest.get(`${player.id}:${match.id}`) || null;
      if (!prediction) return null;
      return { player, prediction, winner: predictionWinner(prediction), points: scorePrediction(match, prediction) };
    }).filter(Boolean);
    const counts = predictions.reduce((map, item) => {
      map[item.winner] = (map[item.winner] || 0) + 1;
      return map;
    }, {});
    for (const item of predictions) {
      const totalGoals = item.prediction.homeScore + item.prediction.awayScore;
      const uncommonWinner = counts[item.winner] <= Math.max(1, Math.floor(predictions.length * 0.25));
      if (item.points > 0 && (totalGoals >= 6 || uncommonWinner)) {
        oddPredictions.push({
          player: safePlayer(item.player).name,
          match: `${match.home} vs ${match.away}`,
          prediction: `${item.prediction.homeScore}-${item.prediction.awayScore}${item.prediction.penaltyWinner ? `, ${item.prediction.penaltyWinner} on penalties` : ""}`,
          result: `${match.homeScore}-${match.awayScore}${match.penaltyWinner ? `, ${match.penaltyWinner} on penalties` : ""}`,
          points: item.points,
          why: totalGoals >= 6 ? "high-goal prediction" : "uncommon winner among pool predictions"
        });
      }
    }
  }

  const completedDates = [...new Set(db.matches.filter(isFinished).map(match => reportDateKey(match.kickoff)))].sort();
  const rankHistory = completedDates.map(day => {
    const matchesToDay = db.matches.filter(match => isFinished(match) && reportDateKey(match.kickoff) <= day);
    return { day, standings: calculateStandings(db, matchesToDay).map((player, index) => ({ id: player.id, name: player.name, rank: index + 1, points: player.points })) };
  });

  return {
    date,
    matches: dayMatches.map(match => ({
      id: match.id,
      number: match.number,
      stage: match.stage,
      fixture: `${match.home} vs ${match.away}`,
      result: `${match.homeScore}-${match.awayScore}${match.penaltyWinner ? `, ${match.penaltyWinner} on penalties` : ""}`,
      winner: resultWinner(match)
    })),
    beforeStandings: before.map((player, index) => ({ rank: index + 1, name: player.name, points: player.points })),
    afterStandings: after.map((player, index) => ({ rank: index + 1, name: player.name, points: player.points })),
    playerSummaries,
    biggestJump: playerSummaries.filter(item => item.rankChange > 0).sort((a, b) => b.rankChange - a.rankChange || b.dayPoints - a.dayPoints).slice(0, 5),
    biggestDrop: playerSummaries.filter(item => item.rankChange < 0).sort((a, b) => a.rankChange - b.rankChange || a.dayPoints - b.dayPoints).slice(0, 5),
    perfectOrRoughDays: playerSummaries.filter(item => item.submitted > 0 && (item.exact === dayMatches.length || item.positive === 0)),
    oddPredictions: oddPredictions.slice(0, 10),
    rankHistory
  };
}

function extractResponseText(payload) {
  if (payload.output_text) return payload.output_text;
  const chunks = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

async function generateFunFactsReport(db, date) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured on the server.");
  const context = buildFunFactsContext(db, date);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: "You write playful but kind FIFA World Cup prediction-pool recaps. Use only the supplied data. Do not invent statistics, matches, or predictions. Celebrate good calls without insulting players. Return concise bilingual JSON.",
      input: `Create fun facts for this match day. Mention ranking jumps/drops, perfect or rough prediction days, consistent movement toward the top if supported by rankHistory, and odd-but-correct predictions when present. Keep each language to 4-7 short bullets. Data:\n${JSON.stringify(context)}`,
      text: {
        format: {
          type: "json_schema",
          name: "match_day_fun_facts",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title_en: { type: "string" },
              title_fa: { type: "string" },
              bullets_en: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
              bullets_fa: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 }
            },
            required: ["title_en", "title_fa", "bullets_en", "bullets_fa"]
          }
        }
      }
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText.slice(0, 300)}`);
  }
  const payload = await response.json();
  const text = extractResponseText(payload);
  const generated = JSON.parse(text);
  return {
    id: id("report"),
    date,
    titleEn: generated.title_en,
    titleFa: generated.title_fa,
    bulletsEn: generated.bullets_en,
    bulletsFa: generated.bullets_fa,
    createdAt: new Date().toISOString(),
    model: OPENAI_MODEL
  };
}

function buildPreMatchReport(db, matchId) {
  const match = db.matches.find(item => item.id === matchId);
  if (!match) throw new Error("Match was not found.");
  if (Date.now() < new Date(match.kickoff).getTime()) throw new Error("Prediction window is still open for this match.");

  const latest = latestPredictions(db.predictions);
  const approvedPlayers = db.players.filter(isApprovedPlayer);
  const rows = approvedPlayers.map(player => {
    const prediction = latest.get(`${player.id}:${match.id}`) || null;
    if (!prediction) return null;
    return {
      player: safePlayer(player),
      prediction,
      outcome: winnerFromPrediction(prediction),
      score: `${prediction.homeScore}-${prediction.awayScore}${prediction.penaltyWinner ? ` ${prediction.penaltyWinner}` : ""}`
    };
  }).filter(Boolean);

  const totalPlayers = approvedPlayers.length;
  const totalPredictions = rows.length;
  const outcomeCounts = { home: 0, draw: 0, away: 0 };
  const scoreCounts = new Map();
  for (const row of rows) {
    outcomeCounts[row.outcome] = (outcomeCounts[row.outcome] || 0) + 1;
    scoreCounts.set(row.score, (scoreCounts.get(row.score) || 0) + 1);
  }

  const mostFrequentScores = [...scoreCounts.entries()]
    .map(([score, count]) => ({ score, count, percentOfPredictions: percent(count, totalPredictions) }))
    .sort((a, b) => b.count - a.count || a.score.localeCompare(b.score))
    .slice(0, 5);

  return {
    id: id("prematch"),
    matchId: match.id,
    matchNumber: match.number,
    fixture: `${match.home} vs ${match.away}`,
    home: match.home,
    away: match.away,
    kickoff: match.kickoff,
    createdAt: new Date().toISOString(),
    totalPlayers,
    totalPredictions,
    missingPredictions: Math.max(0, totalPlayers - totalPredictions),
    outcomes: [
      { key: "home", label: match.home, count: outcomeCounts.home || 0, percentOfPlayers: percent(outcomeCounts.home || 0, totalPlayers), percentOfPredictions: percent(outcomeCounts.home || 0, totalPredictions) },
      { key: "draw", label: "Draw", count: outcomeCounts.draw || 0, percentOfPlayers: percent(outcomeCounts.draw || 0, totalPlayers), percentOfPredictions: percent(outcomeCounts.draw || 0, totalPredictions) },
      { key: "away", label: match.away, count: outcomeCounts.away || 0, percentOfPlayers: percent(outcomeCounts.away || 0, totalPlayers), percentOfPredictions: percent(outcomeCounts.away || 0, totalPredictions) }
    ],
    mostFrequentScores,
    predictions: rows.map(row => ({
      player: row.player.name,
      score: row.score,
      outcome: row.outcome
    })).sort((a, b) => a.player.localeCompare(b.player))
  };
}

function percent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 1000) / 10;
}

async function handleApi(req, res, pathname) {
  const db = await loadDb();

  if (req.method === "GET" && pathname === "/api/state") return json(res, 200, publicState(db));

  if (req.method === "GET" && pathname === "/api/me") {
    const user = resolveUser(req, db);
    return json(res, 200, { user, state: user?.isAdmin ? adminState(db) : publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const password = String(body.password || "");
    const screenName = String(body.screenName || "").trim().slice(0, 40);
    let email = "";
    try {
      email = cleanEmail(body.email, true);
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
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
      email,
      passwordHash: hashPassword(password),
      approved: false,
      createdAt: new Date().toISOString()
    };
    db.players.push(player);
    await saveDb(db);
    return json(res, 202, { pending: true, state: publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const password = String(body.password || "");
    if (username === usernameKey(ADMIN_USERNAME) && password === ADMIN_PASSWORD) {
      const token = makeSession(db, { id: "admin", isAdmin: true });
      await saveDb(db);
      return json(res, 200, { token, user: { id: "admin", username: ADMIN_USERNAME, screenName: "Admin", name: "Admin", isAdmin: true }, state: adminState(db) });
    }
    const player = db.players.find(item => usernameKey(item.username) === username);
    if (!player || !verifyPassword(password, player.passwordHash)) return json(res, 401, { error: "Username or password is incorrect." });
    if (!isApprovedPlayer(player)) return json(res, 403, { error: "Your account is waiting for admin approval." });
    const token = makeSession(db, player);
    await saveDb(db);
    return json(res, 200, { token, user: { ...safePlayer(player, { includePrivate: true }), isAdmin: false }, state: publicState(db) });
  }

  if (req.method === "POST" && pathname === "/api/auth/forgot-password") {
    if (!RESEND_API_KEY) return json(res, 503, { error: "Password reset email is not configured." });
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const player = db.players.find(item => usernameKey(item.username) === username);
    if (player && player.email) {
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      db.passwordResets = db.passwordResets.filter(item => item.playerId !== player.id || new Date(item.expiresAt) > new Date());
      db.passwordResets.push({
        id: id("reset"),
        playerId: player.id,
        codeHash: hashPassword(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });
      await sendPasswordResetEmail(player.email, code);
      await saveDb(db);
    }
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && pathname === "/api/auth/reset-password") {
    const body = await readBody(req);
    const username = usernameKey(body.username);
    const code = String(body.code || "").trim();
    const password = String(body.password || "");
    if (password.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
    const player = db.players.find(item => usernameKey(item.username) === username);
    const now = new Date();
    const reset = player ? db.passwordResets
      .filter(item => item.playerId === player.id && !item.usedAt && new Date(item.expiresAt) > now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .find(item => verifyPassword(code, item.codeHash)) : null;
    if (!player || !reset) return json(res, 400, { error: "Reset code is invalid or expired." });
    player.passwordHash = hashPassword(password);
    reset.usedAt = new Date().toISOString();
    db.sessions = db.sessions.filter(item => item.playerId !== player.id);
    await saveDb(db);
    return json(res, 200, { ok: true });
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

  if (req.method === "POST" && pathname === "/api/account") {
    const body = await readBody(req);
    const user = resolveUser(req, db);
    if (!user || user.isAdmin) return json(res, 401, { error: "Please sign in with a player account." });
    const player = db.players.find(item => item.id === user.id);
    if (!player) return json(res, 404, { error: "User was not found." });

    const screenName = String(body.screenName || "").trim().slice(0, 40);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const favoriteTeam = String(body.favoriteTeam || "").trim().slice(0, 60);
    const avatarDataUrl = cleanAvatarDataUrl(body.avatarDataUrl);
    let email = "";
    try {
      email = cleanEmail(body.email);
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
    if (!screenName) return json(res, 400, { error: "Please enter a screen name." });

    player.screenName = screenName;
    player.name = screenName;
    player.email = email;
    player.favoriteTeam = favoriteTeam;
    if (avatarDataUrl) player.avatarDataUrl = avatarDataUrl;
    else delete player.avatarDataUrl;
    if (newPassword) {
      if (newPassword.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
      if (!verifyPassword(currentPassword, player.passwordHash)) return json(res, 401, { error: "Current password is incorrect." });
      player.passwordHash = hashPassword(newPassword);
      db.sessions = db.sessions.filter(item => item.playerId !== player.id);
    }

    const token = newPassword ? makeSession(db, player) : String(req.headers["x-auth-token"] || "");
    await saveDb(db);
    return json(res, 200, { token, user: { ...safePlayer(player, { includePrivate: true }), isAdmin: false }, state: publicState(db) });
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
    return json(res, 200, adminState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/matches/delete") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const match = db.matches.find(item => item.id === body.matchId);
    if (!match) return json(res, 404, { error: "Match was not found." });
    db.matches = db.matches.filter(item => item.id !== match.id);
    db.predictions = db.predictions.filter(item => item.matchId !== match.id);
    db.preMatchReports = db.preMatchReports.filter(item => item.matchId !== match.id);
    await saveDb(db);
    return json(res, 200, adminState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/fun-facts") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const date = String(body.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: "Choose a match day." });
    try {
      const report = await generateFunFactsReport(db, date);
      db.reports = db.reports.filter(item => item.date !== date);
      db.reports.push(report);
      await saveDb(db);
      return json(res, 200, adminState(db));
    } catch (error) {
      return json(res, 502, { error: error.message });
    }
  }

  if (req.method === "POST" && pathname === "/api/admin/fun-facts/delete") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const reportId = String(body.reportId || "");
    const reportDate = String(body.date || "");
    const beforeCount = db.reports.length;
    db.reports = db.reports.filter(item => item.id !== reportId && item.date !== reportDate);
    if (db.reports.length === beforeCount) return json(res, 404, { error: "Fun facts report was not found." });
    await saveDb(db);
    return json(res, 200, adminState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/pre-match-report") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    try {
      const report = buildPreMatchReport(db, String(body.matchId || ""));
      db.preMatchReports = db.preMatchReports.filter(item => item.matchId !== report.matchId);
      db.preMatchReports.push(report);
      await saveDb(db);
      return json(res, 200, adminState(db));
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }

  if (req.method === "POST" && pathname === "/api/admin/pre-match-report/delete") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const reportId = String(body.reportId || "");
    const beforeCount = db.preMatchReports.length;
    db.preMatchReports = db.preMatchReports.filter(item => item.id !== reportId);
    if (db.preMatchReports.length === beforeCount) return json(res, 404, { error: "Pre-match report was not found." });
    await saveDb(db);
    return json(res, 200, adminState(db));
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
    return json(res, 200, adminState(db));
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
    return json(res, 200, adminState(db));
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
    db.preMatchReports = [];
    await saveDb(db);
    return json(res, 200, adminState(db));
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
    return json(res, 200, adminState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/users") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const player = db.players.find(item => item.id === body.playerId);
    if (!player) return json(res, 404, { error: "User was not found." });

    const username = usernameKey(body.username);
    const screenName = String(body.screenName || "").trim().slice(0, 40);
    const password = String(body.password || "");
    let email = player.email || "";
    if (!validateUsername(username)) return json(res, 400, { error: "Use 3-24 lowercase letters, numbers, or underscores for the username." });
    if (!screenName) return json(res, 400, { error: "Please enter a screen name." });
    try {
      if (Object.prototype.hasOwnProperty.call(body, "email")) email = cleanEmail(body.email);
    } catch (err) {
      return json(res, 400, { error: err.message });
    }
    if (username === usernameKey(ADMIN_USERNAME) || db.players.some(item => item.id !== player.id && usernameKey(item.username) === username)) {
      return json(res, 409, { error: "That username is already taken." });
    }

    player.username = username;
    player.screenName = screenName;
    player.name = screenName;
    player.email = email;
    if (body.approved === true || body.approved === "true") player.approved = true;
    if (password) {
      if (password.length < 6) return json(res, 400, { error: "Password must be at least 6 characters." });
      player.passwordHash = hashPassword(password);
      db.sessions = db.sessions.filter(item => item.playerId !== player.id);
    }
    await saveDb(db);
    return json(res, 200, adminState(db));
  }

  if (req.method === "POST" && pathname === "/api/admin/users/approve") {
    if (!requireAdmin(req, db)) return json(res, 401, { error: "Admin credentials are required." });
    const body = await readBody(req);
    const player = db.players.find(item => item.id === body.playerId);
    if (!player) return json(res, 404, { error: "User was not found." });
    player.approved = true;
    await saveDb(db);
    return json(res, 200, adminState(db));
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
    return json(res, 200, adminState(db));
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

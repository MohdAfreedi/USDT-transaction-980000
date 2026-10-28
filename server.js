
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  SESSION_SECRET
} = process.env;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error(
    "Missing ADMIN_USERNAME, ADMIN_PASSWORD, or SESSION_SECRET in .env"
  );
  process.exit(1);
}

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.use(session({
  name: "chainscope.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000
  }
}));

function safeEqual(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));

  if (first.length !== second.length) {
    // Perform a dummy comparison to reduce simple timing differences.
    crypto.timingSafeEqual(
      crypto.createHash("sha256").update(first).digest(),
      crypto.createHash("sha256").update(second).digest()
    );
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }

  return res.status(401).json({ error: "Please sign in." });
}

// Shared administrator login.
app.post("/api/login", (req, res, next) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > 200 ||
    password.length > 200
  ) {
    return res.status(400).json({ error: "Invalid credentials format." });
  }

  const usernameMatches = safeEqual(username, ADMIN_USERNAME);
  const passwordMatches = safeEqual(password, ADMIN_PASSWORD);

  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  // Regenerate the session after successful login to reduce session fixation risk.
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not start a session." });
    }

    req.session.isAdmin = true;

    req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).json({ error: "Could not save the session." });
      }

      res.set("Cache-Control", "no-store");
      res.json({ ok: true });
    });
  });
});

// Check whether the browser has an administrator session.
app.get("/api/me", requireAdmin, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ authenticated: true, role: "administrator" });
});

// Log out this browser session.
app.post("/api/logout", (req, res) => {
  if (!req.session) {
    return res.json({ ok: true });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out." });
    }

    res.clearCookie("chainscope.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    res.json({ ok: true });
  });
});

// Public login page.
app.get("/", (req, res) => {
  if (req.session?.isAdmin === true) {
    return res.redirect("/transaction-notice.html");
  }

  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// Protect HTML pages before serving static files.
app.use((req, res, next) => {
  if (!req.path.toLowerCase().endsWith(".html")) {
    return next();
  }

  if (req.path === "/index.html") {
  if (req.session?.isAdmin === true) {
    return res.redirect("/transaction-notice.html");
  }

  return res.sendFile(path.join(__dirname, "public", "index.html"));
}
  if (req.session?.isAdmin !== true) {
    return res.redirect("/");
  }

  next();
});

app.use(express.static(path.join(__dirname, "public"), {
  index: false
}));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ChainScope server listening on port ${PORT}`);
});

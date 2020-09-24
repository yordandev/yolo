// Create express app
const express = require("express");
const app = express();
const db = require("./database.js");
const md5 = require("md5");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "f85689f551cf5e2fda79657812715cef6e77cf8361f02bc6d80915b8c4f41bd6";

// Server port
const PORT = 8080;
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res, next) => {
  res.json({ message: "uhhh, what is it you want me to do exactly?" });
});

const generateAccessToken = (username) =>
  // expires after an hour
  jwt.sign(username, JWT_SECRET, { expiresIn: "3600s" });

const authenticateToken = (req, res, next) => {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log(user);
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
};

app.get("/posts", authenticateToken, (req, res, next) => {
  const sql = "select * from post";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
});

app.get("/posts", authenticateToken, (req, res, next) => {
  const sql = "select * from post";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
      user: req.user,
    });
  });
});

app.get("/post/:id", authenticateToken, (req, res, next) => {
  var sql = "select * from post where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: row,
    });
  });
});

app.delete("/post/:id", authenticateToken, (req, res, next) => {
  const sql = `DELETE FROM post WHERE id = ?`;
  db.run(sql, req.params.id, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

app.get("/user/:id", authenticateToken, (req, res, next) => {
  var sql = "select * from user where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: row,
    });
  });
});

app.patch("/post/:id", authenticateToken, (req, res, next) => {
  const data = {
    message: req.body.message,
    life_points: req.body.life_points,
  };
  const params = [data.username, data.email, data.password, req.params.id];
  const sql = `UPDATE post set 
  message = COALESCE(?,message), 
  life_points = COALESCE(?,life_points)
  WHERE id = ?`;
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    delete data.password;
    res.json({
      message: "Success",
      data: data,
      changes: this.changes,
    });
  });
});

app.post("/signup/", (req, res, next) => {
  let errors = [];
  if (!req.body.username) {
    errors.push("No username provided");
  }
  if (!req.body.email) {
    errors.push("No email provided");
  }
  if (!req.body.password) {
    errors.push("No password provided");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  let data = {
    username: req.body.username,
    email: req.body.email,
    password: md5(req.body.password),
  };
  const params = [data.username, data.email, data.password];
  const sql = "INSERT INTO user (username, email, password) VALUES (?,?,?)";
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    delete data.password;
    data.id = this.lastID;
    const token = generateAccessToken({
      username: req.body.username,
      email: req.body.email,
    });
    res.json({
      message: "Success",
      data: data,
      token: token,
    });
  });
});

app.post("/login/", (req, res, next) => {
  let errors = [];
  if (!req.body.username) {
    errors.push("No username provided");
  }
  if (!req.body.password) {
    errors.push("No password provided");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  const params = [req.body.username, md5(req.body.password)];
  const sql = "SELECT * FROM user WHERE username = ? AND password = ?";
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(400).json({ error: "Invalid username or password!" });
      return;
    }
    delete row.password;
    const token = generateAccessToken({
      username: req.body.username,
      email: row.email,
    });
    res.json({
      message: "Success",
      data: row,
      token: token,
    });
  });
});

app.patch("/user/:id", (req, res, next) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : null,
  };
  const params = [data.username, data.email, data.password, req.params.id];
  const sql = `UPDATE user set 
  username = COALESCE(?,username), 
  email = COALESCE(?,email), 
  password = COALESCE(?,password) 
  WHERE id = ?`;
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    delete data.password;
    res.json({
      message: "Success",
      data: data,
      changes: this.changes,
    });
  });
});

app.delete("/user/:id", (req, res, next) => {
  const sql = `DELETE FROM user WHERE id = ?`;
  db.run(sql, req.params.id, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

// Default response for any other request
app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

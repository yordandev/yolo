// Create express app
const express = require("express");
const app = express();
const db = require("./database.js");
const md5 = require("md5");
const bodyParser = require("body-parser");

// Server port
const PORT = 8080;
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});

// Insert here other API endpoints
app.get("/users", (req, res, next) => {
  const sql = "select * from user";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/posts", (req, res, next) => {
  const sql = "select * from post";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/user/:id", (req, res, next) => {
  var sql = "select * from user where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

app.get("/post/:id", (req, res, next) => {
  var sql = "select * from post where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

app.post("/user/", (req, res, next) => {
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
  const data = {
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
    res.json({
      message: "success",
      data: data,
      id: this.lastID,
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
      message: "success",
      data: data,
      changes: this.changes,
    });
  });
});

app.patch("/post/:id", (req, res, next) => {
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
      message: "success",
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

app.delete("/post/:id", (req, res, next) => {
  const sql = `DELETE FROM post WHERE id = ?`;
  db.run(sql, req.params.id, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404).send("Sorry can't find that!");
});

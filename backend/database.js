const sqlite3 = require("sqlite3").verbose();
const md5 = require("md5");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.get("PRAGMA foreign_keys = ON");
    // db.run("DROP TABLE IF EXISTS user");
    // db.run("DROP TABLE IF EXISTS post");
    const userTableQuery = `CREATE TABLE IF NOT EXISTS user (
        id integer PRIMARY KEY AUTOINCREMENT,
        username text NOT NULL UNIQUE, 
        email text NOT NULL UNIQUE, 
        password text NOT NULL,
        life_points integer DEFAULT "0",
        date_created datetime default current_timestamp
        )`;
    const postTableQuery = `CREATE TABLE IF NOT EXISTS post (
            postId integer PRIMARY KEY AUTOINCREMENT,
            message text NOT NULL, 
            life_points integer NOT NULL DEFAULT "0",
            date_created datetime DEFAULT current_timestamp,
            authorId integer NOT NULL,
            FOREIGN KEY(authorId) REFERENCES user(id)
        )`;
    db.run(userTableQuery, (err) => {
      if (err) {
        // console.log(err);
      } else {
        // Table just created, creating some rows
        const insert =
          "INSERT INTO user (username, email, password) VALUES (?,?,?)";
        // db.run(insert, ["yordan", "atyo18ux@student.ju.se", md5("test123")]);
        // db.run(insert, ["antonia", "zian18aw@example.com", md5("test123")]);
      }
    });
    db.run(postTableQuery, (err) => {
      if (err) {
        // console.log(err);
      } else {
        // Table just created, creating some rows
        const insert =
          "INSERT INTO post (message, life_points, authorId) VALUES (?,?,?)";
        // db.run(insert, ["test post", "12", "1"]);
        // db.run(insert, ["test post number two", "-12", "2"]);
      }
    });
  }
});

module.exports = db;

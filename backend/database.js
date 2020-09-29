const Database = require('better-sqlite3')
const md5 = require('md5')

const DBSOURCE = 'db.sqlite'

const db = new Database(DBSOURCE, { verbose: console.log })
db.pragma('foreign_keys = ON')

const userTableQuery = db.prepare(`CREATE TABLE IF NOT EXISTS user (
    id integer PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL UNIQUE, 
    email text NOT NULL UNIQUE, 
    password text NOT NULL,
    life_points integer DEFAULT "2",
    date_created datetime default current_timestamp
);`)

const postTableQuery = db.prepare(`CREATE TABLE IF NOT EXISTS post (
        id integer PRIMARY KEY AUTOINCREMENT,
        message text NOT NULL, 
        points integer NOT NULL DEFAULT "0",
        date_created datetime DEFAULT current_timestamp,
        authorId integer NOT NULL,
        FOREIGN KEY(authorId) REFERENCES user(id)
);`)

const voteTableQuery = db.prepare(`CREATE TABLE IF NOT EXISTS vote (
      id integer PRIMARY KEY AUTOINCREMENT,
      type text NOT NULL, 
      postId integer NOT NULL,
      voterId integer NOT NULL,
      FOREIGN KEY(postId) REFERENCES post(id),
      FOREIGN KEY(voterId) REFERENCES user(id)
);`)

userTableQuery.run()
postTableQuery.run()
voteTableQuery.run()

// const userInsert = db.prepare('INSERT INTO user (username, email, password, life_points) VALUES (?,?,?,?)');
// userInsert.run(['yordan123', 'atyo1813x@student.ju.se', md5('test123'), '1'])
console.log("SQLite database initiated")

module.exports = db

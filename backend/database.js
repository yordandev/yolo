const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = 'db.sqlite'

let db = new sqlite3.Database(DBSOURCE, (err) => {
	if (err) {
		// Cannot open database
		console.error(err.message)
		throw err
	} else {
		console.log('Connected to the SQLite database.')
		db.get('PRAGMA foreign_keys = ON')
		// db.run("DROP TABLE IF EXISTS user");
		// db.run("DROP TABLE IF EXISTS post");
		const userTableQuery = `CREATE TABLE IF NOT EXISTS user (
        id integer PRIMARY KEY AUTOINCREMENT,
        username text NOT NULL UNIQUE, 
        email text NOT NULL UNIQUE, 
        password text NOT NULL,
		life_points integer DEFAULT "50",
        date_created datetime default current_timestamp
        )`
		const postTableQuery = `CREATE TABLE IF NOT EXISTS post (
            id integer PRIMARY KEY AUTOINCREMENT,
			message text NOT NULL, 
            points integer NOT NULL DEFAULT "0",
            date_created datetime DEFAULT current_timestamp,
            authorId integer NOT NULL,
            FOREIGN KEY(authorId) REFERENCES user(id) ON DELETE CASCADE
        )`
		const voteTableQuery = `CREATE TABLE IF NOT EXISTS vote (
          id integer PRIMARY KEY AUTOINCREMENT,
          type text NOT NULL, 
          postId integer NOT NULL,
          voterId integer NOT NULL,
          FOREIGN KEY(postId) REFERENCES post(id) ON DELETE CASCADE,
          FOREIGN KEY(voterId) REFERENCES user(id) ON DELETE CASCADE
	  	)`
		const blacklistedEmailTableQuery = `CREATE TABLE IF NOT EXISTS blacklisted_email (
		id integer PRIMARY KEY AUTOINCREMENT,
		email text NOT NULL
		)`
		db.run(userTableQuery, (err) => {
			if (err) {
				// console.log(err);
			} else {
				// Table just created, creating some rows
				const insert = 'INSERT INTO user (username, email, password, life_points) VALUES (?,?,?,?)'
				// db.run(insert, ['yordan123', 'atyo1813x@student.ju.se', md5('test123'), '1'])
				// db.run(insert, ['test', 'test@example.com', md5('test123')], 1)
			}
		})
		db.run(postTableQuery, (err) => {
			if (err) {
				// console.log(err);
			} else {
				// Table just created, creating some rows
				const insert = 'INSERT INTO post (message, points, authorId) VALUES (?,?,?)'
				// db.run(insert, ['test post', '12', '1'])
				// db.run(insert, ['test post number two', '1', '3'])
			}
		})
		db.run(voteTableQuery, (err) => {
			if (err) {
				// console.log(err);
			} else {
				// Table just created, creating some rows
				const insert = 'INSERT INTO vote (type, postId, voterId) VALUES (?,?,?)'
				// db.run(insert, ['upvote', '1', '2'])
				// db.run(insert, ['downvote', '2', '1'])
			}
		})
		db.run(blacklistedEmailTableQuery, (err) => {
			if (err) {
				// console.log(err);
			} else {
			}
		})
	}
})

module.exports = db

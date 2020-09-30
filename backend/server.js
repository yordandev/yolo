// Create express app
const express = require('express')
const app = express()
const db = require('./database.js')
const md5 = require('md5')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const JWT_SECRET =
	Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

db.query = function (sql, params) {
	var that = this
	return new Promise(function (resolve, reject) {
		that.all(sql, params, function (error, rows) {
			if (error) reject(error)
			else resolve({ rows: rows })
		})
	})
}

// Server port
const PORT = 8080
// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

// Root endpoint
app.get('/', (req, res, next) => {
	res.json({ message: 'uhhh, what is it you want me to do exactly?' })
})

//USER/AUTHENTICATION ENDPOINTS
const generateAccessToken = (data) =>
	// expires after an hour
	jwt.sign(data, JWT_SECRET, { expiresIn: '3600s' })

const authenticateToken = (req, res, next) => {
	// Gather the jwt access token FROM the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) {
		return res.sendStatus(401)
	} // if there is no token attached to the headers

	jwt.verify(token, JWT_SECRET, async (err, user) => {
		if (err) return res.sendStatus(403)
		const sql = 'select * from user where id = ?'
		const params = [user.id]
		const userPointsSql = 'SELECT life_points FROM user WHERE id = ?'
		const deleteUserSql = 'DELETE FROM user WHERE id = ?'
		const insertIntoBlacklistSql = 'INSERT INTO blacklisted_email (email) VALUES (?)'
		const userPoints = await db.query(userPointsSql, params)

		if (!userPoints.rows.length) {
			res.status(403).json({ error: 'Token invalid' })
			return
		}
		if (userPoints.rows[0].life_points <= 0) {
			await db.query(insertIntoBlacklistSql, user.email)
			await db.query(deleteUserSql, params)
			res.json({
				message:
					'Your account, your posts and your votes were deleted because you hit 0 life points.',
			})
			return
		}

		db.get(sql, params, (err, row) => {
			if (err) {
				res.status(400).json({ error: err.message })
				return
			}
			delete row.password
			req.user = row
			next() // pass the execution off to whatever request the client intended
		})
	})
}

app.post('/signup/', async (req, res, next) => {
	let errors = []
	if (!req.body.username) {
		errors.push('No username provided')
	}
	if (!req.body.email) {
		errors.push('No email provided')
	}
	if (!req.body.password) {
		errors.push('No password provided')
	}
	if (errors.length) {
		res.status(400).json({ error: errors.join(', ') })
		return
	}

	let data = {
		username: req.body.username,
		email: req.body.email,
		password: md5(req.body.password),
	}

	const blacklistedEmailCheckSql = 'SELECT email FROM blacklisted_email WHERE email = ?'
	const sql = 'INSERT INTO user (username, email, password) VALUES (?,?,?)'
	const params = [data.username, data.email, data.password]

	const blacklistedCheck = await db.query(blacklistedEmailCheckSql, data.email)
	if (blacklistedCheck.rows.length) {
		res.status(403).json({ error: 'Your email is blacklisted' })
		return
	}
	db.run(sql, params, function (err, result) {
		if (err) {
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email') {
				res.status(400).json({ error: 'Email already taken' })
				return
			}
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username') {
				res.status(400).json({ error: 'Username already taken' })
				return
			} else {
				res.status(400).json({ error: err.message })
				return
			}
		}
		data.id = this.lastID
		data.life_points = 50
		const token = generateAccessToken({
			id: data.id,
			username: data.username,
			email: data.email,
		})
		res.json({
			data: data,
			token: token,
		})
	})
})

app.post('/signin/', async (req, res, next) => {
	let errors = []
	if (!req.body.username) {
		errors.push('No username provided')
	}
	if (!req.body.password) {
		errors.push('No password provided')
	}
	if (errors.length) {
		res.status(400).json({ error: errors.join(', ') })
		return
	}

	const signInSql = 'SELECT * FROM user WHERE username = ? AND password = ?'
	const signInParams = [req.body.username, md5(req.body.password)]
	const deleteUserSql = 'DELETE FROM user WHERE id = ?'
	const insertIntoBlacklistSql = 'INSERT INTO blacklisted_email (email) VALUES (?)'

	try {
		const data = await db.query(signInSql, signInParams)
		if (!data.rows.length) {
			res.status(400).json({ error: 'Invalid username or password or user does not exist!' })
			return
		}
		const userData = data.rows[0]
		if (userData.life_points <= 0) {
			await db.query(deleteUserSql, userData.id)
			await db.query(insertIntoBlacklistSql, userData.email)
			res.json({
				message:
					'Your account, your posts and your votes were deleted because you hit 0 life points.',
			})
			return
		}
		delete userData.password
		const token = generateAccessToken({
			id: userData.id,
			username: userData.username,
			email: userData.email,
		})
		res.json({
			data: userData,
			token: token,
		})
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

app.get('/myposts', authenticateToken, async (req, res, next) => {
	const sql = 'SELECT * FROM post WHERE authorId = ? ORDER BY date_created DESC'
	const params = [req.user.id]

	try {
		const postsData = await db.query(sql, params)
		res.json({
			data: postsData.rows,
		})
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

app.patch('/users/:id', authenticateToken, async (req, res, next) => {
	if (!req.body.username && !req.body.email && !req.body.password) {
		res.status(400).json({ error: 'Nothing to update' })
		return
	}

	const data = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password ? md5(req.body.password) : null,
	}
	const params = [data.username, data.email, data.password, req.params.id]
	const sql = `UPDATE user SET 
		username = COALESCE(?,username), 
		email = COALESCE(?,email), 
		password = COALESCE(?,password) 
		WHERE id = ?`

	//Prevent user FROM updating other user's details
	if (Number(req.params.id) !== req.user.id) {
		res.status(403).json({ message: 'You can only update your own details.' })
		return
	}
	db.run(sql, params, function (err, result) {
		if (err) {
			if (data.username && data.email) {
				res.status(400).json({ error: 'Username or email are taken.' })
			} else if (data.username) {
				res.status(400).json({ error: 'Username taken' })
			} else if (data.email) {
				res.status(400).json({ error: 'Email taken ' })
			} else {
				res.status(400).json({ error: err.message })
			}
			return
		}
		res.json({ message: 'Success' })
	})
})

app.delete('/users/:id', authenticateToken, (req, res, next) => {
	const sql = `DELETE FROM user WHERE id = ?`
	if (Number(req.params.id) !== req.user.id) {
		res.status(403).json({ message: 'You can only delete your own account.' })
		return
	}
	db.run(sql, req.params.id, function (err, result) {
		if (err) {
			res.status(400).json({ error: res.message })
			return
		}
		res.json({ message: 'Success' })
	})
})

//POST ENDPOINTS
app.get('/posts', authenticateToken, (req, res, next) => {
	const sql = 'SELECT * FROM post ORDER BY date_created DESC'
	const params = []
	db.all(sql, params, (err, rows) => {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		res.json({
			data: rows,
		})
	})
})

app.post('/posts/', authenticateToken, (req, res, next) => {
	let errors = []
	if (!req.body.message) {
		errors.push('No message provided')
	}
	if (errors.length) {
		res.status(400).json({ error: errors.join(',') })
		return
	}
	let data = {
		message: req.body.message,
		username: req.user.username,
	}
	const sql = 'INSERT INTO post (message, authorId) VALUES (?,?)'
	const params = [data.message, req.user.id]
	db.run(sql, params, function (err, result) {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		data.id = this.lastID
		res.json({
			data: data,
		})
	})
})

app.patch('/posts/:id', authenticateToken, (req, res, next) => {
	if (!req.body.message) {
		res.status(400).json({ error: 'Nothing to update' })
		return
	}
	const data = {
		message: req.body.message,
	}
	const getPostAuthorIdSql = `SELECT authorId FROM post WHERE id = ?`
	const getPostAuthorIdParams = [req.params.id]
	const updatePostSql = `UPDATE post SET 
		message = COALESCE(?,message) 
		WHERE id = ?`
	const updatePostParams = [data.message, req.params.id]
	db.get(getPostAuthorIdSql, getPostAuthorIdParams, function (err, row) {
		if (err) {
			res.status(400).json({ error: res.message })
			return
		}
		if (Number(req.user.id) !== Number(row.authorId)) {
			res.status(403).json({ message: 'You can only update your own posts.' })
			return
		}
		db.run(updatePostSql, updatePostParams, function (err, result) {
			if (err) {
				res.status(400).json({ error: err.message })
				return
			}
			res.json({
				data: data,
			})
		})
	})
})

app.delete('/posts/:id', authenticateToken, (req, res, next) => {
	const getPostAuthorIdSql = `SELECT authorId FROM post WHERE id = ?`
	const getPostAuthorIdParams = [req.params.id]
	const deletePostSql = `DELETE FROM post WHERE id = ?`

	db.get(getPostAuthorIdSql, getPostAuthorIdParams, function (err, row) {
		if (err) {
			res.status(400).json({ error: res.message })
			return
		}
		if (!row) {
			res.status(404).json({ error: 'Post not found' })
			return
		}
		if (Number(req.user.id) !== Number(row.authorId)) {
			res.status(403).json({ message: 'You can only delete your own posts.' })
			return
		}
		db.run(deletePostSql, req.params.id, function (err, result) {
			if (err) {
				res.status(400).json({ error: res.message })
				return
			}
			res.json({ message: 'deleted' })
		})
	})
})

//UPVOTE/DOWNVOTE
app.get('/posts/upvote/:id', authenticateToken, async (req, res, next) => {
	const postExistsCheck = 'SELECT authorId FROM post WHERE id = ?'
	const votedCheckSql = 'SELECT id FROM vote WHERE postId = ? AND voterId = ?'
	const votedCheckParams = [req.params.id, req.user.id]
	const upvoteSql = 'UPDATE post SET points = (points + 1) WHERE id = ?'
	const voteSql = 'INSERT INTO vote (type, postId, voterId) VALUES (?,?,?)'
	const voteParams = ['upvote', req.params.id, req.user.id]
	const upvoteUserSql = 'UPDATE user SET life_points = (life_points + 1) WHERE id = ?'

	try {
		const postExists = await db.query(postExistsCheck, req.params.id)
		let authorId
		if (!postExists.rows.length) {
			res.status(404).json({ error: 'Post not found' })
			return
		} else {
			authorId = postExists.rows[0].authorId
		}

		if (authorId === req.user.id) {
			res.json({ message: 'You cannot vote for yourself' })
			return
		}

		const voteCheck = await db.query(votedCheckSql, votedCheckParams)
		if (voteCheck.rows.length) {
			res.json({
				message: 'You have already voted',
			})
			return
		}
		await db.query(voteSql, voteParams)
		await db.query(upvoteSql, req.params.id)
		await db.query(upvoteUserSql, authorId)
		res.json({ message: 'Upvoted!' })
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

app.get('/posts/downvote/:id', authenticateToken, async (req, res, next) => {
	const postExistsCheck = 'SELECT authorId FROM post WHERE id = ?'
	const votedCheckSql = 'SELECT * FROM vote WHERE postId = ? AND voterId = ?'
	const votedCheckParams = [req.params.id, req.user.id]
	const downvoteSql = 'UPDATE post SET points = (points - 1) WHERE id = ?'
	const voteSql = 'INSERT INTO vote (type, postId, voterId) VALUES (?,?,?)'
	const voteParams = ['downvote', req.params.id, req.user.id]
	const downvoteUserSql = 'UPDATE user SET life_points = (life_points - 1) WHERE id = ?'
	const userPointsSql = 'SELECT life_points FROM user WHERE id = ?'

	try {
		const postExists = await db.query(postExistsCheck, req.params.id)
		let authorId
		if (!postExists.rows.length) {
			res.status(404).json({ error: 'Post not found' })
			return
		} else {
			authorId = postExists.rows[0].authorId
		}

		if (authorId === req.user.id) {
			res.json({ message: 'You cannot vote for yourself' })
			return
		}

		const voteCheck = await db.query(votedCheckSql, votedCheckParams)
		if (voteCheck.rows.length) {
			res.json({
				message: 'You have already voted',
			})
			return
		}
		await db.query(voteSql, voteParams)
		await db.query(downvoteSql, req.params.id)
		await db.query(downvoteUserSql, authorId)
		res.json({ message: 'Downvoted!' })
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

// Default response for any other request
app.use((req, res) => {
	res.status(404).send("Sorry can't find that!")
})

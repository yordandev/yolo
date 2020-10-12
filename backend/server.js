// Create express app
const express = require('express')
const app = express()
const db = require('./database.js')
const md5 = require('md5')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser)
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const googleUtil = require('./google-util')
const rug = require('random-username-generator')
const swaggerUi = require('swagger-ui-express'),
	swaggerDocument = require('./swagger.json')
const parser = require('xml2json')

const JWT_SECRET =
	Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

db.query = function (sql, params) {
	const that = this
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
app.use(
	bodyParser.xml({
		limit: '1MB', // Reject payload bigger than 1 MB
		explicitArray: true,
		normalize: true,
	})
)
app.use(
	cors({
		origin: 'http://localhost:8081',
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const handleResponse = (req, res, status, data) => {
	status = Number(status) || 200
	const type = req.headers['content-type'] || req.headers['accept']
	if (type === 'application/xml' || type === 'text/xml' || type === 'application/rss+xml') {
		res.set('Content-Type', 'application/xml')
		const newdata = parser.toXml(data)
		res.status(status).send(newdata)
	} else {
		res.status(status).json(data)
	}
}

//USER/AUTHENTICATION ENDPOINTS
const generateAccessToken = (data) =>
	// expires after an hour
	jwt.sign(data, JWT_SECRET, { expiresIn: '3600s' })

const authenticateToken = (req, res, next) => {
	// Gather the jwt access token FROM the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) {
		return handleResponse(req, res, 401, { error: 'You need to be authenticated!' })
	} // if there is no token attached to the headers

	jwt.verify(token, JWT_SECRET, async (err, user) => {
		if (err) {
			return handleResponse(req, res, 401, { error: 'You need to be authenticated!' })
		}
		const sql = 'select * from user where id = ?'
		const params = [user.id]
		const userPointsSql = 'SELECT life_points FROM user WHERE id = ?'
		const deleteUserSql = 'DELETE FROM user WHERE id = ?'
		const insertIntoBlacklistSql = 'INSERT INTO blacklisted_email (email) VALUES (?)'
		const userPoints = await db.query(userPointsSql, params)

		if (!userPoints.rows.length) {
			handleResponse(req, res, 401, { error: 'Token invalid!' })
			return
		}
		if (userPoints.rows[0].life_points <= 0) {
			await db.query(insertIntoBlacklistSql, user.email)
			await db.query(deleteUserSql, params)
			handleResponse(req, res, 204, {
				message:
					'Your account, your posts and your votes were deleted because you hit 0 life points.',
			})
			return
		}

		db.get(sql, params, (err, row) => {
			if (err) {
				handleResponse(req, res, 204, { error: err.message })
				return
			}
			delete row.password
			req.user = row
			next() // pass the execution off to whatever request the client intended
		})
	})
}

// Root endpoint
app.get('/', authenticateToken, (req, res, next) => {
	handleResponse(req, res, 200, { message: 'uhhh, what is it you want me to do exactly?' })
})

app.post('/signup', async (req, res, next) => {
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.username = req.body.data.username[0]
		req.body.email = req.body.data.email[0]
		req.body.password = req.body.data.password[0]
	}
	let errors = []
	if (!req.body.username) {
		errors.push('No username provided')
	}
	if (!req.body.email) {
		errors.push('No email provided')
	}
	if (!emailRegex.test(req.body.email)) {
		errors.push('Email is not valid')
	}
	if (!req.body.password) {
		errors.push('No password provided')
	}
	if (errors.length) {
		handleResponse(req, res, 400, { error: errors.join(', ') })
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
		handleResponse(req, res, 400, { error: 'Your email is blacklisted' })
		return
	}
	db.run(sql, params, function (err, result) {
		if (err) {
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email') {
				handleResponse(req, res, 400, { error: 'Email already taken' })
				return
			}
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username') {
				handleResponse(req, res, 400, { error: 'Username already taken' })
				return
			} else {
				handleResponse(req, res, 400, { error: err.message })
				return
			}
		}
		data.id = this.lastID
		data.life_points = 50
		delete data.password
		const token = generateAccessToken({
			id: data.id,
			username: data.username,
			email: data.email,
		})
		data.token = token
		handleResponse(req, res, 200, {
			data: data,
		})
	})
})

app.post('/signin', async (req, res, next) => {
	let errors = []
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.username = req.body.data.username[0]
		req.body.password = req.body.data.password[0]
	}
	if (!req.body.username) {
		errors.push('No username provided')
	}
	if (!req.body.password) {
		errors.push('No password provided')
	}
	if (errors.length) {
		handleResponse(req, res, 400, { error: errors.join(', ') })
		return
	}

	const signInSql = 'SELECT * FROM user WHERE username = ? AND password = ?'
	const signInParams = [req.body.username, md5(req.body.password)]
	const deleteUserSql = 'DELETE FROM user WHERE id = ?'
	const insertIntoBlacklistSql = 'INSERT INTO blacklisted_email (email) VALUES (?)'

	try {
		const data = await db.query(signInSql, signInParams)
		if (!data.rows.length) {
			handleResponse(req, res, 400, { error: 'Invalid username/password or user does not exist!' })
			return
		}
		const userData = data.rows[0]
		if (userData.life_points <= 0) {
			await db.query(deleteUserSql, userData.id)
			await db.query(insertIntoBlacklistSql, userData.email)
			handleResponse(req, res, 400, {
				error:
					'Your account, your posts and your votes were deleted because you hit 0 life points.',
			})
			return
		}
		delete userData.password
		delete userData.date_created
		const token = generateAccessToken({
			id: userData.id,
			username: userData.username,
			email: userData.email,
		})
		userData.token = token
		handleResponse(req, res, 200, userData)
	} catch (error) {
		handleResponse(req, res, 400, { error: error.message })
	}
})

app.get('/me', authenticateToken, async (req, res, next) => {
	const sql = 'SELECT * FROM user WHERE id = ?'
	const params = [req.user.id]

	try {
		const data = await db.query(sql, params)
		delete data.rows[0].password
		delete data.rows[0].date_created
		handleResponse(req, res, 200, { data: data.rows[0] })
	} catch (error) {
		handleResponse(req, res, 400, { error: error.message })
	}
})

app.get('/myposts', authenticateToken, async (req, res, next) => {
	const sql = 'SELECT * FROM post WHERE authorId = ? ORDER BY date_created DESC'
	const params = [req.user.id]

	try {
		const postsData = await db.query(sql, params)
		handleResponse(req, res, 200, { data: postsData.rows })
	} catch (error) {
		handleResponse(req, res, 400, { error: error.message })
	}
})

app.patch('/users/:id', authenticateToken, async (req, res, next) => {
	if (!req.params.id) {
		handleResponse(req, res, 400, { error: 'No user ID provided.' })
		return
	}
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.username = req.body.data.username[0]
		req.body.password = req.body.data.password[0]
	}
	if (!req.body.username && !req.body.password) {
		handleResponse(req, res, 400, { error: 'Nothing to update' })
		return
	}

	const data = {
		username: req.body.username,
		password: req.body.password ? md5(req.body.password) : null,
	}
	const params = [data.username, data.password, req.params.id]
	const sql = `UPDATE user SET 
		username = COALESCE(?,username), 
		password = COALESCE(?,password) 
		WHERE id = ?`

	//Prevent user from updating other user's details
	if (Number(req.params.id) !== req.user.id) {
		handleResponse(req, res, 403, { message: 'You can only update your own details.' })
		return
	}
	db.run(sql, params, function (err, result) {
		if (err) {
			if (data.username) {
				handleResponse(req, res, 400, { error: 'Username taken' })
				return
			} else {
				handleResponse(req, res, 400, { error: err.message })
				return
			}
			return
		}
		handleResponse(req, res, 200, { message: 'Success' })
	})
})

app.delete('/users/:id', authenticateToken, (req, res, next) => {
	const sql = `DELETE FROM user WHERE id = ?`
	if (Number(req.params.id) !== req.user.id) {
		handleResponse(req, res, 403, { message: 'You can only delete your own account.' })
		return
	}
	db.run(sql, req.params.id, function (err, result) {
		if (err) {
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		handleResponse(req, res, 200, { message: 'Success' })
	})
})

app.get('/google-url', async (req, res, next) => {
	const data = await googleUtil.urlGoogle()
	handleResponse(req, res, 200, { data })
})

app.post('/google-account', async (req, res, next) => {
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.code = req.body.data.code[0]
	}
	const code = req.body.code
	if (!code) {
		handleResponse(req, res, 400, { error: 'Google code not provided.' })
		return
	}
	const googleData = await googleUtil.getGoogleAccountFromCode(code)
	const googleIdToken = googleData.id_token
	const userData = await jwt.decode(googleIdToken)
	const username = rug.generate()

	let data = {
		username: username,
		email: userData.email,
		password: md5(googleIdToken + Math.random().toString(36)),
	}

	const blacklistedEmailCheckSql = 'SELECT email FROM blacklisted_email WHERE email = ?'
	const sql = 'INSERT INTO user (username, email, password) VALUES (?,?,?)'
	const deleteUserSql = 'DELETE FROM user WHERE id = ?'
	const insertIntoBlacklistSql = 'INSERT INTO blacklisted_email (email) VALUES (?)'
	const params = [data.username, data.email, data.password]
	const blacklistedCheck = await db.query(blacklistedEmailCheckSql, data.email)

	if (blacklistedCheck.rows.length) {
		handleResponse(req, res, 400, { error: 'Your email is blacklisted' })
		return
	}
	db.run(sql, params, async function (err, result) {
		if (err) {
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email') {
				const sql = 'SELECT username, id, life_points FROM user WHERE email = ?'
				const username = await db.query(sql, data.email)
				const existingData = {
					id: username.rows[0].id,
					username: username.rows[0].username,
					email: data.email,
					life_points: username.rows[0].life_points,
				}
				if (existingData.life_points <= 0) {
					await db.query(deleteUserSql, existingData.id)
					await db.query(insertIntoBlacklistSql, existingData.email)
					handleResponse(req, res, 400, {
						error:
							'Your account, your posts and your votes were deleted because you hit 0 life points.',
					})
					return
				}
				const token = generateAccessToken(existingData)
				existingData.token = token
				handleResponse(req, res, 200, { data: existingData })
				return
			}
			if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username') {
				handleResponse(req, res, 400, { error: 'Username already taken' })
				return
			} else {
				handleResponse(req, res, 400, { error: err.message })
				return
			}
		}
		data.id = this.lastID
		data.life_points = 50
		delete data.password
		const token = generateAccessToken({
			id: data.id,
			username: data.username,
			email: data.email,
		})
		data.token = token
		handleResponse(req, res, 200, { data: data })
	})
})

//POST ENDPOINTS
app.get('/posts', authenticateToken, (req, res, next) => {
	const sql = 'SELECT * FROM post ORDER BY date_created DESC'
	const params = []
	db.all(sql, params, (err, rows) => {
		if (err) {
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		handleResponse(req, res, 200, { data: rows })
	})
})

app.get('/posts/:id', authenticateToken, (req, res, next) => {
	const sql = 'SELECT * FROM post WHERE id = ?'
	const params = [req.params.id]
	db.get(sql, params, (err, row) => {
		if (err) {
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		delete row.date_created
		delete row.authorId
		delete row.points
		delete row.id
		handleResponse(req, res, 200, { data: row })
	})
})

app.post('/posts', authenticateToken, (req, res, next) => {
	let errors = []
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.message = req.body.data.message[0]
	}
	if (!req.body.message) {
		errors.push('No message provided')
	}
	if (errors.length) {
		handleResponse(req, res, 400, { error: errors.join(', ') })
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
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		data.id = this.lastID
		handleResponse(req, res, 200, { data: data })
	})
})

app.patch('/posts/:id', authenticateToken, (req, res, next) => {
	if (req.is('application/xml' || 'text/xml' || 'application/rss+xml')) {
		req.body.message = req.body.data.message[0]
	}
	if (!req.body.message) {
		handleResponse(req, res, 400, { error: 'Nothing to update' })
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
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		if (Number(req.user.id) !== Number(row.authorId)) {
			handleResponse(req, res, 400, { error: 'You can only update your own posts.' })
			return
		}
		db.run(updatePostSql, updatePostParams, function (err, result) {
			if (err) {
				handleResponse(req, res, 400, { error: err.message })
				return
			}
			handleResponse(req, res, 200, { message: 'Success' })
		})
	})
})

app.delete('/posts/:id', authenticateToken, (req, res, next) => {
	const getPostAuthorIdSql = `SELECT authorId FROM post WHERE id = ?`
	const getPostAuthorIdParams = [req.params.id]
	const deletePostSql = `DELETE FROM post WHERE id = ?`

	db.get(getPostAuthorIdSql, getPostAuthorIdParams, function (err, row) {
		if (err) {
			handleResponse(req, res, 400, { error: err.message })
			return
		}
		if (!row) {
			handleResponse(req, res, 404, { error: 'Post not found' })
			return
		}
		if (Number(req.user.id) !== Number(row.authorId)) {
			handleResponse(req, res, 403, { message: 'You can only delete your own posts.' })
			return
		}
		db.run(deletePostSql, req.params.id, function (err, result) {
			if (err) {
				handleResponse(req, res, 400, { error: err.message })
				return
			}
			handleResponse(req, res, 204, { message: 'Deleted' })
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
			handleResponse(req, res, 404, { error: 'Post not found' })
			return
		} else {
			authorId = postExists.rows[0].authorId
		}

		if (authorId === req.user.id) {
			handleResponse(req, res, 400, { error: 'You cannot vote for yourself.' })
			return
		}

		const voteCheck = await db.query(votedCheckSql, votedCheckParams)
		if (voteCheck.rows.length) {
			handleResponse(req, res, 400, { error: 'You have already voted!' })
			return
		}
		await db.query(voteSql, voteParams)
		await db.query(upvoteSql, req.params.id)
		await db.query(upvoteUserSql, authorId)
		handleResponse(req, res, 200, { message: 'Upvoted!' })
	} catch (error) {
		handleResponse(req, res, 400, { error: error.message })
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
			handleResponse(req, res, 404, { error: 'Post not found' })
			return
		} else {
			authorId = postExists.rows[0].authorId
		}

		if (authorId === req.user.id) {
			handleResponse(req, res, 400, { error: 'You cannot vote for yourself.' })
			return
		}

		const voteCheck = await db.query(votedCheckSql, votedCheckParams)
		if (voteCheck.rows.length) {
			handleResponse(req, res, 400, { error: 'You have already voted!' })
			return
		}
		await db.query(voteSql, voteParams)
		await db.query(downvoteSql, req.params.id)
		await db.query(downvoteUserSql, authorId)
		handleResponse(req, res, 200, { message: 'Downvoted!' })
	} catch (error) {
		handleResponse(req, res, 400, { error: error.message })
	}
})

// Default response for any other request
app.use((req, res) => {
	handleResponse(req, res, 404, { error: 'Sorry cannot find that!' })
})

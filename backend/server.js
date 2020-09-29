// Create express app
const express = require('express')
const app = express()
const db = require('./database.js')
const md5 = require('md5')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'f85689f551cf5e2fda79657812715cef6e77cf8361f02bc6d80915b8c4f41bd6'

// Server port
const PORT = 8080
// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Root endpoint
app.get('/', (req, res, next) => {
	res.json({ message: 'uhhh, what is it you want me to do exactly?' })
})

//USER/AUTHENTICATION ENDPOINTS
const generateAccessToken = (username) =>
	// expires after an hour
	jwt.sign(username, JWT_SECRET, { expiresIn: '3600s' })

const authenticateToken = (req, res, next) => {
	// Gather the jwt access token from the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) return res.sendStatus(401) // if there isn't any token

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		const sql = 'select * from user where username = ?'
		const params = [user.username]
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

app.post('/signup/', (req, res, next) => {
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
		res.status(400).json({ error: errors.join(',') })
		return
	}
	let data = {
		username: req.body.username,
		email: req.body.email,
		password: md5(req.body.password),
	}
	const params = [data.username, data.email, data.password]
	const sql = 'INSERT INTO user (username, email, password) VALUES (?,?,?)'
	db.run(sql, params, function (err, result) {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		delete data.password
		data.id = this.lastID
		const token = generateAccessToken({
			username: req.body.username,
			email: req.body.email,
		})
		res.json({
			message: 'Success',
			data: data,
			token: token,
		})
	})
})

app.post('/login/', (req, res, next) => {
	let errors = []
	if (!req.body.username) {
		errors.push('No username provided')
	}
	if (!req.body.password) {
		errors.push('No password provided')
	}
	if (errors.length) {
		res.status(400).json({ error: errors.join(',') })
		return
	}

	const loginSql = 'SELECT * FROM user WHERE username = ? AND password = ?'
	const loginParams = [req.body.username, md5(req.body.password)]
	const sumUserLifePointsSql = 'SELECT SUM(points) FROM post WHERE authorId = ?'
	const addUserLifePointsSql = 'UPDATE user SET life_points = life_points + ? WHERE id = ?'
	const userLifePointsSql = 'SELECT life_points FROM user WHERE id = ?'
	const deleteUserSql = 'DELETE FROM user WHERE id = ?'
	const deleteUserPostsSql = 'DELETE from post WHERE authorId = ?'
	const deleteUserVotes = 'DELETE from vote WHERE voterId = ?'

	try {
		db.get(loginSql, loginParams, async (err, row) => {
			if (err) {
				res.status(400).json({ error: err.message })
				return
			}
			if (!row) {
				res.status(400).json({ error: 'Invalid username or password or user not found.' })
				return
			}
			delete row.password
			const userData = row
			console.log(userData)
			let newLifePoints = 0

			const points = await db.get(sumUserLifePointsSql, userData.id)
			console.log("Points: " + points)

			// newLifePoints = userData['life_points'] + result['SUM(points)']

			// console.log('New life points: ' + newLifePoints)

			// db.get(sumUserLifePointsSql, userData.id, (err, result) => {
			// 	if (err) {
			// 		res.status(400).json({ error: err.message })
			// 		return
			// 	}
			// 	const newPoints = Number(result['SUM(points)'])
			// 	console.log('New points: ' + newPoints)
			// 	db.run(addUserLifePointsSql, [newPoints, userData.id], (err, result) => {
			// 		if (err) {
			// 			res.status(400).json({ error: err.message })
			// 			return
			// 		}
			// 		db.get(userLifePointsSql, userData.id, (err, row) => {
			// 			if (row.life_points === 0) {
			// 				console.log('About to delete')
			// 				db.run(deleteUserVotes, userData.id, (err, result) => {
			// 					if (err) {
			// 						res.status(400).json({ error: err.message })
			// 						return
			// 					}
			// 					db.run(deleteUserPostsSql, userData.id, (err, row) => {
			// 						if (err) {
			// 							res.status(400).json({ error: err.message })
			// 							return
			// 						}
			// 						db.run(deleteUserSql, userData.id, (err, row) => {
			// 							if (err) {
			// 								res.status(400).json({ error: err.message })
			// 								return
			// 							}
			// 							res.json({
			// 								message:
			// 									'Your account, your posts and your votes were deleted because you hit 0 life points.',
			// 							})
			// 						})
			// 					})
			// 				})
			// 			}
			// 			delete userData.password
			// 			const token = generateAccessToken({
			// 				username: req.body.username,
			// 				email: userData.email,
			// 			})
			// 			res.json({
			// 				message: 'Success',
			// 				data: userData,
			// 				token: token,
			// 			})
			// 		})
			// 	})
			// })
		})
	} catch (error) {
		res.status(400).json({ error: err.message })
	}
})

app.get('/user/:username', authenticateToken, (req, res, next) => {
	const userSql = 'select * from user where username = ?'
	const userPostsSql = 'select * from post where authorId = ?'
	const userParams = [req.params.username]
	const userPostsParams = [req.user.id]
	let posts = []
	db.all(userPostsSql, userPostsParams, (err, rows) => {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		posts = rows
	})
	db.get(userSql, userParams, (err, row) => {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		delete row.password
		res.json({
			message: 'Success',
			data: row,
			posts: posts,
		})
	})
})

app.patch('/user/:id', authenticateToken, (req, res, next) => {
	const data = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password ? md5(req.body.password) : null,
	}
	const params = [data.username, data.email, data.password, req.params.id]
	const sql = `UPDATE user set 
  username = COALESCE(?,username), 
  email = COALESCE(?,email), 
  password = COALESCE(?,password) 
  WHERE id = ?`
	//Prevent user from updating other user's details
	if (Number(req.params.id) !== req.user.id) {
		res.status(403).json({ message: 'You can only update your own details.' })
		return
	}
	db.run(sql, params, function (err, result) {
		if (err) {
			res.status(400).json({ error: res.message })
			return
		}
		delete data.password
		res.json({
			message: 'Success',
			data: data,
			changes: this.changes,
		})
	})
})

app.delete('/user/:id', authenticateToken, (req, res, next) => {
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
		res.json({ message: 'deleted', changes: this.changes })
	})
})

//POST ENDPOINTS
app.get('/posts', authenticateToken, (req, res, next) => {
	const sql = 'select * from post'
	const params = []
	db.all(sql, params, (err, rows) => {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		res.json({
			message: 'Success',
			data: rows,
		})
	})
})

app.get('/myposts', authenticateToken, (req, res, next) => {
	const sql = 'select * from post where authorId = ?'
	const params = [req.user.id]
	db.all(sql, params, (err, rows) => {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		res.json({
			message: 'Success',
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
			message: 'Success',
			data: data,
		})
	})
})

app.patch('/post/:id', authenticateToken, (req, res, next) => {
	const data = {
		message: req.body.message,
	}
	const getPostAuthorIdSql = `SELECT authorId from post WHERE id = ?`
	const getPostAuthorIdParams = [req.params.id]
	const updatePostSql = `UPDATE post set 
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
				message: 'Success',
				data: data,
				changes: this.changes,
			})
		})
	})
})

app.delete('/post/:id', authenticateToken, (req, res, next) => {
	const getPostAuthorIdSql = `SELECT authorId from post WHERE id = ?`
	const getPostAuthorIdParams = [req.params.id]
	const deletePostSql = `DELETE FROM post WHERE id = ?`

	db.get(getPostAuthorIdSql, getPostAuthorIdParams, function (err, row) {
		if (err) {
			res.status(400).json({ error: res.message })
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
			res.json({ message: 'deleted', changes: this.changes })
		})
	})
})

//UPVOTE/DOWNVOTE
app.get('/upvote/:id', authenticateToken, (req, res, next) => {
	const votedCheckSql = 'SELECT id FROM vote WHERE postId = ? AND voterId = ?'
	const votedCheckParams = [req.params.id, req.user.id]
	const upvoteSql = 'UPDATE post SET points = (points + 1) WHERE id = ?'
	const voteSql = 'INSERT INTO vote (type, postId, voterId) VALUES (?,?,?)'
	const voteParams = ['upvote', req.params.id, req.user.id]

	db.get(votedCheckSql, votedCheckParams, function (err, result) {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		if (result !== undefined) {
			res.json({
				message: 'You have already voted',
			})
		} else {
			db.run(voteSql, voteParams, function (err, result) {
				if (err) {
					res.status(400).json({ error: err.message })
					return
				}
				db.run(upvoteSql, req.params.id, function (err, result) {
					if (err) {
						res.status(400).json({ error: err.message })
						return
					}
					res.json({
						message: 'Success',
					})
				})
			})
		}
	})
})

app.get('/downvote/:id', authenticateToken, (req, res, next) => {
	const votedCheckSql = 'SELECT * FROM vote WHERE postId = ? AND voterId = ?'
	const votedCheckParams = [req.params.id, req.user.id]
	const downvoteSql = 'UPDATE post SET points = (points - 1) WHERE id = ?'
	const voteSql = 'INSERT INTO vote (type, postId, voterId) VALUES (?,?,?)'
	const voteParams = ['downvote', req.params.id, req.user.id]

	db.get(votedCheckSql, votedCheckParams, function (err, result) {
		if (err) {
			res.status(400).json({ error: err.message })
			return
		}
		if (result !== undefined) {
			res.json({
				message: 'You have already voted',
			})
		} else {
			db.run(voteSql, voteParams, function (err, result) {
				if (err) {
					res.status(400).json({ error: err.message })
					return
				}
				db.run(downvoteSql, req.params.id, function (err, result) {
					if (err) {
						res.status(400).json({ error: err.message })
						return
					}
					res.json({
						message: 'Success',
					})
				})
			})
		}
	})
})

// Default response for any other request
app.use((req, res) => {
	res.status(404).send("Sorry can't find that!")
})

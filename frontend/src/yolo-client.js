/* eslint-disable */
const axios = require('axios')
const jwt = require('jsonwebtoken')

axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.patch['Content-Type'] = 'application/json'
axios.defaults.headers.delete['Content-Type'] = 'application/json'

const setToken = (token) => localStorage.setItem('access_token', token)
const getToken = () => localStorage.getItem('access_token')
const clearToken = () => localStorage.removeItem('access_token')

axios.interceptors.request.use(
	async (config) => {
		const token = getToken()
		config.headers.Authorization = token ? `Bearer ${token}` : ''
		return config
	},
	async (error) => {
		return Promise.reject(error)
	}
)

axios.interceptors.response.use(
	(config) => config,
	async (error) => {
		if (error.response.status === 403) {
			return Promise.reject(new Error('Unauthorized'))
		}
		if (error.response.status === 404) {
			return Promise.reject(new Error('Resource not found'))
		}
		return Promise.reject(error)
	}
)

module.exports.signUp = async function(username, email, password) {
	clearToken()
	let data
	try {
		await axios
			.post('/signup', { username: username, email: email, password: password })
			.then((res) => {
				data = res.data
				setToken(data.token)
			})
		return data
	} catch (err) {
		throw err.response.data.error
	}
}

module.exports.signIn = async function(username, password) {
	clearToken()
	let data
	try {
		await axios.post('/signin', { username: username, password: password }).then((res) => {
			data = res.data
			setToken(data.token)
		})
		return data
	} catch (err) {
		throw err.response.data.error
	}
}

module.exports.getMyUserDetails = async function() {
	let data
	try {
		await axios.get('/me').then((res) => {
			data = res.data
		})
		return data
	} catch (err) {
		console.log(err)
		throw err.response.data.error
	}
}

module.exports.signOut = function() {
	clearToken()
}

module.exports.getMyPosts = async function() {
	let data
	try {
		await axios.get('/myposts').then((res) => {
			data = res.data
		})
		return data
	} catch (err) {
		throw err.response.data.error
	}
}

module.exports.updateMyProfile = async function(username, password) {
	let data
	try {
		const token = getToken()
		if (!token) {
			throw new Error('Unauthenticated')
		}
		const decoded = jwt.decode(token)
		await axios
			.patch(`/users/${decoded.id}`, { username: username, password: password })
			.then((res) => {
				data = res.data.message
			})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.deleteMyProfile = async function() {
	let data
	try {
		const token = getToken()
		if (!token) {
			throw new Error('Unauthenticated')
		}
		const decoded = jwt.decode(token)
		await axios.delete(`/users/${decoded.id}`).then((res) => {
			data = res.data.message
		})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.getPosts = async function() {
	let data
	try {
		await axios.get('/posts').then((res) => {
			data = res.data
		})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.getPost = async function(id) {
	let data
	try {
		await axios.get(`/posts/${id}`).then((res) => {
			data = res.data
		})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.createPost = async function(message) {
	let data
	try {
		await axios.post('/posts', { message: message }).then((res) => {
			data = res.data
		})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.updatePost = async function(id, message) {
	let data
	try {
		await axios.patch(`/posts/${id}`, { message: message }).then((res) => {
			data = res.data.message
		})
		return data
	} catch (err) {
		console.log(err.response)
		throw err.response.data.error
	}
}

module.exports.deletePost = async function(id) {
	let data
	try {
		await axios.delete(`/posts/${id}`).then(() => {
			data = 'Deleted'
		})
		return data
	} catch (err) {
		throw err.message
	}
}

module.exports.upvotePost = async function(id) {
	let data
	try {
		await axios.get(`/posts/upvote/${id}`).then((res) => {
			data = res.data.message
		})
		return data
	} catch (err) {
		throw err.response.data.error
	}
}

module.exports.downvotePost = async function(id) {
	let data
	try {
		await axios.get(`/posts/downvote/${id}`).then((res) => {
			data = res.data.message
		})
		return data
	} catch (err) {
		throw err.response.data.error
	}
}

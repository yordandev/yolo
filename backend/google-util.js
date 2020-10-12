const google = require('googleapis').google

const googleConfig = {
	clientId: '974845574224-ck6jtidv4ftch9t7kqt5stt8b9bub0h8.apps.googleusercontent.com', // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
	clientSecret: 'UawI-pP9yJIzytKIq4fHAHiw', // e.g. _ASDFA%DFASDFASDFASD#FAD-
	redirect: 'http://localhost:8081/callback', // this must match your google api settings
}

/**
 * Create the google auth object which gives us access to talk to google's apis.
 */
function createConnection() {
	return new google.auth.OAuth2(
		googleConfig.clientId,
		googleConfig.clientSecret,
		googleConfig.redirect
	)
}

const defaultScope = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
]

/*************/
/** HELPERS **/
/*************/

function createConnection() {
	return new google.auth.OAuth2(
		googleConfig.clientId,
		googleConfig.clientSecret,
		googleConfig.redirect
	)
}

function getConnectionUrl(auth) {
	return auth.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: defaultScope,
	})
}

function getGooglePeopleApi(auth) {
	return google.people({ version: 'v1', auth })
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
module.exports.urlGoogle = function () {
	const auth = createConnection()
	const url = getConnectionUrl(auth)
	return url
}

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
module.exports.getGoogleAccountFromCode = async function (code) {
	const auth = createConnection()
	const data = await auth.getToken(code)
	const tokens = data.tokens
	return {
		id_token: tokens.id_token
	}
}

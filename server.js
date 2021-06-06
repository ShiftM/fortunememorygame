var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


// get config vars
dotenv.config();


// access config var
process.env.TOKEN_SECRET;

// IMPORT FUNCTIONS
var logger = require('./functions/logger');
var time = require('./functions/time');
var user = require('./functions/user');


var server = require('http').Server(express);
const mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: "users",
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('*/game', express.static(__dirname + "/game"));
app.use('*/assets', express.static(__dirname + "/assets"));
app.use('*/fortune', express.static(__dirname + "/fortune"));


app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/fortune'));

app.use('*/img', express.static(__dirname + "/img"));
app.use('*/css', express.static(__dirname + "/css"));
app.use('*/fonts', express.static(__dirname + "/fonts"));

app.set('view engine', 'ejs');


app.get('/', function (request, response) {

	let iframedata = request.query.QUERY;
	try {
		var safeBase64 = iframedata.replace(/%2F/g, '/').replace(/%2B/g, '+').replace(/%3D/g, '=');
	} catch (e) {
			response.set('Content-Type', 'text/html');
			response.send(Buffer.from('<h2>Invalid URL: Query Missing or Not Formatted Correctly</h2><label>Refer to the documentation for more information</label>'));
	}

	// Check user
	user.checkUserGame(safeBase64).then(res => {
		let ContactId = res;
		let userProgress = "[0,10,10,10,10,10,10,10,0]";
		let userStars = 0;
		if (ContactId) {
			// console.log(data.ContactId)
			connection.query('SELECT * FROM user_fortune_generic WHERE userId = ?', [ContactId], function (error, results, fields) {
				if (results.length > 0) {
					userProgress = results[0].userProgress;
					userStars = results[0].userStars;

					var sql = "UPDATE user_fortune_generic SET lastLogin = ?, userToken = ? WHERE userId = ?";
					connection.query(sql, [time.getServerTime(), safeBase64, ContactId], function (err, result) {
						if (err) throw err;
					});

					var json = {
						ContactId: safeBase64,
						userProgress: userProgress,
						userStars: userStars,
					}

					response.render('../fortune/index', json);
				} else {
					// INSERT TO MYSQL
					connection.query('INSERT INTO user_fortune_generic (userId, userProgress, userStars, dateCreated, lastLogin, userToken ) VALUES (?,?,?,?,?,?)', [ContactId, userProgress, userStars, time.getServerTime(), time.getServerTime(), safeBase64], function (error, results, fields) {
						if (error) throw error;
						console.log("Successfully created user with ID: " + ContactId);
						var json = {
							ContactId: safeBase64,
							userProgress: userProgress,
							userStars: userStars,
						}
						response.render('../fortune/index', json);
					});
				}
			})
		} else {
			console.log('user not valid/available')
			response.status(200);
		}

	}).catch(err => {
		response.set('Content-Type', 'text/html');
		response.send(Buffer.from('<h2>' + err + '</h2><label>You are not authorized to access this content.</label>'));
	})

});

app.get('/test', function (request, response) {
	var json = {
		ContactId: 'TEST',
		userProgress: "[0,10,10,10,10,10,10,10,0]",
		userStars: '0',
	}
	response.render('../fortune/indextest', json);
});


app.get('/getData/:userId', function (request, response) {
	var ContactId = request.params.userId;

	if (ContactId) {
		connection.query('SELECT * FROM user_fortune_generic WHERE userId = ?', [ContactId], function (error, results, fields) {
			// SUCCESS
			if (results.length > 0) {
				// USER IS IN THE DATABASE
				// GET THE DATA
				var json = {
					userProgress: results[0].userProgress,
					userPoints: results[0].userStars,
					lastLogin: results[0].lastLogin,
					dateCreated: results[0].dateCreated
				}
				response.send(json);
			} else {
				response.send(400, { error: "NO SUCH USER" });
			}
		})
	}
});

app.post('/saveProgress', function (request, response) {

	// if (authenticateToken(request)) {

	if (request.body.userId && request.body.userProgress && request.body.userStars) {

		var progress = request.body.userProgress;

		// SAVE CURRENT TIME
		var d = new Date();
		d.setUTCHours(d.getUTCHours() + 8);

		var currentTime = Math.round(d); // next midnight
		var nextMidnight = Math.round(d.setHours(24, 0, 0, 0)); // next midnight

		var array = JSON.parse('[' + progress + ']')


		var databaseId = 0;
		connection.query('SELECT * FROM user_fortune_generic WHERE userToken = ?', [request.body.userId], function (error, results, fields) {
			// SUCCESS
			var levelCompletedId; // FOR LOGGING
			// GET USER ID
			if (results.length > 0) {
				databaseId = results[0].id;
				for (var i = 0; i < array.length; i++) {
					if (array[i] > 1000) {
						// GET CURRENT TIME
						array[i] = currentTime;
						var sql = "UPDATE user_generic SET nextUnlock = ? WHERE id = ?";
						connection.query(sql, [nextMidnight, databaseId], function (err, result) {
							if (err) throw err;
						});

						levelCompletedId = i - 1;
					}
				}

				// Add Coins
				let payload = {
					complete_level: request.body.level,
					coins_amount: request.body.level == 7 ? 20 : 10,
					token: request.body.userId
				}
				user.addCoinGame(payload).then((res) => {
					response.status(200).send(res.status)
				}).catch((err) => {
					response.status(500).send(err.status);
				})

				// UPDATE PROGRESS
				var sql = "UPDATE user_fortune_generic SET userProgress = ?, userStars = ? WHERE id = ?";
				connection.query(sql, ['[' + array + ']', request.body.userStars, databaseId], function (err, result) {
					// console.log(result)
					if (err) throw err;
				});
			}
			if (error) throw error;
		});
	}
	response.status(200);
	// } else {
	// 	response.json({ 
	// 		error: 'INVALID TOKEN', 
	// 	})	
	// }
});

function generateAccessToken(username) {
	return jwt.sign({ name: username }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token) {

		return jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
			//   req.user = user
			if (user) {
				// console.log ('valid ' + JSON.stringify(user) );
				return true;
			} else {
				// console.log('Invalid Token!')
				return false;
			}
		})
	} else {
		return false;
	}

}


const { PORT = 3000 } = process.env;


// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use(function (req, res, next) {
	if (req.secure) {
		// request was via https, so do no special handling
		next();
	} else {

		// request was via http, so redirect to https
		res.redirect('https://' + req.headers.host + req.url);
	}
});

app.listen(PORT, () => {
	console.log('Server is live...');
});
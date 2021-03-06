const express = require('express'); // init node express
const firebase = require('firebase'); // get firebase
const functions = require('firebase-functions'); //get firebase functions
const nodemailer = require('nodemailer'); // sent emails
var bodyParser = require('body-parser'); // read request parameters
var passwordgenerator = require('generate-password');

// firebase config
var firebaseConfig = {
	apiKey: "AIzaSyAQLCpKGof7el_d9XS5iP3c2Zi7DXwKKiY",
	authDomain: "e-commerce-f49e1.firebaseapp.com",
	databaseURL: "https://e-commerce-f49e1.firebaseio.com",
	projectId: "e-commerce-f49e1",
	storageBucket: "e-commerce-f49e1.appspot.com",
	messagingSenderId: "336970934425",
	appId: "1:336970934425:web:7caa3c1c4f02554b"
};


var app = express();
app.use(bodyParser.json()); 

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref();

//site suth verification
app.use((req, res, next) => {
	const token = req.headers.Token;
	//res.append('Access-Control-Allow-Origin', ['*']);
	//res.append('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS, PUT');
	//res.append('Access-Control-Allow-Headers', 'Content-Type');

	if (token !== null && token !== undefined && token !== '') {
		if (token === 'sysauth') return next();
		var status = false;
		var ref = firebase.database().ref("/Users/");
		ref.on("value",
			function (snapshot) {
				snapshot.forEach(function (key) {
					if (status === false) {
						if (key.toJSON().Token === token) {
							status = true;
						}
					}
				});

				ref.off("value");
				if (status === false) {
					res.status(401).send("Access denied. No token provided.");
				}
			});
	}
	else {
		res.status(401).send("Access denied. No token provided.");
	}
	next();
});

// User API functions Start

//get all users
app.get('/users', function (req, res) {
	var userReference = firebase.database().ref("/Users/");
	userReference.on("value",
		function (snapshot) {
			res.json(snapshot.val());
			userReference.off("value");
		},
		function (errorObject) {
			console.log("The read failed: " + errorObject.code);
			res.send("The read failed: " + errorObject.code);
		});
});

//get user by id
app.get('/user', function (req, res) {
	var userId = req.body.id;
	var userReference = firebase.database().ref("/Users/" + userId);
	userReference.on("value",
		function (snapshot) {
			res.json(snapshot.val());
			userReference.off("value");
		},
		function (errorObject) {
			console.log("The read failed: " + errorObject.code);
			res.send("The read failed: " + errorObject.code);
		});
});

//update user
app.put('/user', function (req, res) {
	var eMail = req.body.Email;
	var firstName = req.body.FirstName;
	var lastName = req.body.LastName;
	var mobile = req.body.Mobile;
	var password = req.body.Password;

	var referencePath = '/Users/' + ((eMail.replace('.', '')).replace('@', '')) + '/';
	var userReference = firebase.database().ref(referencePath);
	userReference.set({ FirstName: firstName, LastName: lastName, Email: eMail, Password: password, Mobile: mobile },
		function (error) {
			if (error) {
				res.send("Data could not be saved." + error);
			}
			else {
				res.send("Data saved successfully.");
			}
		});
});

//add user
app.post('/user', function (req, res) {
	var eMail = req.body.Email;
	var firstName = req.body.FirstName;
	var lastName = req.body.LastName;
	var mobile = req.body.Mobile;
	var password = passwordgenerator.generate({
		length: 10,
		numbers: true
	});

	var referencePath = '/Users/' + ((eMail.replace('.', '')).replace('@', '')) + '/';
	var userReference = firebase.database().ref(referencePath);
	userReference.update({ FirstName: firstName, LastName: lastName, Email: eMail, Password: password, Mobile: mobile },
		function (error) {
			if (error) {
				console.log("Data could not be updated." + error);
			}
			else {
				console.log("Data updated successfully.");
				var emailBody = '<h1>Welcome ' + firstName + '</h1><b><h3>We are happy to have you with us.</h3></b><br /></br /> Your fandashtic username : ' + eMail + ', your temp Password : ' + password + '<br /><br /> Please click the following url and login to fandashtic.com <br /><br /> <a href="https://www.fandashtic.com"> https://www.fandashtic.com </a>';
				sendemail(eMail, "Welcome email from fandashtic!", emailBody, emailBody);
			}
		});
});

//validate user
app.post('/validateuser', function (req, res) {
	var username = req.body.UserName;
	var password = req.body.Password;
	var status = false;
	if (username !== null && username !== undefined) {
		var referencePath = '/Users/' + ((username.replace('.', '')).replace('@', '')) + '/';
		var userReference = firebase.database().ref(referencePath);
		userReference.on("value",
			function (snapshot) {
				var user = snapshot.toJSON();
				if (user !== null && user.Password) {
					if (password === user.Password) {
						status = true;
						var token = passwordgenerator.generate({
							length: 25,
							numbers: true
						});

						userReference.update({
							"Token": token
						});
					}
				}
				userReference.off("value");
				res.send(status);
			},
			function (errorObject) {
				console.log("The read failed: " + errorObject.code);
				res.send("The read failed: " + errorObject.code);
			});
	}
	else {
		res.send(status);
	}
});

//reset user password
app.post('/user/reset', function (req, res) {
	console.log("Reset Password / Forget Password");
	var username = req.body.UserName;
	var referencePath = '/Users/' + ((username.replace('.', '')).replace('@', ''));
	var userReference = firebase.database().ref(referencePath);
	userReference.on("value",
		function (snapshot) {
			var user = snapshot.toJSON();
			if (user !== null) {
				var password = passwordgenerator.generate({
					length: 10,
					numbers: true
				});
				var emailBody = '<h1>Welcome ' + user.FirstName + '</h1><b><h3>We are give you a new secure key to access fandashtic. This is a temp key. This key will have life on one day.</h3></b><br /></br /> Your fandashtic temp key : ' + password + '<br /><br /> Please click the following url and login to fandashtic.com <br /><br /> <a href="https://www.fandashtic.com"> https://www.fandashtic.com </a>';
				sendemail(username, "Reset fandashtic Password", emailBody, emailBody);
			}
		},
		function (errorObject) {
			console.log("The read failed: " + errorObject.code);
			res.send("The read failed: " + errorObject.code);
		});
});

var sendemail = function (to, subject, html, body) {
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'info.fandashtic@gmail.com',
			pass: '%%f%H*t2PW6R'
		}
	});
	let mailOptions = {
		from: 'info.fandashtic@gmail.com', // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: body, // plain text body
		html: html // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message %s sent: %s', info.messageId, info.response);
		res.render('index');
	});
};

// User API functions End

exports.app = functions.https.onRequest(app);
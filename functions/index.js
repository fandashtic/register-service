const functions = require('firebase-functions');
const express = require('express');
const firebase = require('firebase');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); //need to parse HTTP request body

var firebaseConfig = {
	apiKey: "AIzaSyAQLCpKGof7el_d9XS5iP3c2Zi7DXwKKiY",
	authDomain: "e-commerce-f49e1.firebaseapp.com",
	databaseURL: "https://e-commerce-f49e1.firebaseio.com",
	projectId: "e-commerce-f49e1",
	storageBucket: "e-commerce-f49e1.appspot.com",
	messagingSenderId: "336970934425",
	appId: "1:336970934425:web:7caa3c1c4f02554b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref();

//Fetch instances
app.get('/users', function (req, res) {

	console.log("HTTP Get Request");
	var userReference = firebase.database().ref("/Users/");

	//Attach an asynchronous callback to read the data
	userReference.on("value",
		function (snapshot) {
			console.log(snapshot.val());
			res.json(snapshot.val());
			userReference.off("value");
		},
		function (errorObject) {
			console.log("The read failed: " + errorObject.code);
			res.send("The read failed: " + errorObject.code);
		});
});

//Create new instance
app.put('/user', function (req, res) {

	console.log("HTTP Put Request");

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

//Update existing instance
app.post('/user', function (req, res) {
	var eMail = req.body.Email;
	var firstName = req.body.FirstName;
	var lastName = req.body.LastName;
	var mobile = req.body.Mobile;
	var password = req.body.Password;
	var referencePath = '/Users/' + ((eMail.replace('.', '')).replace('@', '')) + '/';
	var userReference = firebase.database().ref(referencePath);
	userReference.update({ FirstName: firstName, LastName: lastName, Email: eMail, Password: password, Mobile: mobile },
		function (error) {
			if (error) {
				res.send("Data could not be updated." + error);
			}
			else {
				res.send("Data updated successfully.");
			}
		});
});

//Fetch instances
app.post('/validateuser', function (req, res) {
	var username = req.body.UserName;
	var password = req.body.Password;
	var referencePath = '/Users/' + ((username.replace('.', '')).replace('@', ''));
	var userReference = firebase.database().ref(referencePath);
	var status = false;
	userReference.on("value",
		function (snapshot) {
			var user = snapshot.toJSON();
			if (user !== null && user.Password) {
				if (password === user.Password) {
					status = true;
				}
			}
			userReference.off("value");
			res.send(status);
		},
		function (errorObject) {
			console.log("The read failed: " + errorObject.code);
			res.send("The read failed: " + errorObject.code);
		});	
});

//Delete an instance
app.delete('/', function (req, res) {
	console.log("HTTP DELETE Request");
	//todo
});

exports.app = functions.https.onRequest(app);

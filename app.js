const express = require('express'),
	app = express(),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	User = require("./models/user"),
	Leaderboard = require("./models/leaderboard");
const { check, validationResult } = require('express-validator')

require('dotenv/config');

var fs = require('fs');
var path = require('path');

//Connecting database
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
	console.log(err)
	mongoose.use
});

app.use(require("express-session")({
	secret: "password",       //decode or encode session
	resave: false,
	saveUninitialized: false
}));

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded(
	{ extended: true }
))


app.use(bodyParser.json())

app.use(passport.initialize());
app.use(passport.session());


//=======================
//      R O U T E S
//=======================
app.get("/", (req, res) => {
	res.render("home");
})

app.get("/main", (req, res) => {
	const timeElapsed = Date.now();
	const today = new Date(timeElapsed);
	var logtxt = `------${today.toUTCString()}-----\n User ${req.user.username} logged in successfully.\n----------------------------------------\n\n`;
	fs.appendFileSync('logs/log.txt', logtxt);

	Leaderboard.find({ creator: req.user.username }, function (err, data) {
		res.render("main", {
			leaderboards: data
		});
	})

})

app.post("/addScore", (req, res) => {
	Leaderboard.findOne({ _id: req.body._id }, function (err, data) {
		if (err) {
			console.log(err);
		}
		let newUsername = req.body.username;
		let newScore = req.body.score;
		let scoreArray = [{}];
		for (const score of data.scores) {
			scoreArray.push({ username: score.username, score: score.score });
		}

		scoreArray.push({ username: newUsername, score: newScore });
		scoreArray.shift();
		Leaderboard.findOneAndUpdate({ _id: req.body._id }, { scores: scoreArray }, function (error) {
			if (error) {
				console.log(error);
			}
		});
		res.redirect("main");
	});

});

app.get("/leaderboard/:_id", (req, res) => {
	Leaderboard.findOne({ _id: req.params._id }, function (err, data) {
		res.render("leaderboard", {
			leaderboard: data
		});
	})
});
//Auth Routes
app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/main",
	failureRedirect: "/login"
}), function (req, res) {

});

app.get("/register", (req, res) => {
	res.render("register");
});

//check if inputed values are ok
app.post("/register",
	check("username").isLength({ min: 3 }),
	check("email").isEmail(),
	check("password").isStrongPassword(),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: "The inputed values were Invalid. Pick valid inputs and try again." });
		}
		User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function (err, user) {
			if (err) {
				console.log(err);
				res.render("register");
			}
			passport.authenticate("local")(req, res, function () {
				res.redirect("/login");
			})
		})
	})

app.get("/create", (req, res) => {
	res.render("create");
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

app.post("/create", (req, res) => {

	let newLeaderboard = new Leaderboard({
		creator: req.user.username,
		title: req.body.title,
		unit: req.body.unit,
		scores: []
	});
	newLeaderboard.save(function (err, doc) {
		if (err) return console.error(err);
		console.log("Created Leaderboard");
	});
	res.redirect("main");
})

app.use(express.static(__dirname));

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Server Started At Port " + process.env.PORT);
	}

});
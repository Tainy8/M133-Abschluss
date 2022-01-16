const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const LeaderBoardSchema = new mongoose.Schema({
    title: String,
    creator: String,
    unit: String,
    scores: [{ index: false, username: String, score: Number }]
});
LeaderBoardSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Leaderboard", LeaderBoardSchema);
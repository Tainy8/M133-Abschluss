const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const LeaderBoardSchema = new mongoose.Schema({
    creator: String,
    title: String,
    unit: String,
    scores: [{ username: String, score: Number }]
});
LeaderBoardSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Leaderboard", LeaderBoardSchema);
/* Setting things up. */
const path = require("path"),
  express = require("express"),
  app = express(),
  getDayOfYear = require("date-fns/get_day_of_year"),
  Twit = require("twit"),
  config = {
    twitter: {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    }
  },
  T = new Twit(config.twitter);

app.use(express.static("public"));

const randomFromArray = (number, array) =>
  array
    .sort(() => 0.5 - Math.random())
    .slice(0, number)
    .join("");
const yearDay = getDayOfYear(new Date());
const days = [...Array(yearDay + 1).keys()];

// calculators
const saveForward = currentDay => currentDay * 1;
const saveBackward = currentDay => 365 - (currentDay - 1);
const saveForwardReducer = (accumulator, currentDay) =>
  accumulator + saveForward(currentDay);
const saveBackwardReducer = (accumulator, currentDay) =>
  accumulator + saveBackward(currentDay);

// forwards savings amounts
const saveForwardsAmountToday = (saveForward(yearDay) / 100).toFixed(2);
const saveForwardsAmountTotal = (days.reduce(saveForwardReducer) / 100).toFixed(
  2
);

// backwards savings amounts
const saveBackwardsAmountToday = (saveBackward(yearDay) / 100).toFixed(2);
const saveBackwardsAmountTotal = (
  days.reduce(saveBackwardReducer) / 100
).toFixed(2);
const excitingEmoji = () =>
  randomFromArray(1, [
    "🚀",
    "💰",
    "🤑",
    "💸",
    "🔥",
    "🎉",
    "💲",
    "💷",
    "💱",
    "🥇"
  ]);
const savingEmoji = () =>
  randomFromArray(3, [
    "🍾",
    "🏖",
    "🎄",
    "🍺",
    "🍻",
    "⛷",
    "🎅",
    "🤶",
    "🏄",
    "👨",
    "🍨",
    "🏎",
    "🏍",
    "🛥",
    "🐶",
    "🐕",
    "🐱",
    "🐈",
    "🛳",
    "✈️",
    "🍸",
    "📱",
    "💻",
    "🖥",
    "🎸",
    "🎻",
    "🎹",
    "👚",
    "👒",
    "💄",
    "🍷",
    "🍰",
    "🎂",
    "🎁",
    "🎮",
    "📷",
    "👛",
    "💍",
    "🎭",
    "🚴",
    "🎡"
  ]);

const buildStatus = (savingStrategy, amountToSaveToday, totalSaved) =>
  `${savingStrategy}:\nSave £${amountToSaveToday} today. £${totalSaved} total saved this year! ${excitingEmoji()}\n\n${savingEmoji()} What are you saving for?`;

const postTweet = (status, httpResponse) => {
  T.post("statuses/update", { status: status }, function(err, data, resp) {
    if (err) {
      httpResponse.sendStatus(500);
      console.log("Error!");
      console.log(err);
    } else {
      httpResponse.sendStatus(200);
    }
  });
};
/* Zapier hits /BOT_ENDPOINT every day at 8am to wake up this Twitter bot. */
app.all("/forward/" + process.env.BOT_ENDPOINT, function(request, response) {
  console.log("forward", new Date(), yearDay, getDayOfYear(new Date()));
  const forwardSavingStatus = buildStatus(
    "Forward saving from £0.01📈",
    saveForwardsAmountToday,
    saveForwardsAmountTotal
  );
  postTweet(forwardSavingStatus, response);
});

/* Zapier hits /BOT_ENDPOINT every day at 8am to wake up this Twitter bot. */
app.all("/backward/" + process.env.BOT_ENDPOINT, function(request, response) {
  console.log("backward", new Date(), yearDay, getDayOfYear(new Date()));
  const backwardSavingStatus = buildStatus(
    "Backward saving from £3.65📉",
    saveBackwardsAmountToday,
    saveBackwardsAmountTotal
  );
  if (saveBackwardsAmountToday > 0) {
    postTweet(backwardSavingStatus, response);
  }
});

app.all("/test/", function(request, response) {
  const date = new Date(2020, 12, 31);
  console.log("test", date, yearDay);
  const forwardSavingStatus = buildStatus(
    "Forward saving from £0.01📈",
    saveForwardsAmountToday,
    saveForwardsAmountTotal
  );
  const backwardSavingStatus = buildStatus(
    "Backward saving from £3.65📉",
    saveBackwardsAmountToday,
    saveBackwardsAmountTotal
  );
  response.send(
    "<p>" + forwardSavingStatus + "</p><p>" + backwardSavingStatus + "</p>"
  );
});

var listener = app.listen(process.env.PORT, function() {
  console.log("Your bot is running on port " + listener.address().port);
});

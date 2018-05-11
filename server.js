/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),
    getDayOfYear = require('date-fns/get_day_of_year'),
    Twit = require('twit'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.use(express.static('public'));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */
app.all("/" + process.env.BOT_ENDPOINT, function (request, response) {
  var resp = response;
  const yearDay = getDayOfYear(new Date());
  const days = [...Array(yearDay + 1).keys()];
  
  // calculators
  const saveForwardReducer = (accumulator, currentDay) =>  accumulator + saveForward(currentDay);
  const saveBackwardReducer = (accumulator, currentDay) => accumulator + saveBackward(currentDay);
  const saveForward = (currentDay) => currentDay * 1
  const saveBackward = (currentDay) => 365 - (currentDay - 1)
  
  // forwards savings amounts
  const saveForwardsAmountToday = (saveForward(yearDay) / 100).toFixed(2);
  const saveForwardsAmountTotal = (days.reduce(saveForwardReducer) / 100).toFixed(2);
  
  // backwards savings amounts
  const saveBackwardsAmountToday = (saveBackward(yearDay) / 100).toFixed(2);
  const saveBackwardsAmountTotal = (days.reduce(saveBackwardReducer) / 100).toFixed(2);
  
  const forwardSavingStatus = `Forward saving from £0.01📈: Put £${saveForwardsAmountToday} into your pot today to have £${saveForwardsAmountTotal}`
  const backwardSavingStatus = `Backward saving from £3.65📉: Put £${saveBackwardsAmountToday} into your pot today to have £${saveBackwardsAmountTotal}`
  
  T.post('statuses/update', { status: `${forwardSavingStatus}\n\n${backwardSavingStatus}\n\nHappy Savings!💸💰🏦` }, function(err, data, response) {
    if (err){
      resp.sendStatus(500);
      console.log('Error!');
      console.log(err);
    }
    else{
      resp.sendStatus(200);
    }
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});

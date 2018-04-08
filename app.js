var axios = require('axios')
var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var userStore = [];
var bot = new builder.UniversalBot(connector, function (session) {
// try to shoot the welcome message as soon as you interact with the bot
      session.beginDialog('route');
});

bot.dialog('greetings', [
  function (session) {
    builder.Prompts.text(session, 'Hi! What is your name?');
  },
  function (session, results) {
      session.send(`Hello ${results.response}!, Welcome to ChapaRoute`);
      // sesson.replaceDialogue('localePicker');
  },
]);

bot.dialog('localePicker', [
  function (session, args) {
    welcome_subtitle = 'Choose language/Chagua lugha!';
    menuOptions = [{ value: 'English', title: "en" }, {value: 'Kiswahili', title: "ksw" }];
    builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
      listStyle: builder.ListStyle.button
    });
  },
  function (session, results) {
    var locale = results.response.entity;
    session.preferredLocale(locale);
    if (results.response.entity == 'English') {
      session.send("Hurray! Language updated.");
    } else {
      session.send("Karibu sana!");
    }
  },
]);

var route = { //check if this is right
 //Jimmy to help from here
};

bot.dialog('route', [
  function (session, args) {
    welcome_subtitle = 'Choose Option';
    menuOptions = [{ value: '1) Pick Route?', title: "Pick_Route" }, {value: '2) Live Help', title: "Live_Help" }];
    builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
      listStyle: builder.ListStyle.button
    });
  },
  function (session, results) {
    if (results.response.entity == '1) Pick Route?') {
      session.send(`Please enter Destination`);
      // pick query from the API  and establish possible routes
    } else {
      // still giving enter Destination prompt
      session.send(`We are connecting you to our next agent. This may take a while, kindly hold...`);
    }
  },
]);

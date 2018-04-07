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
    // store user's address
    var address = session.message.address;
    userStore.push(address);

    // end current dialog
    session.beginDialog('greetings');



    // bot.dialog('localePicker', [
    //      function (session) {
    //           var choices = [
    //                { value: 'en', title: "English" },
    //                { value: 'ksw', title: "Kiswahili" }
    //           ];
    //           builder.Prompts.choice(session, "Please select your preferred language.", choices);
    //      },
    //      function (session, results) {
    //           var locale = results.response.entity;
    //           session.preferredLocale(locale);
    //           session.send("Language updated.").endDialog();
    //      }
    // ]);

});
bot.dialog('greetings', [
function (session) {
    builder.Prompts.text(session, 'Hi! What is your name?');
},
function (session, results) {
    session.send(`Hello ${results.response}!, Welcome to ChapaRoute`);
},
// function (session, results) {
//     session.userData.lang = results.response;
//     session.choice(session, 'Choose/C ', ['English', 'Kiswahili']);
// },
]);

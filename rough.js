if connector is True:


  new builder.ChatConnector

  bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello
        var isGroup = message.address.conversation.isGroup;
        var txt = isGroup ? "Hello everyone!" : "Hello...";
        var reply = new builder.Message()
                .address(message.address)
                .text(txt);
        bot.send(reply);
    } else if (message.membersRemoved) {
        // See if bot was removed
        var botId = message.address.bot.id;
        for (var i = 0; i < message.membersRemoved.length; i++) {
            if (message.membersRemoved[i].id === botId) {
                // Say goodbye
                var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                bot.send(reply);
                break;
            }
        }
    }
});





bot.dialog('localePicker', [
     function (session) {
          var choices = [
               { value: 'en', title: "English" },
               { value: 'ksw', title: "Kiswahili" }
          ];
          builder.Prompts.choice(session, "Please select your preferred language.", choices);
     },
     function (session, results) {
          var locale = results.response.entity;
          session.preferredLocale(locale);
          session.send("Language updated.").endDialog();
     }
]);

builder.Prompts.choice = (session, prompt, choices, options) => {
    let args = options || {};
    args.prompt = prompt || args.prompt;
    args.choices = choices || args.choices;

    args.retryPrompt = args.retryPrompt || args.prompt;
    console.log(args);
    session.beginDialog('BotBuilder:prompt-choice', args);
}

bot.dialog('/', [
    (session, args) => {
        welcome_subtitle = 'Choose Language!';
        menuOptions = [{ value: 'en', title: "English" }, {value: 'ksw', title: "Kiswahili" }];
        builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
            listStyle: builder.ListStyle.button
        });
    },
    (session, results) => {
      var locale = results.response.entity;
      session.preferredLocale(locale);
      session.send("Language updated.").endDialog();
    }
]);

//language picker
builder.Prompts.choice = (session, prompt, choices, options) => {
    let args = options || {};
    args.prompt = prompt || args.prompt;
    args.choices = choices || args.choices;

    args.retryPrompt = args.retryPrompt || args.prompt;
    console.log(args);
    session.beginDialog('BotBuilder:prompt-choice', args);
}

bot.dialog('localePicker', [
    (session, args) => {
        welcome_subtitle = 'Choose Language!';
        menuOptions = [{ value: 'en', title: "English" }, {value: 'ksw', title: "Kiswahili" }];
        builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
            listStyle: builder.ListStyle.button
        });
    },
    (session, results) => {
      var locale = results.response.entity;
      session.preferredLocale(locale);
      session.send("Language updated.").endDialog();
    }
]);

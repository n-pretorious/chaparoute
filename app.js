var axios = require('axios')
var restify = require('restify');
var builder = require('botbuilder');

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyDCJpc1WMopfQIThVwfnZf4k5egV6_D2jo', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// const getApiToken = async () => {
//   try {
//     const result = await axios({
//       method: 'POST',
//       url: 'https://identity.whereismytransport.com/connect/token',
//       headers: {Accept: 'application/json'},
//       data: {
//         client_id:'d42c8405-47b8-4e29-ae73-9264b3802326',
//         client_secret:'tJ9HgCoPSUunzdfO23fEPpfVKkqVAiwbeshZvE9hvRc=',
//         grant_type:'client_credentials',
//         scope:'transportapi:all'
//       }
//     })
//
//     console.log(result)
//   } catch (error) {
//     console.log(error.response.data)
//   }
// }
//
// getApiToken()

const apiToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBBNDU1OTA5OTQwQjJGQTQ5OEJGNTgyMzhBNkU3N0Y0MTFGM0NEOTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJDa1ZaQ1pRTEw2U1l2MWdqaW01MzlCSHp6WkkifQ.eyJuYmYiOjE1MjMxNjk0ODMsImV4cCI6MTUyMzE3MzA4MywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tIiwiYXVkIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6ImQ0MmM4NDA1LTQ3YjgtNGUyOS1hZTczLTkyNjRiMzgwMjMyNiIsImNsaWVudF90ZW5hbnQiOiJkOTBlMjNiZi1jOWM1LTQzMjEtODAyNS0xNDNhNGFhYzBhNjQiLCJqdGkiOiI1NzI2ZWE3ZmY5NTliYzBlNWY2YmM1ZmFmNmY3ZDRhMCIsInNjb3BlIjpbInRyYW5zcG9ydGFwaTphbGwiXX0.eGHHG1RVh0jAgeprINPFnSFcFiaVFhIM0iuhMMxPGrucAMRzkwz8XlP9gyMUM9VCRWIzLjgZDFLvdrkND43ALDrdYc11oY-ntodqLgiPcel0lU36XNZXQF_SJcOCEYfO-7ZDiMhKLeQoC0Pq9qzAz3B2gJIqKlDrzBR9eFUSnh7sTTjGDPoHjIwONYSryl1BAa68ysjEU6YV_BaC48CHd6UXU-IWutcXkWSIKpXjyM4hd8qu5cElCqd4N__qup2NvrWDxVR65dK5PBYj6qEMSXC82t7pTK5DbIhyq9swz-1Klj73y_jedk3zBADJkcOGnJn_J3U7R3klt8rTQMMETg"

const getCoordinates = async (location) => {
  return await geocoder.geocode(location)
}

// getCoordinates('test')
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var userStore = [];
var bot = new builder.UniversalBot(connector, async (session) => {
// try to shoot the welcome message as soon as you interact with the bot
      // await getApiToken()
      session.beginDialog('greetings');
});


bot.dialog('greetings', [
  function (session) {
    builder.Prompts.text(session, 'Hi! What is your name?');
  },
  function (session, results) {
      session.send(`Hello ${results.response}!, Welcome to ChapaRoute`);
      session.beginDialog('route');
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
    session.beginDialog('route');
  },
]);

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
      builder.Prompts.text(session, `Please enter your current location`);
    } else {
      // still giving enter Destination prompt
      session.send(`We are connecting you to our next agent. This may take a while, kindly hold...`);
    }
  },
  async (session, results, next) => {
    if (results.response) {
      var curr = await getCoordinates(`${results.response}`);
      session.userData.trip = {}
      session.userData.trip.start = curr[0]
      next()
    }
  },
  function (session, results) {
      builder.Prompts.text(session, `Please enter your destination`); //how do i delay to fisrt get current location?
  },
  async (session, results, next) => {
    if (results.response) {
      var des = await getCoordinates(`${results.response}`);
      session.userData.trip.end = des[0]
      next()
    }
  },
  async (session) => {
    console.log(session.userData.trip)
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://platform.whereismytransport.com/api/journeys',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          "geometry": {
            "type": "MultiPoint",
            "coordinates": [
              [`${session.userData.trip.start.longitude}`,`${session.userData.trip.start.latitude}`],
              [`${session.userData.trip.start.longitude}`,`${session.userData.trip.end.latitude}`]
            ]
          }
        }
      })
      console.log(response.data)

      response.data.itineraries[0].legs.forEach(leg => {
        if(leg.type === 'Walking') {
          leg.directions.forEach(walk => {
            session.send(`${walk.instruction}`)
          })
        }
        if(leg.type === 'Transit') {
            session.send(`Take a bus to ${leg.vehicle.headsign}`)
        }
      })
    } catch (error) {
      console.log(error.data)
    }
  }
]);

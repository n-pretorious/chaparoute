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


const apiToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBBNDU1OTA5OTQwQjJGQTQ5OEJGNTgyMzhBNkU3N0Y0MTFGM0NEOTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJDa1ZaQ1pRTEw2U1l2MWdqaW01MzlCSHp6WkkifQ.eyJuYmYiOjE1MjMxNzI0MzAsImV4cCI6MTUyMzE3NjAzMCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tIiwiYXVkIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6ImQ0MmM4NDA1LTQ3YjgtNGUyOS1hZTczLTkyNjRiMzgwMjMyNiIsImNsaWVudF90ZW5hbnQiOiJkOTBlMjNiZi1jOWM1LTQzMjEtODAyNS0xNDNhNGFhYzBhNjQiLCJqdGkiOiI4NmM3NzkyMDNlZDVjMTEwY2U3Nzk4NDNlZWUwNjNmZiIsInNjb3BlIjpbInRyYW5zcG9ydGFwaTphbGwiXX0.IA6LN2wdhCIyD7mcKHSMrUs1PJqLHv0_P2tsKSxnacZDUi4O1Rdt2lNCWFp3yZTu2l-AjussrGaVhI19ZKHGsp_NBdkvUbZb4lmUn27qLafFkEXVVcVYxTfsVDvFi8NYjcYWJAJIorWIUZNXzLqKz0DLdE1DHx5041QKNCfM4fvkw-V4iTZGm0GKnhrfQ1BkoWNcu9uQt3O3qxxbeoTmir4oHLSrJ4gnyQhx-XpRfSDAuoV7WhMYcfwlnT6avoP2RJC27G4PVO0BYpKDA0uF-b1kV31BotjTibaO6_8L2de2vAAn93lfB4rpJ61ROnBB7TPXYyhEINmkqt2fDWIj1w"
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

var userStore = [];
var bot = new builder.UniversalBot(connector, async (session) => {
      // await getApiToken()
      session.beginDialog('greetings');
});


bot.dialog('greetings', [
  function (session) {
    builder.Prompts.text(session, 'Hi! What is your name?');
  },
  function (session, results) {
      session.send(`Hello ${results.response}!, Welcome to ChapaRoute`);
      session.beginDialog('localePicker');
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
      builder.Prompts.text(session, `Please enter your destination`);
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

      const itineraries = response.data.itineraries
      let counter = 0

      if(itineraries.length > 0) {
        itineraries.forEach(itinerary => {
          counter  = counter + 1
          let routes = ''
          const legs = itinerary.legs
          if(legs.length > 0) {
            legs.forEach(leg => {
              console.log(counter)
              if(leg.type === 'Walking') {
                leg.directions.forEach(walk => {
                  routes = routes + `${walk.instruction}\n`
                })
              }
              if(leg.type === 'Transit') {
                  routes = routes + `Take a bus to ${leg.vehicle.headsign}\n`
              }
            })
          }
          const result = `Option ${counter}\n${routes}`
          session.send(result)
        })
      }
    } catch (error) {
      console.log(error.data)
    }
  }
]);
